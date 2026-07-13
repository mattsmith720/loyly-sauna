"use client";

import { Canvas } from "@react-three/fiber";
import clsx from "clsx";
import { useCallback, useEffect, useRef, type ChangeEvent, type MouseEvent } from "react";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import {
  BASE_TEMPERATURE_C,
  COMFORTABLE_TEMPERATURE_MAX_C,
  COMFORTABLE_TEMPERATURE_MIN_C,
  MAX_TEMPERATURE_C,
  PLAYER_START_POSITION,
  SESSION_LENGTH_OPTIONS,
} from "@/lib/game/constants";
import { getSaunaAudioEngine } from "@/lib/game/audio";
import { SaunaScene } from "@/components/game/SaunaScene";
import { useGameStore } from "@/components/game/useGameStore";
import { gameStore } from "@/lib/game/store";
import styles from "./SaunaGame.module.css";

function formatClock(seconds: number): string {
  const normalized = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(normalized / 60);
  const remainingSeconds = normalized % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

interface SettingsControlsProps {
  sessionLengthMinutes: number;
  mouseSensitivity: number;
  audioMuted: boolean;
  audioVolume: number;
  onSessionLengthChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onSensitivityChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onMuteChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function SettingsControls({
  sessionLengthMinutes,
  mouseSensitivity,
  audioMuted,
  audioVolume,
  onSessionLengthChange,
  onSensitivityChange,
  onMuteChange,
  onVolumeChange,
}: SettingsControlsProps) {
  return (
    <div className={styles.settingsGrid}>
      <label className={styles.settingField}>
        <span>Session length</span>
        <select value={sessionLengthMinutes} onChange={onSessionLengthChange} className={styles.settingSelect}>
          {SESSION_LENGTH_OPTIONS.map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} game min
            </option>
          ))}
        </select>
      </label>

      <label className={styles.settingField}>
        <span>Mouse sensitivity</span>
        <div className={styles.sensitivityRow}>
          <input
            type="range"
            min={0.3}
            max={2}
            step={0.1}
            value={mouseSensitivity}
            onChange={onSensitivityChange}
          />
          <span>{mouseSensitivity.toFixed(1)}x</span>
        </div>
      </label>

      <label className={styles.settingField}>
        <span>Ambience volume</span>
        <div className={styles.sensitivityRow}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={audioMuted ? 0 : audioVolume}
            onChange={onVolumeChange}
          />
          <span>{Math.round((audioMuted ? 0 : audioVolume) * 100)}%</span>
        </div>
      </label>

      <label className={clsx(styles.settingField, styles.muteField)}>
        <input type="checkbox" checked={audioMuted} onChange={onMuteChange} />
        <span>Mute all sound</span>
      </label>
    </div>
  );
}

