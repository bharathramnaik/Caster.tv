/**
 * Recording Scheduler - schedule recordings for future start/end times.
 */
import { nanoid } from 'nanoid';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, '..', 'data', 'schedule.json');

/**
 * @typedef {Object} ScheduledRecording
 * @property {string} id
 * @property {string} name
 * @property {string} startTime - ISO string
 * @property {string} endTime - ISO string
 * @property {string} format
 * @property {string} quality
 * @property {boolean} recurring
 * @property {string[]} days - ['mon','tue','wed','thu','fri','sat','sun']
 * @property {boolean} active
 */

export class RecordingScheduler {
  /**
   * @param {{ onStart?: Function }} [callbacks]
   */
  constructor(callbacks = {}) {
    /** @type {Map<string, ScheduledRecording>} */
    this.schedules = new Map();
    /** @type {Function|null} */
    this._onStart = callbacks.onStart || null;
    /** @type {NodeJS.Timeout} */
    this._checkInterval = setInterval(() => this._checkUpcoming(), 60000);

    this._load();
  }

  _load() {
    try {
      if (existsSync(DATA_FILE)) {
        const data = JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
        for (const sched of data) {
          this.schedules.set(sched.id, sched);
        }
      }
    } catch { /* ignore */ }
  }

  _save() {
    try {
      writeFileSync(DATA_FILE, JSON.stringify([...this.schedules.values()], null, 2));
    } catch { /* ignore */ }
  }

  /**
   * Schedule a new recording.
   * @param {Partial<ScheduledRecording>} config
   * @returns {ScheduledRecording}
   */
  schedule(config = {}) {
    const id = `sched_${nanoid(6)}`;
    const scheduled = {
      id,
      name: config.name || 'Scheduled Recording',
      startTime: config.startTime || new Date().toISOString(),
      endTime: config.endTime || new Date(Date.now() + 3600000).toISOString(),
      format: config.format || 'mp4',
      quality: config.quality || 'high',
      recurring: !!config.recurring,
      days: config.days || [],
      active: true,
      createdAt: new Date().toISOString(),
    };
    this.schedules.set(id, scheduled);
    this._save();
    return scheduled;
  }

  /**
   * Cancel a scheduled recording.
   * @param {string} id
   * @returns {boolean}
   */
  cancel(id) {
    const sched = this.schedules.get(id);
    if (!sched) return false;
    sched.active = false;
    this.schedules.set(id, sched);
    this._save();
    return true;
  }

  /**
   * Get all scheduled recordings.
   * @returns {ScheduledRecording[]}
   */
  getScheduled() {
    return [...this.schedules.values()];
  }

  /**
   * Get upcoming scheduled recordings (future, active).
   * @returns {ScheduledRecording[]}
   */
  getUpcoming() {
    const now = new Date();
    return [...this.schedules.values()]
      .filter(s => s.active && new Date(s.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }

  /**
   * Check for recordings that should start now.
   */
  _checkUpcoming() {
    const now = new Date();
    for (const [id, sched] of this.schedules) {
      if (!sched.active) continue;
      const start = new Date(sched.startTime);
      const diff = Math.abs(now - start);
      if (diff < 60000) {
        if (this._onStart) {
          this._onStart(sched);
        }
        if (!sched.recurring) {
          sched.active = false;
          this.schedules.set(id, sched);
          this._save();
        }
      }
    }
  }

  /**
   * Cleanup on destroy.
   */
  destroy() {
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
    }
  }
}

export default RecordingScheduler;
