/**
 * Recording Manager - manages recordings with state machine lifecycle.
 */
import { nanoid } from 'nanoid';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'data', 'recordings.json');

/**
 * @typedef {'idle'|'preparing'|'recording'|'paused'|'finalizing'|'completed'} RecordingState
 * @typedef {'mp4'|'webm'|'mkv'} RecordingFormat
 * @typedef {Object} RecordingConfig
 * @property {RecordingFormat} format
 * @property {string} quality
 * @property {number} maxDuration - seconds
 * @property {number} maxFileSize - bytes
 */

const DEFAULT_CONFIG = {
  format: 'mp4',
  quality: 'high',
  maxDuration: 7200,
  maxFileSize: 2 * 1024 * 1024 * 1024,
};

const STATE_MACHINE = {
  idle: ['preparing'],
  preparing: ['recording'],
  recording: ['paused', 'finalizing'],
  paused: ['recording', 'finalizing'],
  finalizing: ['completed'],
  completed: ['idle'],
};

export class RecordingManager {
  constructor() {
    /** @type {Map<string, Object>} */
    this.recordings = new Map();
    /** @type {Object|null} */
    this.activeRecording = null;
    /** @type {RecordingConfig} */
    this.config = { ...DEFAULT_CONFIG };
    /** @type {NodeJS.Timeout|null} */
    this._timerInterval = null;
    /** @type {Function|null} */
    this._onStatusChange = null;
    /** @type {Function|null} */
    this._onTimerTick = null;

    this._load();
  }

  _load() {
    try {
      if (existsSync(DATA_FILE)) {
        const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
        for (const rec of data) {
          this.recordings.set(rec.id, rec);
        }
      }
    } catch { /* ignore */ }
  }

  _save() {
    try {
      writeFileSync(DATA_FILE, JSON.stringify([...this.recordings.values()], null, 2));
    } catch { /* ignore */ }
  }

  /**
   * Set callbacks for status changes and timer ticks.
   * @param {{ onStatusChange?: Function, onTimerTick?: Function }} callbacks
   */
  setCallbacks(callbacks = {}) {
    if (callbacks.onStatusChange) this._onStatusChange = callbacks.onStatusChange;
    if (callbacks.onTimerTick) this._onTimerTick = callbacks.onTimerTick;
  }

  /**
   * Transition recording to a new state.
   * @param {RecordingState} newState
   */
  _transition(newState) {
    if (!this.activeRecording) return;
    const valid = STATE_MACHINE[this.activeRecording.state];
    if (!valid || !valid.includes(newState)) {
      throw new Error(`Invalid state transition: ${this.activeRecording.state} -> ${newState}`);
    }
    this.activeRecording.state = newState;
    this.activeRecording.updatedAt = new Date().toISOString();
    if (this._onStatusChange) {
      this._onStatusChange(this.activeRecording);
    }
  }

