"use client";

import { useEffect, useRef } from "react";
import { useSaunaGame } from "./useSaunaGame";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createNoiseBuffer(context: AudioContext, duration: number, scale = 1) {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration));
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    const value = (Math.random() * 2 - 1) * scale;
    const shape = Math.sin((i / frameCount) * Math.PI);
    channel[i] = value * (0.35 + shape * 0.65);
  }
  return buffer;
}

function playSteamBurst(context: AudioContext, destination: AudioNode, reducedMotion: boolean) {
  const now = context.currentTime;
  const burst = context.createBufferSource();
  burst.buffer = createNoiseBuffer(context, 0.46, 0.9);
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 650;
  const lowpass = context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 5200;
  const gain = context.createGain();
  const peak = reducedMotion ? 0.08 : 0.13;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.44);
  burst.connect(highpass);
  highpass.connect(lowpass);
  lowpass.connect(gain);
  gain.connect(destination);
  burst.start(now);
  burst.stop(now + 0.5);

  const splash = context.createOscillator();
  splash.type = "triangle";
  splash.frequency.setValueAtTime(940, now);
  splash.frequency.exponentialRampToValueAtTime(290, now + 0.12);
  const splashGain = context.createGain();
  splashGain.gain.setValueAtTime(0.0001, now);
  splashGain.gain.exponentialRampToValueAtTime(reducedMotion ? 0.04 : 0.06, now + 0.01);
  splashGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  splash.connect(splashGain);
  splashGain.connect(destination);
  splash.start(now);
  splash.stop(now + 0.2);
}

function playRoundEndChime(context: AudioContext, destination: AudioNode, reducedMotion: boolean) {
  const now = context.currentTime + 0.02;
  const low = context.createOscillator();
  low.type = "sine";
  low.frequency.setValueAtTime(440, now);
  low.frequency.exponentialRampToValueAtTime(554, now + 0.45);
  const lowGain = context.createGain();
  lowGain.gain.setValueAtTime(0.0001, now);
  lowGain.gain.exponentialRampToValueAtTime(reducedMotion ? 0.045 : 0.065, now + 0.06);
  lowGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
  low.connect(lowGain);
  lowGain.connect(destination);
  low.start(now);
  low.stop(now + 1.25);

  const high = context.createOscillator();
  high.type = "triangle";
  high.frequency.setValueAtTime(660, now + 0.04);
  high.frequency.exponentialRampToValueAtTime(880, now + 0.5);
  const highGain = context.createGain();
  highGain.gain.setValueAtTime(0.0001, now + 0.04);
  highGain.gain.exponentialRampToValueAtTime(reducedMotion ? 0.03 : 0.05, now + 0.11);
  highGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
  high.connect(highGain);
  highGain.connect(destination);
  high.start(now + 0.04);
  high.stop(now + 1.05);
}

