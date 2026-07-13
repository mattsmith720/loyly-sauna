"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import {
  AUDIO_VOLUME_MAX,
  AUDIO_VOLUME_MIN,
  AUDIO_VOLUME_STEP,
  MOUSE_SENSITIVITY_MAX,
  MOUSE_SENSITIVITY_MIN,
  MOUSE_SENSITIVITY_STEP,
  PLAYER_START_POSITION,
  SESSION_LENGTH_OPTIONS_MINUTES,
} from "@/lib/game/constants";
import type { SessionLengthMinutes } from "@/lib/game/types";
import { gameStore } from "@/lib/game/store";
import { SaunaScene } from "@/components/game/SaunaScene";
import { TouchControls } from "@/components/game/TouchControls";
import { useGameStore } from "@/components/game/useGameStore";
import { useSaunaAudio } from "@/components/game/useSaunaAudio";
import styles from "./SaunaGame.module.css";

function formatSeconds(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function subscribeToMediaQuery(query: MediaQueryList, listener: () => void): () => void {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  const legacyQuery = query as MediaQueryList & {
    addListener?: (callback: (event: MediaQueryListEvent) => void) => void;
    removeListener?: (callback: (event: MediaQueryListEvent) => void) => void;
  };

  if (typeof legacyQuery.addListener === "function" && typeof legacyQuery.removeListener === "function") {
    const legacyListener = () => listener();
    legacyQuery.addListener(legacyListener);
    return () => legacyQuery.removeListener?.(legacyListener);
  }

  return () => {};
}

function useTouchControlPreference(): boolean {
  const [preferTouchControls, setPreferTouchControls] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const noHoverQuery = window.matchMedia("(hover: none)");

    const updatePreference = () => {
      const hasTouchPoints = navigator.maxTouchPoints > 0;
      setPreferTouchControls(hasTouchPoints || coarsePointerQuery.matches || noHoverQuery.matches);
    };

    updatePreference();

    const unsubscribeCoarse = subscribeToMediaQuery(coarsePointerQuery, updatePreference);
    const unsubscribeNoHover = subscribeToMediaQuery(noHoverQuery, updatePreference);
    window.addEventListener("orientationchange", updatePreference);

    return () => {
      unsubscribeCoarse();
      unsubscribeNoHover();
      window.removeEventListener("orientationchange", updatePreference);
    };
  }, []);

  return preferTouchControls;
}

interface SettingsPanelProps {
  sessionLengthMinutes: SessionLengthMinutes;
  mouseSensitivity: number;
  audioMuted: boolean;
  audioVolume: number;
  onSessionLengthChange: (value: SessionLengthMinutes) => void;
  onMouseSensitivityChange: (value: number) => void;
  onAudioMutedChange: (value: boolean) => void;
  onAudioVolumeChange: (value: number) => void;
}

