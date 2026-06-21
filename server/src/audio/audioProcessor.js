/**
 * Audio Processor - audio effects processing with presets.
 */

/**
 * @typedef {Object} Effect
 * @property {string} type
 * @property {Object} params
 */

const PRESETS = {
  broadcast: {
    name: 'Broadcast',
    description: 'Professional broadcast audio',
    effects: [
      { type: 'compressor', params: { threshold: -20, ratio: 4 } },
      { type: 'limiter', params: { ceiling: -1 } },
      { type: 'equalizer', params: { bands: { low: 2, mid: 3, high: 1 } } },
    ],
  },
  podcast: {
    name: 'Podcast',
    description: 'Clear voice for podcasting',
    effects: [
      { type: 'noiseGate', params: { threshold: -40 } },
      { type: 'compressor', params: { threshold: -18, ratio: 3 } },
      { type: 'equalizer', params: { bands: { low: -1, mid: 4, high: 2 } } },
      { type: 'limiter', params: { ceiling: -2 } },
    ],
  },
  music: {
    name: 'Music',
    description: 'Full-range music mixing',
    effects: [
      { type: 'compressor', params: { threshold: -12, ratio: 2 } },
      { type: 'equalizer', params: { bands: { low: 3, mid: 0, high: 2 } } },
    ],
  },
  voice: {
    name: 'Voice',
    description: 'Enhanced voice clarity',
    effects: [
      { type: 'noiseGate', params: { threshold: -35 } },
      { type: 'compressor', params: { threshold: -15, ratio: 3 } },
      { type: 'equalizer', params: { bands: { low: -2, mid: 5, high: 3 } } },
    ],
  },
  quiet: {
    name: 'Quiet',
    description: 'For noisy environments',
    effects: [
      { type: 'noiseGate', params: { threshold: -30 } },
      { type: 'compressor', params: { threshold: -10, ratio: 6 } },
      { type: 'limiter', params: { ceiling: -3 } },
    ],
  },
};

export class AudioProcessor {
  constructor() {
    this.presets = { ...PRESETS };
  }

  /**
   * Apply compression effect.
   * @param {number} input - signal level
   * @param {number} threshold - dB threshold
   * @param {number} ratio - compression ratio
   * @returns {number}
   */
  compressor(input, threshold = -20, ratio = 4) {
    const inputDb = 20 * Math.log10(Math.max(Math.abs(input), 0.0001));
    if (inputDb <= threshold) return input;
    const gainReduction = (inputDb - threshold) * (1 - 1 / ratio);
    return input * Math.pow(10, -gainReduction / 20);
  }

  /**
   * Apply limiter effect.
   * @param {number} input - signal level
   * @param {number} ceiling - max dB
   * @returns {number}
   */
  limiter(input, ceiling = -1) {
    const inputDb = 20 * Math.log10(Math.max(Math.abs(input), 0.0001));
    if (inputDb <= ceiling) return input;
    return input * Math.pow(10, (ceiling - inputDb) / 20);
  }

  /**
   * Apply equalizer effect.
   * @param {number} input - signal level
   * @param {{ low: number, mid: number, high: number }} bands - gain per band
   * @returns {number}
   */
  equalizer(input, bands = { low: 0, mid: 0, high: 0 }) {
    const avgGain = ((bands.low || 0) + (bands.mid || 0) + (bands.high || 0)) / 3;
    return input * Math.pow(10, avgGain / 20);
  }

  /**
   * Apply noise gate effect.
   * @param {number} input - signal level
   * @param {number} threshold - dB threshold
   * @returns {number}
   */
  noiseGate(input, threshold = -40) {
    const inputDb = 20 * Math.log10(Math.max(Math.abs(input), 0.0001));
    return inputDb < threshold ? 0 : input;
  }

  /**
   * Process audio data through a chain of effects.
   * @param {number} data - input signal
   * @param {Effect[]} effects
   * @returns {number}
   */
  process(data, effects = []) {
    let output = data;
    for (const effect of effects) {
      switch (effect.type) {
        case 'compressor':
          output = this.compressor(output, effect.params.threshold, effect.params.ratio);
          break;
        case 'limiter':
          output = this.limiter(output, effect.params.ceiling);
          break;
        case 'equalizer':
          output = this.equalizer(output, effect.params.bands);
          break;
        case 'noiseGate':
          output = this.noiseGate(output, effect.params.threshold);
          break;
      }
    }
    return output;
  }

  /**
   * Get a preset effect chain by name.
   * @param {string} presetName
   * @returns {{ name: string, description: string, effects: Effect[] }|null}
   */
  getPresetEffects(presetName) {
    return this.presets[presetName] || null;
  }
}

export default AudioProcessor;