export function Audio() {
  const { state, audio } = useSaunaGame();
  const contextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const fireGainRef = useRef<GainNode | null>(null);
  const forestGainRef = useRef<GainNode | null>(null);
  const fireBaseRef = useRef(0);
  const firePulseRef = useRef<number | null>(null);
  const previousBurstRef = useRef(state.steamBurstId);
  const previousPhaseRef = useRef(state.phase);

  useEffect(() => {
    if (audio.unlocked) return;
    const unlockOnGesture = () => {
      audio.unlock();
    };
    window.addEventListener("pointerdown", unlockOnGesture, { once: true });
    window.addEventListener("keydown", unlockOnGesture, { once: true });
    window.addEventListener("touchstart", unlockOnGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockOnGesture);
      window.removeEventListener("keydown", unlockOnGesture);
      window.removeEventListener("touchstart", unlockOnGesture);
    };
  }, [audio]);

  useEffect(() => {
    if (!audio.unlocked || contextRef.current) return;
    const AudioContextCtor: typeof AudioContext | undefined =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = new AudioContextCtor();
    const masterGain = context.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(context.destination);

    const fireSource = context.createBufferSource();
    fireSource.buffer = createNoiseBuffer(context, 2.4, 0.95);
    fireSource.loop = true;
    const fireBand = context.createBiquadFilter();
    fireBand.type = "bandpass";
    fireBand.frequency.value = 1150;
    fireBand.Q.value = 0.7;
    const fireLow = context.createBiquadFilter();
    fireLow.type = "lowpass";
    fireLow.frequency.value = 2100;
    const fireGain = context.createGain();
    fireGain.gain.value = 0;
    fireSource.connect(fireBand);
    fireBand.connect(fireLow);
    fireLow.connect(fireGain);
    fireGain.connect(masterGain);
    fireSource.start();

    const forestSource = context.createBufferSource();
    forestSource.buffer = createNoiseBuffer(context, 4.8, 0.8);
    forestSource.loop = true;
    const forestHigh = context.createBiquadFilter();
    forestHigh.type = "highpass";
    forestHigh.frequency.value = 120;
    const forestLow = context.createBiquadFilter();
    forestLow.type = "lowpass";
    forestLow.frequency.value = 980;
    const forestGain = context.createGain();
    forestGain.gain.value = 0;
    forestSource.connect(forestHigh);
    forestHigh.connect(forestLow);
    forestLow.connect(forestGain);
    forestGain.connect(masterGain);
    forestSource.start();

    contextRef.current = context;
    masterGainRef.current = masterGain;
    fireGainRef.current = fireGain;
    forestGainRef.current = forestGain;

    firePulseRef.current = window.setInterval(() => {
      const gainNode = fireGainRef.current;
      const active = fireBaseRef.current;
      if (!gainNode) return;
      const pulse = active <= 0 ? 0 : active * (0.75 + Math.random() * 0.55);
      gainNode.gain.setTargetAtTime(pulse, context.currentTime, 0.07);
    }, 120);

    void context.resume();

    return () => {
      if (firePulseRef.current !== null) {
        window.clearInterval(firePulseRef.current);
        firePulseRef.current = null;
      }
      fireSource.stop();
      forestSource.stop();
      fireSource.disconnect();
      forestSource.disconnect();
      fireBand.disconnect();
      fireLow.disconnect();
      forestHigh.disconnect();
      forestLow.disconnect();
      fireGain.disconnect();
      forestGain.disconnect();
      masterGain.disconnect();
      void context.close();
      contextRef.current = null;
      masterGainRef.current = null;
      fireGainRef.current = null;
      forestGainRef.current = null;
    };
  }, [audio.unlocked]);

  useEffect(() => {
    const context = contextRef.current;
    if (!context || !audio.unlocked) return;
    if (context.state === "suspended") {
      void context.resume();
    }
  }, [audio.unlocked, state.phase]);

  useEffect(() => {
    const context = contextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;
    const motionScalar = state.reducedMotion ? 0.85 : 1;
    const target = audio.muted ? 0 : clamp(audio.volume * motionScalar, 0, 0.6);
    master.gain.setTargetAtTime(target, context.currentTime, 0.08);
  }, [audio.muted, audio.volume, state.reducedMotion]);

  useEffect(() => {
    const isFireActive = state.saunaType === "woodfired" && state.fireLit;
    const fuelScalar = clamp(state.fireFuel / 100, 0, 1);
    const base = isFireActive ? 0.018 + fuelScalar * 0.105 : 0;
    fireBaseRef.current = base;
  }, [state.saunaType, state.fireLit, state.fireFuel]);

  useEffect(() => {
    const context = contextRef.current;
    const forestGain = forestGainRef.current;
    if (!context || !forestGain) return;
    const isOutside = state.saunaType === "woodfired" && state.playerMode === "outside";
    const target = isOutside ? (state.reducedMotion ? 0.024 : 0.038) : 0;
    forestGain.gain.setTargetAtTime(target, context.currentTime, isOutside ? 0.65 : 0.18);
  }, [state.saunaType, state.playerMode, state.reducedMotion]);

  useEffect(() => {
    const context = contextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;
    if (state.steamBurstId === previousBurstRef.current) return;
    previousBurstRef.current = state.steamBurstId;
    playSteamBurst(context, master, state.reducedMotion);
  }, [state.steamBurstId, state.reducedMotion]);

  useEffect(() => {
    const context = contextRef.current;
    const master = masterGainRef.current;
    if (!context || !master) return;
    const previous = previousPhaseRef.current;
    if (state.phase === "ended" && previous !== "ended") {
      playRoundEndChime(context, master, state.reducedMotion);
    }
    previousPhaseRef.current = state.phase;
  }, [state.phase, state.reducedMotion]);

  return null;
}
