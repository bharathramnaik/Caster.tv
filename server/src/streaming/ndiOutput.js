/**
 * NDI output - simulated for testing.
 * Ready for future native NDI library integration.
 */
import { EventEmitter } from 'events';

const DEFAULT_CONFIG = {
  name: 'SportsCaster NDI',
  group: 'SPORTSCASTER',
  enabled: true
};

class NDIOutput extends EventEmitter {
  constructor(id, config = {}) {
    super();
    this.id = id;
    this.type = 'ndi';
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = 'idle';
    this.retryCount = 0;
    this._frameCount = 0;
    this._metrics = {
      fps: 0,
      bitrate: 0,
      droppedFrames: 0,
      latency: 0,
      startTime: null,
      uptime: 0,
      frameCount: 0
    };
    this._metricsInterval = null;
    this._frameInterval = null;
  }

  /**
   * Start the NDI output (simulated).
   */
  async start() {
    if (this.state === 'active') return;

    this.state = 'active';
    this._metrics.startTime = Date.now();
    this.retryCount = 0;

    this.emit('status', { state: 'active', message: `NDI output "${this.config.name}" started (simulated)` });

    this._startFrameSimulation();
    this._startMetricsCollection();
  }

  /**
   * Simulate frame delivery.
   * @private
   */
  _startFrameSimulation() {
    this._frameInterval = setInterval(() => {
      if (this.state !== 'active') return;
      this._frameCount++;
      this._metrics.frameCount = this._frameCount;

      const frame = {
        id: this._frameCount,
        timestamp: Date.now(),
        width: 1920,
        height: 1080,
        format: 'BGRA',
        data: Buffer.alloc(0) // Empty for simulation
      };

      this.emit('frame', frame);
    }, 1000 / 30); // 30fps simulation
  }

  /**
   * Start periodic metrics collection.
   * @private
   */
  _startMetricsCollection() {
    this._metricsInterval = setInterval(() => {
      if (this.state !== 'active') return;

      if (this._metrics.startTime) {
        this._metrics.uptime = Math.floor((Date.now() - this._metrics.startTime) / 1000);
      }

      this._metrics.fps = 30 + (Math.random() * 2 - 1);
      this._metrics.bitrate = 4400 + Math.random() * 200;
      this._metrics.droppedFrames += Math.random() > 0.98 ? 1 : 0;
      this._metrics.latency = Math.floor(2 + Math.random() * 3);

      this.emit('health', { ...this._metrics });
    }, 1000);
  }

  /**
   * Stop the NDI output.
   */
  stop() {
    this.state = 'stopped';
    this._cleanup();
    this.emit('status', { state: 'stopped' });
  }

  /**
   * Clean up resources.
   * @private
   */
  _cleanup() {
    if (this._metricsInterval) {
      clearInterval(this._metricsInterval);
      this._metricsInterval = null;
    }
    if (this._frameInterval) {
      clearInterval(this._frameInterval);
      this._frameInterval = null;
    }
  }

  /**
   * Get current metrics.
   * @returns {object}
   */
  getMetrics() {
    return { ...this._metrics };
  }

  /**
   * Switch scene (no-op for NDI, handled by compositor).
   * @param {string} sceneId
   */
  switchScene(sceneId) {
    this.emit('scene:switch', { sceneId });
  }
}

export default NDIOutput;
