import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const USAGE_FILE = join(DATA_DIR, 'usage.json');

function loadUsage() {
  try {
    if (existsSync(USAGE_FILE)) {
      return JSON.parse(readFileSync(USAGE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load usage:', e.message);
  }
  return { pageViews: {}, features: {}, sessions: {}, journeys: {} };
}

function saveUsage(data) {
  try {
    writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save usage:', e.message);
  }
}

export class UsageTracker {
  constructor() {
    this.data = loadUsage();
    if (!this.data.pageViews) this.data.pageViews = {};
    if (!this.data.features) this.data.features = {};
    if (!this.data.sessions) this.data.sessions = {};
    if (!this.data.journeys) this.data.journeys = {};
    this._saveTimer = null;
  }

  trackPageView(page) {
    const today = new Date().toISOString().slice(0, 10);
    this.data.pageViews[page] = this.data.pageViews[page] || {};
    this.data.pageViews[page][today] = (this.data.pageViews[page][today] || 0) + 1;
    this._scheduleSave();
    return { page, date: today, count: this.data.pageViews[page][today] };
  }

  trackAction(action) {
    const today = new Date().toISOString().slice(0, 10);
    this.data.features[action] = this.data.features[action] || {};
    this.data.features[action][today] = (this.data.features[action][today] || 0) + 1;
    this._scheduleSave();
    return { action, date: today, count: this.data.features[action][today] };
  }

  trackFeature(feature) {
    return this.trackAction(feature);
  }

  getPopularPages() {
    const result = {};
    for (const [page, dates] of Object.entries(this.data.pageViews)) {
      result[page] = Object.values(dates).reduce((s, v) => s + v, 0);
    }
    return Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .map(([page, views]) => ({ page, views }));
  }

  getFeatureUsage() {
    const result = {};
    for (const [feature, dates] of Object.entries(this.data.features)) {
      result[feature] = Object.values(dates).reduce((s, v) => s + v, 0);
    }
    return Object.entries(result)
      .sort((a, b) => b[1] - a[1])
      .map(([feature, count]) => ({ feature, count }));
  }

  getUserJourney(userId) {
    return this.data.journeys[userId] || [];
  }

  trackSession(sessionId, userId, data = {}) {
    this.data.sessions[sessionId] = {
      sessionId,
      userId,
      startTime: data.startTime || new Date().toISOString(),
      pages: data.pages || [],
      actions: data.actions || [],
      ...data
    };
    this._scheduleSave();
    return this.data.sessions[sessionId];
  }

  updateSession(sessionId, updates) {
    if (this.data.sessions[sessionId]) {
      Object.assign(this.data.sessions[sessionId], updates);
      this._scheduleSave();
    }
    return this.data.sessions[sessionId];
  }

  getStats() {
    const totalPages = Object.values(this.data.pageViews)
      .reduce((s, dates) => s + Object.values(dates).reduce((a, b) => a + b, 0), 0);
    const totalFeatures = Object.values(this.data.features)
      .reduce((s, dates) => s + Object.values(dates).reduce((a, b) => a + b, 0), 0);
    const totalSessions = Object.keys(this.data.sessions).length;

    return { totalPages, totalFeatures, totalSessions };
  }

  _scheduleSave() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      saveUsage(this.data);
      this._saveTimer = null;
    }, 2000);
  }
}