  /**
   * Start a new recording.
   * @param {Partial<RecordingConfig>} config
   * @returns {Object}
   */
  startRecording(config = {}) {
    if (this.activeRecording && this.activeRecording.state !== 'idle' && this.activeRecording.state !== 'completed') {
      throw new Error('A recording is already in progress');
    }

    this.config = { ...DEFAULT_CONFIG, ...config };
    const id = `rec_${nanoid(8)}`;
    const recording = {
      id,
      state: 'preparing',
      format: this.config.format,
      quality: this.config.quality,
      startTime: null,
      pauseTime: null,
      duration: 0,
      fileSize: 0,
      totalPausedTime: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.recordings.set(id, recording);
    this.activeRecording = recording;

    // Simulate preparation
    setTimeout(() => {
      try {
        this._transition('recording');
        recording.startTime = new Date().toISOString();
        this._startTimer();
      } catch { /* ignore */ }
    }, 500);

    this._save();
    return recording;
  }

  /**
   * Start the duration/size timer.
   */
  _startTimer() {
    this._stopTimer();
    this._timerInterval = setInterval(() => {
      if (!this.activeRecording || this.activeRecording.state !== 'recording') return;

      const elapsed = (Date.now() - new Date(this.activeRecording.startTime).getTime() - this.activeRecording.totalPausedTime) / 1000;
      this.activeRecording.duration = Math.round(elapsed);
      this.activeRecording.fileSize = Math.round(elapsed * this._getBytesPerSecond());

      if (this._onTimerTick) {
        this._onTimerTick(this.activeRecording);
      }

      // Auto-stop checks
      if (this.config.maxDuration > 0 && elapsed >= this.config.maxDuration) {
        this.stopRecording();
      }
      if (this.config.maxFileSize > 0 && this.activeRecording.fileSize >= this.config.maxFileSize) {
        this.stopRecording();
      }
    }, 1000);
  }

  _stopTimer() {
    if (this._timerInterval) {
      clearInterval(this._timerInterval);
      this._timerInterval = null;
    }
  }

  /**
   * Estimate bytes per second based on quality/format.
   */
  _getBytesPerSecond() {
    const rates = {
      ultra: 12 * 1024 * 1024,
      high: 6 * 1024 * 1024,
      medium: 3 * 1024 * 1024,
      low: 1.5 * 1024 * 1024,
      mobile: 0.8 * 1024 * 1024,
    };
    return rates[this.config.quality] || rates.high;
  }

  /**
   * Stop the current recording.
   * @returns {Object|null}
   */
  stopRecording() {
    if (!this.activeRecording) return null;
    this._stopTimer();
    this._transition('finalizing');
    this.activeRecording.duration = Math.round(
      (Date.now() - new Date(this.activeRecording.startTime).getTime() - this.activeRecording.totalPausedTime) / 1000
    );
    this.activeRecording.fileSize = Math.round(this.activeRecording.duration * this._getBytesPerSecond());

    setTimeout(() => {
      if (this.activeRecording) {
        this._transition('completed');
        this.activeRecording = null;
        this._save();
      }
    }, 300);

    return this.activeRecording;
  }

  /**
   * Pause the current recording.
   * @returns {Object|null}
   */
  pauseRecording() {
    if (!this.activeRecording) return null;
    this._transition('paused');
    this.activeRecording.pauseTime = new Date().toISOString();
    this._stopTimer();
    this._save();
    return this.activeRecording;
  }

  /**
   * Resume a paused recording.
   * @returns {Object|null}
   */
  resumeRecording() {
    if (!this.activeRecording || this.activeRecording.state !== 'paused') return null;
    if (this.activeRecording.pauseTime) {
      const pausedDuration = Date.now() - new Date(this.activeRecording.pauseTime).getTime();
      this.activeRecording.totalPausedTime += pausedDuration;
      this.activeRecording.pauseTime = null;
    }
    this._transition('recording');
    this._startTimer();
    this._save();
    return this.activeRecording;
  }

  /**
   * Get the active recording.
   * @returns {Object|null}
   */
  getRecording() {
    return this.activeRecording;
  }

  /**
   * Get all recordings.
   * @returns {Object[]}
   */
  getRecordings() {
    return [...this.recordings.values()].sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get recording status summary.
   * @returns {{ state: RecordingState, duration: number, fileSize: number, format: string }}
   */
  getRecordingStatus() {
    if (!this.activeRecording) {
      return { state: 'idle', duration: 0, fileSize: 0, format: null };
    }
    return {
      state: this.activeRecording.state,
      duration: this.activeRecording.duration,
      fileSize: this.activeRecording.fileSize,
      format: this.activeRecording.format,
    };
  }

  /**
   * Delete a recording by id.
   * @param {string} id
   * @returns {boolean}
   */
  deleteRecording(id) {
    if (this.activeRecording && this.activeRecording.id === id) {
      throw new Error('Cannot delete an active recording');
    }
    const deleted = this.recordings.delete(id);
    if (deleted) this._save();
    return deleted;
  }
}

export default RecordingManager;
