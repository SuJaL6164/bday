"use client";
import React, { useMemo } from "react";
import Book from "./Book";

/* ------------------------------------------------------------------
 * DESIGN DIRECTION — "one light, quiet traces" (v4)
 * ------------------------------------------------------------------
 * Same premium stage as before. Two changes on top of v3:
 *
 *  1. Photos now use collision-aware placement (scatterNoOverlap):
 *     each candidate spot is checked against every already-placed
 *     photo's approximate footprint, so photos never overlap each
 *     other. Falls back gracefully to the least-bad spot if the
 *     frame gets tight.
 *
 *  2. More doodles (7 → 14), slightly smaller so the frame doesn't
 *     feel cluttered, still generated off a fixed seed so it's
 *     stable across renders.
 * ------------------------------------------------------------------ */

type CustomStyle = React.CSSProperties & Record<string, string | number>;

/* ---------- seeded random + scatter placement ---------- */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Placement = { top: string; left: string; rotate: number; size: number; delay: number };

type ScatterOpts = {
  minTop: number; maxTop: number;
  minLeft: number; maxLeft: number;
  minSize: number; maxSize: number;
  minRot: number; maxRot: number;
  // center box to keep clear, as [min, max] percentages on each axis
  excludeTop: [number, number];
  excludeLeft: [number, number];
};

function inCenterBox(top: number, left: number, opts: ScatterOpts) {
  return (
    top > opts.excludeTop[0] && top < opts.excludeTop[1] &&
    left > opts.excludeLeft[0] && left < opts.excludeLeft[1]
  );
}

function scatter(rng: () => number, count: number, opts: ScatterOpts): Placement[] {
  const items: Placement[] = [];
  for (let i = 0; i < count; i++) {
    let top = 0;
    let left = 0;
    let tries = 0;
    do {
      top = opts.minTop + rng() * (opts.maxTop - opts.minTop);
      left = opts.minLeft + rng() * (opts.maxLeft - opts.minLeft);
      tries++;
    } while (inCenterBox(top, left, opts) && tries < 25);
    items.push({
      top: `${top.toFixed(1)}%`,
      left: `${left.toFixed(1)}%`,
      rotate: Math.round(opts.minRot + rng() * (opts.maxRot - opts.minRot)),
      size: Math.round(opts.minSize + rng() * (opts.maxSize - opts.minSize)),
      delay: Number((rng() * 0.5).toFixed(2)),
    });
  }
  return items;
}

/* ---------- collision-aware scatter (used for photos) ----------
 * Positions are in % of the stage; sizes are in px. We convert each
 * item's px size into an approximate % "radius" using PX_TO_PCT so
 * we can compare footprints in the same units, then reject any
 * candidate whose center-to-center distance is smaller than the sum
 * of the two radii (i.e. the boxes would overlap). If we can't find
 * a fully clean spot in time, we keep the least-overlapping one we
 * saw so placement never fails outright.
 * ------------------------------------------------------------------ */

const PX_TO_PCT = 0.11; // tuned so photo boxes read as "touching, not overlapping" at their gaps

function footprintRadius(size: number) {
  return (size * PX_TO_PCT) / 2;
}

function overlapAmount(
  a: { top: number; left: number; size: number },
  b: { top: number; left: number; size: number },
) {
  const dx = a.left - b.left;
  const dy = a.top - b.top;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = footprintRadius(a.size) + footprintRadius(b.size);
  return minDist - dist; // > 0 means overlapping by that much
}

function scatterNoOverlap(rng: () => number, count: number, opts: ScatterOpts): Placement[] {
  const placedRaw: { top: number; left: number; size: number }[] = [];
  const items: Placement[] = [];

  for (let i = 0; i < count; i++) {
    let best: { top: number; left: number; size: number; rotate: number } | null = null;
    let bestOverlap = Infinity;
    const tries = 60;

    for (let t = 0; t < tries; t++) {
      const top = opts.minTop + rng() * (opts.maxTop - opts.minTop);
      const left = opts.minLeft + rng() * (opts.maxLeft - opts.minLeft);
      const size = Math.round(opts.minSize + rng() * (opts.maxSize - opts.minSize));
      const rotate = Math.round(opts.minRot + rng() * (opts.maxRot - opts.minRot));

      if (inCenterBox(top, left, opts)) continue;

      const candidate = { top, left, size };
      const worstOverlap = placedRaw.reduce(
        (max, p) => Math.max(max, overlapAmount(candidate, p)),
        -Infinity,
      );
      const overlapScore = placedRaw.length === 0 ? -Infinity : worstOverlap;

      if (overlapScore < bestOverlap) {
        bestOverlap = overlapScore;
        best = { top, left, size, rotate };
      }
      if (overlapScore <= 0) break; // fully clean spot found, stop early
    }

    // best is always set after at least one try (center-box retries aside)
    const chosen = best ?? {
      top: opts.minTop + rng() * (opts.maxTop - opts.minTop),
      left: opts.minLeft + rng() * (opts.maxLeft - opts.minLeft),
      size: Math.round(opts.minSize + rng() * (opts.maxSize - opts.minSize)),
      rotate: Math.round(opts.minRot + rng() * (opts.maxRot - opts.minRot)),
    };

    placedRaw.push({ top: chosen.top, left: chosen.left, size: chosen.size });
    items.push({
      top: `${chosen.top.toFixed(1)}%`,
      left: `${chosen.left.toFixed(1)}%`,
      rotate: chosen.rotate,
      size: chosen.size,
      delay: Number((rng() * 0.5).toFixed(2)),
    });
  }

  return items;
}

