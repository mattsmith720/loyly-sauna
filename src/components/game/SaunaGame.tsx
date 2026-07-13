"use client";

import { Canvas } from "@react-three/fiber";
import { useCallback, useRef, type MouseEvent } from "react";
import type { PointerLockControls as PointerLockControlsImpl } from "three-stdlib";
import {
  MOUSE_SENSITIVITY_MAX,
  MOUSE_SENSITIVITY_MIN,
  MOUSE_SENSITIVITY_STEP,
  PLAYER_START_POSITION,
  SESSION_LENGTH_OPTIONS_MINUTES,
} from "@/lib/game/constants";
import type { SessionLengthMinutes } from "@/lib/game/types";
import { gameStore } from "@/lib/game/store";
import { SaunaScene } from "@/components/game/SaunaScene";
import { useGameStore } from "@/components/game/useGameStore";
import styles from "./SaunaGame.module.css";

function formatSeconds(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

interface SettingsPanelProps {
  sessionLengthMinutes: SessionLengthMinutes;
  mouseSensitivity: number;
  onSessionLengthChange: (value: SessionLengthMinutes) => void;
  onMouseSensitivityChange: (value: number) => void;
}

function SettingsPanel({
  sessionLengthMinutes,
  mouseSensitivity,
  onSessionLengthChange,
  onMouseSensitivityChange,
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
    </div>
  );
}

export function SaunaGame() {
  const controlsRef = useRef<PointerLockControlsImpl | null>(null);
  const session = useGameStore((state) => state.session);

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

  const requestPointerLock = useCallback((event?: MouseEvent<HTMLElement>) => {
    event?.preventDefault();
    const phase = gameStore.getState().session.phase;
    if (phase !== "playing") return;
    controlsRef.current?.lock();
  }, []);

  const startSession = useCallback(() => {
    gameStore.actions.startSession();
    requestAnimationFrame(() => {
      controlsRef.current?.lock();
    });
  }, []);

  const resumeSession = useCallback(() => {
    gameStore.actions.resumeSession();
    requestAnimationFrame(() => {
      controlsRef.current?.lock();
    });
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

  const handleRootClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (event.defaultPrevented) return;
      if (!isPlaying || isPointerLocked) return;
      requestPointerLock();
    },
    [isPlaying, isPointerLocked, requestPointerLock],
  );

  return (
    <div className={styles.gameRoot} onClick={handleRootClick}>
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
        <SaunaScene controlsRef={controlsRef} />
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

      {isPlaying && isPointerLocked && <div className={styles.crosshair}>+</div>}

      {isPlaying && session.interaction.prompt && <div className={styles.prompt}>{session.interaction.prompt}</div>}

      {isPlaying && !isPointerLocked && (
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
            <p className={styles.menuText}>Controls: WASD move, mouse look, E interact/pour, Escape pause.</p>
            <SettingsPanel
              sessionLengthMinutes={session.settings.sessionLengthMinutes}
              mouseSensitivity={session.settings.mouseSensitivity}
              onSessionLengthChange={handleSessionLengthChange}
              onMouseSensitivityChange={handleMouseSensitivityChange}
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
              onSessionLengthChange={handleSessionLengthChange}
              onMouseSensitivityChange={handleMouseSensitivityChange}
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
    </div>
  );
}
