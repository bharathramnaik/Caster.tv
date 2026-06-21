/**
 * Quality Manager - manages output quality presets and settings.
 */

const PRESETS = {
  ultra: {
    name: 'Ultra',
    description: '4K Ultra HD',
    resolution: { width: 3840, height: 2160 },
    videoBitrate: 20000,
    audioBitrate: 320,
    framerate: 60,
    codec: 'h264',
  },
  high: {
    name: 'High',
    description: '1080p Full HD',
    resolution: { width: 1920, height: 1080 },
    videoBitrate: 8000,
    audioBitrate: 256,
    framerate: 30,
    codec: 'h264',
  },
  medium: {
    name: 'Medium',
    description: '720p HD',
    resolution: { width: 1280, height: 720 },
    videoBitrate: 4000,
    audioBitrate: 192,
    framerate: 30,
    codec: 'h264',
  },
  low: {
    name: 'Low',
    description: '480p SD',
    resolution: { width: 854, height: 480 },
    videoBitrate: 1500,
    audioBitrate: 128,
    framerate: 24,
    codec: 'h264',
  },
  mobile: {
    name: 'Mobile',
    description: '360p Mobile',
    resolution: { width: 640, height: 360 },
    videoBitrate: 800,
    audioBitrate: 96,
    framerate: 24,
    codec: 'h264',
  },
};

export class QualityManager {
  constructor() {
    this.presets = { ...PRESETS };
    this.currentQuality = 'high';
    this.autoQuality = false;
    this.customPresets = new Map();
  }

  /**
   * Get a quality preset by name.
   * @param {string} name
   * @returns {Object|null}
   */
  getPreset(name) {
    return this.presets[name] || this.customPresets.get(name) || null;
  }

  /**
   * Get all available presets (built-in + custom).
   * @returns {Object[]}
   */
  getPresets() {
    const builtIn = Object.entries(this.presets).map(([key, val]) => ({ id: key, ...val, custom: false }));
    const custom = [...this.customPresets.entries()].map(([key, val]) => ({ id: key, ...val, custom: true }));
    return [...builtIn, ...custom];
  }

  /**
   * Create a custom quality preset.
   * @param {string} name
   * @param {Object} config
   * @returns {Object}
   */
  createCustomPreset(name, config) {
    const preset = {
      name: config.name || name,
      description: config.description || 'Custom preset',
      resolution: config.resolution || { width: 1920, height: 1080 },
      videoBitrate: config.videoBitrate || 8000,
      audioBitrate: config.audioBitrate || 256,
      framerate: config.framerate || 30,
      codec: config.codec || 'h264',
    };
    this.customPresets.set(name, preset);
    return { id: name, ...preset, custom: true };
  }

  /**
   * Get current quality settings.
   * @returns {Object}
   */
  getCurrentQuality() {
    const preset = this.getPreset(this.currentQuality);
    return {
      id: this.currentQuality,
      autoQuality: this.autoQuality,
      ...preset,
    };
  }

  /**
   * Set quality by preset name.
   * @param {string} presetName
   * @returns {Object|null}
   */
  setQuality(presetName) {
    const preset = this.getPreset(presetName);
    if (!preset) return null;
    this.currentQuality = presetName;
    return { id: presetName, ...preset };
  }

  /**
   * Get recommended bitrate for a given resolution and framerate.
   * @param {{ width: number, height: number }} resolution
   * @param {number} framerate
   * @returns {{ videoBitrate: number, audioBitrate: number, recommended: string }}
   */
  getRecommendedBitrate(resolution, framerate) {
    const pixels = resolution.width * resolution.height;
    const pixelFactor = pixels / (1920 * 1080);
    const fpsFactor = framerate / 30;

    const videoBitrate = Math.round(8000 * pixelFactor * fpsFactor);
    const audioBitrate = 256;

    let recommended = 'medium';
    if (videoBitrate >= 15000) recommended = 'ultra';
    else if (videoBitrate >= 6000) recommended = 'high';
    else if (videoBitrate >= 2500) recommended = 'medium';
    else if (videoBitrate >= 1000) recommended = 'low';
    else recommended = 'mobile';

    return { videoBitrate, audioBitrate, recommended };
  }
}

export default QualityManager;