/* ---------- photos ---------- */

const PHOTO_SOURCES = [
  "/ref/girl.jpg",
  "/ref/girl2.jpg",
  "/ref/girl4.jpg",
  "/ref/girl5.jpg",
  "/ref/girl7.jpg",
  "/ref/girl8.jpg",
  "/ref/girl10.jpg",
  "/ref/girl9.jpg",
];

type PhotoProps = { src: string; top: string; left: string; size: number; rotate: number; delay: number };

function BgPhoto({ src, top, left, size, rotate, delay }: PhotoProps) {
  return (
    <div
      className="bg-photo"
      style={
        {
          top,
          left,
          width: size,
          height: size,
          "--rot": `${rotate}deg`,
          "--delay": `${delay}s`,
        } as CustomStyle
      }
    >
      <img
        src={src}
        alt=""
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

/* ---------- doodles: love-leaning pool ---------- */

const HeartDoodle = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 90" {...props}>
    <path
      d="M50 82C22 62 6 44 6 26 6 12 17 3 30 3c9 0 17 5 20 13 3-8 11-13 20-13 13 0 24 9 24 23 0 18-16 36-44 56z"
      fill="none"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartArrowDoodle = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 78C28 62 15 47 15 32c0-12 9-20 19-20 7 0 13 4 16 10 3-6 9-10 16-10 10 0 19 8 19 20 0 15-13 30-35 46z" />
      <path d="M10 12l80 76" />
      <path d="M78 78l12 10M88 88l10-12" />
    </g>
  </svg>
);

const HeartsPairDoodle = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 66C22 54 12 43 12 31c0-9 7-15 15-15 5 0 10 3 12 8 2-5 7-8 12-8 8 0 15 6 15 15 0 5-2 9-5 13" />
      <path d="M62 84C46 72 36 61 36 49c0-9 7-15 15-15 5 0 10 3 12 8 2-5 7-8 12-8 8 0 15 6 15 15 0 12-13 24-28 35z" />
    </g>
  </svg>
);

const FlowerDoodle = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 50c0-16-8-28-4-40 8 6 14 20 12 34" />
      <path d="M50 50c14-6 22-18 34-18-2 10-12 22-26 26" />
      <path d="M50 50c8 14 6 28 14 38-10-2-22-14-24-28" />
      <path d="M50 50c-14 6-20 20-32 22 4-10 12-22 26-26" />
      <path d="M50 50c-8-12-4-26-12-36 10 2 20 12 22 26" />
      <circle cx="50" cy="50" r="5" />
    </g>
  </svg>
);

const StarDoodle = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 100 100" {...props}>
    <path
      d="M50 8c3 16 8 26 14 32 12 3 22 8 28 10-10 4-20 9-28 12-6 10-11 22-14 30-3-8-8-20-14-30-8-3-18-8-28-12 10-2 20-7 28-10 6-6 11-16 14-32z"
      fill="none"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

// Weighted pool: hearts + cupid arrow + paired hearts make up the
// majority; flower/star stay in as occasional, non-love accents.
const DOODLE_POOL = [
  HeartDoodle,
  HeartDoodle,
  HeartArrowDoodle,
  HeartsPairDoodle,
  HeartDoodle,
  FlowerDoodle,
  HeartArrowDoodle,
  StarDoodle,
  HeartsPairDoodle,
];

/* ---------- page ---------- */

// Fixed seeds → looks random, stays stable across renders (no
// hydration mismatch, no re-shuffle on every reload).
const PHOTO_SEED = 7;
const DOODLE_SEED = 21;
const DOODLE_TYPE_SEED = 33;

