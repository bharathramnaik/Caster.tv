export class RealtimeEngine {
  constructor() {
    this.events = [];
    this.windows = { '1min': 60000, '5min': 300000, '15min': 900000, '1hr': 3600000 };
    this.activeUsers = new Map();
    this.metricsHistory = [];
    this.anomalyThresholds = { spike: 2.5, drop: 0.4, errorRate: 0.1 };
    this.maxEvents = 50000;
    this._cleanupInterval = setInterval(() => this._cleanup(), 30000);
  }

  trackEvent(event) {
    const entry = {
      id: `rt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: event.type || 'generic',
      userId: event.userId || 'anonymous',
      endpoint: event.endpoint || '/',
      method: event.method || 'GET',
      statusCode: event.statusCode || 200,
      responseTime: event.responseTime || 0,
      timestamp: Date.now(),
      data: event.data || {}
    };

    this.events.push(entry);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    if (entry.userId && entry.userId !== 'anonymous') {
      this.activeUsers.set(entry.userId, entry.timestamp);
    }

    this._recordMetrics(entry);
    return entry;
  }

  _recordMetrics(entry) {
    const now = Date.now();
    const metrics = {
      timestamp: now,
      requests: 1,
      errors: entry.statusCode >= 400 ? 1 : 0,
      responseTime: entry.responseTime,
      activeUsers: this.activeUsers.size
    };
    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > 3600) {
      this.metricsHistory = this.metricsHistory.slice(-3600);
    }
  }

  getMetrics(window = '5min') {
    const windowMs = this.windows[window] || this.windows['5min'];
    const cutoff = Date.now() - windowMs;
    const events = this.events.filter(e => e.timestamp >= cutoff);

    if (events.length === 0) {
      return {
        window,
        totalRequests: 0,
        requestsPerSec: 0,
        avgResponseTime: 0,
        errorRate: 0,
        activeUsers: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0
      };
    }

    const totalRequests = events.length;
    const errors = events.filter(e => e.statusCode >= 400).length;
    const responseTimes = events.map(e => e.responseTime).sort((a, b) => a - b);
    const avgResponseTime = Math.round(responseTimes.reduce((s, v) => s + v, 0) / totalRequests);
    const elapsed = Math.max(windowMs, Date.now() - events[0].timestamp);
    const requestsPerSec = Math.round((totalRequests / elapsed) * 1000 * 10) / 10;

    const p95Idx = Math.floor(totalRequests * 0.95);
    const p99Idx = Math.floor(totalRequests * 0.99);

    return {
      window,
      totalRequests,
      requestsPerSec,
      avgResponseTime,
      errorRate: Math.round((errors / totalRequests) * 10000) / 100,
      activeUsers: this.activeUsers.size,
      p95ResponseTime: responseTimes[p95Idx] || 0,
      p99ResponseTime: responseTimes[p99Idx] || 0,
      errors
    };
  }

  getTrend(metric, periods = 6) {
    const windowMs = this.windows['1hr'];
    const now = Date.now();
    const result = [];

    for (let i = periods - 1; i >= 0; i--) {
      const start = now - (i + 1) * windowMs;
      const end = now - i * windowMs;
      const events = this.events.filter(e => e.timestamp >= start && e.timestamp < end);

      let value = 0;
      switch (metric) {
        case 'requests':
          value = events.length;
          break;
        case 'errors':
          value = events.filter(e => e.statusCode >= 400).length;
          break;
        case 'avgResponseTime':
          value = events.length > 0
            ? Math.round(events.reduce((s, e) => s + e.responseTime, 0) / events.length)
            : 0;
          break;
        case 'activeUsers':
          value = new Set(events.map(e => e.userId).filter(u => u !== 'anonymous')).size;
          break;
        case 'errorRate':
          value = events.length > 0
            ? Math.round((events.filter(e => e.statusCode >= 400).length / events.length) * 10000) / 100
            : 0;
          break;
        default:
          value = events.length;
      }

      result.push({
        period: periods - i,
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
        value
      });
    }

    return result;
  }

  detectAnomalies() {
    const anomalies = [];
    const recentWindow = this.windows['15min'];
    const baselineWindow = this.windows['1hr'];
    const now = Date.now();

    const recentEvents = this.events.filter(e => e.timestamp >= now - recentWindow);
    const baselineEvents = this.events.filter(e => e.timestamp >= now - baselineWindow && e.timestamp < now - recentWindow);

    const recentRPS = recentEvents.length / (recentWindow / 1000);
    const baselineRPS = baselineEvents.length / (baselineWindow / 1000) || 0.001;

    if (recentRPS > baselineRPS * this.anomalyThresholds.spike) {
      anomalies.push({
        type: 'spike',
        metric: 'requestsPerSec',
        severity: 'high',
        message: `Request rate spike: ${recentRPS.toFixed(1)} vs baseline ${baselineRPS.toFixed(1)} req/s`,
        detectedAt: new Date().toISOString()
      });
    }

    if (recentRPS < baselineRPS * this.anomalyThresholds.drop && baselineRPS > 0.1) {
      anomalies.push({
        type: 'drop',
        metric: 'requestsPerSec',
        severity: 'medium',
        message: `Request rate drop: ${recentRPS.toFixed(1)} vs baseline ${baselineRPS.toFixed(1)} req/s`,
        detectedAt: new Date().toISOString()
      });
    }

    const recentErrors = recentEvents.filter(e => e.statusCode >= 400).length;
    const recentErrorRate = recentEvents.length > 0 ? recentErrors / recentEvents.length : 0;
    if (recentErrorRate > this.anomalyThresholds.errorRate && recentEvents.length > 10) {
      anomalies.push({
        type: 'spike',
        metric: 'errorRate',
        severity: 'critical',
        message: `Error rate elevated: ${(recentErrorRate * 100).toFixed(1)}%`,
        detectedAt: new Date().toISOString()
      });
    }

    const recentAvgRT = recentEvents.length > 0
      ? recentEvents.reduce((s, e) => s + e.responseTime, 0) / recentEvents.length
      : 0;
    const baselineAvgRT = baselineEvents.length > 0
      ? baselineEvents.reduce((s, e) => s + e.responseTime, 0) / baselineEvents.length
      : 0;

    if (baselineAvgRT > 0 && recentAvgRT > baselineAvgRT * 2) {
      anomalies.push({
        type: 'spike',
        metric: 'responseTime',
        severity: 'medium',
        message: `Response time spike: ${Math.round(recentAvgRT)}ms vs baseline ${Math.round(baselineAvgRT)}ms`,
        detectedAt: new Date().toISOString()
      });
    }

    return anomalies;
  }

  getSummary() {
    const now = Date.now();
    const activeCount = [...this.activeUsers.entries()]
      .filter(([_, ts]) => now - ts < 300000).length;

    const last5min = this.getMetrics('5min');
    const last1hr = this.getMetrics('1hr');
    const anomalies = this.detectAnomalies();

    const hourBuckets = Array(24).fill(0);
    this.events.forEach(e => {
      const h = new Date(e.timestamp).getHours();
      hourBuckets[h]++;
    });
    const peakHour = hourBuckets.indexOf(Math.max(...hourBuckets));

    const topEndpoints = {};
    this.events.filter(e => e.timestamp >= now - this.windows['1hr']).forEach(e => {
      const key = `${e.method} ${e.endpoint}`;
      topEndpoints[key] = (topEndpoints[key] || 0) + 1;
    });

    return {
      timestamp: new Date().toISOString(),
      realtime: last5min,
      hourly: last1hr,
      activeUsers: activeCount,
      anomalies,
      peakHour,
      topEndpoints: Object.entries(topEndpoints)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count })),
      status: anomalies.some(a => a.severity === 'critical')
        ? 'critical'
        : anomalies.length > 0
          ? 'warning'
          : 'healthy'
    };
  }

  _cleanup() {
    const cutoff = Date.now() - this.windows['1hr'] * 2;
    this.events = this.events.filter(e => e.timestamp >= cutoff);
    this.metricsHistory = this.metricsHistory.filter(m => m.timestamp >= cutoff);

    const userCutoff = Date.now() - 600000;
    for (const [userId, ts] of this.activeUsers) {
      if (ts < userCutoff) this.activeUsers.delete(userId);
    }
  }

  destroy() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }
  }
}
