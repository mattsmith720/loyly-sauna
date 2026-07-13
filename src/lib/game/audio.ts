type WindowWithWebkitAudio = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

function resolveAudioContextCtor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  const win = window as WindowWithWebkitAudio;
  return win.AudioContext ?? win.webkitAudioContext ?? null;
}

/**
 * Lightweight, fully synthesized sauna soundscape built on the Web Audio API.
 * No audio files are shipped: the stove rumble, crackles, wood creaks and the
 * loyly sizzle are all generated from noise buffers and oscillators at runtime.
 */
export class SaunaAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private ambientSources: AudioScheduledSourceNode[] = [];
  private scheduledTimers: ReturnType<typeof setTimeout>[] = [];
  private ambientRunning = false;
  private volume = 0.35;
  private muted = false;
  private disposed = false;

  get isUnlocked(): boolean {
    return this.context !== null && this.context.state === "running";
  }

  /** Must be called from a user gesture. Creates/resumes the context. */
  async unlock(): Promise<void> {
    if (this.disposed) return;
    if (!this.context) {
      const Ctor = resolveAudioContextCtor();
      if (!Ctor) return;
      this.context = new Ctor();
      this.masterGain = this.context.createGain();
      this.masterGain.gain.value = this.effectiveVolume();
      this.masterGain.connect(this.context.destination);
      this.ambientGain = this.context.createGain();
      this.ambientGain.gain.value = 0;
      this.ambientGain.connect(this.masterGain);
      this.noiseBuffer = this.createNoiseBuffer(4);
    }
    if (this.context.state === "suspended") {
      try {
        await this.context.resume();
      } catch {
        // Resuming can reject if not triggered by a gesture; ignore and retry later.
      }
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyMasterGain();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterGain();
  }

  startAmbient(): void {
    if (this.disposed || this.ambientRunning) return;
    const ctx = this.context;
    const noise = this.noiseBuffer;
    if (!ctx || !noise || !this.ambientGain) return;

    this.ambientRunning = true;

    const rumble = ctx.createBufferSource();
    rumble.buffer = noise;
    rumble.loop = true;
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = "lowpass";
    rumbleFilter.frequency.value = 320;
    rumbleFilter.Q.value = 0.6;
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 0.5;
    rumble.connect(rumbleFilter).connect(rumbleGain).connect(this.ambientGain);
    rumble.start();
    this.ambientSources.push(rumble);

    const air = ctx.createBufferSource();
    air.buffer = noise;
    air.loop = true;
    air.playbackRate.value = 0.8;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.value = 600;
    airFilter.Q.value = 0.4;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.06;
    air.connect(airFilter).connect(airGain).connect(this.ambientGain);
    air.start();
    this.ambientSources.push(air);

    const now = ctx.currentTime;
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.setValueAtTime(0, now);
    this.ambientGain.gain.linearRampToValueAtTime(1, now + 1.6);

    this.scheduleCrackle();
    this.scheduleCreak();
  }

  stopAmbient(fadeSeconds = 0.6): void {
    if (!this.ambientRunning) return;
    this.ambientRunning = false;
    this.clearTimers();
    const ctx = this.context;
    if (ctx && this.ambientGain) {
      const now = ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + fadeSeconds);
    }
    const sources = this.ambientSources;
    this.ambientSources = [];
    window.setTimeout(() => {
      for (const source of sources) {
        try {
          source.stop();
        } catch {
          // Already stopped.
        }
      }
    }, Math.ceil(fadeSeconds * 1000) + 50);
  }

  /** A water-on-hot-stones hiss. `intensity` (0..1) scales loudness and length. */
  playSizzle(intensity = 1): void {
    const ctx = this.context;
    const noise = this.noiseBuffer;
    if (!ctx || !noise || !this.masterGain || this.disposed) return;
    const strength = Math.max(0.15, Math.min(1, intensity));
    const now = ctx.currentTime;
    const duration = 0.7 + strength * 1.1;

    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    source.playbackRate.value = 1.4;

    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(1600, now);
    highpass.frequency.exponentialRampToValueAtTime(3600, now + 0.12);
    highpass.frequency.exponentialRampToValueAtTime(900, now + duration);

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 4200;
    bandpass.Q.value = 0.7;

    const gain = ctx.createGain();
    const peak = 0.32 * strength;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(highpass).connect(bandpass).connect(gain).connect(this.masterGain);
    source.start(now);
    source.stop(now + duration + 0.05);
  }

  dispose(): void {
    this.disposed = true;
    this.stopAmbient(0.05);
    this.clearTimers();
    const ctx = this.context;
    this.context = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.noiseBuffer = null;
    if (ctx) {
      window.setTimeout(() => {
        ctx.close().catch(() => {});
      }, 120);
    }
  }

  private effectiveVolume(): number {
    return this.muted ? 0 : this.volume;
  }

  private applyMasterGain(): void {
    const ctx = this.context;
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(this.effectiveVolume(), now + 0.12);
  }

  private createNoiseBuffer(seconds: number): AudioBuffer {
    const ctx = this.context;
    if (!ctx) throw new Error("Audio context required for noise buffer");
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }

  private scheduleCrackle(): void {
    if (!this.ambientRunning) return;
    const delay = 120 + Math.random() * 520;
    const timer = setTimeout(() => {
      this.emitCrackle();
      this.scheduleCrackle();
    }, delay);
    this.scheduledTimers.push(timer);
  }

  private emitCrackle(): void {
    const ctx = this.context;
    const noise = this.noiseBuffer;
    if (!ctx || !noise || !this.ambientGain || !this.ambientRunning) return;
    const now = ctx.currentTime;
    const burstCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < burstCount; i += 1) {
      const t = now + i * (0.02 + Math.random() * 0.05);
      const source = ctx.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      source.playbackRate.value = 1.5 + Math.random();
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1400 + Math.random() * 2600;
      filter.Q.value = 3 + Math.random() * 4;
      const gain = ctx.createGain();
      const peak = 0.04 + Math.random() * 0.08;
      const dur = 0.03 + Math.random() * 0.08;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(peak, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      source.connect(filter).connect(gain).connect(this.ambientGain);
      source.start(t);
      source.stop(t + dur + 0.02);
    }
  }

  private scheduleCreak(): void {
    if (!this.ambientRunning) return;
    const delay = 7000 + Math.random() * 12000;
    const timer = setTimeout(() => {
      this.emitCreak();
      this.scheduleCreak();
    }, delay);
    this.scheduledTimers.push(timer);
  }

  private emitCreak(): void {
    const ctx = this.context;
    if (!ctx || !this.ambientGain || !this.ambientRunning) return;
    const now = ctx.currentTime;
    const dur = 0.9 + Math.random() * 1.2;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    const baseFreq = 90 + Math.random() * 70;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * (1.04 + Math.random() * 0.08), now + dur);
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 220 + Math.random() * 120;
    filter.Q.value = 6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(filter).connect(gain).connect(this.ambientGain);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  private clearTimers(): void {
    for (const timer of this.scheduledTimers) {
      clearTimeout(timer);
    }
    this.scheduledTimers = [];
  }
}

let sharedEngine: SaunaAudioEngine | null = null;

export function getSaunaAudioEngine(): SaunaAudioEngine {
  if (!sharedEngine) {
    sharedEngine = new SaunaAudioEngine();
  }
  return sharedEngine;
}
