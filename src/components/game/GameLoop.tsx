"use client";

import { useFrame } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";

export function GameLoop() {
  const { dispatch } = useSaunaGame();

  useFrame((_, delta) => {
    dispatch({ type: "tick", delta });
  });

  return null;
}
