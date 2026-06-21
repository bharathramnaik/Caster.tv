/**
 * SwitcherEngine - Core multi-input switching engine.
 * Manages program/preview workflow similar to Blackmagic ATEM.
 * @module switcherEngine
 */
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

/**
 * @typedef {Object} InputConfig
 * @property {string} id - Unique input identifier
 * @property {string} name - Display name
 * @property {'scene'|'camera'|'media'|'ndi'} type - Source type
 * @property {string} source - Source identifier or URL
 */

/**
 * Core switcher engine managing multi-input switching with program/preview workflow.
 */
export class SwitcherEngine extends EventEmitter {
  /** @type {InputConfig[]} */
  #inputs = [];
  /** @type {string|null} */
  #programInput = null;
  /** @type {string|null} */
  #previewInput = null;
  /** @type {string} */
  #transitionType = 'cut';
  /** @type {boolean} */
  #isTransitioning = false;

  constructor() {
    super();
    this.#initDefaultInputs();
  }

  /** Initialize default inputs */
  #initDefaultInputs() {
    const defaults = [
      { name: 'Camera 1', type: 'camera', source: 'cam://default/1' },
      { name: 'Camera 2', type: 'camera', source: 'cam://default/2' },
      { name: 'Scene: Scoreboard', type: 'scene', source: 'scene://scoreboard' },
      { name: 'Scene: Replay', type: 'scene', source: 'scene://replay' },
      { name: 'Media: Intro', type: 'media', source: 'media://intro.mp4' },
      { name: 'Media: Ads', type: 'media', source: 'media://ads.mp4' },
      { name: 'NDI: Commentary', type: 'ndi', source: 'ndi://commentary' },
      { name: 'Color Bars', type: 'media', source: 'media://colorbars' },
    ];

    for (const d of defaults) {
      this.#inputs.push({ id: `input_${nanoid(8)}`, ...d });
    }

    if (this.#inputs.length > 0) {
      this.#programInput = this.#inputs[0].id;
      this.#previewInput = this.#inputs[1]?.id || this.#inputs[0].id;
    }
  }

  /**
   * Switch program to the given input using a transition.
   * @param {string} inputId - Target input ID
   * @param {string} [transition='cut'] - Transition type
   */
  switchTo(inputId, transition = 'cut') {
    const input = this.#inputs.find(i => i.id === inputId);
    if (!input) throw new Error(`Input not found: ${inputId}`);

    const prevProgram = this.#programInput;
    this.#programInput = inputId;
    this.#transitionType = transition;
    this.#isTransitioning = true;

    this.emit('switch', {
      from: prevProgram,
      to: inputId,
      transition,
      timestamp: Date.now()
    });

    this.#isTransitioning = false;
    this.emit('stateChange', this.getState());
  }

  /**
   * Set preview input.
   * @param {string} inputId - Target input ID
   */
  previewInput(inputId) {
    const input = this.#inputs.find(i => i.id === inputId);
    if (!input) throw new Error(`Input not found: ${inputId}`);

    this.#previewInput = inputId;
    this.emit('previewChange', { inputId, timestamp: Date.now() });
    this.emit('stateChange', this.getState());
  }

  /** Hard cut: instant switch of preview to program */
  cut() {
    if (this.#previewInput) {
      this.switchTo(this.#previewInput, 'cut');
    }
  }

  /**
   * Auto transition: execute transition from program to preview.
   * @param {string} [transitionType] - Override transition type
   */
  autoTransition(transitionType) {
    if (this.#previewInput) {
      this.switchTo(this.#previewInput, transitionType || this.#transitionType);
    }
  }

  /** @returns {string|null} Current program input ID */
  getProgramInput() { return this.#programInput; }

  /** @returns {string|null} Current preview input ID */
  getPreviewInput() { return this.#previewInput; }

  /** @returns {InputConfig[]} All configured inputs */
  getInputs() { return [...this.#inputs]; }

  /**
   * Add a new input.
   * @param {Omit<InputConfig, 'id'>} config
   * @returns {InputConfig}
   */
  addInput(config) {
    const input = { id: `input_${nanoid(8)}`, ...config };
    this.#inputs.push(input);
    this.emit('inputAdded', input);
    this.emit('stateChange', this.getState());
    return input;
  }

  /**
   * Remove an input by ID.
   * @param {string} inputId
   * @returns {boolean}
   */
  removeInput(inputId) {
    const idx = this.#inputs.findIndex(i => i.id === inputId);
    if (idx === -1) return false;

    const [removed] = this.#inputs.splice(idx, 1);

    if (this.#programInput === inputId) {
      this.#programInput = this.#inputs[0]?.id || null;
    }
    if (this.#previewInput === inputId) {
      this.#previewInput = this.#inputs[0]?.id || null;
    }

    this.emit('inputRemoved', removed);
    this.emit('stateChange', this.getState());
    return true;
  }

  /**
   * Get full switcher state.
   * @returns {Object}
   */
  getState() {
    return {
      programInput: this.#programInput,
      previewInput: this.#previewInput,
      transitionType: this.#transitionType,
      isTransitioning: this.#isTransitioning,
      inputs: this.getInputs()
    };
  }
}

export default SwitcherEngine;
