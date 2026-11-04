// Audio synthesizer using Web Audio API for celebratory chimes and romantic ambient music loops

class AudioService {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isMuted = false;
  private customAudio: HTMLAudioElement | null = null;
  private intervalId: number | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play celebration entrance chime when wax seal is cracked
  playCelebrationChime() {
    try {
      this.initCtx();
      if (!this.ctx || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.3);
      });
    } catch {
      // Audio not permitted or supported
    }
  }

  // Ambient gentle romantic chord arpeggio loop
  playAmbientLoop(customUrl?: string) {
    if (this.isPlaying) return;

    if (customUrl && customUrl.startsWith('http')) {
      try {
        if (!this.customAudio) {
          this.customAudio = new Audio(customUrl);
          this.customAudio.loop = true;
          this.customAudio.volume = 0.4;
        }
        this.customAudio.play().then(() => {
          this.isPlaying = true;
        }).catch(() => {
          this.playSynthAmbientLoop();
        });
        return;
      } catch {
        this.playSynthAmbientLoop();
      }
    } else {
      this.playSynthAmbientLoop();
    }
  }

  private playSynthAmbientLoop() {
    this.initCtx();
    this.isPlaying = true;

    // Harmonic chords in A major / F# minor
    const progression = [
      [220, 277.18, 329.63, 440], // A Major
      [293.66, 369.99, 440, 587.33], // D Major
      [246.94, 293.66, 369.99, 493.88], // B minor
      [329.63, 415.30, 493.88, 659.25], // E Major
    ];

    let chordIdx = 0;
    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;

      const chord = progression[chordIdx];
      chordIdx = (chordIdx + 1) % progression.length;

      const now = this.ctx.currentTime;
      chord.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.04, now + i * 0.15 + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 3.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 3.8);
      });
    };

    playChordStep();
    this.intervalId = window.setInterval(playChordStep, 4000);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio.currentTime = 0;
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.customAudio) {
      this.customAudio.muted = this.isMuted;
    }
    return this.isMuted;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getIsMuted() {
    return this.isMuted;
  }
}

export const audioService = new AudioService();
