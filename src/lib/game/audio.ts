// Fully generated sauna soundscape built on the Web Audio API. No binary audio
// assets are shipped: ambience is filtered noise plus scheduled crackles and
// wood creaks, and the loyly pour is a decaying band-passed noise burst.

const AMBIENT_NOISE_SECONDS = 3;

function createNoiseBuffer(context: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(context.sampleRate * seconds);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    // Brownian smoothing gives a warmer, low-rumble stove bed.
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  return buffer;
}

export class SaunaAudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private crackleTimer: ReturnType<typeof setTimeout> | null = null;
  private creakTimer: ReturnType<typeof setTimeout> | null = null;
  private started = false;
  private volume = 0.35;
  private muted = false;

  get isStarted(): boolean {
    return this.started;
  }

  // Must be invoked from a user gesture to satisfy autoplay policies.
  async start(): Promise<void> {
    if (this.started) {
      await this.context?.resume().catch(() => undefined);
      return;
    }

    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    const context = new AudioContextCtor();
    this.context = context;

    const masterGain = context.createGain();
    masterGain.gain.value = this.muted ? 0 : this.volume;
    masterGain.connect(context.destination);
    this.masterGain = masterGain;

    const ambientGain = context.createGain();
    ambientGain.gain.value = 0.55;
    ambientGain.connect(masterGain);
    this.ambientGain = ambientGain;

    this.noiseBuffer = createNoiseBuffer(context, AMBIENT_NOISE_SECONDS);

    const noiseSource = context.createBufferSource();
    noiseSource.buffer = this.noiseBuffer;
    noiseSource.loop = true;

    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 520;
    lowpass.Q.value = 0.7;

    noiseSource.connect(lowpass);
    lowpass.connect(ambientGain);
    noiseSource.start();
    this.noiseSource = noiseSource;

    this.started = true;
    await context.resume().catch(() => undefined);

    this.scheduleCrackle();
    this.scheduleCreak();
  }

  private scheduleCrackle(): void {
    if (!this.context) {
      return;
    }

    const delay = 140 + Math.random() * 520;
    this.crackleTimer = setTimeout(() => {
      this.playCrackle();
      this.scheduleCrackle();
    }, delay);
  }

  private playCrackle(): void {
    const context = this.context;
    const ambientGain = this.ambientGain;
    const buffer = this.noiseBuffer;
    if (!context || !ambientGain || !buffer) {
      return;
    }

    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 1.4 + Math.random() * 1.6;

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1600 + Math.random() * 2600;
    bandpass.Q.value = 5;

    const gain = context.createGain();
    const peak = 0.05 + Math.random() * 0.09;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(peak, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06 + Math.random() * 0.05);

    const offset = Math.random() * (AMBIENT_NOISE_SECONDS - 0.2);
    source.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ambientGain);
    source.start(now, offset, 0.14);
    source.stop(now + 0.2);
  }

  private scheduleCreak(): void {
    if (!this.context) {
      return;
    }

    const delay = 6000 + Math.random() * 9000;
    this.creakTimer = setTimeout(() => {
      this.playCreak();
      this.scheduleCreak();
    }, delay);
  }

  private playCreak(): void {
    const context = this.context;
    const ambientGain = this.ambientGain;
    if (!context || !ambientGain) {
      return;
    }

    const now = context.currentTime;
    const osc = context.createOscillator();
    osc.type = "sawtooth";
    const startFreq = 70 + Math.random() * 40;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, now + 0.6);

    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 320;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(ambientGain);
    osc.start(now);
    osc.stop(now + 1);
  }

  // Water hitting hot stones: a bright noise burst that quickly settles into a
  // longer, softer hiss.
  playSizzle(): void {
    const context = this.context;
    const masterGain = this.masterGain;
    const buffer = this.noiseBuffer;
    if (!context || !masterGain || !buffer || !this.started) {
      return;
    }

    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = 3.2;

    const highpass = context.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(1800, now);
    highpass.frequency.exponentialRampToValueAtTime(600, now + 1.4);

    const bandpass = context.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(5200, now);
    bandpass.frequency.exponentialRampToValueAtTime(2400, now + 1.2);
    bandpass.Q.value = 0.8;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    source.connect(highpass);
    highpass.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(masterGain);
    source.start(now);
    source.stop(now + 1.7);
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.applyMasterGain();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyMasterGain();
  }

  private applyMasterGain(): void {
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain) {
      return;
    }

    const target = this.muted ? 0 : this.volume;
    masterGain.gain.cancelScheduledValues(context.currentTime);
    masterGain.gain.setTargetAtTime(target, context.currentTime, 0.05);
  }

  dispose(): void {
    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
    if (this.creakTimer) {
      clearTimeout(this.creakTimer);
      this.creakTimer = null;
    }
    try {
      this.noiseSource?.stop();
    } catch {
      // Source may already be stopped; ignore.
    }
    this.noiseSource = null;
    void this.context?.close().catch(() => undefined);
    this.context = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.started = false;
  }
}

let sharedEngine: SaunaAudioEngine | null = null;

export function getSaunaAudioEngine(): SaunaAudioEngine {
  if (!sharedEngine) {
    sharedEngine = new SaunaAudioEngine();
  }
  return sharedEngine;
}