function SettingsPanel({
  sessionLengthMinutes,
  mouseSensitivity,
  audioMuted,
  audioVolume,
  onSessionLengthChange,
  onMouseSensitivityChange,
  onAudioMutedChange,
  onAudioVolumeChange,
}: SettingsPanelProps) {
  return (
    <div className={styles.settingsPanel}>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Session length</legend>
        <div className={styles.segmentedControl}>
          {SESSION_LENGTH_OPTIONS_MINUTES.map((option) => (
            <button
              key={`session-length-${option}`}
              type="button"
              className={option === sessionLengthMinutes ? styles.segmentActive : styles.segment}
              onClick={() => onSessionLengthChange(option)}
            >
              {option}m
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Mouse sensitivity</legend>
        <label className={styles.sliderLabel}>
          <input
            type="range"
            min={MOUSE_SENSITIVITY_MIN}
            max={MOUSE_SENSITIVITY_MAX}
            step={MOUSE_SENSITIVITY_STEP}
            value={mouseSensitivity}
            onChange={(event) => onMouseSensitivityChange(Number(event.target.value))}
          />
          <span>{mouseSensitivity.toFixed(1)}x</span>
        </label>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Ambience volume</legend>
        <div className={styles.audioRow}>
          <button
            type="button"
            className={audioMuted ? styles.muteButtonActive : styles.muteButton}
            aria-pressed={audioMuted}
            onClick={() => onAudioMutedChange(!audioMuted)}
          >
            {audioMuted ? "Muted" : "Sound on"}
          </button>
          <label className={styles.sliderLabel}>
            <input
              type="range"
              min={AUDIO_VOLUME_MIN}
              max={AUDIO_VOLUME_MAX}
              step={AUDIO_VOLUME_STEP}
              value={audioVolume}
              disabled={audioMuted}
              onChange={(event) => onAudioVolumeChange(Number(event.target.value))}
            />
            <span>{Math.round(audioVolume * 100)}%</span>
          </label>
        </div>
      </fieldset>
    </div>
  );
}

export function SaunaGame() {
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const session = useGameStore((state) => state.session);
  const preferTouchControls = useTouchControlPreference();
  const { unlockAudio } = useSaunaAudio();

  const isPointerLocked = session.isPointerLocked;
  const isPlaying = session.phase === "playing";
  const isPaused = session.phase === "paused";
  const isIdle = session.phase === "idle";
  const isComplete = session.phase === "complete";

  const sessionProgress =
    session.timer.targetRealSeconds > 0
      ? Math.min(1, session.timer.elapsedRealSeconds / session.timer.targetRealSeconds)
      : 0;
  const comfortProgress =
    session.timer.elapsedRealSeconds > 0
      ? (session.ritual.timeInComfortSeconds / session.timer.elapsedRealSeconds) * 100
      : 0;
  const temperatureMin = 60;
  const temperatureMax = 110;
  const temperatureRange = temperatureMax - temperatureMin;
  const temperatureFill = Math.min(
    100,
    Math.max(0, ((session.ritual.temperatureC - temperatureMin) / temperatureRange) * 100),
  );
  const comfortBandStart = Math.min(
    100,
    Math.max(0, ((session.ritual.comfortBandMinC - temperatureMin) / temperatureRange) * 100),
  );
  const comfortBandWidth = Math.min(
    100 - comfortBandStart,
    Math.max(0, ((session.ritual.comfortBandMaxC - session.ritual.comfortBandMinC) / temperatureRange) * 100),
  );
  const humidityFill = Math.min(100, Math.max(0, session.ritual.humidityPercent));
  const rootClassName = preferTouchControls ? `${styles.gameRoot} ${styles.touchMode}` : styles.gameRoot;
  const controlsHint = useMemo(
    () =>
      preferTouchControls
        ? "Touch mode: left pad move, right drag look, interact button when in range."
        : "Controls: WASD move, mouse look, E interact/pour, Escape pause.",
    [preferTouchControls],
  );
  const interactionPrompt = useMemo(() => {
    if (!session.interaction.prompt) return null;
    if (!preferTouchControls) return session.interaction.prompt;
    return session.interaction.prompt.replace(/^Press E to/i, "Tap Interact to");
  }, [preferTouchControls, session.interaction.prompt]);

  const requestPointerLock = useCallback((event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    if (preferTouchControls) return;
    const phase = gameStore.getState().session.phase;
    if (phase !== "playing") return;
    controlsRef.current?.lock();
  }, [preferTouchControls]);

  const startSession = useCallback(() => {
    gameStore.actions.startSession();
    unlockAudio();
    if (preferTouchControls) return;
    requestAnimationFrame(() => {
      controlsRef.current?.lock();
    });
  }, [preferTouchControls, unlockAudio]);

  const resumeSession = useCallback(() => {
    gameStore.actions.resumeSession();
    unlockAudio();
    if (preferTouchControls) return;
    requestAnimationFrame(() => {
      controlsRef.current?.lock();
    });
  }, [preferTouchControls, unlockAudio]);

  const pauseSession = useCallback(() => {
    const state = gameStore.getState();
    if (state.session.phase !== "playing") return;

    if (state.session.isPointerLocked) {
      controlsRef.current?.unlock();
      return;
    }

    gameStore.actions.pauseSession();
  }, []);

  const restartSession = useCallback(() => {
    controlsRef.current?.unlock();
    gameStore.actions.restartSession();
  }, []);

  const handleSessionLengthChange = useCallback((value: SessionLengthMinutes) => {
    gameStore.actions.setSessionLengthMinutes(value);
  }, []);

  const handleMouseSensitivityChange = useCallback((value: number) => {
    gameStore.actions.setMouseSensitivity(value);
  }, []);

  const handleAudioMutedChange = useCallback(
    (value: boolean) => {
      gameStore.actions.setAudioMuted(value);
      if (!value) unlockAudio();
    },
    [unlockAudio],
  );

  const handleAudioVolumeChange = useCallback(
    (value: number) => {
      gameStore.actions.setAudioVolume(value);
      unlockAudio();
    },
    [unlockAudio],
  );

  const handleRootClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      if (preferTouchControls) return;
      if (!isPlaying || isPointerLocked) return;
      requestPointerLock();
    },
    [isPlaying, isPointerLocked, preferTouchControls, requestPointerLock],
  );

  return (
    <div className={rootClassName} onClick={handleRootClick}>
      <Canvas
        className={styles.canvas}
        shadows
        dpr={[1, 1.75]}
        camera={{
          fov: 75,
          near: 0.1,
          far: 50,
          position: [PLAYER_START_POSITION.x, PLAYER_START_POSITION.y, PLAYER_START_POSITION.z],
        }}
      >
        <SaunaScene controlsRef={controlsRef} allowUnlockedLookAndMove={preferTouchControls} />
      </Canvas>

      {!isIdle && (
        <div className={styles.hudLayer}>
          <div className={styles.hudPanel}>
            <div className={styles.metricHeader}>
              <span>Temperature</span>
              <strong>{session.ritual.temperatureC.toFixed(1)} C</strong>
            </div>
            <div className={styles.gaugeTrack}>
              <div
                className={styles.comfortBand}
                style={{ left: `${comfortBandStart}%`, width: `${comfortBandWidth}%` }}
              />
              <div className={styles.temperatureFill} style={{ width: `${temperatureFill}%` }} />
            </div>
            <div className={styles.metricSubtext}>
              Comfort band {session.ritual.comfortBandMinC} C - {session.ritual.comfortBandMaxC} C
            </div>
          </div>

          <div className={styles.hudPanel}>
            <div className={styles.metricHeader}>
              <span>Steam</span>
              <strong>{session.ritual.humidityPercent.toFixed(0)}%</strong>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={styles.humidityFill} style={{ width: `${humidityFill}%` }} />
            </div>
          </div>

          <div className={styles.hudPanel}>
            <div className={styles.metricHeader}>
              <span>Time remaining</span>
              <strong>{formatSeconds(session.timer.remainingRealSeconds)}</strong>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={styles.timerFill} style={{ width: `${Math.max(0, (1 - sessionProgress) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {!isIdle && (
        <button
          type="button"
          className={session.settings.audioMuted ? styles.audioToggleMuted : styles.audioToggle}
          aria-pressed={!session.settings.audioMuted}
          aria-label={session.settings.audioMuted ? "Unmute ambience" : "Mute ambience"}
          title={session.settings.audioMuted ? "Unmute ambience" : "Mute ambience"}
          onClick={() => handleAudioMutedChange(!session.settings.audioMuted)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path
              d="M4 9v6h4l5 4V5L8 9H4z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {session.settings.audioMuted ? (
              <path d="M17 9l5 6M22 9l-5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path
                d="M16.5 8.5a5 5 0 010 7M18.8 6.2a8 8 0 010 11.6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      )}

      {isPlaying && (isPointerLocked || preferTouchControls) && (
        <div className={styles.crosshair} aria-hidden="true">
          <span className={styles.crosshairDot} />
        </div>
      )}

      {isPlaying && interactionPrompt && (
        <div className={preferTouchControls ? `${styles.prompt} ${styles.touchPrompt}` : styles.prompt}>
          {interactionPrompt}
        </div>
      )}

      {isPlaying && !isPointerLocked && !preferTouchControls && (
        <button type="button" className={styles.pointerOverlay} onClick={requestPointerLock}>
          <span className={styles.overlayTitle}>Click to resume control</span>
          <span className={styles.overlayHint}>WASD to move · Mouse to look · E to pour loyly · Esc to pause</span>
        </button>
      )}

      {isIdle && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuCard}>
            <h1 className={styles.menuTitle}>Sauna Ritual</h1>
            <p className={styles.menuText}>
              Maintain a comfortable sauna by pouring loyly onto the stones at the right rhythm.
            </p>
            <p className={styles.menuText}>{controlsHint}</p>
            <SettingsPanel
              sessionLengthMinutes={session.settings.sessionLengthMinutes}
              mouseSensitivity={session.settings.mouseSensitivity}
              audioMuted={session.settings.audioMuted}
              audioVolume={session.settings.audioVolume}
              onSessionLengthChange={handleSessionLengthChange}
              onMouseSensitivityChange={handleMouseSensitivityChange}
              onAudioMutedChange={handleAudioMutedChange}
              onAudioVolumeChange={handleAudioVolumeChange}
            />
            <button type="button" className={styles.primaryButton} onClick={startSession}>
              Start Session
            </button>
          </div>
        </div>
      )}

      {isPaused && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuCard}>
            <h2 className={styles.menuTitle}>Paused</h2>
            <p className={styles.menuText}>Adjust settings or jump back in.</p>
            <SettingsPanel
              sessionLengthMinutes={session.settings.sessionLengthMinutes}
              mouseSensitivity={session.settings.mouseSensitivity}
              audioMuted={session.settings.audioMuted}
              audioVolume={session.settings.audioVolume}
              onSessionLengthChange={handleSessionLengthChange}
              onMouseSensitivityChange={handleMouseSensitivityChange}
              onAudioMutedChange={handleAudioMutedChange}
              onAudioVolumeChange={handleAudioVolumeChange}
            />
            <div className={styles.pauseActions}>
              <button type="button" className={styles.primaryButton} onClick={resumeSession}>
                Resume
              </button>
              <button type="button" className={styles.secondaryButton} onClick={restartSession}>
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {isComplete && (
        <div className={styles.menuOverlay}>
          <div className={styles.menuCard}>
            <h2 className={styles.menuTitle}>Session Complete</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryRow}>
                <span>Time in comfort band</span>
                <strong>{session.ritual.timeInComfortSeconds.toFixed(1)}s</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Comfort ratio</span>
                <strong>{comfortProgress.toFixed(1)}%</strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Total elapsed</span>
                <strong>{session.timer.elapsedRealSeconds.toFixed(1)}s</strong>
              </div>
            </div>
            <button type="button" className={styles.primaryButton} onClick={restartSession}>
              Restart
            </button>
          </div>
        </div>
      )}

      <TouchControls
        enabled={preferTouchControls && isPlaying}
        mouseSensitivity={session.settings.mouseSensitivity}
        focusedInteractableId={session.interaction.focusedInteractableId}
        onPause={pauseSession}
      />
    </div>
  );
}
