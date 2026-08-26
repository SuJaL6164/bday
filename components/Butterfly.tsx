"use client";
/**
 * FloatingNotes
 * ------------------------------------------------------------------
 * Small "note" cards that drift and flutter around the screen like
 * butterflies (organic, non-repeating flight paths + independent wing
 * flap), and unfold into a readable card when clicked using
 * framer-motion's shared layout animation (layoutId) so the note
 * itself visually grows into the modal — no separate "reveal" hack.
 *
 * Install:
 *   npm install framer-motion
 *
 * Usage (inside DoodleBackgroundDemo, layered above DoodleBackground
 * and below/around <Book/>):
 *
 *   <DoodleBackground />
 *   <FloatingNotes />
 *   <div className="...">
 *     <Book />
 *   </div>
 *
 * The root container is pointer-events: none so it never blocks the
 * page under it — only the notes themselves re-enable pointer events.
 * ------------------------------------------------------------------
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
} from "framer-motion";

/* ---------------------------------- data ---------------------------------- */

type NoteData = {
  id: string;
  title: string;
  text: string;
  accent: string; // hex, drives wing color + fold mark
};

const DEFAULT_NOTES: NoteData[] = [
  {
    id: "n1",
    title: "01",
    text: "Every butterfly escapes... except me. I've been happily stuck with you since day one. 🤍",
    accent: "#D98E7E",
  },
  {
    id: "n2",
    title: "02",
    text: "Is butterfly ki tarah meri har khushi ka raasta bhi aakhir tum tak hi aakar rukta hai. 🫶",
    accent: "#C9A15E",
  },
  {
    id: "n3",
    title: "03",
    text: "Tumne butterfly ko touch kiya... aur meri heartbeat phir se skip kar gayi. 😭❤️",
    accent: "#7E9C68",
  },
  {
    id: "n4",
    title: "04",
    text: "Looks like you're really good at catching butterflies... no wonder you caught my heart so easily. ❤️",
    accent: "#B27A94",
  },
  {
    id: "n5",
    title: "05",
    text: "This butterfly landed in your hands for a moment... my heart chose to stay there forever. 🦋",
    accent: "#7C8FA6",
  },
];

/* ------------------------------- utilities -------------------------------- */

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Picks a new random point inside the given bounds, away from the edges. */
function randomPoint(width: number, height: number, margin = 60) {
  return {
    x: rand(margin, Math.max(margin + 1, width - margin)),
    y: rand(margin, Math.max(margin + 1, height - margin)),
  };
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

/**
 * Builds a winding multi-point path between two points instead of a
 * single straight hop. Picks a random number of waypoints (more for
 * longer flights), bows each one off the direct line by a random
 * perpendicular offset, and occasionally throws in a sharp "dart" or
 * a wide "loop-ish" swing so consecutive flights don't feel templated.
 */
function buildFlightPath(
  start: { x: number; y: number },
  end: { x: number; y: number },
  bounds: { width: number; height: number },
  margin = 40
) {
  const dist = Math.hypot(end.x - start.x, end.y - start.y);
  const dirX = end.x - start.x;
  const dirY = end.y - start.y;
  const perpX = -dirY;
  const perpY = dirX;
  const perpLen = Math.hypot(perpX, perpY) || 1;

  // longer hops get more waypoints (windier), short hops stay quick/direct
  const segments =
    dist > 380 ? Math.round(rand(4, 6)) : dist > 160 ? Math.round(rand(2, 4)) : 1;

  // pick a "flight character" per hop so the shape varies flight to flight
  const style = Math.random();
  const wobbleScale =
    style < 0.25 ? rand(0.05, 0.1) // near-direct dart
    : style < 0.7 ? rand(0.12, 0.26) // typical meander
    : rand(0.28, 0.42); // wide, loopy swing

  // alternate offset side per waypoint sometimes, sometimes commit to
  // one side (an S-curve vs. a single bow) — both happen in nature
  const alternate = Math.random() < 0.5;

  const points: { x: number; y: number }[] = [start];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const baseX = start.x + dirX * t;
    const baseY = start.y + dirY * t;
    const side = alternate ? (i % 2 === 0 ? 1 : -1) : 1;
    const mag = side * rand(0.6, 1) * wobbleScale * dist * Math.sin(Math.PI * t);
    points.push({
      x: clamp(baseX + (perpX / perpLen) * mag, margin, bounds.width - margin),
      y: clamp(baseY + (perpY / perpLen) * mag, margin, bounds.height - margin),
    });
  }
  points.push(end);
  return points;
}

