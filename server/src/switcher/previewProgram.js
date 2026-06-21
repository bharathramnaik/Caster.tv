/**
 * PreviewProgram - PGM/PST (Program/Preview) bus workflow manager.
 * Manages the two-bus switching model used in professional broadcast.
 * @module previewProgram
 */
import { EventEmitter } from 'events';

/** @typedef {'cut'|'dissolve'|'wipe'|'slide'|'zoom'|'blur'|'flip'|'rotate'|'push'|'reveal'} TransitionType */

/**
 * Preview/Program bus manager implementing professional broadcast workflow.
 */
export class PreviewProgram extends EventEmitter {
  /** @type {string|null} */
  #programBus = null;
  /** @type {string|null} */
  #previewBus = null;
  /** @type {boolean} */
  #isTransitioning = false;
  /** @type {string} */
  #activeTransition = 'cut';
  /** @type {string[]} */
  #transitionLog = [];

  /** Available transition types */
  static TRANSITIONS = [
    'cut', 'dissolve', 'wipe', 'slide', 'zoom',
    'blur', 'flip', 'rotate', 'push', 'reveal'
  ];

  /**
   * Set the Program (live) bus input.
   * @param {string} inputId
   */
  setProgram(inputId) {
    const prev = this.#programBus;
    this.#programBus = inputId;
    this.#logTransition('program-set', prev, inputId);
    this.emit('programChange', { from: prev, to: inputId });
    this.emit('stateChange', this.getStatus());
  }

  /**
   * Set the Preview (next) bus input.
   * @param {string} inputId
   */
  setPreview(inputId) {
    const prev = this.#previewBus;
    this.#previewBus = inputId;
    this.emit('previewChange', { from: prev, to: inputId });
    this.emit('stateChange', this.getStatus());
  }

  /**
   * Swap Program and Preview buses (like pressing the SWAP button).
   */
  swap() {
    const temp = this.#programBus;
    this.#programBus = this.#previewBus;
    this.#previewBus = temp;

    this.#logTransition('swap', temp, this.#programBus);
    this.emit('swap', { program: this.#programBus, preview: this.#previewBus });
    this.emit('stateChange', this.getStatus());
  }

  /**
   * Execute transition from Preview to Program.
   * @param {TransitionType} [type='cut']
   * @param {number} [duration=1000] - Duration in ms
   * @returns {Promise<void>}
   */
  async transition(type = 'cut', duration = 1000) {
    if (this.#isTransitioning) throw new Error('Transition already in progress');
    if (!this.#previewBus) throw new Error('No preview input selected');

    this.#isTransitioning = true;
    this.#activeTransition = type;
    this.emit('transitionStart', { type, duration, from: this.#programBus, to: this.#previewBus });

    const targetInput = this.#previewBus;

    if (type === 'cut' || duration === 0) {
      this.#programBus = targetInput;
    } else {
      await new Promise(resolve => setTimeout(resolve, duration));
      this.#programBus = targetInput;
    }

    this.#isTransitioning = false;
    this.#logTransition(type, this.#programBus, targetInput);
    this.emit('transitionComplete', { type, input: targetInput });
    this.emit('stateChange', this.getStatus());
  }

  /** @returns {string|null} Current program input */
  getProgram() { return this.#programBus; }

  /** @returns {string|null} Current preview input */
  getPreview() { return this.#previewBus; }

  /** @returns {boolean} Whether a transition is in progress */
  isTransitioning() { return this.#isTransitioning; }

  /**
   * Get full status object.
   * @returns {Object}
   */
  getStatus() {
    return {
      program: this.#programBus,
      preview: this.#previewBus,
      isTransitioning: this.#isTransitioning,
      activeTransition: this.#activeTransition,
      transitionLog: [...this.#transitionLog].slice(-20)
    };
  }

  /**
   * Get available transitions.
   * @returns {string[]}
   */
  getAvailableTransitions() {
    return [...PreviewProgram.TRANSITIONS];
  }

  /**
   * Log a transition action.
   * @private
   */
  #logTransition(type, from, to) {
    this.#transitionLog.push({ type, from, to, timestamp: Date.now() });
    if (this.#transitionLog.length > 100) {
      this.#transitionLog = this.#transitionLog.slice(-100);
    }
  }
}

export default PreviewProgram;
