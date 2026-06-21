/**
 * Audio Visualizer - generates mock audio visualization data for charts and displays.
 */

const LEVEL_COUNT = 16;

export class AudioVisualizer {
  constructor() {
    this._levelCache = new Map();
    this._lastUpdate = 0;
    this._updateInterval = 33; // ~30fps
  }

  /**
   * Get current audio levels for each channel.
   * @param {number} channels - number of channels
   * @returns {{ levels: number[], peak: number }}
   */
  getLevels(channels) {
    const now = Date.now();
    if (now - this._lastUpdate > this._updateInterval) {
      this._lastUpdate = now;
      this._levelCache.clear();
    }

    const levels = [];
    for (let i = 0; i < channels; i++) {
      const cached = this._levelCache.get(i);
      if (cached !== undefined) {
        levels.push(cached);
      } else {
        // Smooth random walk with realistic range
        const prev = this._levelCache.has(i) ? this._levelCache.get(i) : 30 + Math.random() * 40;
        const delta = (Math.random() - 0.5) * 20;
        const level = Math.max(0, Math.min(100, prev + delta));
        this._levelCache.set(i, level);
        levels.push(Math.round(level));
      }
    }

    const peak = Math.max(...levels, 0);
    return { levels, peak };
  }

  /**
   * Get waveform data for a specific channel (sine wave + noise).
   * @param {number} channel
   * @returns {number[]} array of samples (-100 to 100)
   */
  getWaveform(channel) {
    const samples = [];
    const baseFreq = 0.05 + (channel % 4) * 0.02;
    const baseAmp = 30 + Math.random() * 40;
    const phase = Date.now() * 0.001;

    for (let i = 0; i < LEVEL_COUNT; i++) {
      const t = i * 0.5 + phase;
      const sine = Math.sin(t * baseFreq * 10) * baseAmp;
      const noise = (Math.random() - 0.5) * 15;
      samples.push(Math.round(Math.max(-100, Math.min(100, sine + noise))));
    }
    return samples;
  }

  /**
   * Get spectrum (frequency band) data for a channel.
   * @param {number} channel
   * @returns {{ low: number, mid: number, high: number, bands: number[] }}
   */
  getSpectrum(channel) {
    const seed = channel * 1000 + Math.floor(Date.now() / 100);
    const low = 30 + (seed % 40) + Math.random() * 15;
    const mid = 20 + ((seed * 7) % 50) + Math.random() * 15;
    const high = 10 + ((seed * 13) % 35) + Math.random() * 10;

    const bands = [];
    for (let i = 0; i < LEVEL_COUNT; i++) {
      const ratio = i / LEVEL_COUNT;
      let val;
      if (ratio < 0.33) {
        val = low * (1 - ratio * 3) + mid * (ratio * 3);
      } else if (ratio < 0.66) {
        val = mid * (1 - (ratio - 0.33) * 3) + high * ((ratio - 0.33) * 3);
      } else {
        val = high * (1 - (ratio - 0.66) * 3) * 0.6;
      }
      val += (Math.random() - 0.5) * 10;
      bands.push(Math.round(Math.max(0, Math.min(100, val))));
    }

    return { low: Math.round(low), mid: Math.round(mid), high: Math.round(high), bands };
  }
}

export default AudioVisualizer;
