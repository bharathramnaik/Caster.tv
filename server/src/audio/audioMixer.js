/**
 * Audio Mixer - manages multiple audio channels with volume, mute, solo, and pan controls.
 */
import { nanoid } from 'nanoid';

/**
 * @typedef {Object} Channel
 * @property {string} id
 * @property {string} name
 * @property {number} volume - 0-100
 * @property {boolean} mute
 * @property {boolean} solo
 * @property {number} pan - -100 to 100
 */

const MAX_CHANNELS = 8;

export class AudioMixer {
  constructor() {
    /** @type {Channel[]} */
    this.channels = [];
    /** @type {number} */
    this.masterVolume = 75;
  }

  /**
   * Add a new audio channel.
   * @param {string} name
   * @returns {Channel}
   */
  addChannel(name) {
    if (this.channels.length >= MAX_CHANNELS) {
      throw new Error(`Maximum of ${MAX_CHANNELS} channels reached`);
    }
    const channel = {
      id: `ch_${nanoid(6)}`,
      name: name || `Channel ${this.channels.length + 1}`,
      volume: 75,
      mute: false,
      solo: false,
      pan: 0,
    };
    this.channels.push(channel);
    return channel;
  }

  /**
   * Remove a channel by id.
   * @param {string} id
   * @returns {boolean}
   */
  removeChannel(id) {
    const idx = this.channels.findIndex(ch => ch.id === id);
    if (idx === -1) return false;
    this.channels.splice(idx, 1);
    return true;
  }

  /**
   * Set volume for a channel.
   * @param {string} id
   * @param {number} level - 0-100
   * @returns {Channel|null}
   */
  setVolume(id, level) {
    const ch = this.channels.find(c => c.id === id);
    if (!ch) return null;
    ch.volume = Math.max(0, Math.min(100, Math.round(level)));
    return ch;
  }

  /**
   * Set mute for a channel.
   * @param {string} id
   * @param {boolean} mute
   * @returns {Channel|null}
   */
  setMute(id, mute) {
    const ch = this.channels.find(c => c.id === id);
    if (!ch) return null;
    ch.mute = !!mute;
    return ch;
  }

  /**
   * Set solo for a channel.
   * @param {string} id
   * @param {boolean} solo
   * @returns {Channel|null}
   */
  setSolo(id, solo) {
    const ch = this.channels.find(c => c.id === id);
    if (!ch) return null;
    ch.solo = !!solo;
    return ch;
  }

  /**
   * Set pan for a channel.
   * @param {string} id
   * @param {number} pan - -100 to 100
   * @returns {Channel|null}
   */
  setPan(id, pan) {
    const ch = this.channels.find(c => c.id === id);
    if (!ch) return null;
    ch.pan = Math.max(-100, Math.min(100, Math.round(pan)));
    return ch;
  }

  /**
   * Get all channels.
   * @returns {Channel[]}
   */
  getChannels() {
    return [...this.channels];
  }

  /**
   * Get master volume.
   * @returns {number}
   */
  getMasterVolume() {
    return this.masterVolume;
  }

  /**
   * Set master volume.
   * @param {number} level - 0-100
   */
  setMasterVolume(level) {
    this.masterVolume = Math.max(0, Math.min(100, Math.round(level)));
  }

  /**
   * Get the full mix state including solo/mute logic.
   * @returns {{ masterVolume: number, channels: Channel[] }}
   */
  getMixState() {
    const hasSolo = this.channels.some(ch => ch.solo);
    const resolved = this.channels.map(ch => {
      let effectiveVolume = ch.volume;
      let effectiveMute = ch.mute;
      if (hasSolo && !ch.solo) {
        effectiveMute = true;
      }
      return { ...ch, effectiveVolume, effectiveMute };
    });
    return { masterVolume: this.masterVolume, channels: resolved };
  }
}

export default AudioMixer;
