import type { CableSound } from "@/types";

/**
 * The sounds of the mouse's cable, synthesized with Web Audio so there's
 * nothing to download: a dry creak while the cable is being stretched and a
 * dull thud when it stops the mouse.
 */

const MASTER_VOLUME = 0.2;
const NOISE_SECONDS = 2;
/** The creak is friction: band-passed noise, chopped into ticks that speed up as it tightens */
const CREAK_BAND = { low: 420, high: 1150, q: 7 };
const CREAK_TICKS = { slow: 11, fast: 38 };
const CREAK_VOLUME = 0.55;
/** Tension below which the cable is silent */
const CREAK_THRESHOLD = 0.3;
/** Seconds the creak takes to follow the tension, so it never clicks */
const CREAK_SMOOTHING = 0.04;
const THUD = { from: 120, to: 48, seconds: 0.16, volume: 0.9 };
/** Impact speed (cm/s) of a full-volume thud, and the gap between two of them */
const THUD_FULL_SPEED = 90;
const THUD_GAP_SECONDS = 0.18;

function noiseBuffer(context: AudioContext) {
  const length = context.sampleRate * NOISE_SECONDS;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < length; index++) {
    samples[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Starts the audio graph. Browsers only allow this from a user gesture, so
 * it's called from the first press on the mouse. Returns null where Web Audio
 * isn't available.
 */
export function createCableSound(): CableSound | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.value = MASTER_VOLUME;
  master.connect(context.destination);

  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer(context);
  noise.loop = true;
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = CREAK_BAND.low;
  band.Q.value = CREAK_BAND.q;
  // A sawtooth opens and shuts the noise: each tooth is one tick of the creak
  const ticks = context.createGain();
  ticks.gain.value = 0;
  const chopper = context.createOscillator();
  chopper.type = "sawtooth";
  chopper.frequency.value = CREAK_TICKS.slow;
  const chopDepth = context.createGain();
  chopDepth.gain.value = 0.5;
  const creak = context.createGain();
  creak.gain.value = 0;

  noise.connect(band).connect(ticks).connect(creak).connect(master);
  chopper.connect(chopDepth).connect(ticks.gain);
  const offset = context.createConstantSource();
  offset.offset.value = 0.5;
  offset.connect(ticks.gain);
  noise.start();
  chopper.start();
  offset.start();

  let lastThud = -Infinity;

  return {
    strain(tension) {
      const now = context.currentTime;
      const amount = Math.max(
        0,
        (tension - CREAK_THRESHOLD) / (1 - CREAK_THRESHOLD)
      );
      creak.gain.setTargetAtTime(
        amount * amount * CREAK_VOLUME,
        now,
        CREAK_SMOOTHING
      );
      band.frequency.setTargetAtTime(
        CREAK_BAND.low + (CREAK_BAND.high - CREAK_BAND.low) * amount,
        now,
        CREAK_SMOOTHING
      );
      chopper.frequency.setTargetAtTime(
        CREAK_TICKS.slow + (CREAK_TICKS.fast - CREAK_TICKS.slow) * amount,
        now,
        CREAK_SMOOTHING
      );
    },
    thud(speed) {
      const now = context.currentTime;
      if (now - lastThud < THUD_GAP_SECONDS) return;
      lastThud = now;
      const volume = Math.min(1, speed / THUD_FULL_SPEED) * THUD.volume;
      const tone = context.createOscillator();
      tone.type = "sine";
      tone.frequency.setValueAtTime(THUD.from, now);
      tone.frequency.exponentialRampToValueAtTime(THUD.to, now + THUD.seconds);
      const envelope = context.createGain();
      envelope.gain.setValueAtTime(volume, now);
      envelope.gain.exponentialRampToValueAtTime(0.001, now + THUD.seconds);
      tone.connect(envelope).connect(master);
      tone.start(now);
      tone.stop(now + THUD.seconds);
    },
    dispose() {
      void context.close();
    },
  };
}
