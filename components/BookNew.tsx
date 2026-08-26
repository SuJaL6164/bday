"use client";

import { useEffect, useRef } from "react";
import { PageFlip } from "page-flip";
import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * SimplePhoto
 * -------------------------------------------------------------------------
 * For photos that are NOT paired with a specific frame graphic (i.e. no
 * separate frame PNG whose "window" needs to line up with this photo).
 * Fixed-size box + object-cover, so any photo aspect ratio gets cropped
 * to fill the box consistently.
 */
function SimplePhoto({
  src,
  alt = "",
  width,
  height,
  objectPosition = "center",
  rounded,
  wrapperClassName = "",
  wrapperStyle,
  sizes = "25vw",
}: {
  src: string;
  alt?: string;
  width: number;
  height: number;
  objectPosition?: string;
  rounded?: string;
  wrapperClassName?: string;
  wrapperStyle?: CSSProperties;
  sizes?: string;
}) {
  return (
    <div
      className={`absolute overflow-hidden ${wrapperClassName}`}
      style={{
        top: "50%",
        left: "50%",
        marginLeft: -width / 2,
        marginTop: -height / 2,
        width,
        height,
        borderRadius: rounded,
        ...wrapperStyle,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        draggable={false}
        sizes={sizes}
        style={{ objectFit: "cover", objectPosition }}
        className="pointer-events-none select-none"
      />
    </div>
  );
}

/**
 * PhotoInFrame
 * -------------------------------------------------------------------------
 * Use this whenever a decorative frame PNG (frame5, frame7, frame8, frame9,
 * frame10, frame11...) is meant to visually "contain" a specific photo.
 *
 * Frame image + photo box live inside ONE wrapper that carries a SINGLE
 * scale/rotate/translate (frameClassName), so they always move together —
 * no drift between where the photo sits and where the frame's window is.
 *
 * IMPORTANT — because photoWidth/photoHeight/photoOffsetX/photoOffsetY are
 * all measured BEFORE frameClassName's transform is applied, if
 * frameClassName includes a scale-*, you must divide your desired FINAL
 * on-screen size/offset by that scale factor to compensate, e.g.:
 *   frameClassName="scale-65 ..."   →   photoWidth = desiredFinalWidth / 0.65
 * This is already done below for frame10 (0.65), frame11 (0.75), and
 * frame5 (0.68). If you change any scale-NN value, re-divide by the new
 * factor (NN / 100) to keep the same final rendered size.
 *
 * TUNING WORKFLOW (do this once per frame graphic):
 * 1. Temporarily add `outline outline-2 outline-red-500` to the inner photo
 *    wrapper below so you can see its box clearly against the frame art.
 * 2. Adjust photoOffsetX / photoOffsetY / photoWidth / photoHeight (all in
 *    PRE-scale units) until the box lines up with the frame's transparent
 *    window in its final rendered state.
 * 3. Remove the debug outline. Done — stays in sync even if you later
 *    change frameClassName's rotate/translate (scale changes need the
 *    division above re-applied).
 */
function PhotoInFrame({
  frameSrc,
  photoSrc,
  photoAlt = "",
  frameClassName = "",
  photoOffsetX = 0,
  photoOffsetY = 0,
  photoWidth,
  photoHeight,
  objectPosition = "center",
  sizes = "25vw",
}: {
  frameSrc: string;
  photoSrc: string;
  photoAlt?: string;
  /** scale-/rotate-/translate- classes shared by BOTH the frame art and the photo */
  frameClassName?: string;
  /** px offset of the photo's center from the wrapper's center, in PRE-scale local space */
  photoOffsetX?: number;
  photoOffsetY?: number;
  /** px size of the photo box, in PRE-scale local space (divide desired final size by frameClassName's scale factor) */
  photoWidth: number;
  photoHeight: number;
  objectPosition?: string;
  sizes?: string;
}) {
  return (
    <div className={`absolute inset-0 ${frameClassName}`}>
      {/* Photo sits UNDER the frame art, positioned within the frame's own local space */}
      <div
        className="absolute overflow-hidden"
        style={{
          top: "50%",
          left: "50%",
          marginLeft: photoOffsetX - photoWidth / 2,
          marginTop: photoOffsetY - photoHeight / 2,
          width: photoWidth,
          height: photoHeight,
        }}
      >
        <Image
          src={photoSrc}
          alt={photoAlt}
          fill
          draggable={false}
          sizes={sizes}
          style={{ objectFit: "cover", objectPosition }}
          className="pointer-events-none select-none"
        />
      </div>

      <Image
        src={frameSrc}
        alt=""
        fill
        priority
        draggable={false}
        style={{ objectFit: "contain" }}
        className="pointer-events-none select-none"
      />
    </div>
  );
}

export default function Book() {
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookRef.current) return;

    const pageFlip = new PageFlip(bookRef.current, {
      width: 400,
      height: 500,
      autoSize: false,
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.5,
      usePortrait: false,
      startPage: 0,
    });

    pageFlip.loadFromHTML(bookRef.current.querySelectorAll(".book-page"));

    return () => {
      pageFlip.destroy();
    };
  }, []);

  return (
    <div ref={bookRef}>
      {/* Front Cover */}
      <div
        className="relative book-page bg-blue-700 text-white"
        data-density="hard"
        style={{ width: 200, height: 700 }}
      >
        <Image
          src="/pages/front.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-130 translate-x-3 pointer-events-none select-none"
        ></Image>

        <div className="flex h-full items-center justify-center text-5xl font-bold"></div>
      </div>

      {/* Page 1 */}
      <div
        className="relative book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/left.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain  pointer-events-none select-none"
        ></Image>

        <Image
          src="/elements/fwine.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain  -rotate-12  -translate-x-34 -translate-y-33 scale-35   "
        ></Image>

        <Image
          src="/elements/side3.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain   -translate-x-23 -translate-y-14 scale-78   "
        ></Image>

        <Image
          src="/elements/mouse.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain   z-50 translate-x-20 translate-y-46 scale-55   "
        ></Image>

        <Image
          src="/elements/butter.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-45 rotate-30  -translate-x-28 translate-y-32 "
        ></Image>

        {/* frame10: scale-65 (0.65) -> photoWidth/Height compensated: 132 / 0.65 ≈ 203 */}
        <PhotoInFrame
          frameSrc="/elements/frame10.png"
          photoSrc="/ref/girl2.jpg"
          frameClassName="scale-65 rotate-10 translate-x-14 -translate-y-20"
          photoOffsetX={0}
          photoOffsetY={0}
          photoWidth={203}
          photoHeight={203}
        />

        <Image
          src="/elements/text1.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-45   translate-x-10 translate-y-15 "
        ></Image>
      </div>

      {/* Page 2 */}
      <div
        className="relative overflow-hidden book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/right.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain  pointer-events-none select-none"
        ></Image>

        <Image
          src="/elements/paper.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain rotate-90 shadow-black   translate-x-18 translate-y-38  scale-50   "
        ></Image>

        <Image
          src="/elements/starB.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black  -rotate-50 -translate-x-17 translate-y-30  scale-50   "
        ></Image>

        {/* These 3 photos don't share frame9's transform in the original — independent
            decorative photos, not individually boxed by frame9. Kept as SimplePhoto. */}
        <SimplePhoto
          src="/ref/girl.jpg"
          width={88}
          height={88}
          wrapperClassName="rotate-20 translate-x-19 -translate-y-22"
        />

        <SimplePhoto
          src="/ref/girl3.jpg"
          width={76}
          height={76}
          wrapperClassName="rotate-20 translate-x-26 -translate-y-43"
        />

        <SimplePhoto
          src="/pipis/pipi4.jpg"
          width={80}
          height={80}
          wrapperClassName="rotate-20 translate-x-10 translate-y-3"
        />

        <Image
          src="/elements/frame9.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black rotate-12  translate-x-18 -translate-y-20  scale-80   "
        ></Image>

        <Image
          src="/elements/text2.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black rotate-0 -translate-x-13 -translate-y-40  scale-60   "
        ></Image>

        <Image
          src="/elements/kit.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black rotate-0 -translate-x-13 -translate-y-16  scale-60   "
        ></Image>
      </div>

      {/* Page 3 */}
      <div
        className="relative overflow-hidden book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/left.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain pointer-events-none select-none"
        />

        {/* Lyrics */}
        <Image
          src="/elements/billa6.png"
          alt="Lyrics"
          fill
          priority
          draggable={false}
          className="object-contain scale-55 rotate-1 -translate-x-30 -translate-y-10"
        />

        {/* Wine */}
        <Image
          src="/elements/side1.png"
          alt="Wine"
          fill
          priority
          draggable={false}
          className="object-contain scale-50 rotate-180 -translate-x-26 translate-y-31"
        />

        {/* Tape */}
        <Image
          src="/elements/starem.png"
          alt="Tape"
          fill
          priority
          draggable={false}
          className="object-contain scale-16 -rotate-18 translate-x-18 -translate-y-56 z-20"
        />

        {/* frame11: scale-75 (0.75) -> photoWidth/Height compensated: 132 / 0.75 ≈ 176 */}
        <PhotoInFrame
          frameSrc="/elements/frame11.png"
          photoSrc="/pipis/pipi6.jpg"
          frameClassName="scale-75 rotate-18 translate-x-10 -translate-y-11 z-30"
          photoOffsetX={0}
          photoOffsetY={0}
          photoWidth={176}
          photoHeight={176}
        />

        {/* Recorder */}
        <Image
          src="/elements/moon.png"
          alt="Recorder"
          fill
          priority
          draggable={false}
          className="object-contain scale-34 -rotate-14 -translate-x-20 translate-y-30 z-40"
        />

        <Image
          src="/elements/fits.png"
          alt="Recorder"
          fill
          priority
          draggable={false}
          className="object-contain scale-44 -rotate-14 -translate-x-30 -translate-y-50 z-40"
        />

        {/* Vinyl Disk */}
        <Image
          src="/elements/note1.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68 -rotate-7 z-50 translate-x-14 translate-y-38 "
        />

        {/* Old Paper */}
        <Image
          src="/elements/lovetape.png"
          alt="Old Paper"
          fill
          priority
          draggable={false}
          className="object-contain scale-19 rotate-0 z-50 translate-x-10 translate-y-24"
        />
      </div>

      {/* Page 4 */}
      <div
        className="relative overflow-hidden book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/right.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain pointer-events-none select-none"
        />

        <Image
          src="/elements/side2.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 translate-x-16 translate-y-23 "
        />

        <Image
          src="/elements/billa.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-38  rotate-0 z-50 -translate-x-14 -translate-y-28 "
        />

        <Image
          src="/elements/boqey.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-48  rotate-0 z-50 -translate-x-14 translate-y-28 "
        />

        {/* frame5: scale-68 (0.68) -> photoWidth/Height compensated: 120 / 0.68 ≈ 176 */}
        <PhotoInFrame
          frameSrc="/frames/frame5.png"
          photoSrc="/pipis/pipi12.jpg"
          frameClassName="scale-68 translate-x-18 -translate-y-28 z-50"
          photoOffsetX={0}
          photoOffsetY={0}
          photoWidth={176}
          photoHeight={176}
        />

        <Image
          src="/elements/miss.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-48  rotate-18 z-50 translate-x-28 translate-y-4 "
        />
      </div>

      {/* Page 5 */}
      <div
        className="relative overflow-hidden book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/left.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain pointer-events-none select-none"
        />

        <Image
          src="/elements/side4.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 -translate-x-22 translate-y-23 "
        />

        <Image
          src="/elements/disk.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 -translate-x-50 -translate-y-15 "
        />

        <Image
          src="/elements/billa5.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 translate-x-19 translate-y-33 "
        />

        {/* No matching per-photo frame transform in the original — frame8.png covers both
            photos at once. Kept as SimplePhoto. */}
        <SimplePhoto
          src="/pipis/pipi9.jpg"
          width={92}
          height={92}
          wrapperClassName="-rotate-11 translate-x-4 -translate-y-10 z-50"
        />

        <SimplePhoto
          src="/pipis/pipi10.jpg"
          width={92}
          height={92}
          wrapperClassName="rotate-11 translate-x-16 -translate-y-40 z-50"
        />

        <Image
          src="/elements/frame8.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 translate-x-10 -translate-y-25 "
        />

        <Image
          src="/elements/twoStar.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-38  rotate-0 z-50 -translate-x-14 translate-y-20 "
        />

        <Image
          src="/elements/text3.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-48  rotate-0 z-50 -translate-x-22 -translate-y-48 "
        />
      </div>

      {/* Page 6 */}
      <div
        className="relative overflow-hidden book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/right.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain pointer-events-none select-none"
        />

        <Image
          src="/elements/side5.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-78  rotate-0 z-50 translate-x-22 translate-y-14 "
        />

        <Image
          src="/elements/text4.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-58  rotate-0 z-50 -translate-x-6 -translate-y-40 "
        />

        {/* No matching per-photo frame transform in the original — frame7.png covers both
            photos at once. Kept as SimplePhoto. */}
        <SimplePhoto
          src="/pipis/pipi12.jpg"
          width={112}
          height={112}
          wrapperClassName="-rotate-4 -translate-x-18 -translate-y-12 z-50"
        />

        <SimplePhoto
          src="/pipis/pipi13.jpg"
          width={96}
          height={96}
          wrapperClassName="rotate-10 -translate-x-11 translate-y-14 z-50"
        />

        <Image
          src="/elements/frame7.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 -translate-x-14 translate-y-1 "
        />

        <Image
          src="/elements/billa4.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-58  rotate-0 z-50 -translate-x-17 translate-y-40 "
        />
      </div>

      {/* Back Cover */}
      <div
        className="relative overflow-hidden book-page bg-blue-700 text-white"
        data-density="hard"
        style={{ width: 600, height: 500 }}
      >
        <Image
          src="/pages/back.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-130 translate-x-3 pointer-events-none select-none"
        ></Image>
      </div>
    </div>
  );
}