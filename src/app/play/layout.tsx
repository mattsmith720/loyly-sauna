import type { ReactNode } from "react";
import { PlayRouteChrome } from "@/app/play/PlayRouteChrome";
import "./play-route.css";

interface PlayLayoutProps {
  children: ReactNode;
}

export default function PlayLayout({ children }: PlayLayoutProps) {
  return (
    <PlayRouteChrome>
      <div className="play-route-layout">{children}</div>
    </PlayRouteChrome>
  );
}
