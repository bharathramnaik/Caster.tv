/**
 * TransitionEngine - Manages transition effects between inputs.
 * Supports 15+ transition types with configurable durations and T-bar control.
 * @module transitionEngine
 */
import { EventEmitter } from 'events';

/**
 * Available transition types with default configurations.
 */
const TRANSITION_DEFS = {
  'cut':         { category: 'basic',  defaultDuration: 0,    maxDuration: 0 },
  'crossfade':   { category: 'basic',  defaultDuration: 1000, maxDuration: 5000 },
  'slide-left':  { category: 'slide',  defaultDuration: 1000, maxDuration: 5000 },
  'slide-right': { category: 'slide',  defaultDuration: 1000, maxDuration: 5000 },
  'slide-up':    { category: 'slide',  defaultDuration: 1000, maxDuration: 5000 },
  'slide-down':  { category: 'slide',  defaultDuration: 1000, maxDuration: 5000 },
  'wipe-left':   { category: 'wipe',   defaultDuration: 1000, maxDuration: 5000 },
  'wipe-right':  { category: 'wipe',   defaultDuration: 1000, maxDuration: 5000 },
  'wipe-up':     { category: 'wipe',   defaultDuration: 1000, maxDuration: 5000 },
  'wipe-down':   { category: 'wipe',   defaultDuration: 1000, maxDuration: 5000 },
  'zoom-in':     { category: 'zoom',   defaultDuration: 1000, maxDuration: 5000 },
  'zoom-out':    { category: 'zoom',   defaultDuration: 1000, maxDuration: 5000 },
  'blur':        { category: 'effect', defaultDuration: 1000, maxDuration: 5000 },
  'flip':        { category: 'effect', defaultDuration: 800,  maxDuration: 3000 },
  'rotate':      { category: 'effect', defaultDuration: 1000, maxDuration: 3000 },
};

/**
 * TransitionEngine managing transition effects, auto-transition, and T-bar simulation.
 */
export class TransitionEngine extends EventEmitter {
  /** @type {boolean} */
  #isActive = false;
  /** @type {string} */
  #currentType = 'cut';
  /** @type {number} */
  #currentDuration = 1000;
  /** @type {number} */
  #progress = 0; // 0-100
  /** @type {boolean} */
  #autoMode = false;
  /** @type {NodeJS.Timeout|null} */
  #transitionTimer = null;
  /** @type {number} */
  #transitionStart = 0;

  constructor() {
    super();
  }

  /**
   * Start a transition.
   * @param {string} type - Transition type
   * @param {number} [duration] - Duration in ms (uses default if omitted)
   * @returns {Promise<void>}
   */
  async startTransition(type = 'cut', duration) {
    if (this.#isActive) throw new Error('Transition already in progress');

    const def = TRANSITION_DEFS[type];
    if (!def) throw new Error(`Unknown transition type: ${type}`);

    this.#currentType = type;
    this.#currentDuration = duration ?? def.defaultDuration;
    this.#isActive = true;
    this.#progress = 0;
    this.#transitionStart = Date.now();

    this.emit('transitionStart', {
      type: this.#currentType,
      duration: this.#currentDuration
    });

    if (this.#currentType === 'cut' || this.#currentDuration === 0) {
      this.#progress = 100;
      this.#complete();
      return;
    }

    return new Promise((resolve) => {
      const step = 16; // ~60fps
      const totalSteps = this.#currentDuration / step;
      let currentStep = 0;

      this.#transitionTimer = setInterval(() => {
        currentStep++;
        this.#progress = Math.min(100, (currentStep / totalSteps) * 100);
        this.emit('progress', this.#progress);

        if (currentStep >= totalSteps) {
          this.#complete();
          resolve();
        }
      }, step);
    });
  }

  /**
   * Set T-bar progress manually (0-100).
   * @param {number} progress - 0 to 100
   */
  setProgress(progress) {
    this.#progress = Math.max(0, Math.min(100, progress));
    this.emit('progress', this.#progress);

    if (this.#progress >= 100 && this.#isActive) {
      this.#complete();
    }
  }

  /** Complete the current transition immediately */
  completeTransition() {
    if (!this.#isActive) return;
    this.#progress = 100;
    this.#complete();
  }

  /** Cancel the current transition */
  cancelTransition() {
    if (!this.#isActive) return;

    if (this.#transitionTimer) {
      clearInterval(this.#transitionTimer);
      this.#transitionTimer = null;
    }

    this.#isActive = false;
    this.#progress = 0;
    this.emit('transitionCancel', { type: this.#currentType });
    this.emit('stateChange', this.getState());
  }

  /**
   * Get all available transitions.
   * @returns {Array<{type: string, category: string, defaultDuration: number, maxDuration: number}>}
   */
  getAvailableTransitions() {
    return Object.entries(TRANSITION_DEFS).map(([type, def]) => ({
      type,
      ...def
    }));
  }

  /**
   * Set auto-transition mode.
   * @param {boolean} enabled
   */
  setAutoMode(enabled) {
    this.#autoMode = enabled;
    this.emit('autoModeChange', enabled);
  }

  /** @returns {boolean} Whether auto-transition is enabled */
  getAutoMode() { return this.#autoMode; }

  /**
   * Get current engine state.
   * @returns {Object}
   */
  getState() {
    return {
      isActive: this.#isActive,
      currentType: this.#currentType,
      currentDuration: this.#currentDuration,
      progress: this.#progress,
      autoMode: this.#autoMode
    };
  }

  /** @private */
  #complete() {
    if (this.#transitionTimer) {
      clearInterval(this.#transitionTimer);
      this.#transitionTimer = null;
    }

    this.#isActive = false;
    this.emit('transitionComplete', {
      type: this.#currentType,
      duration: this.#currentDuration
    });
    this.emit('stateChange', this.getState());
  }
}

export default TransitionEngine;