export function SaunaGame() {
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const sessionPhase = useGameStore((state) => state.session.phase);
  const isPointerLocked = useGameStore((state) => state.session.isPointerLocked);
  const interaction = useGameStore((state) => state.interaction);
  const sauna = useGameStore((state) => state.sauna);
  const settings = useGameStore((state) => state.settings);
  const pourCount = sauna.pourCount;
  const lastPourCount = useRef(pourCount);

  const ensureAudio = useCallback(() => {
    const engine = getSaunaAudioEngine();
    void engine.start();
  }, []);

  const requestPointerLock = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      ensureAudio();
      controlsRef.current?.lock();
    },
    [ensureAudio],
  );
  const handleRootClick = useCallback(() => {
    if (sessionPhase === "playing" && !isPointerLocked) {
      ensureAudio();
      controlsRef.current?.lock();
    }
  }, [ensureAudio, isPointerLocked, sessionPhase]);

  const handleStartSession = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      ensureAudio();
      gameStore.actions.startSession();
      controlsRef.current?.lock();
    },
    [ensureAudio],
  );

  const handlePauseSession = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    gameStore.actions.pauseSession();
    controlsRef.current?.unlock();
  }, []);

  const handleResumeSession = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      ensureAudio();
      gameStore.actions.resumeSession();
      controlsRef.current?.lock();
    },
    [ensureAudio],
  );

  const handleRestartSession = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    gameStore.actions.restartToStart();
    controlsRef.current?.unlock();
  }, []);

  const handleSessionLengthChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    gameStore.actions.setSessionLengthMinutes(Number(event.target.value) as 5 | 10 | 15);
  }, []);

  const handleMouseSensitivityChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    gameStore.actions.setMouseSensitivity(Number(event.target.value));
  }, []);

  const handleMuteChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    gameStore.actions.setAudioMuted(event.target.checked);
  }, []);

  const handleVolumeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    gameStore.actions.setAudioVolume(Number(event.target.value));
  }, []);

  const handleToggleMute = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      ensureAudio();
      gameStore.actions.toggleAudioMuted();
    },
    [ensureAudio],
  );

  useEffect(() => {
    if (sessionPhase !== "playing" && controlsRef.current?.isLocked) {
      controlsRef.current.unlock();
    }
  }, [sessionPhase]);

  useEffect(() => {
    const engine = getSaunaAudioEngine();
    engine.setMuted(settings.audioMuted);
    engine.setVolume(settings.audioVolume);
  }, [settings.audioMuted, settings.audioVolume]);

  useEffect(() => {
    if (pourCount !== lastPourCount.current) {
      lastPourCount.current = pourCount;
      if (pourCount > 0) {
        getSaunaAudioEngine().playSizzle();
      }
    }
  }, [pourCount]);

  useEffect(() => {
    return () => {
      getSaunaAudioEngine().dispose();
    };
  }, []);

  const remainingSec = Math.max(0, sauna.totalDurationSec - sauna.elapsedSec);
  const timeProgress = sauna.totalDurationSec > 0 ? clamp01(sauna.elapsedSec / sauna.totalDurationSec) : 0;
  const temperatureProgress = clamp01((sauna.temperatureC - BASE_TEMPERATURE_C) / (MAX_TEMPERATURE_C - BASE_TEMPERATURE_C));
  const comfortBandStart = clamp01(
    (COMFORTABLE_TEMPERATURE_MIN_C - BASE_TEMPERATURE_C) / (MAX_TEMPERATURE_C - BASE_TEMPERATURE_C),
  );
  const comfortBandEnd = clamp01(
    (COMFORTABLE_TEMPERATURE_MAX_C - BASE_TEMPERATURE_C) / (MAX_TEMPERATURE_C - BASE_TEMPERATURE_C),
  );
  const steamPercent = clamp01(sauna.steamLevel);
  const comfortablePercent =
    sauna.totalDurationSec > 0 ? clamp01(sauna.timeInComfortRangeSec / sauna.totalDurationSec) : 0;
  const completeSummary = `${Math.round(comfortablePercent * 100)}%`;
  const inComfortBand =
    sauna.temperatureC >= COMFORTABLE_TEMPERATURE_MIN_C && sauna.temperatureC <= COMFORTABLE_TEMPERATURE_MAX_C;
  const muteGlyph = settings.audioMuted ? "Muted" : "Sound on";

  return (
    <div className={styles.gameRoot} onClick={handleRootClick}>
      <Canvas
        className={styles.canvas}
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true }}
        camera={{
          fov: 75,
          near: 0.1,
          far: 50,
          position: [PLAYER_START_POSITION.x, PLAYER_START_POSITION.y, PLAYER_START_POSITION.z],
        }}
      >
        <SaunaScene controlsRef={controlsRef} />
      </Canvas>

      <div className={styles.vignette} aria-hidden />

      {sessionPhase === "playing" && (
        <div className={styles.hud}>
          <div className={styles.statusCard}>
            <div className={styles.statusRow}>
              <span>Temperature</span>
              <strong className={clsx(inComfortBand && styles.comfortValue)}>{sauna.temperatureC.toFixed(1)}°C</strong>
            </div>
            <div className={styles.gaugeTrack}>
              <div
                className={styles.comfortBand}
                style={{
                  left: `${comfortBandStart * 100}%`,
                  width: `${(comfortBandEnd - comfortBandStart) * 100}%`,
                }}
              />
              <div className={styles.gaugeFill} style={{ width: `${temperatureProgress * 100}%` }} />
            </div>
            <span className={styles.statusHint}>
              Comfort: {COMFORTABLE_TEMPERATURE_MIN_C}°C - {COMFORTABLE_TEMPERATURE_MAX_C}°C
            </span>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusRow}>
              <span>Time remaining</span>
              <strong>{formatClock(remainingSec)}</strong>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={clsx(styles.gaugeFill, styles.timeFill)} style={{ width: `${timeProgress * 100}%` }} />
            </div>
            <span className={styles.statusHint}>Session total: {formatClock(sauna.totalDurationSec)}</span>
          </div>

          <div className={styles.statusCard}>
            <div className={styles.statusRow}>
              <span>Steam</span>
              <strong>{Math.round(steamPercent * 100)}%</strong>
            </div>
            <div className={styles.gaugeTrack}>
              <div className={clsx(styles.gaugeFill, styles.steamFill)} style={{ width: `${steamPercent * 100}%` }} />
            </div>
            <span className={styles.statusHint}>{sauna.hasWaterInLadle ? "Ladle ready" : "Ladle empty"}</span>
          </div>

          <div className={styles.hudControls}>
            <button
              type="button"
              className={clsx(styles.iconButton, settings.audioMuted && styles.iconButtonMuted)}
              onClick={handleToggleMute}
              aria-pressed={settings.audioMuted}
              title={muteGlyph}
            >
              {settings.audioMuted ? "🔇" : "🔊"}
            </button>
            <button type="button" className={styles.pauseButton} onClick={handlePauseSession}>
              Pause
            </button>
          </div>
        </div>
      )}

      {sessionPhase === "playing" && isPointerLocked && interaction.focusedId !== null && interaction.prompt && (
        <div className={clsx(styles.interactionPrompt, !interaction.isActionAvailable && styles.promptDisabled)}>
          {interaction.prompt}
        </div>
      )}

      {sessionPhase === "playing" && isPointerLocked && (
        <div className={clsx(styles.crosshair, interaction.isActionAvailable && styles.crosshairActive)} aria-hidden />
      )}

      {sessionPhase === "playing" && !isPointerLocked && (
        <button type="button" className={styles.overlay} onClick={requestPointerLock}>
          <span className={styles.overlayTitle}>Click to continue</span>
          <span className={styles.overlayHint}>WASD to move · Mouse to look · E to interact · Esc to pause</span>
        </button>
      )}

      {sessionPhase === "start" && (
        <div className={styles.menuPanel}>
          <span className={styles.menuKicker}>Löyly · a cozy sauna</span>
          <h1>Cozy Sauna Session</h1>
          <p>Settle into the warmth. Fill your ladle, pour löyly on the stones, and keep the heat in the comfort band.</p>
          <ul>
            <li>Move with WASD or arrow keys</li>
            <li>Look at the bucket to fill the ladle, then the stones to pour</li>
            <li>Press E to interact · Esc to pause anytime</li>
          </ul>
          <SettingsControls
            sessionLengthMinutes={settings.sessionLengthMinutes}
            mouseSensitivity={settings.mouseSensitivity}
            audioMuted={settings.audioMuted}
            audioVolume={settings.audioVolume}
            onSessionLengthChange={handleSessionLengthChange}
            onSensitivityChange={handleMouseSensitivityChange}
            onMuteChange={handleMuteChange}
            onVolumeChange={handleVolumeChange}
          />
          <button type="button" className={styles.primaryButton} onClick={handleStartSession}>
            Start session
          </button>
          <span className={styles.audioNote}>Sound begins after you start (kept low and gentle).</span>
        </div>
      )}

      {sessionPhase === "paused" && (
        <div className={styles.menuPanel}>
          <span className={styles.menuKicker}>Paused</span>
          <h2>Take a breath</h2>
          <p>Resume when you are ready, adjust your settings, or restart from the beginning.</p>
          <SettingsControls
            sessionLengthMinutes={settings.sessionLengthMinutes}
            mouseSensitivity={settings.mouseSensitivity}
            audioMuted={settings.audioMuted}
            audioVolume={settings.audioVolume}
            onSessionLengthChange={handleSessionLengthChange}
            onSensitivityChange={handleMouseSensitivityChange}
            onMuteChange={handleMuteChange}
            onVolumeChange={handleVolumeChange}
          />
          <div className={styles.buttonRow}>
            <button type="button" className={styles.primaryButton} onClick={handleResumeSession}>
              Resume
            </button>
            <button type="button" className={styles.secondaryButton} onClick={handleRestartSession}>
              Restart
            </button>
          </div>
        </div>
      )}

      {sessionPhase === "complete" && (
        <div className={styles.menuPanel}>
          <span className={styles.menuKicker}>Session complete</span>
          <h2>Warm and unwound</h2>
          <p>You stayed in the comfort band for {completeSummary} of the session.</p>
          <div className={styles.summaryGrid}>
            <div>
              <span>Comfort time</span>
              <strong>{formatClock(sauna.timeInComfortRangeSec)}</strong>
            </div>
            <div>
              <span>Total pours</span>
              <strong>{sauna.pourCount}</strong>
            </div>
            <div>
              <span>Final temperature</span>
              <strong>{sauna.temperatureC.toFixed(1)}°C</strong>
            </div>
          </div>
          <button type="button" className={styles.primaryButton} onClick={handleRestartSession}>
            Restart
          </button>
        </div>
      )}
    </div>
  );
}
