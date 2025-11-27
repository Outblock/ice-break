// src/utils/audio.ts

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
  }

  // Call this on first user interaction to unlock AudioContext
  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error("Audio resume failed", e));
    }
  }

  private createOscillator(type: OscillatorType, freq: number, duration: number, startTime: number) {
    if (!this.ctx) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    return { osc, gain };
  }

  public playSpinStart() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Rising "power up" sound
    const { osc, gain } = this.createOscillator('square', 100, 0.4, t) || {};
    if (osc && gain) {
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    }
  }

  public playTick() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Short crisp blip
    const { osc, gain } = this.createOscillator('square', 600, 0.05, t) || {};
    if (osc && gain) {
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
    }
  }

  public playWin() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Simple victory arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio: C5, E5, G5, C6
    notes.forEach((freq, index) => {
        const startTime = t + index * 0.1;
        const duration = 0.1;
        const { osc, gain } = this.createOscillator('square', freq, duration, startTime) || {};
        if (osc && gain) {
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);
            osc.start(startTime);
            osc.stop(startTime + duration);
        }
    });

    // Final long note
    const finalStart = t + notes.length * 0.1;
    const { osc: oscEnd, gain: gainEnd } = this.createOscillator('square', 523.25, 0.4, finalStart) || {}; // Back to C5 but longer? Maybe C6
    if (oscEnd && gainEnd) {
         oscEnd.frequency.setValueAtTime(1046.50, finalStart); // C6
         gainEnd.gain.setValueAtTime(0.1, finalStart);
         gainEnd.gain.linearRampToValueAtTime(0, finalStart + 0.4);
         oscEnd.start(finalStart);
         oscEnd.stop(finalStart + 0.4);
    }
  }
}

export const soundManager = new SoundManager();
