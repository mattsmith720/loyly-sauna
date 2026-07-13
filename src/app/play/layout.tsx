import type { ReactNode } from "react";
import type { Viewport } from "next";
import { PlayRouteChrome } from "@/app/play/PlayRouteChrome";
import "./play-route.css";

interface PlayLayoutProps {
  children: ReactNode;
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function PlayLayout({ children }: PlayLayoutProps) {
  return (
    <PlayRouteChrome>
      <div className="play-route-layout">{children}</div>
    </PlayRouteChrome>
  );
}
