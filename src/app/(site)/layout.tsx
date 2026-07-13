import { StagingBanner } from "@/components/layout/StagingBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <a className="skip" href="#book">
        Skip to booking
      </a>
      <StagingBanner />
      <Header />
      {children}
      <Footer />
      <MobileActionBar />
    </>
  );
}
