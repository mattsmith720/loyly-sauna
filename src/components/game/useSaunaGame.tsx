"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
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
  audio: {
    muted: boolean;
    volume: number;
    unlocked: boolean;
    unlock: () => void;
    toggleMute: () => void;
    setMuted: (muted: boolean) => void;
    setVolume: (volume: number) => void;
  };
};

const SaunaGameContext = createContext<SaunaGameContextValue | null>(null);

export function SaunaGameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(saunaGameReducer, initialSaunaGameState);
  const [audioMuted, setAudioMuted] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.24);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const setVolume = useCallback((volume: number) => {
    setAudioVolume(Math.min(0.6, Math.max(0.05, volume)));
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setAudioMuted(muted);
  }, []);

  const toggleMute = useCallback(() => {
    setAudioMuted((muted) => !muted);
  }, []);

  const unlock = useCallback(() => {
    setAudioUnlocked(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    dispatch({ type: "set_reduced_motion", reduced: mq.matches });
    const onChange = (event: MediaQueryListEvent) => {
      dispatch({ type: "set_reduced_motion", reduced: event.matches });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const storedMuted = window.localStorage.getItem("loyly.audio.muted");
    const storedVolume = window.localStorage.getItem("loyly.audio.volume");
    if (storedMuted === null) {
      setAudioMuted(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } else {
      setAudioMuted(storedMuted === "1");
    }
    if (storedVolume !== null) {
      const parsed = Number.parseFloat(storedVolume);
      if (Number.isFinite(parsed)) {
        setVolume(parsed);
      }
    }
  }, [setVolume]);

  useEffect(() => {
    window.localStorage.setItem("loyly.audio.muted", audioMuted ? "1" : "0");
  }, [audioMuted]);

  useEffect(() => {
    window.localStorage.setItem("loyly.audio.volume", audioVolume.toFixed(3));
  }, [audioVolume]);

  const value = useMemo(
    () => ({
      state,
      dispatch,
      prompt: getInteractionPrompt(state),
      audio: {
        muted: audioMuted,
        volume: audioVolume,
        unlocked: audioUnlocked,
        unlock,
        toggleMute,
        setMuted,
        setVolume,
      },
    }),
    [state, audioMuted, audioVolume, audioUnlocked, unlock, toggleMute, setMuted, setVolume],
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
