'use client';

/**
 * ShowtimeCountdown
 * -------------------------------------------------------------------------
 * A cinema-marquee countdown. At zero, the curtain opens, and once it has
 * fully finished opening the whole lock screen fades out to reveal your
 * content.
 *
 * Reveal sequence:
 *  1. Lock content fades out.
 *  2. Curtain parts + chrome fades (existing GSAP timeline, unchanged).
 *  3. The moment the curtain finishes opening, your real content mounts
 *     underneath the lock screen while it's still fully opaque, so there
 *     is never a visible flash of unpainted content.
 *  4. Once content has had a paint frame, the whole lock-screen overlay
 *     fades to transparent and unmounts, revealing your page already
 *     fully painted.
 *
 *  All the original fixes (children not mounted until safe, own audio that
 *  never overlaps yours, portal + scroll lock, killing ambient tweens
 *  before the reveal timeline starts, sequential/non-overlapping curtain
 *  timeline) are unchanged.
 *
 * Install once:
 *   npm install gsap
 *
 * Usage A — reveal in place:
 *   <ShowtimeCountdown targetDate={new Date('2026-08-11T00:00:00+05:30')} songSrc="/song.mp3">
 *     <YourHomepage />
 *   </ShowtimeCountdown>
 *
 * Usage B — redirect on completion (recommended if smoothness matters most):
 *   <ShowtimeCountdown
 *     targetDate={new Date('2026-08-11T00:00:00+05:30')}
 *     songSrc="/song.mp3"
 *     redirectTo="/live"
 *   />
 *   (redirectTo skips the fade entirely — there's no local content to mask
 *   a paint-in gap for, Next.js just serves the destination page.)
 *
 * Perf note: import this with
 *   next/dynamic(() => import('./ShowtimeCountdown'), { ssr: false })
 * on the one page that uses it, so its JS/GSAP never ships to any other route.
 */

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

export interface ShowtimeCountdownProps {
  /** Moment the countdown ends and the curtain opens. */
  targetDate?: Date;
  /** Scrolling ticker text above/below the marquee title. */
  tickerText?: string;
  /** Big marquee title on the lock screen (e.g. "NOW SHOWING"). */
  marqueeTitle?: string;
  /** Script-font subtitle under the marquee title. */
  marqueeSub?: string;
  /** Caption under the countdown ("doors open at midnight, IST"). */
  doorsText?: string;
  /** Optional audio file that plays only on the lock screen and stops at zero. */
  songSrc?: string;
  /** 0–1. Default 0.6. */
  songVolume?: number;
  /**
   * Optional route to navigate to when the countdown completes, instead of
   * opening the curtain in place. When set, `children` are ignored entirely
   * — this component is the whole page, and the real content lives at
   * `redirectTo`. This is the smoothest option if you have a real route for
   * "the show".
   */
  redirectTo?: string;
  /** Your actual page content. Not mounted until the countdown hits zero. Ignored when `redirectTo` is set. */
  children?: ReactNode;
  /**
   * Shows a small "Preview" button on the lock screen that triggers the
   * curtain-open early, so you can check the reveal without waiting for
   * the real countdown. Defaults to true — set to false for production.
   */
  showPreviewButton?: boolean;
}

interface Remaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TARGET = new Date('2026-08-11T00:00:00+05:30').getTime();

