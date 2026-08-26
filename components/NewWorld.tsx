"use client"

import React, { Suspense, useEffect, useMemo, useRef, useState, createContext, useContext } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Html,
  Plane,
  Sphere,
} from "@react-three/drei"
import { Download, Heart, X } from "lucide-react"

/**
 * Single-file Stellar Card Gallery
 * - Context, Starfield, Galaxy, FloatingCard, Modal, and Page in one.
 * - Patched for Brave browser compatibility (WebGL fingerprinting protection).
 */

/* =========================
   WebGL Detection (Brave-safe, inlined)
   ========================= */

/**
 * Brave's "Block Fingerprinting" shield (Strict/Aggressive mode) can:
 *  - Return null from getContext("webgl") even when the GPU works fine
 *  - Throw a SecurityError instead of returning null
 *  - Report a "major performance caveat" that WebGL calls fail on by default
 * This detection function guards against all three cases.
 */
function detectWebGL(): "webgl2" | "webgl" | null {
  try {
    const canvas = document.createElement("canvas")
    const ctxOptions = { failIfMajorPerformanceCaveat: false } as WebGLContextAttributes

    const gl2 = canvas.getContext("webgl2", ctxOptions)
    if (gl2) return "webgl2"

    const gl =
      canvas.getContext("webgl", ctxOptions) ||
      canvas.getContext("experimental-webgl", ctxOptions)
    if (gl) return "webgl"

    return null
  } catch (e) {
    // Brave can throw here under strict fingerprinting protection
    console.warn("WebGL detection threw (likely Brave Shields):", e)
    return null
  }
}

/* =========================
   Card Context (inlined)
   ========================= */

type Card = {
  id: string
  imageUrl: string
  alt: string
  title: string
}

type CardContextType = {
  selectedCard: Card | null
  setSelectedCard: (card: Card | null) => void
  cards: Card[]
}

const CardContext = createContext<CardContextType | undefined>(undefined)

function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error("useCard must be used within CardProvider")
  return ctx
}

function CardProvider({ children }: { children: React.ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  const cards: Card[] = [
    // { id: "1", imageUrl: "/ref/💜.jpg", alt: "Cutie", title: "Cutie" },
    { id: "2", imageUrl: "/ref/girl.jpg", alt: "Baddie", title: "Baddie" },
    { id: "3", imageUrl: "/ref/girl2.jpg", alt: "Angel", title: "Angel" },
    { id: "4", imageUrl: "/ref/girl3.jpg", alt: "Dreamgirl", title: "Dreamgirl" },
    { id: "5", imageUrl: "/ref/girl4.jpg", alt: "Sweetheart", title: "Sweetheart" },
    { id: "6", imageUrl: "/ref/girl5.jpg", alt: "Icon", title: "Icon" },
    { id: "7", imageUrl: "/ref/girl6.jpg", alt: "Stunner", title: "Stunner" },
    { id: "8", imageUrl: "/ref/girl7.jpg", alt: "Babe", title: "Babe" },
    { id: "9", imageUrl: "/ref/girl8.jpg", alt: "Darling", title: "Darling" },
    { id: "10", imageUrl: "/ref/girl9.jpg", alt: "Sunshine", title: "Sunshine" },
    { id: "11", imageUrl: "/ref/girl10.jpg", alt: "Queen", title: "Queen" },
    { id: "12", imageUrl: "/ref/girl11.jpg", alt: "Heartbreaker", title: "Heartbreaker" },
  ]

  // const cards: Card[] = [
  // { id: "1", imageUrl: "/pipis/pipi1.jpg", alt: "Cutie", title: "Cutie" },

  // { id: "2", imageUrl: "/pipis/pipi2.jpg", alt: "Baddie", title: "Baddie" },
  // { id: "3", imageUrl: "/pipis/pipi3.jpg", alt: "Angel", title: "Angel" },
  // { id: "4", imageUrl: "/pipis/pipi4.jpg", alt: "Dreamgirl", title: "Dreamgirl" },
  // { id: "5", imageUrl: "/pipis/pipi5.jpg", alt: "Sweetheart", title: "Sweetheart" },
  // { id: "6", imageUrl: "/pipis/pipi6.jpg", alt: "Icon", title: "Icon" },
  // { id: "7", imageUrl: "/pipis/pipi7.jpg", alt: "Stunner", title: "Stunner" },
  // { id: "8", imageUrl: "/pipis/pipi8.jpg", alt: "Babe", title: "Babe" },
  // { id: "9", imageUrl: "/pipis/pipi9.jpg", alt: "Darling", title: "Darling" },
  // { id: "10", imageUrl: "/pipis/pipi10.jpg", alt: "Sunshine", title: "Sunshine" },
  // { id: "11", imageUrl: "/pipis/pipi11.jpg", alt: "Queen", title: "Queen" },
  // { id: "12", imageUrl: "/pipis/pipi12.jpg", alt: "Heartbreaker", title: "Heartbreaker" },

  // optional extra images
  // { id: "13", imageUrl: "/pipis/pipi13.jpg", alt: "Extra 1", title: "Extra 1" },
  // { id: "14", imageUrl: "/pipis/pipi14.jpg", alt: "Extra 2", title: "Extra 2" },
// ];

  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>
      {children}
    </CardContext.Provider>
  )
}

