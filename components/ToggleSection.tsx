"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const photos = [
  "/ref/girl.jpg",
  "/ref/girl2.jpg",
  "/ref/girl3.jpg",
  "/ref/girl4.jpg",
  "/ref/girl5.jpg",
  "/ref/girl6.jpg",
] as const;

export const ToggleSection = () => {
  const [opened, setOpened] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!opened) return;

    import("balloons-js").then(({ balloons }) => balloons());
  }, [opened]);

  return (
    <div
      onMouseMove={(e) =>
        setMouse({
          x: (e.clientX / window.innerWidth - 0.5) * 18,
          y: (e.clientY / window.innerHeight - 0.5) * 18,
        })
      }
      style={{
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        position: "relative",
        background:
          "radial-gradient(circle at top, #111827 0%, #0f172a 45%, #020617 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        perspective: 1800,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Floating particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -60, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 4 + (i % 6),
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "white",
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            boxShadow: "0 0 10px rgba(255,255,255,0.9)",
          }}
        />
      ))}

      <motion.div
        animate={{
          rotateX: -mouse.y,
          rotateY: mouse.x,
        }}
        transition={{ type: "spring", stiffness: 80, damping: 18 }}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transformStyle: "preserve-3d",
          padding: "48px 24px",
        }}
      >
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="cube-room"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
              transition={{ duration: 0.8 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 28,
                color: "white",
                textAlign: "center",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Infinite cube ring */}
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                style={{
                  width: 320,
                  height: 320,
                  position: "relative",
                  transformStyle: "preserve-3d",
                }}
              >
                {photos.map((src, i) => (
                  <motion.div
                    key={src}
                    whileHover={{ scale: 1.08, translateZ: 40 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      transform: `rotateY(${i * 60}deg) translateZ(240px)`,
                      borderRadius: 24,
                      overflow: "hidden",
                      border: "2px solid rgba(255,255,255,0.14)",
                      boxShadow:
                        "0 24px 60px rgba(0,0,0,0.45), 0 0 30px rgba(168,85,247,0.18)",
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <img
                      src={src}
                      alt="memory face"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>

              <div style={{ maxWidth: 640 }}>
                <div style={{ fontSize: 56, marginBottom: 14 }}>🧊🌌✨</div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "clamp(3rem, 7vw, 5.8rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.06em",
                    lineHeight: 0.92,
                  }}
                >
                  Infinite Photo Cube Room
                </h1>

                <p
                  style={{
                    marginTop: 18,
                    color: "rgba(255,255,255,0.78)",
                    fontSize: 18,
                    lineHeight: 1.8,
                  }}
                >
                  A floating room made of memories is orbiting in front of you. Step inside
                  the cube and unlock the hidden birthday dimension 💜
                </p>
              </div>

              <motion.button
                onClick={() => setOpened(true)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(168,85,247,0.35)",
                    "0 0 42px rgba(168,85,247,0.82)",
                    "0 0 20px rgba(168,85,247,0.35)",
                  ],
                }}
                transition={{ duration: 2.2, repeat: Infinity }}
                style={{
                  padding: "16px 34px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  backdropFilter: "blur(18px)",
                }}
              >
                ENTER THE ROOM
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="final-room"
              initial={{ opacity: 0, scale: 0.82, rotateX: -16 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{
                width: "min(94vw, 1040px)",
                padding: "36px 30px",
                borderRadius: 36,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(28px)",
                boxShadow: "0 30px 90px rgba(0,0,0,0.45)",
                color: "white",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Orbit ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                style={{
                  position: "absolute",
                  width: 520,
                  height: 520,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.06)",
                  top: -180,
                  right: -180,
                }}
              />

              <div style={{ fontSize: 72, marginBottom: 18 }}>🎉🧊🎂✨</div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "clamp(2.8rem, 6vw, 5rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.06em",
                  lineHeight: 0.92,
                }}
              >
                Happy Birthday
              </h2>

              <p
                style={{
                  marginTop: 20,
                  color: "rgba(255,255,255,0.84)",
                  fontSize: 18,
                  lineHeight: 1.9,
                  maxWidth: 660,
                  marginInline: "auto",
                }}
              >
                This room was built from moments that matter. Every face of the cube holds a little piece of joy, laughter, and love.
                May your life keep unfolding into new adventures, brighter dreams, and memories even more magical than the ones already captured here. 💜🎈
              </p>

              {/* Floating gallery */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: 16,
                  marginTop: 32,
                }}
              >
                {photos.map((src, i) => (
                  <motion.div
                    key={src}
                    initial={{ opacity: 0, y: 24, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.08 }}
                    whileHover={{ y: -14, rotate: i % 2 === 0 ? -3 : 3, scale: 1.03 }}
                    style={{
                      borderRadius: 22,
                      overflow: "hidden",
                      border: "1px solid rgba(255,255,255,0.12)",
                      boxShadow:
                        "0 18px 44px rgba(0,0,0,0.35), 0 0 24px rgba(168,85,247,0.12)",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <img
                      src={src}
                      alt={`memory-${i + 1}`}
                      style={{
                        width: "100%",
                        height: 180,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                style={{
                  marginTop: 28,
                  fontSize: 30,
                  fontFamily: "Cormorant Garamond, serif",
                  color: "#e9d5ff",
                }}
              >
                “Some memories fade. The best ones become entire universes.”
              </motion.div>

              <button
                onClick={() => setOpened(false)}
                style={{
                  marginTop: 30,
                  padding: "14px 28px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                }}
              >
                ↩ Return to Cube
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};