export default function DoodleBackgroundDemo() {
  const photos = useMemo(() => {
    const rng = mulberry32(PHOTO_SEED);
    const placements = scatterNoOverlap(rng, PHOTO_SOURCES.length, {
      minTop: 3, maxTop: 90,
      minLeft: 3, maxLeft: 86,
      minSize: 130, maxSize: 205,
      minRot: -18, maxRot: 18,
      excludeTop: [30, 70],
      excludeLeft: [30, 70],
    });
    return placements.map((p, i) => ({ ...p, src: PHOTO_SOURCES[i] }));
  }, []);

  const doodles = useMemo(() => {
    const rng = mulberry32(DOODLE_SEED);
    const typeRng = mulberry32(DOODLE_TYPE_SEED);
    const placements = scatter(rng, 14, {
      minTop: 2, maxTop: 94,
      minLeft: 2, maxLeft: 92,
      minSize: 36, maxSize: 68,
      minRot: -24, maxRot: 24,
      excludeTop: [34, 66],
      excludeLeft: [34, 66],
    });
    return placements.map((p) => ({
      ...p,
      Comp: DOODLE_POOL[Math.floor(typeRng() * DOODLE_POOL.length)],
    }));
  }, []);

  return (
    <div className="stage">
      <style>{`
        .stage {
          --bg-ink: #0E0B09;
          --bg-ink-2: #1A1512;
          --bg-amber: #E7C687;
          --bg-hair: rgba(255,255,255,0.07);

          position: relative;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          background: var(--bg-ink);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stage__ground {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(60% 50% at 50% 8%, var(--bg-ink-2) 0%, transparent 70%),
            radial-gradient(120% 90% at 50% 100%, #050403 0%, var(--bg-ink) 60%);
        }

        .stage__spotlight {
          position: absolute;
          top: -18%;
          left: 50%;
          width: 62vmax;
          height: 62vmax;
          transform: translateX(-50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(231,198,135,0.14) 0%, transparent 62%);
          filter: blur(40px);
          opacity: 0;
          animation: fade-in 1.8s ease-out forwards;
        }

        .stage__ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: min(72vmin, 640px);
          height: min(72vmin, 640px);
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid var(--bg-hair);
          box-shadow: 0 0 0 1px rgba(0,0,0,0.4) inset;
          opacity: 0;
          animation: fade-in 2s ease-out forwards;
          animation-delay: 0.2s;
        }

        /* background traces: photos + doodles, pushed back together */
        .stage__traces {
          position: absolute;
          inset: 0;
          /* one dial for "how present the background texture is" */
          opacity: 0.5;
        }

        .bg-photo {
          position: absolute;
          overflow: hidden;
          border-radius: 1.1rem;
          opacity: 0;
          filter: grayscale(0.35) saturate(0.75) brightness(0.6) contrast(1.02) blur(0.6px);
          box-shadow: 0 14px 30px -18px rgba(0,0,0,0.7);
          transform: rotate(var(--rot)) scale(0.94);
          animation: bg-in 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--delay);
        }
        .bg-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bg-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(14,11,9,0.55) 100%);
        }

        .bg-doodle {
          position: absolute;
          opacity: 0;
          color: var(--bg-hair);
          transform: rotate(var(--rot));
          animation: bg-doodle-in 1.1s ease-out forwards;
          animation-delay: var(--delay);
        }
        .bg-doodle svg { width: 100%; height: 100%; stroke: currentColor; display: block; }

        .stage__grain {
          position: absolute;
          inset: -10%;
          opacity: 0.045;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .stage__vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 100% at 50% 55%, transparent 34%, rgba(0,0,0,0.68) 100%);
          pointer-events: none;
        }

        .stage__book {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stage__book-shadow {
          position: absolute;
          bottom: -2%;
          left: 50%;
          width: 56%;
          height: 44px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.6), transparent 72%);
          filter: blur(10px);
          pointer-events: none;
        }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bg-in {
          from { opacity: 0; transform: rotate(var(--rot)) scale(0.94); }
          to   { opacity: 1; transform: rotate(var(--rot)) scale(1); }
        }
        @keyframes bg-doodle-in { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 640px) {
          .stage__traces { transform: scale(0.6); transform-origin: 50% 40%; opacity: 0.35; }
        }

        @media (prefers-reduced-motion: reduce) {
          .stage__spotlight, .stage__ring, .bg-photo, .bg-doodle { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="stage__ground" />
      <div className="stage__spotlight" />
      <div className="stage__ring" />

      <div className="stage__traces">
        {photos.map((p, i) => (
          <BgPhoto key={i} {...p} />
        ))}
        {doodles.map(({ Comp, top, left, size, rotate, delay }, i) => (
          <div
            key={i}
            className="bg-doodle"
            style={{ top, left, width: size, height: size, "--rot": `${rotate}deg`, "--delay": `${delay}s` } as CustomStyle}
          >
            <Comp />
          </div>
        ))}
      </div>

      <div className="stage__grain" />
      <div className="stage__vignette" />

      <div className="stage__book">
        <div className="stage__book-shadow" />
        <Book />
      </div>
    </div>
  );
}