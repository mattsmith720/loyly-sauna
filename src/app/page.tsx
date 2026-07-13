import { Hero } from "@/components/sections/Hero";
import { ProcessVisual } from "@/components/sections/ProcessVisual";
import { Problem } from "@/components/sections/Problem";
import { Method } from "@/components/sections/Method";
import { ProofBand } from "@/components/sections/ProofBand";
import { LocalStrip } from "@/components/sections/LocalStrip";
import { Guarantee } from "@/components/sections/Guarantee";
import { Services } from "@/components/sections/Services";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Faq } from "@/components/sections/Faq";
import { Booking } from "@/components/sections/Booking";

export default function HomePage() {
  return (
    <main id="top">
      <Hero />
      <ProcessVisual />
      <Problem />
      <Method />
      <ProofBand />
      <LocalStrip />
      <Guarantee />
      <Services />
      <HowItWorks />
      <Faq />
      <Booking />
    </main>
  );
}
