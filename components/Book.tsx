"use client";

import { useEffect, useRef } from "react";
import { PageFlip } from "page-flip";
import Image from "next/image";


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

    // const pages = bookRef.current.querySelectorAll(".book-page");
    pageFlip.loadFromHTML(bookRef.current.querySelectorAll(".book-page"));

    return () => {
      pageFlip.destroy();
    };
  }, []);

  return (
    <div ref={bookRef}>
      {/* Front Cover */}
      <div
        className="book-page bg-blue-700 text-white"
        data-density="hard"
        style={{ width: 200, height: 700 }}
      >
        <Image
          // src="/frontr.png"
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
        className="  book-page bg-amber-50 text-black"
        style={{ width: 600, height: 500 }}
      >
        {/* <div className="flex h-full items-center justify-center text-4xl">
          Page 1
        </div> */}

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

        {/* <Image
      src="/elements/stamp.png"
        alt="Front Cover"
    fill
    priority
    draggable={false}
    className="object-contain  -rotate-12  -translate-x-20 translate-y-30 scale-40   "
        ></Image>  */}

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

        <Image
          src="/ref/girl.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-33  rotate-10  translate-x-14 -translate-y-23 "
        ></Image>

        <Image
          src="/elements/frame10.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-65 rotate-10  translate-x-14 -translate-y-20 "
        ></Image>

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
        {/* <div className="flex h-full items-center justify-center text-4xl">
          Page 2
        </div> */}
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

        <Image
          src="/ref/girl.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black rotate-20  translate-x-19 -translate-y-22  scale-22   "
        ></Image>

        <Image
          src="/ref/girl2.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black rotate-20  translate-x-26 -translate-y-43  scale-22   "
        ></Image>

        <Image
          src="/ref/girl3.jpg"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain shadow-black rotate-20  translate-x-11 translate-y-1  scale-22   "
        ></Image>

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
        {/* <div className="flex h-full items-center justify-center text-4xl">
          Page 3
        </div> */}

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

        <Image
          src="/ref/girl4.jpg"
          alt="Frame"
          fill
          priority
          draggable={false}
          className="object-contain scale-33 rotate-17 translate-x-13 -translate-y-21 z-30"
        />

        {/* Photo Frame (Main Focus) */}
        <Image
          src="/elements/frame11.png"
          alt="Frame"
          fill
          priority
          draggable={false}
          className="object-contain scale-75 rotate-18 translate-x-10 -translate-y-11 z-30"
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

        <Image
          src="/ref/girl5.jpg"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-32  rotate-0 z-50 translate-x-19 -translate-y-32 "
        />

        {/* <Image
          src="/ref/girl1.jpg"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 translate-x-18 -translate-y-28 "
        /> */}

        <Image
          src="/frames/frame5.png"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-68  rotate-0 z-50 translate-x-18 -translate-y-28 "
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

        <Image
          src="/ref/girl4.jpg"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-26  -rotate-11 z-50 translate-x-4 -translate-y-12 "
        />

        <Image
          src="/ref/girl10.jpg"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-26  rotate-11 z-50 translate-x-16 -translate-y-40 "
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


          <Image
          src="/ref/girl9.jpg"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-28  -rotate-4 z-50 -translate-x-18 -translate-y-16 "
        />
        
          <Image
          src="/ref/girl8.jpg"
          alt="Disk"
          fill
          priority
          draggable={false}
          className="object-contain scale-27  rotate-10 z-50 -translate-x-11 translate-y-13 "
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
        {/* <div className="flex h-full items-center justify-center text-5xl font-bold">
          Back Cover
        </div> */}
          <Image
          // src="/frontr.png"
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