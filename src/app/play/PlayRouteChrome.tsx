"use client";

import { useEffect, type ReactNode } from "react";

interface PlayRouteChromeProps {
  children: ReactNode;
}

export function PlayRouteChrome({ children }: PlayRouteChromeProps) {
  useEffect(() => {
    document.body.dataset.playRoute = "true";

    return () => {
      delete document.body.dataset.playRoute;
    };
  }, []);

  return <>{children}</>;
}