/* --------------------------------- wings ---------------------------------- */
/**
 * Anatomically-inspired wing pair: a pointed forewing (costa → apex →
 * scalloped outer margin) and a rounder hindwing beneath it, each with
 * fanned venation and a soft translucent gradient — read much closer
 * to an actual lepidopteran wing than a single symmetric blob.
 */
function WingPair({
  side,
  idPrefix,
  accent,
  flapMs,
  delay,
}: {
  side: "left" | "right";
  idPrefix: string;
  accent: string;
  flapMs: number;
  delay: number;
}) {
  const gradId = `${idPrefix}-grad-${side}`;
  const mirror = side === "left";

  return (
    <motion.svg
      viewBox="0 0 84 120"
      style={{
        position: "absolute",
        left: mirror ? undefined : "50%",
        right: mirror ? "50%" : undefined,
        top: 0,
        width: 42,
        height: 60,
        transformOrigin: mirror ? "100% 18%" : "0% 18%",
        overflow: "visible",
        transform: mirror ? "scaleX(-1)" : undefined,
      }}
      animate={{ rotateY: [10, 62, 10], rotateZ: [0, -4, 0] }}
      transition={{
        duration: flapMs / 1000,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.85} />
          <stop offset="100%" stopColor={accent} stopOpacity={0.42} />
        </linearGradient>
      </defs>

      {/* forewing: costa nearly straight, pointed apex, gently scalloped margin */}
      <path
        d="M4 18
           C 18 4, 44 2, 62 14
           C 76 23, 78 40, 66 48
           C 54 55, 34 52, 20 44
           C 10 38, 3 28, 4 18 Z"
        fill={`url(#${gradId})`}
        stroke={accent}
        strokeOpacity={0.35}
        strokeWidth={0.6}
      />
      {/* forewing venation, fanned from the wing root */}
      <g stroke="rgba(15,12,10,0.32)" strokeWidth={0.7} fill="none" strokeLinecap="round">
        <path d="M6 20 C 24 16, 42 14, 60 17" />
        <path d="M6 22 C 22 24, 40 26, 58 28" />
        <path d="M8 30 C 22 32, 36 36, 50 42" />
      </g>

      {/* hindwing: rounder, sits lower/behind, small tail hint */}
      <path
        d="M4 42
           C 6 56, 16 70, 32 76
           C 42 80, 50 74, 48 64
           C 46 56, 36 52, 26 50
           C 16 48, 6 46, 4 42 Z"
        fill={`url(#${gradId})`}
        opacity={0.92}
        stroke={accent}
        strokeOpacity={0.3}
        strokeWidth={0.6}
      />
      <g stroke="rgba(15,12,10,0.28)" strokeWidth={0.6} fill="none" strokeLinecap="round">
        <path d="M8 46 C 18 52, 26 58, 34 66" />
        <path d="M6 44 C 14 50, 20 58, 24 68" />
      </g>
      {/* small eyespot for character */}
      <circle cx="30" cy="63" r="3.4" fill="none" stroke={accent} strokeOpacity={0.55} strokeWidth={0.7} />
      <circle cx="30" cy="63" r="1.2" fill={accent} fillOpacity={0.6} />
    </motion.svg>
  );
}

function NoteWings({
  idPrefix,
  accent,
  flapMs,
}: {
  idPrefix: string;
  accent: string;
  flapMs: number;
}) {
  return (
    <div
      style={{
        width: 60,
        height: 60,
        perspective: 320,
        position: "relative",
      }}
    >
      <WingPair side="right" idPrefix={idPrefix} accent={accent} flapMs={flapMs} delay={0} />
      <WingPair side="left" idPrefix={idPrefix} accent={accent} flapMs={flapMs} delay={0} />

      {/* body: thorax + tapered abdomen */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "10%",
          width: 4,
          height: 8,
          borderRadius: "50%",
          background: "rgba(18,15,13,0.85)",
          transform: "translateX(-50%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "17%",
          width: 3,
          height: 26,
          borderRadius: "40%",
          background:
            "linear-gradient(180deg, rgba(18,15,13,0.85), rgba(18,15,13,0.5))",
          transform: "translateX(-50%)",
        }}
      />
      {/* antennae */}
      <svg
        viewBox="0 0 40 24"
        style={{
          position: "absolute",
          left: "50%",
          top: "-14%",
          width: 26,
          height: 16,
          transform: "translateX(-50%)",
          overflow: "visible",
        }}
      >
        <path d="M20 20 C 14 12, 8 8, 4 4" stroke="rgba(18,15,13,0.75)" strokeWidth={1} fill="none" strokeLinecap="round" />
        <path d="M20 20 C 26 12, 32 8, 36 4" stroke="rgba(18,15,13,0.75)" strokeWidth={1} fill="none" strokeLinecap="round" />
        <circle cx="4" cy="4" r="1.4" fill="rgba(18,15,13,0.8)" />
        <circle cx="36" cy="4" r="1.4" fill="rgba(18,15,13,0.8)" />
      </svg>
    </div>
  );
}

