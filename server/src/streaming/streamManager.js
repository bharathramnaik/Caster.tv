/**
 * Central stream management - orchestrates all output destinations.
 * Supports multiple simultaneous outputs with automatic reconnection.
 */
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';
import RTMPOutput from './rtmpOutput.js';
import WebRTCOutput from './webRTCOutput.js';
import NDIOutput from './ndiOutput.js';
import StreamMonitor from './streamMonitor.js';

const MAX_CONCURRENT_OUTPUTS = 10;
const MAX_RETRIES = 3;
const BACKOFF_DELAYS = [2000, 4000, 8000];

const STATE = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  ACTIVE: 'active',
  RECONNECTING: 'reconnecting',
  STOPPED: 'stopped',
  ERROR: 'error'
};

class StreamManager extends EventEmitter {
  constructor() {
    super();
    this.outputs = new Map();
    this.monitor = new StreamMonitor(this);
    this._monitorInterval = null;
  }

  /**
   * Add a new output destination.
   * @param {string} type - 'rtmp' | 'webrtc' | 'ndi'
   * @param {object} config - Output-specific configuration
   * @returns {object} The created output
   */
  addOutput(type, config) {
    if (this.outputs.size >= MAX_CONCURRENT_OUTPUTS) {
      throw new Error(`Max concurrent outputs (${MAX_CONCURRENT_OUTPUTS}) reached`);
    }

    const id = `out_${nanoid(8)}`;
    let output;

    switch (type) {
      case 'rtmp':
        output = new RTMPOutput(id, config);
        break;
      case 'webrtc':
        output = new WebRTCOutput(id, config);
        break;
      case 'ndi':
        output = new NDIOutput(id, config);
        break;
      default:
        throw new Error(`Unknown output type: ${type}`);
    }

    output.on('status', (status) => {
      this.emit('output:status', { id, type, status, config: output.config });
    });

    output.on('health', (health) => {
      this.emit('output:health', { id, type, health });
    });

    this.outputs.set(id, output);
    this.emit('output:added', { id, type, config: output.config });
    return { id, type, config: output.config, state: STATE.IDLE };
  }

  /**
   * Remove an output by ID.
   * @param {string} id
   */
  removeOutput(id) {
    const output = this.outputs.get(id);
    if (!output) throw new Error(`Output ${id} not found`);

    if (output.state === STATE.ACTIVE || output.state === STATE.RECONNECTING) {
      output.stop();
    }

    this.outputs.delete(id);
    this.emit('output:removed', { id });
  }

  /**
   * Start a specific output.
   * @param {string} id
   */
  async startOutput(id) {
    const output = this.outputs.get(id);
    if (!output) throw new Error(`Output ${id} not found`);

    try {
      await output.start();
    } catch (err) {
      this._handleReconnect(output);
    }
  }

  /**
   * Stop a specific output.
   * @param {string} id
   */
  stopOutput(id) {
    const output = this.outputs.get(id);
    if (!output) throw new Error(`Output ${id} not found`);
    output.stop();
  }

  /**
   * Start all outputs.
   */
  async startAll() {
    const promises = [];
    for (const [, output] of this.outputs) {
      promises.push(
        output.start().catch(() => this._handleReconnect(output))
      );
    }
    await Promise.allSettled(promises);
  }

  /**
   * Stop all outputs.
   */
  stopAll() {
    for (const [, output] of this.outputs) {
      output.stop();
    }
  }

  /**
   * Get all outputs as an array.
   * @returns {Array}
   */
  getOutputs() {
    return Array.from(this.outputs.entries()).map(([id, output]) => ({
      id,
      type: output.type,
      config: output.config,
      state: output.state,
      metrics: output.getMetrics ? output.getMetrics() : null,
      viewers: output.viewers || 0
    }));
  }

  /**
   * Get a specific output.
   * @param {string} id
   * @returns {object|null}
   */
  getOutput(id) {
    const output = this.outputs.get(id);
    if (!output) return null;
    return {
      id,
      type: output.type,
      config: output.config,
      state: output.state,
      metrics: output.getMetrics ? output.getMetrics() : null,
      viewers: output.viewers || 0
    };
  }

  /**
   * Update an output's config.
   * @param {string} id
   * @param {object} config
   */
  updateOutputConfig(id, config) {
    const output = this.outputs.get(id);
    if (!output) throw new Error(`Output ${id} not found`);
    output.config = { ...output.config, ...config };
    this.emit('output:config-updated', { id, config: output.config });
  }

  /**
   * Get aggregate health metrics from the monitor.
   * @returns {object}
   */
  getHealth() {
    return this.monitor.getMetrics();
  }

  /**
   * Get metrics history from the monitor.
   * @returns {Array}
   */
  getHistory() {
    return this.monitor.getHistory();
  }

  /**
   * Get active alerts from the monitor.
   * @returns {Array}
   */
  getAlerts() {
    return this.monitor.getAlerts();
  }

  /**
   * Add a viewer to a WebRTC output.
   * @param {string} outputId
   * @param {string} viewerId
   * @param {string} socketId
   * @returns {boolean}
   */
  addViewer(outputId, viewerId, socketId) {
    const output = this.outputs.get(outputId);
    if (!output || output.type !== 'webrtc') return false;
    return output.addViewer(viewerId, socketId);
  }

  /**
   * Remove a viewer from a WebRTC output.
   * @param {string} outputId
   * @param {string} viewerId
   */
  removeViewer(outputId, viewerId) {
    const output = this.outputs.get(outputId);
    if (!output || output.type !== 'webrtc') return;
    output.removeViewer(viewerId);
  }

  /**
   * Switch scene for all active outputs.
   * @param {string} sceneId
   */
  switchScene(sceneId) {
    for (const [, output] of this.outputs) {
      if (output.state === STATE.ACTIVE && output.switchScene) {
        output.switchScene(sceneId);
      }
    }
    this.emit('scene:switched', { sceneId });
  }

  /**
   * Start the health monitoring interval.
   * @param {number} intervalMs - Monitoring interval in ms (default: 1000)
   */
  startMonitoring(intervalMs = 1000) {
    this.monitor.start(intervalMs);
  }

  /**
   * Stop the health monitoring interval.
   */
  stopMonitoring() {
    this.monitor.stop();
  }

  /**
   * Handle automatic reconnection with exponential backoff.
   * @private
   */
  _handleReconnect(output) {
    if (output.retryCount >= MAX_RETRIES) {
      output.state = STATE.ERROR;
      output.emit('status', { state: STATE.ERROR, message: 'Max retries exceeded' });
      return;
    }

    output.state = STATE.RECONNECTING;
    output.emit('status', {
      state: STATE.RECONNECTING,
      retryCount: output.retryCount,
      nextRetryIn: BACKOFF_DELAYS[output.retryCount]
    });

    const delay = BACKOFF_DELAYS[output.retryCount];
    output.retryCount++;

    setTimeout(async () => {
      try {
        await output.start();
      } catch {
        this._handleReconnect(output);
      }
    }, delay);
  }
}

export default StreamManager;
