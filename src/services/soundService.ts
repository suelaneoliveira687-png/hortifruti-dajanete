// Web Audio API chime generator for new order alerts

class SoundService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Cheerful bell notification when a new order arrives
  public playNewOrderChime() {
    if (!this.soundEnabled) return;

    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1 (Ding)
      this.playTone(ctx, 587.33, now, 0.25, 0.4); // D5
      // Note 2 (Dong)
      this.playTone(ctx, 880.00, now + 0.15, 0.35, 0.45); // A5
      // Note 3 (Ting)
      this.playTone(ctx, 1174.66, now + 0.32, 0.6, 0.5); // D6
    } catch {
      // Audio context may be blocked by browser policy until user interacts
    }
  }

  // Quick success click feedback
  public playSuccessTone() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.playTone(ctx, 523.25, now, 0.15, 0.25); // C5
      this.playTone(ctx, 659.25, now + 0.1, 0.25, 0.3); // E5
    } catch {
      // ignore
    }
  }

  private playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, volume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, startTime);

    // Envelope
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const soundService = new SoundService();