/* ------------------------------ flying note -------------------------------- */

function FlyingNote({
  note,
  bounds,
  onOpen,
}: {
  note: NoteData;
  bounds: { width: number; height: number };
  onOpen: (id: string) => void;
}) {
  const controls = useAnimationControls();
  const flapMs = useRef(rand(260, 420)).current;
  const alive = useRef(true);
  const [hovered, setHovered] = useState(false);
  const [invisible, setInvisible] = useState(false);

  useEffect(() => {
    alive.current = true;
    let cancelled = false;

    async function fly() {
      let pos = randomPoint(bounds.width, bounds.height);
      controls.set({ x: pos.x, y: pos.y, rotate: 0, opacity: 1 });

      while (!cancelled && alive.current) {
        const next = randomPoint(bounds.width, bounds.height);
        const path = buildFlightPath(pos, next, bounds);

        // per-segment speed jitter so the note doesn't glide at one
        // constant rate — real flutter speeds up and slows down
        const speeds = path.map(() => rand(70, 130));
        const segLengths: number[] = [];
        for (let i = 1; i < path.length; i++) {
          segLengths.push(Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y));
        }
        const segDurations = segLengths.map((len, i) =>
          Math.max(0.35, len / speeds[i])
        );
        const totalDuration = clamp(
          segDurations.reduce((a, b) => a + b, 0),
          1.4,
          7
        );

        // build a "times" array proportional to each segment's share of
        // total duration, so faster/slower segments read correctly
        let acc = 0;
        const times = [0];
        for (const d of segDurations) {
          acc += d;
          times.push(acc / segDurations.reduce((a, b) => a + b, 0));
        }

        // rotation follows the actual heading of each segment, gently
        // banking into turns instead of a single fixed tilt
        const rotations = path.map((p, i) => {
          if (i === 0 || i === path.length - 1) return 0;
          const prev = path[i - 1];
          const nxt = path[i + 1] ?? p;
          const a1 = Math.atan2(p.y - prev.y, p.x - prev.x);
          const a2 = Math.atan2(nxt.y - p.y, nxt.x - p.x);
          const turn = ((a2 - a1) * 180) / Math.PI;
          return clamp(turn * 0.6, -16, 16);
        });

        await controls.start({
          x: path.map((p) => p.x),
          y: path.map((p) => p.y),
          rotate: rotations,
          transition: {
            duration: totalDuration,
            ease: "easeInOut",
            times,
          },
        });

        pos = next;

        // after each arrival, roll for what happens next: keep flying,
        // settle and flutter in place, or fade out of sight for a
        // while (sometimes briefly, sometimes a long, still pause)
        // before fading back in somewhere new.
        if (!cancelled && alive.current) {
          const roll = Math.random();

          if (roll < 0.22) {
            // settle for a moment — like landing on a bloom
            const hoverJitters = Math.round(rand(2, 4));
            for (let h = 0; h < hoverJitters && !cancelled && alive.current; h++) {
              await controls.start({
                x: pos.x + rand(-6, 6),
                y: pos.y + rand(-6, 6),
                rotate: rand(-4, 4),
                transition: { duration: rand(0.3, 0.5), ease: "easeInOut" },
              });
            }
          } else if (roll < 0.47) {
            // vanish — fade out, hold invisible (sometimes just a beat,
            // sometimes a long still pause), then reappear elsewhere
            await controls.start({
              opacity: 0,
              transition: { duration: rand(0.5, 0.9), ease: "easeInOut" },
            });
            setInvisible(true);

            const longPause = Math.random() < 0.3;
            const hiddenMs = longPause ? rand(3200, 6500) : rand(600, 2000);
            await new Promise((resolve) => setTimeout(resolve, hiddenMs));
            if (cancelled || !alive.current) return;

            const reappearAt = randomPoint(bounds.width, bounds.height);
            controls.set({ x: reappearAt.x, y: reappearAt.y });
            pos = reappearAt;
            setInvisible(false);

            await controls.start({
              opacity: 1,
              transition: { duration: rand(0.6, 1), ease: "easeOut" },
            });
          }
          // else: no pause, straight into the next flight path
        }
      }
    }

    fly();
    return () => {
      cancelled = true;
      alive.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  return (
    <motion.div
      layoutId={`note-${note.id}`}
      onClick={() => {
        alive.current = false;
        onOpen(note.id);
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={controls}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: invisible ? "none" : "auto",
        cursor: "pointer",
        willChange: "transform",
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          filter: hovered
            ? "drop-shadow(0 2px 6px rgba(0,0,0,0.45))"
            : "drop-shadow(0 1px 3px rgba(0,0,0,0.3))",
          transition: "filter 0.3s ease",
        }}
      >
        <NoteWings idPrefix={note.id} accent={note.accent} flapMs={flapMs} />
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------- opened card -------------------------------- */

function OpenedNote({ note, onClose }: { note: NoteData; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(12,10,9,0.6)",
        backdropFilter: "blur(4px)",
        pointerEvents: "auto",
      }}
    >
      <motion.div
        layoutId={`note-${note.id}`}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="fn-card"
        style={{
          width: "min(380px, 88vw)",
          padding: "2.4rem 2.1rem 2rem",
          background: "#1E1A17",
          position: "relative",
          clipPath:
            "polygon(0% 1.5%,3% 0%,9% 1.2%,16% 0%,24% 1.4%,32% 0.2%,40% 1.1%,48% 0%,56% 1.3%,64% 0.1%,72% 1.2%,80% 0%,88% 1%,94% 0.2%,100% 1.4%,100% 98.5%,96% 100%,90% 98.7%,83% 100%,75% 98.6%,67% 100%,59% 98.8%,51% 100%,43% 98.7%,35% 100%,27% 98.6%,19% 100%,11% 98.8%,4% 100%,0% 98.6%)",
          boxShadow: "0 24px 60px -18px rgba(0,0,0,0.7)",
        }}
      >
        {/* paper grain */}
        <svg
          style={{ position: "absolute", inset: 0, opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }}
          width="100%"
          height="100%"
        >
          <filter id="fn-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#fn-grain)" />
        </svg>

        {/* fold crease */}
        <div
          style={{
            position: "absolute",
            top: "34%",
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          style={{ position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1.1rem",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.02em",
                color: note.accent,
              }}
            >
              N&deg;{note.title}
            </span>
            <span
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.12)",
              }}
            />
          </div>
          <p
            style={{
              fontFamily: "'Newsreader', ui-serif, Georgia, serif",
              fontWeight: 400,
              fontSize: "1.2rem",
              lineHeight: 1.6,
              color: "#EDE6DA",
              margin: 0,
              letterSpacing: "0.005em",
            }}
          >
            {note.text}
          </p>
        </motion.div>

        <button
          onClick={onClose}
          aria-label="Close note"
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            border: "none",
            background: "transparent",
            color: "rgba(237,230,218,0.55)",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: "0.85rem",
            lineHeight: 1,
          }}
        >
          close
        </button>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------- root ------------------------------------ */

export default function FloatingNotes({
  notes = DEFAULT_NOTES,
}: {
  notes?: NoteData[];
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState({ width: 1200, height: 800 });
  const [openId, setOpenId] = useState<string | null>(null);
  const [respawnKey, setRespawnKey] = useState(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setBounds({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const openNote = useMemo(
    () => notes.find((n) => n.id === openId) || null,
    [notes, openId]
  );

  return (
    <div
      ref={rootRef}
      className="fn-root"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {notes.map((note) =>
        note.id === openId ? null : (
          <FlyingNote
            key={`${note.id}-${respawnKey}`}
            note={note}
            bounds={bounds}
            onOpen={setOpenId}
          />
        )
      )}

      <AnimatePresence>
        {openNote && (
          <OpenedNote
            key={openNote.id}
            note={openNote}
            onClose={() => {
              setOpenId(null);
              setRespawnKey((k) => k + 1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}