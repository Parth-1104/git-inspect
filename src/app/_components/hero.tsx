"use client";

import Spline from "@splinetool/react-spline";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(80%_50%_at_50%_0%,_oklch(0.2_0_0)_0%,_transparent_50%)]" />
      <div className="mx-auto grid min-h-[100svh] w-full max-w-7xl grid-cols-1 items-end gap-10 px-6 pb-24 md:grid-cols-2 md:items-stretch md:pb-24">
        <div className="flex flex-col mt-[190px]">
          <div className="max-w-3xl ">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl bg-[linear-gradient(90deg,_#9ca3af_0%,_#ffffff_20%,_#9ca3af_40%,_#9ca3af_100%)] bg-clip-text text-transparent [background-size:200%_100%] [animation:shine_3s_linear_infinite]">
            Your codebase, explained at the speed of AI.
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            Every branch, every commit, crystal clear.
            </p>
          </div>
        </div>

        <div className="relative h-64 overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-b from-primary/10 to-transparent md:h-auto">
          <Spline
            scene="https://prod.spline.design/ymG2vng9ta3piEeD/scene.splinecode"
            className="absolute inset-0 h-full w-full pointer-events-none"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>
      </div>
    </section>
  );
}