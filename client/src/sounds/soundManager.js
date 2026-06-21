import { sounds } from './sounds.js';

class SoundManagerClass {
  constructor() {
    this.ctx = null;
    this.volume = parseFloat(localStorage.getItem('soundVolume') || '0.5');
    this.muted = localStorage.getItem('soundMuted') === 'true';
    this.preloaded = new Set();
  }

  _getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.ctx;
  }

  _createOscillator(config, ctx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = config.type || 'sine';
    gain.gain.value = this.muted ? 0 : this.volume;
    osc.connect(gain);
    gain.connect(ctx.destination);
    return { osc, gain };
  }

  _playNote(config, startTime, noteFreq, duration) {
    const ctx = this._getContext();
    const { osc, gain } = this._createOscillator(config, ctx);
    osc.frequency.setValueAtTime(noteFreq, startTime);
    gain.gain.setValueAtTime(this.muted ? 0 : this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }

  play(soundName) {
    const config = sounds[soundName];
    if (!config) return;

    const ctx = this._getContext();
    const startTime = ctx.currentTime;

    if (config.sweep) {
      const { osc, gain } = this._createOscillator(config, ctx);
      osc.frequency.setValueAtTime(config.frequency, startTime);
      osc.frequency.linearRampToValueAtTime(config.sweep, startTime + config.duration);
      gain.gain.setValueAtTime(this.muted ? 0 : this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + config.duration);
      osc.start(startTime);
      osc.stop(startTime + config.duration);
      return;
    }

    if (config.notes && Array.isArray(config.notes)) {
      const noteDur = config.duration / config.notes.length;
      config.notes.forEach((freq, i) => {
        this._playNote(config, startTime + i * noteDur, freq, noteDur);
      });
      return;
    }

    if (config.frequency) {
      this._playNote(config, startTime, config.frequency, config.duration);
    }
  }

  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
    localStorage.setItem('soundVolume', String(this.volume));
  }

  getVolume() {
    return this.volume;
  }

  mute() {
    this.muted = true;
    localStorage.setItem('soundMuted', 'true');
  }

  unmute() {
    this.muted = false;
    localStorage.setItem('soundMuted', 'false');
  }

  toggleMute() {
    if (this.muted) this.unmute();
    else this.mute();
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  preload(soundNames) {
    soundNames.forEach(name => {
      if (sounds[name]) this.preloaded.add(name);
    });
  }
}

export const SoundManager = new SoundManagerClass();
