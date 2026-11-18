type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let sharedCtx: AudioContext | null = null;
let muted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (sharedCtx) return sharedCtx;

  const AudioCtx =
    window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
  if (!AudioCtx) return null;

  try {
    sharedCtx = new AudioCtx();
    return sharedCtx;
  } catch {
    return null;
  }
}

export function isSoundMuted(): boolean {
  return muted;
}

export function setSoundMuted(nextMuted: boolean): void {
  muted = nextMuted;
}

export async function unlockDjAudio(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  return ctx.state === 'running';
}

function createNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Som sintetizado de entrada DJ: sweep de filtro no mixer + drop grave + transient de agulha/prato
 */
export async function playDjIntroSound(): Promise<boolean> {
  if (muted) return false;
  const ready = await unlockDjAudio();
  const ctx = getAudioContext();
  if (!ready || !ctx) return false;

  try {
    const now = ctx.currentTime;

    // 1. Sweep de filtro tipo DJ mixer (riser -> abertura)
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = createNoiseBuffer(ctx, 1.15);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(2.6, now);
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.exponentialRampToValueAtTime(3400, now + 0.55);
    filter.frequency.exponentialRampToValueAtTime(600, now + 1.05);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.14, now + 0.45);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 1.15);

    // 2. Drop de sub-grave (808 punch no momento do lock da logo)
    const dropStart = now + 0.48;
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(118, dropStart);
    subOsc.frequency.exponentialRampToValueAtTime(38, dropStart + 0.48);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.001, dropStart);
    subGain.gain.linearRampToValueAtTime(0.28, dropStart + 0.025);
    subGain.gain.exponentialRampToValueAtTime(0.001, dropStart + 0.62);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(dropStart);
    subOsc.stop(dropStart + 0.65);

    // 3. Pulso rítmico sutil de prato/synth no lock
    const hitOsc = ctx.createOscillator();
    hitOsc.type = 'triangle';
    hitOsc.frequency.setValueAtTime(220, dropStart);
    hitOsc.frequency.exponentialRampToValueAtTime(55, dropStart + 0.14);

    const hitGain = ctx.createGain();
    hitGain.gain.setValueAtTime(0.12, dropStart);
    hitGain.gain.exponentialRampToValueAtTime(0.001, dropStart + 0.16);

    hitOsc.connect(hitGain);
    hitGain.connect(ctx.destination);

    hitOsc.start(dropStart);
    hitOsc.stop(dropStart + 0.18);

    return true;
  } catch {
    return false;
  }
}

/**
 * Som curto de transição ao tocar em um artista (filter whoosh + cue tap)
 */
export async function playDjTransitionSound(): Promise<void> {
  if (muted) return;
  const ready = await unlockDjAudio();
  const ctx = getAudioContext();
  if (!ready || !ctx) return;

  try {
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 0.24);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.setValueAtTime(3.2, now);
    filter.frequency.setValueAtTime(350, now);
    filter.frequency.exponentialRampToValueAtTime(2600, now + 0.11);
    filter.frequency.exponentialRampToValueAtTime(480, now + 0.22);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.04);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.24);

    // Sub cue tap
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.12);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.14, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Silencioso caso o contexto de áudio não esteja disponível
  }
}
