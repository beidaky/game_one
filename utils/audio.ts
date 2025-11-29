// A simple procedural synthwave generator to avoid external assets
// and keep the "Tech" vibe.

export class AudioManager {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private tempo: number = 130;
  private beatCount: number = 0;
  private schedulerTimer: number | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization in init() to handle browser autoplay policies
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.4;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public toggleMute(muted: boolean) {
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.4, this.ctx!.currentTime, 0.1);
    }
  }

  public startMusic() {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.beatCount = 0;
    this.scheduler();
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      window.clearTimeout(this.schedulerTimer);
    }
  }

  public playJumpSound() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playCrashSound() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  private scheduler = () => {
    if (!this.ctx || !this.isPlaying) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleNote(this.beatCount, this.nextNoteTime);
      this.nextNoteTime += 60.0 / this.tempo / 4; // 16th notes
      this.beatCount++;
    }
    
    this.schedulerTimer = window.setTimeout(this.scheduler, 25);
  }

  private scheduleNote(beat: number, time: number) {
    if (!this.ctx || !this.masterGain) return;

    // Bassline (Every 1/8)
    if (beat % 2 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      // Simple arpeggio pattern
      const notes = [65.41, 65.41, 77.78, 65.41, 58.27, 58.27, 48.00, 58.27];
      const freq = notes[(beat / 2) % 8];

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      // Filter for that "pluck" sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, time);
      filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);
      osc.disconnect();
      osc.connect(filter);
      filter.connect(gain);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

      osc.start(time);
      osc.stop(time + 0.2);
    }

    // Kick (Every 1/4)
    if (beat % 4 === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

      gain.gain.setValueAtTime(0.7, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

      osc.start(time);
      osc.stop(time + 0.5);
    }

    // Snare/Clap (Every 1/4 offset)
    if ((beat + 4) % 8 === 0) {
      const noiseBuffer = this.createNoiseBuffer();
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      const noiseGain = this.ctx.createGain();
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);

      noiseGain.gain.setValueAtTime(0.4, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      noise.start(time);
    }
  }

  private createNoiseBuffer(): AudioBuffer {
    if (!this.ctx) throw new Error("No Context");
    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

export const audioManager = new AudioManager();