/**
 * MultiViewer - Generates and manages multi-view layouts.
 * Supports configurable grid layouts with tally indicators.
 * @module multiViewer
 */
import { EventEmitter } from 'events';

/**
 * Pre-defined layout configurations.
 */
const LAYOUTS = {
  '2x1': { columns: 2, rows: 1, cells: 2 },
  '2x2': { columns: 2, rows: 2, cells: 4 },
  '3x1': { columns: 3, rows: 1, cells: 3 },
  '3x2': { columns: 3, rows: 2, cells: 6 },
  '4x2': { columns: 4, rows: 2, cells: 8 },
  'custom': { columns: 4, rows: 2, cells: 8 }
};

/**
 * Multi-view layout manager with tally light support.
 */
export class MultiViewer extends EventEmitter {
  /** @type {string} */
  #layoutType = '4x2';
  /** @type {Object} */
  #layoutConfig;
  /** @type {Map<number, string>} */
  #cellInputs = new Map();
  /** @type {Map<string, string>} */
  #tallyStates = new Map(); // inputId -> 'program'|'preview'|null

  constructor(layout = '4x2') {
    super();
    this.#layoutType = layout;
    this.#layoutConfig = { ...LAYOUTS[layout] } || LAYOUTS['4x2'];
    this.#initCells();
  }

  /** Initialize cells with default assignments */
  #initCells() {
    for (let i = 0; i < this.#layoutConfig.cells; i++) {
      this.#cellInputs.set(i, null);
    }
  }

  /**
   * Set the multi-view layout.
   * @param {'2x1'|'2x2'|'3x1'|'3x2'|'4x2'|'custom'} layoutType
   */
  setLayout(layoutType) {
    const config = LAYOUTS[layoutType];
    if (!config) throw new Error(`Unknown layout: ${layoutType}`);

    this.#layoutType = layoutType;
    this.#layoutConfig = { ...config };

    // Reinitialize cells
    const oldCells = new Map(this.#cellInputs);
    this.#cellInputs.clear();
    for (let i = 0; i < config.cells; i++) {
      this.#cellInputs.set(i, oldCells.get(i) || null);
    }

    this.emit('layoutChange', { layoutType, config: this.#layoutConfig });
    this.emit('stateChange', this.getState());
  }

  /**
   * Get current layout configuration.
   * @returns {Object}
   */
  getLayout() {
    return {
      type: this.#layoutType,
      ...this.#layoutConfig
    };
  }

  /**
   * Get configuration for a specific cell.
   * @param {number} cellId
   * @returns {Object|null}
   */
  getCellConfig(cellId) {
    if (!this.#cellInputs.has(cellId)) return null;
    return {
      cellId,
      inputId: this.#cellInputs.get(cellId),
      tally: this.#tallyStates.get(this.#cellInputs.get(cellId)) || null
    };
  }

  /**
   * Assign an input to a cell.
   * @param {number} cellId
   * @param {string|null} inputId
   */
  setCellInput(cellId, inputId) {
    if (!this.#cellInputs.has(cellId)) throw new Error(`Invalid cell ID: ${cellId}`);
    this.#cellInputs.set(cellId, inputId);
    this.emit('cellChange', { cellId, inputId });
    this.emit('stateChange', this.getState());
  }

  /**
   * Get tally state for a given input.
   * @param {string} inputId
   * @returns {'program'|'preview'|null}
   */
  getTallyState(inputId) {
    return this.#tallyStates.get(inputId) || null;
  }

  /**
   * Update all tally states (typically called when program/preview changes).
   * @param {string|null} programInput
   * @param {string|null} previewInput
   */
  updateTally(programInput, previewInput) {
    // Reset all
    for (const [key] of this.#tallyStates) {
      this.#tallyStates.set(key, null);
    }

    if (programInput) this.#tallyStates.set(programInput, 'program');
    if (previewInput) this.#tallyStates.set(previewInput, 'preview');

    this.emit('tallyUpdate', {
      program: programInput,
      preview: previewInput,
      states: Object.fromEntries(this.#tallyStates)
    });
  }

  /**
   * Get full multi-view state.
   * @returns {Object}
   */
  getState() {
    const cells = [];
    for (const [cellId, inputId] of this.#cellInputs) {
      cells.push({
        cellId,
        inputId,
        tally: inputId ? (this.#tallyStates.get(inputId) || null) : null
      });
    }

    return {
      layout: this.#layoutType,
      config: this.#layoutConfig,
      cells,
      tallyStates: Object.fromEntries(this.#tallyStates)
    };
  }

  /**
   * Get all available layout types.
   * @returns {string[]}
   */
  static getAvailableLayouts() {
    return Object.keys(LAYOUTS);
  }
}

export default MultiViewer;
