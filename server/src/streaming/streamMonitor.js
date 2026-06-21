/**
 * Health monitoring for all active stream outputs.
 * Collects metrics, detects issues, and stores history.
 */
const HISTORY_MAX = 300; // 5 minutes at 1/sec
const ALERT_THRESHOLDS = {
  bitrateDropPercent: 80,
  minFps: 24,
  maxDroppedFrames: 100
};

class StreamMonitor {
  constructor(streamManager) {
    this._manager = streamManager;
    this._interval = null;
    this._history = [];
    this._alerts = [];
    this._currentMetrics = {};
  }

  /**
   * Start monitoring all outputs.
   * @param {number} intervalMs - Collection interval in ms
   */
  start(intervalMs = 1000) {
    this.stop();
    this._interval = setInterval(() => this._collect(), intervalMs);
  }

  /**
   * Stop monitoring.
   */
  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }

  /**
   * Collect metrics from all active outputs.
   * @private
   */
  _collect() {
    const outputs = this._manager.getOutputs();
    const snapshot = {
      timestamp: Date.now(),
      outputs: {},
      totals: {
        totalBitrate: 0,
        avgFps: 0,
        totalDroppedFrames: 0,
        totalViewers: 0,
        activeOutputs: 0
      }
    };

    let fpsSum = 0;
    let activeCount = 0;

    for (const output of outputs) {
      if (output.state === 'active' && output.metrics) {
        snapshot.outputs[output.id] = {
          type: output.type,
          bitrate: output.metrics.bitrate || 0,
          fps: output.metrics.fps || 0,
          droppedFrames: output.metrics.droppedFrames || 0,
          latency: output.metrics.latency || 0,
          viewers: output.viewers || 0
        };

        snapshot.totals.totalBitrate += output.metrics.bitrate || 0;
        fpsSum += output.metrics.fps || 0;
        snapshot.totals.totalDroppedFrames += output.metrics.droppedFrames || 0;
        snapshot.totals.totalViewers += output.viewers || 0;
        activeCount++;
      }
    }

    snapshot.totals.activeOutputs = activeCount;
    snapshot.totals.avgFps = activeCount > 0 ? fpsSum / activeCount : 0;

    this._currentMetrics = snapshot.totals;
    this._checkAlerts(snapshot);
    this._history.push(snapshot);

    if (this._history.length > HISTORY_MAX) {
      this._history.shift();
    }
  }

  /**
   * Check for alert conditions.
   * @private
   */
  _checkAlerts(snapshot) {
    for (const [id, metrics] of Object.entries(snapshot.outputs)) {
      if (metrics.bitrate < (4500 * ALERT_THRESHOLDS.bitrateDropPercent / 100)) {
        this._addAlert(id, 'bitrate', `Bitrate dropped to ${metrics.bitrate.toFixed(0)}kbps`);
      }
      if (metrics.fps < ALERT_THRESHOLDS.minFps) {
        this._addAlert(id, 'fps', `FPS dropped to ${metrics.fps.toFixed(1)}`);
      }
      if (metrics.droppedFrames > ALERT_THRESHOLDS.maxDroppedFrames) {
        this._addAlert(id, 'dropped', `${metrics.droppedFrames} frames dropped`);
      }
    }

    // Clear alerts for outputs that are no longer active
    const activeIds = new Set(Object.keys(snapshot.outputs));
    this._alerts = this._alerts.filter(a => activeIds.has(a.outputId));
  }

  /**
   * Add or update an alert.
   * @private
   */
  _addAlert(outputId, type, message) {
    const existing = this._alerts.find(a => a.outputId === outputId && a.type === type);
    if (existing) {
      existing.message = message;
      existing.timestamp = Date.now();
    } else {
      this._alerts.push({
        outputId,
        type,
        message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get current aggregate metrics.
   * @returns {object}
   */
  getMetrics() {
    return { ...this._currentMetrics };
  }

  /**
   * Get metrics history.
   * @returns {Array}
   */
  getHistory() {
    return [...this._history];
  }

  /**
   * Get active alerts.
   * @returns {Array}
   */
  getAlerts() {
    return [...this._alerts];
  }
}

export default StreamMonitor;
