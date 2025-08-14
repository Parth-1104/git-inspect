'use client'

import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { FeaturesSection } from "./_components/features";
import { PricingSection } from "./_components/pricing";
import { TestimonialsSection } from "./_components/testimonials";
import { Loader } from "./_components/loader";
import { useState } from "react";

export default function Home() {
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);

  const handleSplineLoaded = () => {
    // Add a small delay to ensure smooth transition
    setTimeout(() => {
      setIsSplineLoaded(true);
    }, 500);
  };

  return (
    <>
      {!isSplineLoaded && <Loader />}
      <main className={`min-h-screen overflow-x-hidden transition-opacity duration-500 ${!isSplineLoaded ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <Hero onSplineLoaded={handleSplineLoaded} />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
      </main>
    </>
  );
}
