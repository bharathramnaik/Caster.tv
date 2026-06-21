import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const ANALYTICS_FILE = join(DATA_DIR, 'analytics.json');

function loadAnalytics() {
  try {
    if (existsSync(ANALYTICS_FILE)) {
      return JSON.parse(readFileSync(ANALYTICS_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load analytics:', e.message);
  }
  return { events: [], metrics: {}, daily: {}, weekly: {}, monthly: {} };
}

function saveAnalytics(data) {
  try {
    writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save analytics:', e.message);
  }
}

export class AnalyticsEngine {
  constructor() {
    this.data = loadAnalytics();
    if (!this.data.events) this.data.events = [];
    if (!this.data.metrics) this.data.metrics = {};
    if (!this.data.daily) this.data.daily = {};
    if (!this.data.weekly) this.data.weekly = {};
    if (!this.data.monthly) this.data.monthly = {};
    this._saveTimer = null;
  }

  trackEvent(userId, event, eventData = {}) {
    const entry = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: userId || 'anonymous',
      event,
      data: eventData,
      timestamp: new Date().toISOString()
    };

    this.data.events.push(entry);

    // Keep last 10000 events
    if (this.data.events.length > 10000) {
      this.data.events = this.data.events.slice(-10000);
    }

    // Aggregate counts
    const today = new Date().toISOString().slice(0, 10);
    const week = this._getWeekKey(new Date());
    const month = new Date().toISOString().slice(0, 7);

    this.data.daily[today] = this.data.daily[today] || {};
    this.data.daily[today][event] = (this.data.daily[today][event] || 0) + 1;

    this.data.weekly[week] = this.data.weekly[week] || {};
    this.data.weekly[week][event] = (this.data.weekly[week][event] || 0) + 1;

    this.data.monthly[month] = this.data.monthly[month] || {};
    this.data.monthly[month][event] = (this.data.monthly[month][event] || 0) + 1;

    // Debounce save
    this._scheduleSave();

    return entry;
  }

  getMetrics(period = 'daily') {
    const map = { daily: this.data.daily, weekly: this.data.weekly, monthly: this.data.monthly };
    return map[period] || this.data.daily;
  }

  getDashboard() {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const yesterday = new Date(now - 86400000).toISOString().slice(0, 10);

    const todayEvents = this.data.daily[today] || {};
    const yesterdayEvents = this.data.daily[yesterday] || {};

    const totalToday = Object.values(todayEvents).reduce((s, v) => s + v, 0);
    const totalYesterday = Object.values(yesterdayEvents).reduce((s, v) => s + v, 0);

    const uniqueUsersToday = new Set(
      this.data.events
        .filter(e => e.timestamp.startsWith(today))
        .map(e => e.userId)
    ).size;

    const eventsByType = {};
    for (const e of this.data.events.slice(-1000)) {
      eventsByType[e.event] = (eventsByType[e.event] || 0) + 1;
    }

    return {
      summary: {
        totalEventsToday: totalToday,
        totalEventsYesterday: totalYesterday,
        trend: totalYesterday > 0 ? ((totalToday - totalYesterday) / totalYesterday * 100).toFixed(1) : 0,
        uniqueUsersToday
      },
      eventsByType,
      recentEvents: this.data.events.slice(-20).reverse(),
      daily: this._getLastNDays(7),
      weekly: this._getLastNWeeks(4),
      monthly: this._getLastNMonths(3)
    };
  }

  getUsageByPage() {
    const pageViews = {};
    for (const e of this.data.events) {
      if (e.event === 'page_view' && e.data.page) {
        pageViews[e.data.page] = (pageViews[e.data.page] || 0) + 1;
      }
    }
    return Object.entries(pageViews)
      .sort((a, b) => b[1] - a[1])
      .map(([page, views]) => ({ page, views }));
  }

  getPeakHours() {
    const hours = Array(24).fill(0);
    for (const e of this.data.events) {
      const h = new Date(e.timestamp).getHours();
      hours[h]++;
    }
    return hours.map((count, hour) => ({ hour, count }));
  }

  getUserActivity() {
    const users = {};
    for (const e of this.data.events) {
      if (!users[e.userId]) {
        users[e.userId] = { userId: e.userId, events: 0, lastActive: e.timestamp, firstActive: e.timestamp };
      }
      users[e.userId].events++;
      if (e.timestamp > users[e.userId].lastActive) users[e.userId].lastActive = e.timestamp;
      if (e.timestamp < users[e.userId].firstActive) users[e.userId].firstActive = e.timestamp;
    }
    return Object.values(users).sort((a, b) => b.events - a.events);
  }

  getRecentEvents(limit = 20) {
    return this.data.events.slice(-limit).reverse();
  }

  _getWeekKey(date) {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }

  _getLastNDays(n) {
    const result = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      const events = this.data.daily[key] || {};
      result.push({ date: key, ...events });
    }
    return result;
  }

  _getLastNWeeks(n) {
    const result = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now - i * 7 * 86400000);
      const key = this._getWeekKey(d);
      const events = this.data.weekly[key] || {};
      result.push({ week: key, ...events });
    }
    return result;
  }

  _getLastNMonths(n) {
    const result = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const events = this.data.monthly[key] || {};
      result.push({ month: key, ...events });
    }
    return result;
  }

  _scheduleSave() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      saveAnalytics(this.data);
      this._saveTimer = null;
    }, 2000);
  }
}
