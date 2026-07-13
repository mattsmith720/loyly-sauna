"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useSaunaGame } from "./useSaunaGame";
import type { InteractableId } from "./sauna-game-state";

const INTERACT_DISTANCE = 2.4;

export function InteractionRaycast() {
  const { camera, scene } = useThree();
  const { state, dispatch } = useSaunaGame();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const lastId = useRef<InteractableId | null>(null);

  useEffect(() => {
    if (state.phase !== "playing") {
      if (lastId.current !== null) {
        lastId.current = null;
        dispatch({ type: "set_focus", id: null });
      }
    }
  }, [dispatch, state.phase]);

  useFrame(() => {
    if (state.phase !== "playing") return;

    camera.getWorldDirection(direction);
    raycaster.set(camera.position, direction);
    raycaster.far = INTERACT_DISTANCE;

    const hits = raycaster.intersectObjects(scene.children, true);
    let found: InteractableId | null = null;
    for (const hit of hits) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj) {
        const id = obj.userData?.interactableId as InteractableId | undefined;
        if (id) {
          found = id;
          break;
        }
        obj = obj.parent;
      }
      if (found) break;
    }

    if (found !== lastId.current) {
      lastId.current = found;
      dispatch({ type: "set_focus", id: found });
    }
  });

  return null;
}
