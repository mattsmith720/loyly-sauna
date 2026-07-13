"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";

export function OutsideTransition() {
  const { camera } = useThree();
  const { state } = useSaunaGame();

  useEffect(() => {
    if (state.playerMode === "outside") {
      camera.position.z = 2.15;
    } else if (state.playerMode === "walking" && camera.position.z > 1.5) {
      camera.position.z = 0.85;
    }
  }, [camera, state.playerMode]);

  return null;
}
