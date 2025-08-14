"use client";

import Spline from "@splinetool/react-spline";
import { useState } from "react";

interface HeroProps {
  onSplineLoaded?: () => void;
}

export function Hero({ onSplineLoaded }: HeroProps) {
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  const handleSplineLoad = () => {
    setIsSplineLoaded(true);
    onSplineLoaded?.();
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,_oklch(0.2_0_0)_0%,_transparent_50%)]" />
      <div className="mx-auto grid min-h-[100svh] w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 py-16 md:grid-cols-2 md:items-stretch md:gap-10 md:px-6 md:py-24">
        <div className="flex flex-col mt-0 md:mt-[190px] items-center md:items-start">
          <div className="max-w-3xl ">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl bg-[linear-gradient(90deg,_#9ca3af_0%,_#ffffff_20%,_#9ca3af_40%,_#9ca3af_100%)] bg-clip-text text-transparent [background-size:200%_100%] [animation:shine_3s_linear_infinite] text-center md:text-left">
            Your codebase, explained at the speed of AI.
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg text-center md:text-left">
            Every branch, every commit, crystal clear.
            </p>
          </div>
        </div>
       

        <div className="relative h-[580px] mt-[20px] sm:h-[520px] overflow-hidden rounded-xl border border-primary/30  md:h-auto mt-6 md:mt-0">
          <Spline
            scene="https://prod.spline.design/ymG2vng9ta3piEeD/scene.splinecode"
            className="absolute inset-0 h-full w-full pointer-events-none"
            onLoad={handleSplineLoad}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          
          {/* Black rectangle clipped to container */}
          <div className="absolute bottom-4 right-4 w-58 h-18 bg-[#090909] z-10  md:block" />
        </div>

      </div>
    </section>
  );
}