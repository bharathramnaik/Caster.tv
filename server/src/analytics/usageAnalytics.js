import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const USAGE_FILE = join(DATA_DIR, 'usageAnalytics.json');

function loadData() {
  try {
    if (existsSync(USAGE_FILE)) {
      return JSON.parse(readFileSync(USAGE_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load usage analytics:', e.message);
  }
  return { pageViews: [], features: [], templates: {}, sports: {}, sessions: {}, hourly: Array(24).fill(0) };
}

function saveData(data) {
  try {
    writeFileSync(USAGE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to save usage analytics:', e.message);
  }
}

export class UsageAnalytics {
  constructor() {
    this.data = loadData();
    if (!this.data.pageViews) this.data.pageViews = [];
    if (!this.data.features) this.data.features = [];
    if (!this.data.templates) this.data.templates = {};
    if (!this.data.sports) this.data.sports = {};
    if (!this.data.sessions) this.data.sessions = {};
    if (!this.data.hourly) this.data.hourly = Array(24).fill(0);
    this._saveTimer = null;
    this.maxPageViews = 50000;
    this.maxFeatures = 50000;
  }

  trackPageView(page, userId = 'anonymous') {
    const entry = {
      page,
      userId,
      timestamp: new Date().toISOString(),
      hour: new Date().getHours()
    };
    this.data.pageViews.push(entry);
    if (this.data.pageViews.length > this.maxPageViews) {
      this.data.pageViews = this.data.pageViews.slice(-this.maxPageViews);
    }
    this.data.hourly[entry.hour]++;
    this._scheduleSave();
    return entry;
  }

  trackFeature(feature, userId = 'anonymous', data = {}) {
    const entry = {
      feature,
      userId,
      timestamp: new Date().toISOString(),
      data
    };
    this.data.features.push(entry);
    if (this.data.features.length > this.maxFeatures) {
      this.data.features = this.data.features.slice(-this.maxFeatures);
    }
    this._scheduleSave();
    return entry;
  }

  trackTemplate(templateId, templateName, action = 'used') {
    if (!this.data.templates[templateId]) {
      this.data.templates[templateId] = { name: templateName, count: 0, actions: {} };
    }
    this.data.templates[templateId].count++;
    this.data.templates[templateId].actions[action] =
      (this.data.templates[templateId].actions[action] || 0) + 1;
    this._scheduleSave();
  }

  trackSport(sport, userId = 'anonymous') {
    this.data.sports[sport] = (this.data.sports[sport] || 0) + 1;
    this._scheduleSave();
  }

  startSession(sessionId, userId = 'anonymous', metadata = {}) {
    this.data.sessions[sessionId] = {
      sessionId,
      userId,
      startTime: new Date().toISOString(),
      pages: [],
      features: [],
      metadata,
      duration: 0
    };
    this._scheduleSave();
    return this.data.sessions[sessionId];
  }

  updateSession(sessionId, updates) {
    if (this.data.sessions[sessionId]) {
      Object.assign(this.data.sessions[sessionId], updates);
      if (updates.page) {
        this.data.sessions[sessionId].pages.push({
          page: updates.page,
          timestamp: new Date().toISOString()
        });
      }
      if (updates.feature) {
        this.data.sessions[sessionId].features.push({
          feature: updates.feature,
          timestamp: new Date().toISOString()
        });
      }
      this._scheduleSave();
    }
    return this.data.sessions[sessionId];
  }

  endSession(sessionId) {
    const session = this.data.sessions[sessionId];
    if (session) {
      session.endTime = new Date().toISOString();
      session.duration = new Date(session.endTime) - new Date(session.startTime);
      this._scheduleSave();
    }
    return session;
  }

  getUsageStats(days = 7) {
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    const recentPageViews = this.data.pageViews.filter(p => p.timestamp >= cutoff);
    const recentFeatures = this.data.features.filter(f => f.timestamp >= cutoff);

    const pageCounts = {};
    recentPageViews.forEach(p => {
      pageCounts[p.page] = (pageCounts[p.page] || 0) + 1;
    });

    const featureCounts = {};
    recentFeatures.forEach(f => {
      featureCounts[f.feature] = (featureCounts[f.feature] || 0) + 1;
    });

    const dailyPageViews = {};
    recentPageViews.forEach(p => {
      const day = p.timestamp.slice(0, 10);
      dailyPageViews[day] = (dailyPageViews[day] || 0) + 1;
    });

    const uniqueUsers = new Set(recentPageViews.map(p => p.userId).filter(u => u !== 'anonymous')).size;

    return {
      period: `${days}d`,
      totalPageViews: recentPageViews.length,
      totalFeatureUses: recentFeatures.length,
      uniqueUsers,
      topPages: Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([page, count]) => ({ page, count })),
      topFeatures: Object.entries(featureCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([feature, count]) => ({ feature, count })),
      dailyPageViews: Object.entries(dailyPageViews)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, count]) => ({ date, count })),
      hourly: this.data.hourly
    };
  }

  getPopularTemplates(limit = 10) {
    return Object.entries(this.data.templates)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([id, data]) => ({ id, name: data.name, count: data.count, actions: data.actions }));
  }

  getPopularSports(limit = 10) {
    return Object.entries(this.data.sports)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([sport, count]) => ({ sport, count }));
  }

  getSessionAnalytics() {
    const sessions = Object.values(this.data.sessions);
    const totalSessions = sessions.length;
    const avgDuration = totalSessions > 0
      ? Math.round(sessions.reduce((s, sess) => s + (sess.duration || 0), 0) / totalSessions)
      : 0;
    const avgPagesPerSession = totalSessions > 0
      ? Math.round(sessions.reduce((s, sess) => s + (sess.pages?.length || 0), 0) / totalSessions * 10) / 10
      : 0;

    return {
      totalSessions,
      avgDuration,
      avgPagesPerSession,
      activeSessions: sessions.filter(s => !s.endTime).length,
      recentSessions: sessions
        .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
        .slice(0, 20)
    };
  }

  exportCSV() {
    const lines = ['Timestamp,Page,Feature,User,Hour'];
    const allEvents = [
      ...this.data.pageViews.map(p => ({ timestamp: p.timestamp, page: p.page, feature: '', user: p.userId, hour: p.hour })),
      ...this.data.features.map(f => ({ timestamp: f.timestamp, page: '', feature: f.feature, user: f.userId, hour: new Date(f.timestamp).getHours() }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    for (const e of allEvents) {
      lines.push(`${e.timestamp},${e.page || ''},${e.feature || ''},${e.user},${e.hour}`);
    }
    return lines.join('\n');
  }

  _scheduleSave() {
    if (this._saveTimer) return;
    this._saveTimer = setTimeout(() => {
      saveData(this.data);
      this._saveTimer = null;
    }, 2000);
  }
}
