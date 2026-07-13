"use client";

import { useEffect } from "react";
import { SaunaCanvas } from "./SaunaCanvas";
import { Hud } from "./Hud";
import { StartScreen } from "./StartScreen";
import { SaunaGameProvider, useSaunaGame } from "./useSaunaGame";

function SaunaGameInner() {
  const { state } = useSaunaGame();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (state.phase !== "playing" || state.pointerLocked) return;

    const onClick = () => {
      const canvas = document.querySelector(".game-shell canvas");
      if (canvas instanceof HTMLCanvasElement) {
        canvas.requestPointerLock();
      }
    };

    window.addEventListener("click", onClick, { once: true });
    return () => window.removeEventListener("click", onClick);
  }, [state.phase, state.pointerLocked]);

  return (
    <div className="relative h-dvh w-full">
      <SaunaCanvas />
      <StartScreen />
      <Hud />
    </div>
  );
}

export function SaunaGame() {
  return (
    <SaunaGameProvider>
      <SaunaGameInner />
    </SaunaGameProvider>
  );
}
