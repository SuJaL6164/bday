"use client";

import { Caveat } from "next/font/google";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "./DraggableCards";

const handwriting = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// const images = [
//   "/pipis/pipi3.jpg",
//   "/pipis/pipi4.jpg",
//   "/pipis/pipi5.jpg",
//   "/pipis/pipi6.jpg",
//   "/pipis/pipi7.jpg",
//   // "/pipis/pipi8.jpg",
//   "/pipis/pipi9.jpg",
//   "/pipis/pipi10.jpg",
//   "/pipis/pipi11.jpg",
// ];

const images = [
  "/ref/girl2.jpg",
  "/ref/girl3.jpg",
  "/ref/girl4.jpg",
  "/ref/girl5.jpg",
  "/ref/girl6.jpg",
  "/ref/girl7.jpg",
  "/ref/girl8.jpg",
  "/ref/girl9.jpg",
  "/ref/girl10.jpg",
  "/ref/girl11.jpg",
];

const captions = [
  "Cutie 🥹",
  "Baddie 😎",
  "Pretty ✨",
  "My Love 🤍",
  "Sunshine ☀️",
  // "Angel 🪽",
  "Beautiful 🌸",
  "Dream Girl 💫",
  "Queen 👑",
];

const positions = [
  "top-[8%] left-[8%] rotate-[-8deg]",
  "top-[15%] left-[35%] rotate-[6deg]",
  "top-[10%] right-[10%] rotate-[-5deg]",
  "top-[45%] left-[12%] rotate-[7deg]",
  "top-[50%] left-[40%] rotate-[-6deg]",
  "top-[40%] right-[12%] rotate-[10deg]",
  "bottom-[10%] left-[18%] rotate-[-10deg]",
  "bottom-[12%] left-[45%] rotate-[5deg]",
  "bottom-[8%] right-[15%] rotate-[-7deg]",
];

export default function LoveGallery() {
  return (
    <DraggableCardContainer
      className="
        relative
        min-h-screen
        overflow-visible
        bg-[#d9d3c7]

        before:absolute
        before:inset-0
        before:pointer-events-none
        before:bg-[linear-gradient(rgba(120,110,90,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(120,110,90,0.12)_1px,transparent_1px)]
        before:bg-[size:40px_40px]

        after:absolute
        after:inset-0
        after:pointer-events-none
        after:bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.08))]
      "
    >
      {images.map((img, index) => (
        <DraggableCardBody
          key={img}
          className={`
            absolute
            ${positions[index]}
            bg-white
            rounded-xl
            shadow-2xl
            p-3
            overflow-visible
            cursor-grab
            active:cursor-grabbing
            touch-none
            select-none
            z-10
            hover:scale-[1.03]
          `}
        >
          <div className="relative overflow-visible">
            <img
              src={img}
              alt={img}
              draggable={false}
              className="
                h-56
                w-56
                rounded-lg
                object-cover
                pointer-events-none
                select-none
              "
            />

            <div
              className="
                absolute
                -top-7
                -right-7
                text-5xl
                z-50
                pointer-events-none
                drop-shadow-md
              "
            >
              ❤️
            </div>

            <p
              className={`
                mt-3
                text-center
                text-neutral-700
                text-3xl
                font-semibold
                ${handwriting.className}
                pointer-events-none
              `}
            >
              {captions[index]}
            </p>
          </div>
        </DraggableCardBody>
      ))}

      <div
        className="
          absolute
          top-20
          left-20
          text-5xl
          opacity-30
          pointer-events-none
        "
      >
        ✿
      </div>

      <div
        className="
          absolute
          bottom-20
          right-20
          text-5xl
          opacity-30
          pointer-events-none
        "
      >
        ♡
      </div>

      <div
        className="
          absolute
          top-[45%]
          right-[5%]
          text-4xl
          opacity-30
          pointer-events-none
        "
      >
        ✨
      </div>
    </DraggableCardContainer>
  );
}