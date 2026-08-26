"use client";

import Spline from '@splinetool/react-spline';

export default function SplineScene() {
  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center">
      <Spline scene="https://prod.spline.design/1V1I43WtFtj6Ii1w/scene.splinecode" />
    </div>
  );
}
