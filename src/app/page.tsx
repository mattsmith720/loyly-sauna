import { Hero } from "@/components/sections/Hero";
import { ProcessVisual } from "@/components/sections/ProcessVisual";
import { LocalStrip } from "@/components/sections/LocalStrip";
import { ProofBand } from "@/components/sections/ProofBand";
import { Services } from "@/components/sections/Services";
import { Booking } from "@/components/sections/Booking";

export default function HomePage() {
  return (
    <main id="top">
      <Hero />
      <ProcessVisual />
      <LocalStrip />
      <ProofBand />
      <Services />
      <Booking />
    </main>
  );
}