/* =========================
   Starfield Background (inlined, Brave-safe)
   ========================= */

function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Use the shared Brave-safe detection instead of a raw getContext check
    if (!detectWebGL()) {
      console.warn("WebGL not available — skipping 3D starfield, using CSS fallback")
      return
    }

    let renderer: THREE.WebGLRenderer | null = null
    let animationId = 0
    let starsGeometry: THREE.BufferGeometry | null = null
    let starsMaterial: THREE.PointsMaterial | null = null

    try {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000)
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        failIfMajorPerformanceCaveat: false, // Brave can report a false performance caveat
        powerPreference: "default",
      })
      renderer.setSize(window.innerWidth, window.innerHeight)
      // Clamp pixel ratio — Brave can spoof devicePixelRatio for fingerprint resistance,
      // occasionally returning odd values that hurt perf or break sizing.
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.setClearColor(0x000000, 1)
      mountRef.current.appendChild(renderer.domElement)

      starsGeometry = new THREE.BufferGeometry()
      const starsCount = 10000
      const positions = new Float32Array(starsCount * 3)
      for (let i = 0; i < starsCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000
      }
      starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true })
      const stars = new THREE.Points(starsGeometry, starsMaterial)
      scene.add(stars)

      camera.position.z = 10

      const animate = () => {
        animationId = requestAnimationFrame(animate)
        stars.rotation.y += 0.0001
        stars.rotation.x += 0.00005
        renderer!.render(scene, camera)
      }
      animate()

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer!.setSize(window.innerWidth, window.innerHeight)
      }
      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        cancelAnimationFrame(animationId)
        if (mountRef.current && renderer?.domElement) {
          mountRef.current.removeChild(renderer.domElement)
        }
        renderer?.dispose()
        starsGeometry?.dispose()
        starsMaterial?.dispose()
      }
    } catch (e) {
      // WebGL context creation failed — CSS fallback handles the background
      console.warn("WebGL renderer init failed, using CSS fallback:", e)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed top-0 left-0 w-full h-full z-0"
      style={{ background: "radial-gradient(ellipse at center, #0d0d2b 0%, #000000 100%)" }}
    />
  )
}

/* =========================
   Floating Card (inlined)
   ========================= */

function FloatingCard({
  card,
  position,
}: {
  card: Card
  position: { x: number; y: number; z: number; rotationX: number; rotationY: number; rotationZ: number }
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedCard } = useCard()

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position)
    }
  })

  const handleClick = (e: any) => {
    e.stopPropagation()
    setSelectedCard(card)
  }
  const handlePointerOver = (e: any) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = "pointer"
  }
  const handlePointerOut = (e: any) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = "auto"
  }

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane
        ref={meshRef}
        args={[4.5, 6]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: "all 0.3s ease",
          transform: hovered ? "scale(1.15)" : "scale(1)",
          pointerEvents: "none",
        }}
      >
        <div
          className="w-40 h-52 rounded-lg overflow-hidden shadow-2xl bg-[#1F2121] p-3 select-none"
          style={{
            boxShadow: hovered
              ? "0 25px 50px rgba(49, 184, 198, 0.5), 0 0 30px rgba(49, 184, 198, 0.3)"
              : "0 15px 30px rgba(0, 0, 0, 0.6)",
            border: hovered ? "2px solid rgba(49, 184, 198, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <img
            src={card.imageUrl || "/placeholder.svg"}
            alt={card.alt}
            className="w-full h-40 object-cover rounded-md"
            loading="lazy"
            draggable={false}
          />
          <div className="mt-1 text-center">
            <p className="text-white text-xs font-medium truncate">{card.title}</p>
          </div>
        </div>
      </Html>
    </group>
  )
}

/* =========================
   Card Modal (inlined)
   ========================= */

