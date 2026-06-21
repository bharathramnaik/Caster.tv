/**
 * MacroRecorder - Records and replays switcher action sequences.
 * Stores macros as JSON arrays of timestamped actions.
 * @module macroRecorder
 */
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const MACROS_FILE = join(DATA_DIR, 'macros.json');

/**
 * Macro recording and playback engine.
 */
export class MacroRecorder extends EventEmitter {
  /** @type {boolean} */
  #isRecording = false;
  /** @type {Object|null} */
  #currentMacro = null;
  /** @type {Map<string, Object>} */
  #macros = new Map();
  /** @type {boolean} */
  #isPlaying = false;

  constructor() {
    super();
    this.#loadMacros();
  }

  /** Load macros from disk */
  #loadMacros() {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      if (existsSync(MACROS_FILE)) {
        const data = JSON.parse(readFileSync(MACROS_FILE, 'utf-8'));
        for (const macro of data) {
          this.#macros.set(macro.id, macro);
        }
        console.log(`📹 Loaded ${this.#macros.size} macros`);
      }
    } catch (err) {
      console.error('Failed to load macros:', err.message);
    }
  }

  /** Save macros to disk */
  #saveMacros() {
    try {
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
      const data = Array.from(this.#macros.values());
      writeFileSync(MACROS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save macros:', err.message);
    }
  }

  /** Start recording a new macro */
  startRecording() {
    if (this.#isRecording) throw new Error('Already recording');

    this.#isRecording = true;
    this.#currentMacro = {
      id: `macro_${nanoid(8)}`,
      name: `Macro ${this.#macros.size + 1}`,
      actions: [],
      startedAt: Date.now(),
      savedAt: null
    };

    this.emit('recordingStart', { id: this.#currentMacro.id });
    this.emit('stateChange', this.getState());
  }

  /**
   * Stop recording and return the recorded macro (unsaved).
   * @returns {Object|null}
   */
  stopRecording() {
    if (!this.#isRecording) return null;

    this.#isRecording = false;
    const macro = this.#currentMacro;
    macro.stoppedAt = Date.now();
    this.#currentMacro = null;

    this.emit('recordingStop', { macro });
    this.emit('stateChange', this.getState());
    return macro;
  }

  /**
   * Record a single action during recording.
   * @param {string} action - Action type (e.g., 'switch', 'transition', 'cut')
   * @param {Object} data - Action payload
   */
  recordAction(action, data = {}) {
    if (!this.#isRecording || !this.#currentMacro) return;

    const entry = {
      action,
      data,
      timestamp: Date.now() - this.#currentMacro.startedAt
    };

    this.#currentMacro.actions.push(entry);
    this.emit('actionRecorded', entry);
  }

  /**
   * Save the currently recorded macro with a name.
   * @param {string} name - Macro name
   * @returns {Object} Saved macro
   */
  saveMacro(name) {
    if (!this.#currentMacro) throw new Error('No macro recorded. Record first, then save.');
    if (this.#isRecording) throw new Error('Stop recording before saving.');

    this.#currentMacro.name = name || this.#currentMacro.name;
    this.#currentMacro.savedAt = Date.now();

    const macro = { ...this.#currentMacro };
    this.#macros.set(macro.id, macro);
    this.#saveMacros();

    this.emit('macroSaved', macro);
    this.emit('stateChange', this.getState());
    return macro;
  }

  /**
   * Load a macro by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  loadMacro(id) {
    return this.#macros.get(id) || null;
  }

  /**
   * Play a macro by ID (replays actions with original timing).
   * @param {string} id
   * @param {Function} actionHandler - Callback: async (action, data) => void
   * @returns {Promise<void>}
   */
  async playMacro(id, actionHandler) {
    const macro = this.#macros.get(id);
    if (!macro) throw new Error(`Macro not found: ${id}`);
    if (this.#isPlaying) throw new Error('A macro is already playing');

    this.#isPlaying = true;
    this.emit('macroPlayStart', { id, name: macro.name });

    try {
      let lastTimestamp = 0;
      for (const entry of macro.actions) {
        const delay = entry.timestamp - lastTimestamp;
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        lastTimestamp = entry.timestamp;

        if (actionHandler) {
          await actionHandler(entry.action, entry.data);
        }
        this.emit('macroAction', entry);
      }
    } finally {
      this.#isPlaying = false;
      this.emit('macroPlayComplete', { id });
      this.emit('stateChange', this.getState());
    }
  }

  /**
   * List all saved macros.
   * @returns {Object[]}
   */
  listMacros() {
    return Array.from(this.#macros.values()).map(m => ({
      id: m.id,
      name: m.name,
      actionCount: m.actions.length,
      savedAt: m.savedAt,
      duration: m.stoppedAt ? m.stoppedAt - m.startedAt : 0
    }));
  }

  /**
   * Delete a macro by ID.
   * @param {string} id
   * @returns {boolean}
   */
  deleteMacro(id) {
    if (!this.#macros.has(id)) return false;
    this.#macros.delete(id);
    this.#saveMacros();
    this.emit('macroDeleted', { id });
    this.emit('stateChange', this.getState());
    return true;
  }

  /**
   * Get current recorder state.
   * @returns {Object}
   */
  getState() {
    return {
      isRecording: this.#isRecording,
      isPlaying: this.#isPlaying,
      currentMacro: this.#currentMacro ? {
        id: this.#currentMacro.id,
        name: this.#currentMacro.name,
        actionCount: this.#currentMacro.actions.length,
        elapsed: Date.now() - this.#currentMacro.startedAt
      } : null,
      macroCount: this.#macros.size
    };
  }
}

export default MacroRecorder;
