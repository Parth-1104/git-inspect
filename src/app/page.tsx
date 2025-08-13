import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { FeaturesSection } from "./_components/features";
import { PricingSection } from "./_components/pricing";
import { TestimonialsSection } from "./_components/testimonials";

export default async function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
    </main>
  );
}