async function getRemaining() {
  const res = await fetch('/api/time', { cache: 'no-store' });
  const { now } = await res.json();

  const diff = TARGET - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const total = Math.floor(diff / 1000);

  return {
    total,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/** Default target: Aug 11 2026, 00:00 IST */
const DEFAULT_TARGET = new Date(Date.UTC(2026, 7, 11, 0, 0, 0) - (5 * 60 + 30) * 60 * 1000);

type UnitKey = 'days' | 'hours' | 'minutes' | 'seconds';

export default function ShowtimeCountdown({
  tickerText = 'SAVE THE DATE · AUGUST 11 ·',
  marqueeTitle = 'NOW SHOWING',
  marqueeSub = "a Pipi production, live August 11th",
  doorsText = 'doors open at midnight, IST',
  songSrc,
  songVolume = 0.6,
  redirectTo,
  children,
  showPreviewButton = true,
}: ShowtimeCountdownProps) {
  const router = useRouter();

  // Both flip together, only once the lock screen has fully faded out.
  // `mounted` gates your children, `revealed` unmounts the overlay itself.
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // False on both the server render and React's first client render (before
  // any effect has run) — that agreement is what avoids the hydration
  // mismatch. It flips true in an effect right after mount, which is also
  // the client's very next render, so it's still the frame the portal
  // content (and anything that depends on it) actually appears in.
  const [isClient, setIsClient] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const flickerRef = useRef<HTMLDivElement>(null);
  const curtainLRef = useRef<HTMLDivElement>(null);
  const curtainRRef = useRef<HTMLDivElement>(null);
  const lockContentRef = useRef<HTMLDivElement>(null);
  const bulbTopRef = useRef<HTMLDivElement>(null);
  const bulbBottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const daysRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef<HTMLDivElement>(null);
  const builtRef = useRef<Record<UnitKey, boolean>>({
    days: false,
    hours: false,
    minutes: false,
    seconds: false,
  });

  const unlockedRef = useRef(false);
  const reduceMotionRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsClient(true);
  }, []);

  /* ---------- lock body scroll while the lock screen is up ---------- */
  useEffect(() => {
    if (revealed) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [revealed]);

  /* ---------- bulb rail dots (built once the portal content exists) ---------- */
  useEffect(() => {
    if (revealed || !isClient) return;
    const build = (el: HTMLDivElement | null, count: number) => {
      if (!el) return;
      el.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        dot.className = 'bulb-dot';
        el.appendChild(dot);
      }
    };
    build(bulbTopRef.current, 22);
    build(bulbBottomRef.current, 22);
  }, [revealed, isClient]);

  /* ---------- ambient motion: bulb pulse + projector flicker (only while locked) ---------- */
  useEffect(() => {
    if (revealed || !isClient || reduceMotionRef.current) return;

    const dots = rootRef.current?.querySelectorAll<HTMLElement>('.bulb-dot');
    const bulbTween = dots
      ? gsap.to(dots, {
          opacity: 1,
          scale: 1.5,
          duration: 0.5,
          ease: 'power1.inOut',
          stagger: { each: 0.045, repeat: -1, yoyo: true },
        })
      : null;

    let cancelled = false;
    function flickerLoop() {
      if (cancelled) return;
      gsap.to(flickerRef.current, {
        opacity: () => Math.random() * 0.045,
        duration: () => 0.06 + Math.random() * 0.18,
        ease: 'power1.inOut',
        onComplete: flickerLoop,
      });
    }
    flickerLoop();

    return () => {
      cancelled = true;
      bulbTween?.kill();
      if (flickerRef.current) gsap.killTweensOf(flickerRef.current);
    };
  }, [revealed, isClient]);

  /* ---------- lock-screen's own song: only ever plays here, never near your content ---------- */
  useEffect(() => {
    if (revealed || !songSrc || !isClient) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = songVolume;
    const tryPlay = () => {
      audio.play().catch(() => {
        /* browser blocked autoplay; will retry on first interaction below */
      });
    };
    tryPlay();

    // Most browsers require a user gesture before audio can play with sound.
    window.addEventListener('pointerdown', tryPlay, { once: true });

    return () => {
      window.removeEventListener('pointerdown', tryPlay);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [revealed, songSrc, songVolume, isClient]);

  /* ---------- odometer digit columns ---------- */
  const buildColumns = useCallback((el: HTMLDivElement, digits: number[]) => {
    el.innerHTML = '';
    for (const d of digits) {
      void d;
      const col = document.createElement('span');
      col.className = 'od-col';
      const strip = document.createElement('span');
      strip.className = 'od-strip';
      for (let i = 0; i < 10; i++) {
        const s = document.createElement('span');
        s.className = 'od-digit';
        s.textContent = String(i);
        strip.appendChild(s);
      }
      col.appendChild(strip);
      el.appendChild(col);
    }
  }, []);

  const setDigits = useCallback((el: HTMLDivElement, digits: number[], animate: boolean) => {
    [...el.children].forEach((col, i) => {
      const h = (col as HTMLElement).getBoundingClientRect().height;
      const strip = col.querySelector<HTMLElement>('.od-strip');
      if (!strip) return;
      if (animate && !reduceMotionRef.current) {
        gsap.to(strip, { y: -digits[i] * h, duration: 0.5, ease: 'power3.out' });
      } else {
        gsap.set(strip, { y: -digits[i] * h });
      }
    });
  }, []);

  const paintUnit = useCallback(
    (el: HTMLDivElement | null, key: UnitKey, value: string) => {
      if (!el) return;
      const digits = value.split('').map(Number);
      if (!builtRef.current[key]) {
        buildColumns(el, digits);
        builtRef.current[key] = true;
        requestAnimationFrame(() => setDigits(el, digits, false));
        return;
      }
      setDigits(el, digits, true);
    },
    [buildColumns, setDigits]
  );

  /* ---------- the reveal: curtain opens, then the whole lock screen fades out ---------- */
  const triggerUnlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;

    // Stop the clock and every ambient tween immediately, before the curtain
    // timeline even starts. Letting these keep running underneath it is what
    // caused the glitchy feel — they were fighting it for frames.
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    gsap.killTweensOf(rootRef.current?.querySelectorAll('.bulb-dot') ?? []);
    if (flickerRef.current) gsap.killTweensOf(flickerRef.current);

    const finish = () => {
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      // Mount real content now — it paints hidden behind the still-opaque
      // lock screen, so there's no visible flash of unpainted content.
      setMounted(true);
      requestAnimationFrame(() => {
        if (reduceMotionRef.current) {
          setRevealed(true);
          return;
        }
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.6,
          delay: 0.15,
          ease: 'power2.out',
          onComplete: () => setRevealed(true),
        });
      });
    };

    const curtainL = curtainLRef.current;
    const curtainR = curtainRRef.current;

    if (reduceMotionRef.current || !curtainL || !curtainR) {
      finish();
      return;
    }

    // Fade the lock-screen song out in step with the curtain, so it ends in
    // silence rather than cutting off abruptly.
    if (audioRef.current && !audioRef.current.paused) {
      gsap.to(audioRef.current, { volume: 0, duration: 1.1, ease: 'power1.in' });
    }

    // Fully sequential — no overlapping/negative offsets. Overlap is what
    // was causing multiple tweens to compete for frames at once. The two
    // curtain halves and the chrome fade all start together at the "open"
    // label so the parting reads as one clean motion, not layered stutters.
    // Once the curtain has fully finished opening, the whole screen fades.
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(lockContentRef.current, { opacity: 0, y: -10, duration: 0.35, ease: 'power2.inOut' })
      .addLabel('open', '+=0.05')
      .to(curtainL, { xPercent: -100, duration: 1.0, ease: 'power3.inOut', force3D: true }, 'open')
      .to(curtainR, { xPercent: 100, duration: 1.0, ease: 'power3.inOut', force3D: true }, 'open')
      .to(chromeRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 'open');
  }, [redirectTo, router]);

  /* ---------- countdown tick (stops entirely the moment unlock triggers) ---------- */
  useEffect(() => {
    if (revealed) return;
    async function paint() {
      const r = await getRemaining();
      paintUnit(daysRef.current, 'days', String(Math.min(r.days, 99)).padStart(2, '0'));
      paintUnit(hoursRef.current, 'hours', String(r.hours).padStart(2, '0'));
      paintUnit(minutesRef.current, 'minutes', String(r.minutes).padStart(2, '0'));
      paintUnit(secondsRef.current, 'seconds', String(r.seconds).padStart(2, '0'));
      if (r.total <= 0) triggerUnlock();
    }
    paint();
    intervalRef.current = setInterval(paint, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [revealed, paintUnit, triggerUnlock]);

  const overlay = (
    <div className="showtime-root " ref={rootRef}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Caveat:wght@500;600&family=JetBrains+Mono:wght@500;700&display=swap"
      />

      {songSrc && <audio ref={audioRef} src={songSrc} loop preload="auto" />}

      <div ref={chromeRef}>
        <div className="rail left" />
        <div className="rail right" />
        <div className="flicker" ref={flickerRef} />
        <div className="vignette" />
        <div className="spotlight" />
        <div className="grain" />
      </div>

      {showPreviewButton && (
        <button
          type="button"
          className="preview-btn"
          onClick={triggerUnlock}
        >
          Preview
        </button>
      )}

      <div className="lock">
        <div className="curtain-l" ref={curtainLRef} />
        <div className="curtain-r" ref={curtainRRef} />

        <div className="screen">
          <span className="corner corner-tl" aria-hidden="true">✦</span>
          <span className="corner corner-tr" aria-hidden="true">✦</span>
          <span className="corner corner-bl" aria-hidden="true">✦</span>
          <span className="corner corner-br" aria-hidden="true">✦</span>
          <div className="lock-content" ref={lockContentRef}>
            <div className="bulb-rail top" ref={bulbTopRef} />
            <div className="ticker">
              <div className="ticker-track">
                <span>{tickerText}</span>
                <span>{tickerText}</span>
                <span>{tickerText}</span>
                <span>{tickerText}</span>
              </div>
            </div>
            <div className="bulb-rail bottom" ref={bulbBottomRef} />

            <h1 className="marquee-title">
              <span className="marquee-title-star" aria-hidden="true">✦</span>
              {marqueeTitle}
              <span className="marquee-title-star" aria-hidden="true">✦</span>
            </h1>
            <p className="marquee-sub">{marqueeSub}</p>

            <div className="hero-days">
              <div className="od-number" ref={daysRef} />
              <div className="hero-caption">days to curtain</div>
            </div>

            <div className="rest-row">
              <div className="bulb-tile">
                <div className="od-number" ref={hoursRef} />
                <span className="bulb-label">hrs</span>
              </div>
              <div className="bulb-tile">
                <div className="od-number" ref={minutesRef} />
                <span className="bulb-label">min</span>
              </div>
              <div className="bulb-tile">
                <div className="od-number" ref={secondsRef} />
                <span className="bulb-label">sec</span>
              </div>
            </div>

            <div className="perforation" aria-hidden="true" />
            <p className="lock-foot">{doorsText}</p>
          </div>
        </div>
      </div>

      <style>{`
        .showtime-root {
          --bg: #120d0a;
          --bg-2: #1b140d;
          --cream: #f3e6cf;
          --amber: #f0a83c;
          --amber-glow: rgba(240, 168, 60, 0.55);
          --maroon: #6e1f24;
          --maroon-2: #8c2a30;
          --muted: #a8957a;
          --film: #241a10;
          --font-display: 'Bebas Neue', sans-serif;
          --font-marquee: 'Anton', 'Bebas Neue', sans-serif;
          --font-script: 'Caveat', cursive;
          --font-mono: 'JetBrains Mono', monospace;
          --gold: #d4af6a;
          --rail: 26px;

          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          z-index: 999;
          background: radial-gradient(120% 90% at 50% 40%, var(--bg-2) 0%, var(--bg) 70%);
          color: var(--cream);
          font-family: var(--font-mono);
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
          isolation: isolate;
        }
        .showtime-root * {
          box-sizing: border-box;
        }

        .showtime-root .rail {
          position: absolute;
          top: 0;
          bottom: 0;
          width: var(--rail);
          z-index: 3;
          background-color: var(--film);
          background-image: radial-gradient(circle, var(--bg) 5px, transparent 5.6px);
          background-size: 100% 30px;
          background-position: center;
        }
        .showtime-root .rail.left {
          left: 0;
        }
        .showtime-root .rail.right {
          right: 0;
        }

        .showtime-root .flicker {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: #fff;
          opacity: 0;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Soft dark corners so the frame reads like it's lit by a single
           projector beam rather than flat-lit edge to edge. */
        .showtime-root .vignette {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: radial-gradient(120% 85% at 50% 42%, transparent 45%, rgba(0, 0, 0, 0.55) 100%);
        }

        /* A slow, faint beam sweeping past the title — the one bit of
           ambient motion that reads as "cinema" rather than "loading". */
        .showtime-root .spotlight {
          position: absolute;
          top: -20%;
          left: -30%;
          width: 60%;
          height: 140%;
          z-index: 4;
          pointer-events: none;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(240, 168, 60, 0.05) 45%,
            rgba(240, 168, 60, 0.09) 50%,
            rgba(240, 168, 60, 0.05) 55%,
            transparent 100%
          );
          animation: showtime-sweep 9s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        @keyframes showtime-sweep {
          0% { transform: translateX(0); }
          50% { transform: translateX(220%); }
          100% { transform: translateX(0); }
        }

        /* Very light grain so the amber/maroon gradients don't band on
           flat panels. */
        .showtime-root .grain {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size: 160px 160px;
        }

        .showtime-root .preview-btn {
          position: absolute;
          top: max(14px, env(safe-area-inset-top));
          right: max(14px, env(safe-area-inset-right));
          z-index: 1000;
          font-family: var(--font-display);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--gold);
          background: rgba(18, 13, 10, 0.55);
          border: 1px solid rgba(212, 175, 106, 0.4);
          border-radius: 999px;
          padding: 6px 14px;
          cursor: pointer;
          backdrop-filter: blur(2px);
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .showtime-root .preview-btn:hover {
          background: rgba(212, 175, 106, 0.16);
          border-color: var(--gold);
          color: var(--cream);
        }

        .showtime-root .lock {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: calc(var(--rail) + 10px);
        }

        /* The actual "projector screen" — a real 16:9 box, centered, so the
           ticker and text are framed instead of stretching across whatever
           width the monitor happens to be. Shrinks by height on short
           screens and by width on narrow ones, whichever runs out first. */

      .showtime-root .screen {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;
  box-shadow: inset 0 0 0 1px rgba(212, 175, 106, 0.16), inset 0 0 40px rgba(0, 0, 0, 0.4);
}

        .showtime-root .corner {
          position: absolute;
          z-index: 15;
          font-size: clamp(10px, 1.8cqw, 14px);
          color: var(--gold);
          opacity: 0.55;
          text-shadow: 0 0 6px var(--amber-glow);
          pointer-events: none;
        }
        .showtime-root .corner-tl { top: 10px; left: 12px; }
        .showtime-root .corner-tr { top: 10px; right: 12px; }
        .showtime-root .corner-bl { bottom: 10px; left: 12px; }
        .showtime-root .corner-br { bottom: 10px; right: 12px; }

        .showtime-root .curtain-l,
        .showtime-root .curtain-r {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 52%;
          z-index: 1;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          /* Wide, soft-edged stripes instead of a tight hard-edged repeat —
             tight repeating patterns shimmer/moiré under transform on most
             displays, which is what read as a "glitch" during the curtain
             animation. */
          background-image:
            radial-gradient(140% 55% at 50% -8%, rgba(255, 255, 255, 0.1), transparent 60%),
            linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(0,0,0,0.3) 100%),
            repeating-linear-gradient(
            90deg,
            var(--maroon) 0,
            var(--maroon) 26px,
            var(--maroon-2) 34px,
            var(--maroon-2) 60px,
            var(--maroon) 68px
          );
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.6) inset;
        }
        .showtime-root .curtain-l {
          left: 0;
          transform-origin: left;
        }
        .showtime-root .curtain-r {
          right: 0;
          transform-origin: right;
        }

    .showtime-root .lock-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  padding: 24px 0 3cqh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}

        .showtime-root .bulb-rail {
          display: flex;
          justify-content: space-between;
          padding: 0 4px;
          width: 100%;
        }
        .showtime-root .bulb-rail.top {
          margin-bottom: 7px;
        }
        .showtime-root .bulb-rail.bottom {
          margin-top: 7px;
          margin-bottom: 24px;
        }
        .showtime-root .bulb-rail .bulb-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--amber);
          opacity: 0.25;
          box-shadow: 0 0 4px var(--amber-glow);
        }

        .showtime-root .ticker {
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--amber-glow);
          border-bottom: 1px solid var(--amber-glow);
          padding: 1.4cqh 0;
          /* Fade the scrolling text at both edges instead of a hard cut. */
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
        }
        .showtime-root .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: showtime-scroll 16s linear infinite;
        }
        .showtime-root .ticker-track span {
          font-family: var(--font-display);
          font-size: clamp(11px, 2.4cqw, 15px);
          letter-spacing: 0.22em;
          color: var(--amber);
          padding-right: 2.4em;
        }
        @keyframes showtime-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .showtime-root .marquee-title {
          font-family: var(--font-marquee);
          font-weight: 400;
          font-size: clamp(2.1rem, 9.4cqw, 4.8rem);
          letter-spacing: 0.01em;
          color: var(--cream);
          line-height: 0.9;
          text-shadow:
            0 1px 0 rgba(0, 0, 0, 0.5),
            0 2px 0 rgba(0, 0, 0, 0.35),
            0 0 22px var(--amber-glow),
            0 0 60px rgba(240, 168, 60, 0.22);
          margin-top: 2.6cqh;
          display: inline-flex;
          align-items: center;
          gap: 0.4em;
          animation: showtime-title-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .showtime-root .marquee-title-star {
          font-size: 0.32em;
          color: var(--amber);
          opacity: 0.8;
          animation: showtime-twinkle 2.4s ease-in-out infinite;
        }
        .showtime-root .marquee-title-star:last-child {
          animation-delay: 1.1s;
        }
        @keyframes showtime-title-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); letter-spacing: 0.16em; }
          to { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 0.03em; }
        }
        @keyframes showtime-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .showtime-root .marquee-sub {
          font-family: var(--font-script);
          font-size: clamp(1rem, 3cqw, 1.4rem);
          color: var(--gold);
          margin: 1cqh 0 0;
          text-shadow: 0 0 14px rgba(212, 175, 106, 0.3);
        }

        .showtime-root .hero-days {
          position: relative;
          margin: 3cqh 0 0.6cqh;
        }
        .showtime-root .hero-days::before {
          content: '';
          position: absolute;
          inset: -14% -10%;
          z-index: -1;
          background: radial-gradient(50% 60% at 50% 45%, rgba(240, 168, 60, 0.16) 0%, transparent 75%);
          filter: blur(2px);
        }
        .showtime-root .hero-days .od-col {
          width: clamp(34px, 9cqw, 64px);
          height: clamp(48px, 12cqw, 92px);
        }
        .showtime-root .hero-days .od-digit {
          height: clamp(48px, 12cqw, 92px);
          font-size: clamp(2rem, 7.5cqw, 4.4rem);
        }
        .showtime-root .hero-days .od-number {
          display: inline-flex;
          gap: 2px;
        }
        .showtime-root .hero-caption {
          font-family: var(--font-display);
          font-size: clamp(10px, 2cqw, 13px);
          letter-spacing: 0.3em;
          color: var(--muted);
        }

        .showtime-root .rest-row {
          display: flex;
          gap: 1.4cqw;
          margin-top: 2.6cqh;
          flex-wrap: wrap;
          justify-content: center;
        }
        .showtime-root .bulb-tile {
          position: relative;
          background: linear-gradient(180deg, var(--bg-2) 0%, rgba(18, 13, 10, 0.9) 100%);
          border: 1px solid rgba(243, 230, 207, 0.14);
          border-radius: 8px;
          padding: 1.4cqh 1.4cqw 1cqh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6cqh;
          box-shadow: 0 14px 30px -14px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(243, 230, 207, 0.06);
          overflow: hidden;
        }
        .showtime-root .bulb-tile::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--amber), transparent);
          opacity: 0.65;
        }
        .showtime-root .bulb-tile .od-number {
          display: flex;
          gap: 1px;
        }
        .showtime-root .bulb-label {
          font-family: var(--font-display);
          font-size: clamp(9px, 1.6cqw, 10.5px);
          letter-spacing: 0.24em;
          color: var(--muted);
        }

        .showtime-root .od-col {
          position: relative;
          width: clamp(18px, 4.6cqw, 26px);
          height: clamp(28px, 7cqw, 40px);
          overflow: hidden;
          display: inline-block;
          border-radius: 3px;
          background: linear-gradient(180deg, #1a130d 0%, #0d0906 100%);
          box-shadow: inset 0 0 0 1px rgba(212, 175, 106, 0.18), inset 0 2px 4px rgba(0, 0, 0, 0.6);
        }
        .showtime-root .od-col::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0, 0, 0, 0.55);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03);
          z-index: 1;
          pointer-events: none;
        }
        .showtime-root .od-strip {
          display: flex;
          flex-direction: column;
        }
        .showtime-root .od-digit {
          height: clamp(28px, 7cqw, 40px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: clamp(1.1rem, 3.2cqw, 1.7rem);
          font-variant-numeric: tabular-nums;
          color: var(--amber);
          text-shadow: 0 0 10px var(--amber-glow);
        }

        .showtime-root .perforation {
          width: min(220px, 60%);
          height: 1px;
          margin-top: 2.4cqh;
          background-image: radial-gradient(circle, rgba(212, 175, 106, 0.5) 1.1px, transparent 1.2px);
          background-size: 9px 1px;
          background-repeat: repeat-x;
          opacity: 0.7;
        }
        .showtime-root .lock-foot {
          margin-top: 1.1cqh;
          font-size: clamp(9px, 1.6cqw, 10.5px);
          letter-spacing: 0.16em;
          color: var(--gold);
          text-transform: uppercase;
        }

        @media (max-width: 560px) {
          .showtime-root {
            --rail: 12px;
          }
        }


        @media (max-height: 480px), (max-width: 380px) {
          .showtime-root .bulb-rail.top,
          .showtime-root .ticker,
          .showtime-root .corner {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .showtime-root .ticker-track {
            animation: none !important;
          }
          .showtime-root .spotlight,
          .showtime-root .marquee-title,
          .showtime-root .marquee-title-star {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );

  return (
    <>
      {/* mounted flips true right as the lock screen starts to fade — your
          content paints hidden behind it, then the fade reveals an
          already-painted page. No autoplay of yours can fire, or overlap
          the lock-screen song, a moment before that. */}
      {mounted && !redirectTo && children}
      {!revealed && isClient && createPortal(overlay, document.body)}
    </>
  );
}