function CardModal() {
  const { selectedCard, setSelectedCard } = useCard()
  const [isFavorited, setIsFavorited] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  if (!selectedCard) return null

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }

  const handleMouseEnter = () => {}
  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-out"
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)"
    }
  }

  const toggleFavorite = () => setIsFavorited((v) => !v)
  const handleClose = () => setSelectedCard(null)
  const handleBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="relative max-w-md w-full mx-4">
        <button onClick={handleClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10">
          <X className="w-8 h-8" />
        </button>

        <div style={{ perspective: "1000px" }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-[16px] bg-[#1F2121] p-4 transition-all duration-500 ease-out w-full"
            style={{
              transformStyle: "preserve-3d",
              boxShadow:
                "rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px",
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative w-full mb-4" style={{ aspectRatio: "3 / 4" }}>
              <img
                loading="lazy"
                className="absolute inset-0 h-full w-full rounded-[16px] bg-[#000000] object-cover"
                alt={selectedCard.alt}
                src={selectedCard.imageUrl || "/placeholder.svg"}
                style={{ boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 6px 0px", opacity: 1 }}
              />
            </div>

            <h3 className="text-white text-lg font-semibold mb-4 text-center">{selectedCard.title}</h3>

            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex h-9 flex-1 items-center justify-center rounded-lg text-base font-medium text-black outline-none transition duration-300 ease-out hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: "#31b8c6" }}
              >
                <div className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                  <span>Download</span>
                </div>
              </button>
              <button
                type="button"
                onClick={toggleFavorite}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-black outline-none transition duration-300 ease-out hover:opacity-80 active:scale-[0.97]"
                style={{ backgroundColor: "#31b8c6" }}
              >
                <Heart className="h-4 w-4" strokeWidth={1.8} fill={isFavorited ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================
   Card Galaxy (inlined)
   ========================= */

function CardGalaxy() {
  const { cards } = useCard()

  const cardPositions = useMemo(() => {
    const positions: {
      x: number
      y: number
      z: number
      rotationX: number
      rotationY: number
      rotationZ: number
    }[] = []
    const numCards = cards.length
    const goldenRatio = (1 + Math.sqrt(5)) / 2

    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = (2 * Math.PI * i) / goldenRatio
      const x = Math.cos(theta) * radiusAtY
      const z = Math.sin(theta) * radiusAtY
      const layerRadius = 12 + (i % 3) * 4

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
        rotationX: Math.atan2(z, Math.sqrt(x * x + y * y)),
        rotationY: Math.atan2(x, z),
        rotationZ: (Math.random() - 0.5) * 0.2,
      })
    }
    return positions
  }, [cards.length])

  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[i]} />
      ))}
    </>
  )
}

/* =========================
   Canvas Error Boundary
   ========================= */

class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: Error) {
    console.warn("Canvas render error (falling back):", error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

/* =========================
   Page/Component Export
   ========================= */

export default function StellarCardGallerySingle() {
  const [mounted, setMounted] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(false)

  useEffect(() => {
    // Detect WebGL support once on mount, before rendering anything Three.js related.
    // Uses the Brave-safe detectWebGL() helper (try/catch + failIfMajorPerformanceCaveat).
    setWebglAvailable(!!detectWebGL())
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-screen bg-black" />
  }

  return (
    <CardProvider>
      <div className="w-full h-screen relative overflow-hidden bg-black">
        <StarfieldBackground />

        {webglAvailable ? (
          <CanvasErrorBoundary
            fallback={
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <p className="text-white/50 text-sm">3D view not available in this browser</p>
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 0, 15], fov: 60 }}
              className="absolute inset-0 z-10"
              gl={{
                antialias: true,
                alpha: true,
                failIfMajorPerformanceCaveat: false,
                powerPreference: "default",
              }}
              onCreated={({ gl }) => {
                gl.domElement.style.pointerEvents = "auto"
              }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 10]} intensity={1.2} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <CardGalaxy />
                <OrbitControls
                  enablePan
                  enableZoom={false}
                  enableRotate
                  minDistance={5}
                  maxDistance={40}
                  autoRotate={false}
                  rotateSpeed={0.5}
                  zoomSpeed={1.2}
                  panSpeed={0.8}
                  target={[0, 0, 0]}
                />
              </Suspense>
            </Canvas>
          </CanvasErrorBoundary>
        ) : (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-center px-6 max-w-sm">
              <p className="text-white/60 text-sm">3D view didn't load.</p>
              <p className="text-white/40 text-xs mt-2">
                If you're on Brave, click the Shields icon in the address bar,
                open "Advanced Controls," and set "Block Fingerprinting" to
                Standard (or add a site exception) — Strict mode disables WebGL
                by default.
              </p>
            </div>
          </div>
        )}

        <CardModal />
      </div>
    </CardProvider>
  )
}
