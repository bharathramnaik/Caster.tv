/**
 * WebRTC output for browser-based viewing.
 * Uses manual signaling via Socket.IO rooms (SFU-like relay pattern).
 */
import { EventEmitter } from 'events';
import { nanoid } from 'nanoid';

const DEFAULT_CONFIG = {
  maxViewers: 100,
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  videoBitrate: 2500,
  audioBitrate: 128
};

class WebRTCOutput extends EventEmitter {
  constructor(id, config = {}) {
    super();
    this.id = id;
    this.type = 'webrtc';
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = 'idle';
    this.retryCount = 0;
    this.viewers = new Map();
    this._broadcasters = new Map();
    this._metrics = {
      totalViewers: 0,
      bandwidthUsage: 0,
      activeConnections: 0,
      startTime: null,
      uptime: 0
    };
    this._metricsInterval = null;
    this._io = null;
  }

  /**
   * Start the WebRTC output.
   * @param {object} io - Socket.IO server instance
   */
  async start(io) {
    if (this.state === 'active') return;

    this._io = io;
    this.state = 'active';
    this._metrics.startTime = Date.now();
    this.retryCount = 0;

    this.emit('status', { state: 'active' });
    this._startMetricsCollection();
  }

  /**
   * Add a viewer to the stream.
   * @param {string} viewerId
   * @param {string} socketId
   * @returns {boolean}
   */
  addViewer(viewerId, socketId) {
    if (this.viewers.size >= this.config.maxViewers) {
      return false;
    }

    this.viewers.set(viewerId, {
      id: viewerId,
      socketId,
      joinedAt: Date.now(),
      bandwidth: 0
    });

    this._metrics.totalViewers = this.viewers.size;
    this._metrics.activeConnections = this.viewers.size;
    this.emit('viewers', { count: this.viewers.size });
    return true;
  }

  /**
   * Remove a viewer from the stream.
   * @param {string} viewerId
   */
  removeViewer(viewerId) {
    this.viewers.delete(viewerId);
    this._metrics.totalViewers = this.viewers.size;
    this._metrics.activeConnections = this.viewers.size;
    this.emit('viewers', { count: this.viewers.size });
  }

  /**
   * Handle WebRTC signaling - offer from broadcaster.
   * @param {string} broadcasterId
   * @param {object} offer
   */
  handleBroadcasterOffer(broadcasterId, offer) {
    this._broadcasters.set(broadcasterId, { offer, socketId: null });
    return { offer };
  }

  /**
   * Handle WebRTC signaling - answer from viewer.
   * @param {string} viewerId
   * @param {object} answer
   */
  handleViewerAnswer(viewerId, answer) {
    const viewer = this.viewers.get(viewerId);
    if (viewer) {
      viewer.answer = answer;
    }
    return { answer };
  }

  /**
   * Handle ICE candidate exchange.
   * @param {string} fromId
   * @param {string} toId
   * @param {object} candidate
   */
  handleIceCandidate(fromId, toId, candidate) {
    return { fromId, toId, candidate };
  }

  /**
   * Get viewer list.
   * @returns {Array}
   */
  getViewerList() {
    return Array.from(this.viewers.values()).map(v => ({
      id: v.id,
      joinedAt: v.joinedAt,
      bandwidth: v.bandwidth
    }));
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

      this._metrics.activeConnections = this.viewers.size;
      this._metrics.bandwidthUsage = this.viewers.size * ((this.config.videoBitrate + this.config.audioBitrate) / 8);

      this.emit('health', { ...this._metrics });
    }, 1000);
  }

  /**
   * Stop the WebRTC output.
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
    this.viewers.clear();
    this._broadcasters.clear();
  }

  /**
   * Get current metrics.
   * @returns {object}
   */
  getMetrics() {
    return {
      ...this._metrics,
      totalViewers: this.viewers.size,
      activeConnections: this.viewers.size
    };
  }

  /**
   * Switch scene (notify viewers).
   * @param {string} sceneId
   */
  switchScene(sceneId) {
    this.emit('scene:switch', { sceneId });
  }
}

export default WebRTCOutput;
