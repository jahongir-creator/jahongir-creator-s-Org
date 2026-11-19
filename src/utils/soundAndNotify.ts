import { SoundStyle } from '../types/prayer';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/**
 * Synthesizes a serene, respectful acoustic chime via Web Audio API
 * without requiring external audio file fetches.
 */
export function playPrayerTone(style: SoundStyle = 'chime'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  const playNote = (freq: number, startOffset: number, duration: number, peakGain: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + startOffset);

    gain.gain.setValueAtTime(0.0001, now + startOffset);
    gain.gain.exponentialRampToValueAtTime(peakGain, now + startOffset + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + startOffset);
    osc.stop(now + startOffset + duration + 0.05);
  };

  if (style === 'chime') {
    // Gentle ascending Hijaz-inspired fifths: D4 - A4 - D5 - F#5
    playNote(293.66, 0.0, 1.4, 0.14, 'sine');
    playNote(440.0, 0.22, 1.5, 0.12, 'sine');
    playNote(587.33, 0.44, 1.8, 0.11, 'triangle');
    playNote(739.99, 0.68, 2.0, 0.07, 'sine');
  } else if (style === 'harmonic') {
    // Warm resonant chord sustain
    playNote(261.63, 0.0, 2.2, 0.11, 'sine');
    playNote(392.0, 0.05, 2.2, 0.09, 'sine');
    playNote(523.25, 0.1, 2.3, 0.08, 'sine');
    playNote(659.25, 0.35, 1.9, 0.06, 'sine');
  } else {
    // Crisp clear brass bell strike + overtone
    playNote(528.0, 0.0, 1.6, 0.15, 'sine');
    playNote(1056.0, 0.0, 0.9, 0.05, 'sine');
    playNote(528.0, 0.55, 1.8, 0.12, 'sine');
  }
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showBrowserNotification(title: string, body: string): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission !== 'granted') {
    return false;
  }
  try {
    new Notification(title, {
      body,
      tag: 'mihrab-prayer-reminder',
    });
    return true;
  } catch {
    return false;
  }
}
