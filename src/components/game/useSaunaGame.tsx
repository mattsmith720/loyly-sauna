"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import {
  getInteractionPrompt,
  initialSaunaGameState,
  saunaGameReducer,
  type SaunaGameAction,
  type SaunaGameState,
} from "./sauna-game-state";

type SaunaGameContextValue = {
  state: SaunaGameState;
  dispatch: (action: SaunaGameAction) => void;
  prompt: string | null;
};

const SaunaGameContext = createContext<SaunaGameContextValue | null>(null);

export function SaunaGameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(saunaGameReducer, initialSaunaGameState);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    dispatch({ type: "set_reduced_motion", reduced: mq.matches });
    const onChange = (event: MediaQueryListEvent) => {
      dispatch({ type: "set_reduced_motion", reduced: event.matches });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      prompt: getInteractionPrompt(state),
    }),
    [state],
  );

  return <SaunaGameContext.Provider value={value}>{children}</SaunaGameContext.Provider>;
}

export function useSaunaGame() {
  const ctx = useContext(SaunaGameContext);
  if (!ctx) {
    throw new Error("useSaunaGame must be used within SaunaGameProvider");
  }
  return ctx;
}
