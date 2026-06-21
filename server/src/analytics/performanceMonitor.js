export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      api_response_time: [],
      socket_latency: [],
      memory_usage: [],
      cpu_usage: [],
      active_connections: []
    };
    this.maxHistory = 300;
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

  getHealth() {
    const avgs = this.getAverages();
    let score = 100;

    // Penalize high API response times
    if (avgs.api_response_time > 200) score -= 10;
    if (avgs.api_response_time > 500) score -= 20;
    if (avgs.api_response_time > 1000) score -= 30;

    // Penalize high memory usage (MB)
    if (avgs.memory_usage > 200) score -= 5;
    if (avgs.memory_usage > 500) score -= 15;
    if (avgs.memory_usage > 1000) score -= 25;

    // Penalize high socket latency
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
