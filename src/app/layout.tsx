import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import { seo } from "@/lib/copy";
import { buildLocalBusinessSchema } from "@/lib/schema";
import { StagingBanner } from "@/components/layout/StagingBanner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: seo.title,
  description: seo.description,
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: seo.ogTitle,
    description: seo.ogDescription,
    type: "website",
    url: siteConfig.url,
    images: [{ url: siteConfig.images.og, width: 1200, height: 630, alt: "LÖYLY CO. Sauna Cleaning Brisbane" }],
  },
  robots: siteConfig.isStaging
    ? { index: false, follow: false }
    : { index: true, follow: true },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#2b2622",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = buildLocalBusinessSchema();

  return (
    <html lang="en-AU" className={`${serif.variable} ${sans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body>
        <a className="skip" href="#book">
          Skip to booking
        </a>
        <StagingBanner />
        <Header />
        {children}
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
