export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      api_response_time: [],
      socket_latency: [],
      memory_usage: [],
      cpu_usage: [],
      active_connections: []
    };
    this.endpointStats = {};
    this.slowQueries = [];
    this.maxHistory = 300;
    this.slowQueryThreshold = 500;
    this._interval = null;
    this._startCollection();
  }

  _startCollection() {
    this._interval = setInterval(() => {
      const mem = process.memoryUsage();
      this.recordMetric('memory_usage', Math.round(mem.heapUsed / 1024 / 1024));
      this.recordMetric('cpu_usage', Math.round(process.cpuUsage().user / 1000));
    }, 5000);
  }

  recordMetric(name, value) {
    if (!this.metrics[name]) {
      this.metrics[name] = [];
    }
    this.metrics[name].push({
      value,
      timestamp: Date.now()
    });
    if (this.metrics[name].length > this.maxHistory) {
      this.metrics[name] = this.metrics[name].slice(-this.maxHistory);
    }
  }

  trackResponse(method, endpoint, statusCode, responseTime) {
    const key = `${method} ${endpoint}`;
    if (!this.endpointStats[key]) {
      this.endpointStats[key] = {
        method,
        endpoint,
        totalRequests: 0,
        totalTime: 0,
        errors: 0,
        maxTime: 0,
        minTime: Infinity,
        recentTimes: []
      };
    }

    const stats = this.endpointStats[key];
    stats.totalRequests++;
    stats.totalTime += responseTime;
    stats.maxTime = Math.max(stats.maxTime, responseTime);
    stats.minTime = Math.min(stats.minTime, responseTime);
    stats.recentTimes.push(responseTime);
    if (stats.recentTimes.length > 100) {
      stats.recentTimes = stats.recentTimes.slice(-100);
    }

    if (statusCode >= 400) stats.errors++;

    this.recordMetric('api_response_time', responseTime);

    if (responseTime > this.slowQueryThreshold) {
      this.slowQueries.push({
        method,
        endpoint,
        responseTime,
        statusCode,
        timestamp: new Date().toISOString()
      });
      if (this.slowQueries.length > 200) {
        this.slowQueries = this.slowQueries.slice(-200);
      }
    }
  }

  trackDatabaseQuery(query, duration, collection = 'unknown') {
    if (duration > this.slowQueryThreshold) {
      this.slowQueries.push({
        type: 'database',
        query: query.slice(0, 200),
        collection,
        duration,
        timestamp: new Date().toISOString()
      });
      if (this.slowQueries.length > 200) {
        this.slowQueries = this.slowQueries.slice(-200);
      }
    }
  }

  getMetrics() {
    const result = {};
    for (const [name, data] of Object.entries(this.metrics)) {
      result[name] = {
        current: data.length > 0 ? data[data.length - 1].value : 0,
        history: data.slice(-60),
        count: data.length
      };
    }
    return result;
  }

  getAverages() {
    const result = {};
    for (const [name, data] of Object.entries(this.metrics)) {
      if (data.length === 0) {
        result[name] = 0;
        continue;
      }
      const sum = data.reduce((s, d) => s + d.value, 0);
      result[name] = Math.round(sum / data.length);
    }
    return result;
  }

  getSlowEndpoints(limit = 10) {
    return Object.values(this.endpointStats)
      .sort((a, b) => (b.totalTime / b.totalRequests) - (a.totalTime / a.totalRequests))
      .slice(0, limit)
      .map(s => ({
        method: s.method,
        endpoint: s.endpoint,
        totalRequests: s.totalRequests,
        avgResponseTime: Math.round(s.totalTime / s.totalRequests),
        maxResponseTime: s.maxTime,
        minResponseTime: s.minTime === Infinity ? 0 : s.minTime,
        errorRate: s.totalRequests > 0 ? Math.round((s.errors / s.totalRequests) * 10000) / 100 : 0
      }));
  }

  getTopEndpoints(limit = 10) {
    return Object.values(this.endpointStats)
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, limit)
      .map(s => ({
        method: s.method,
        endpoint: s.endpoint,
        totalRequests: s.totalRequests,
        avgResponseTime: Math.round(s.totalTime / s.totalRequests),
        errorRate: s.totalRequests > 0 ? Math.round((s.errors / s.totalRequests) * 10000) / 100 : 0
      }));
  }

  getSlowQueries(limit = 20) {
    return this.slowQueries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  getPerformanceReport() {
    const avgs = this.getAverages();
    const mem = process.memoryUsage();

    let score = 100;
    if (avgs.api_response_time > 200) score -= 10;
    if (avgs.api_response_time > 500) score -= 20;
    if (avgs.api_response_time > 1000) score -= 30;
    if (avgs.memory_usage > 200) score -= 5;
    if (avgs.memory_usage > 500) score -= 15;
    if (avgs.memory_usage > 1000) score -= 25;
    if (avgs.socket_latency > 100) score -= 5;
    if (avgs.socket_latency > 300) score -= 10;
    score = Math.max(0, Math.min(100, score));

    const totalRequests = Object.values(this.endpointStats)
      .reduce((s, e) => s + e.totalRequests, 0);
    const totalErrors = Object.values(this.endpointStats)
      .reduce((s, e) => s + e.errors, 0);

    return {
      score,
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      metrics: {
        apiResponseTime: avgs.api_response_time || 0,
        memoryUsage: avgs.memory_usage || 0,
        memoryTotal: Math.round(mem.heapTotal / 1024 / 1024),
        memoryExternal: Math.round(mem.external / 1024 / 1024),
        cpuUsage: avgs.cpu_usage || 0,
        activeConnections: avgs.active_connections || 0
      },
      endpoints: {
        total: Object.keys(this.endpointStats).length,
        totalRequests,
        totalErrors,
        slowQueries: this.slowQueries.length,
        topEndpoints: this.getTopEndpoints(5),
        slowEndpoints: this.getSlowEndpoints(5)
      },
      timestamp: new Date().toISOString()
    };
  }

  getHealth() {
    const avgs = this.getAverages();
    let score = 100;

    if (avgs.api_response_time > 200) score -= 10;
    if (avgs.api_response_time > 500) score -= 20;
    if (avgs.api_response_time > 1000) score -= 30;
    if (avgs.memory_usage > 200) score -= 5;
    if (avgs.memory_usage > 500) score -= 15;
    if (avgs.memory_usage > 1000) score -= 25;
    if (avgs.socket_latency > 100) score -= 5;
    if (avgs.socket_latency > 300) score -= 10;
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      status: score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'critical',
      metrics: avgs,
      timestamp: new Date().toISOString()
    };
  }

  setActiveConnections(count) {
    this.recordMetric('active_connections', count);
  }

  destroy() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
}
