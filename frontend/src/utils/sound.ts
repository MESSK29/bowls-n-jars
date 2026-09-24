// Web Audio API Ceramic Sound Engine
// Synthesizes authentic porcelain and stoneware acoustic frequencies procedurally
// with zero external audio file latency and randomized micro-variations.

class CeramicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.22; // subtle default volume (22%)

  constructor() {
    // Load persisted state from localStorage if available
    try {
      const storedMute = localStorage.getItem('bowls_sound_muted');
      if (storedMute !== null) {
        this.isMuted = storedMute === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('bowls_sound_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    // If unmuting, play a gentle test tap to confirm
    if (!this.isMuted) {
      this.playTap();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Delicate ceramic tap: short, high-Q damped ping for buttons, links, and minor clicks.
   */
  public playTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Fundamental ceramic frequency with slight random micro-variation (2100Hz - 2500Hz)
    const baseFreq = 2200 + (Math.random() - 0.5) * 300;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.08);

    // Bandpass filter to sculpt ceramic resonance
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq, now);
    filter.Q.setValueAtTime(12, now);

    // Fast decay envelope (~90ms)
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.7, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Resonant porcelain clink: dual-harmonic clink with realistic ceramic ring
   * for Add-to-Basket, checkout buttons, and key interactions.
   */
  public playClink() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.14; // 140ms

    // Two harmonic oscillators to simulate stoneware acoustic modes
    const f1 = 1950 + (Math.random() - 0.5) * 150;
    const f2 = f1 * 1.58; // Inharmonic overtone characteristic of ceramic plates/bowls

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(f1, now);
    osc1.frequency.exponentialRampToValueAtTime(f1 * 0.85, now + duration);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(f2, now);
    osc2.frequency.exponentialRampToValueAtTime(f2 * 0.9, now + duration);

    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1400, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.01);
    osc2.stop(now + duration + 0.01);
  }

  /**
   * Soft sliding sound for drawers and modals (e.g. cart drawer slide).
   */
  public playSlide() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Celebratory glaze shimmer: gentle multi-tonal chord for promo codes and order completion.
   */
  public playGlazeChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7 warm ceramic chime
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + idx * 0.045;
      const duration = 0.28;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.5, startTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
    });
  }
}

export const ceramicAudio = new CeramicAudioEngine();
