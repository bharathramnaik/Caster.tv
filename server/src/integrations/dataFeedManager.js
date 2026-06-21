/**
 * Central feed management system for data integrations.
 * Orchestrates all data sources, polling, and event emission.
 */
import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import { RSSFeed } from './rssFeed.js';
import { SocialFeed } from './socialFeed.js';
import { ScoreTicker } from './scoreTicker.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FEEDS_FILE = join(__dirname, '..', '..', 'data', 'feeds.json');
const MAX_FEEDS = 20;

const FEED_TYPES = {
  rss: RSSFeed,
  social: SocialFeed,
  score: ScoreTicker,
  webhook: 'webhook'
};

/**
 * @class DataFeedManager
 * @extends EventEmitter
 * @description Manages all data feeds, their lifecycle, and data distribution.
 */
export class DataFeedManager extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, object>} */
    this.feeds = new Map();
    /** @type {Map<string, object>} */
    this.feedInstances = new Map();
    /** @type {Map<string, NodeJS.Timeout>} */
    this.pollTimers = new Map();
    this._loadFeeds();
  }

  /** Load persisted feeds from disk */
  _loadFeeds() {
    try {
      if (existsSync(FEEDS_FILE)) {
        const data = JSON.parse(readFileSync(FEEDS_FILE, 'utf-8'));
        for (const feed of data) {
          this.feeds.set(feed.id, { ...feed, status: 'stopped' });
        }
      }
    } catch (err) {
      console.error('[DataFeedManager] Failed to load feeds:', err.message);
    }
  }

  /** Persist feeds to disk */
  _saveFeeds() {
    try {
      const data = Array.from(this.feeds.values()).map(f => ({
        id: f.id,
        type: f.type,
        config: f.config,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt
      }));
      writeFileSync(FEEDS_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('[DataFeedManager] Failed to save feeds:', err.message);
    }
  }

  /**
   * Add a new data feed.
   * @param {'rss'|'webhook'|'social'|'score'} type - Feed type
   * @param {object} config - Feed configuration
   * @returns {object} Created feed
   * @throws {Error} If max feeds reached or invalid type
   */
  addFeed(type, config) {
    if (this.feeds.size >= MAX_FEEDS) {
      throw new Error(`Maximum concurrent feeds (${MAX_FEEDS}) reached`);
    }
    if (!FEED_TYPES[type]) {
      throw new Error(`Invalid feed type: ${type}. Valid types: ${Object.keys(FEED_TYPES).join(', ')}`);
    }

    const id = `feed_${nanoid(8)}`;
    const feed = {
      id,
      type,
      config: { ...config },
      status: 'stopped',
      data: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.feeds.set(id, feed);
    this._saveFeeds();

    console.log(`[DataFeedManager] Added feed: ${id} (${type})`);
    return { ...feed };
  }

  /**
   * Remove a feed by ID.
   * @param {string} id - Feed ID
   * @returns {boolean} Whether the feed was removed
   */
  removeFeed(id) {
    this.stopFeed(id);
    const deleted = this.feeds.delete(id);
    if (deleted) {
      this._saveFeeds();
      console.log(`[DataFeedManager] Removed feed: ${id}`);
    }
    return deleted;
  }

  /**
   * Start polling/monitoring a feed.
   * @param {string} id - Feed ID
   * @returns {object} Updated feed
   */
  startFeed(id) {
    const feed = this.feeds.get(id);
    if (!feed) throw new Error(`Feed not found: ${id}`);
    if (feed.status === 'active') return feed;

    feed.status = 'active';
    feed.updatedAt = new Date().toISOString();

    // Create feed instance if needed
    this._createFeedInstance(feed);

    // Start polling if interval-based
    const interval = (feed.config.pollInterval || 30) * 1000;
    const timer = setInterval(() => this._pollFeed(id), interval);
    this.pollTimers.set(id, timer);

    // Initial fetch
    this._pollFeed(id);

    this._saveFeeds();
    this.emit('feed:started', { id, type: feed.type });
    console.log(`[DataFeedManager] Started feed: ${id}`);
    return { ...feed };
  }

  /**
   * Stop polling/monitoring a feed.
   * @param {string} id - Feed ID
   * @returns {object} Updated feed
   */
  stopFeed(id) {
    const feed = this.feeds.get(id);
    if (!feed) throw new Error(`Feed not found: ${id}`);
    if (feed.status === 'stopped') return feed;

    feed.status = 'stopped';
    feed.updatedAt = new Date().toISOString();

    // Clear polling timer
    const timer = this.pollTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.pollTimers.delete(id);
    }

    // Cleanup instance
    const instance = this.feedInstances.get(id);
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
    this.feedInstances.delete(id);

    this._saveFeeds();
    this.emit('feed:stopped', { id, type: feed.type });
    console.log(`[DataFeedManager] Stopped feed: ${id}`);
    return { ...feed };
  }

  /** @private Create appropriate feed instance based on type */
  _createFeedInstance(feed) {
    if (this.feedInstances.has(feed.id)) return;

    switch (feed.type) {
      case 'rss': {
        const rss = new RSSFeed(feed.config);
        this.feedInstances.set(feed.id, rss);
        break;
      }
      case 'social': {
        const social = new SocialFeed(feed.config);
        this.feedInstances.set(feed.id, social);
        break;
      }
      case 'score': {
        const ticker = new ScoreTicker(feed.config);
        this.feedInstances.set(feed.id, ticker);
        break;
      }
      case 'webhook':
        // Webhooks are event-driven, no instance needed
        break;
    }
  }

  /** @private Poll a feed for new data */
  async _pollFeed(id) {
    const feed = this.feeds.get(id);
    if (!feed || feed.status !== 'active') return;

    try {
      const instance = this.feedInstances.get(id);
      if (!instance) {
        this._createFeedInstance(feed);
      }

      const inst = this.feedInstances.get(id);
      if (!inst || typeof inst.fetch !== 'function') return;

      const newData = await inst.fetch();
      if (newData && newData.length > 0) {
        feed.data = newData;
        feed.lastUpdated = new Date().toISOString();
        this._saveFeeds();
        this.emit('feed:data', { id, type: feed.type, data: newData });
      }
    } catch (err) {
      feed.status = 'error';
      feed.error = err.message;
      this.emit('feed:error', { id, type: feed.type, error: err.message });
      console.error(`[DataFeedManager] Feed ${id} error:`, err.message);
    }
  }

  /**
   * Get all feeds.
   * @returns {object[]} Array of feed objects
   */
  getFeeds() {
    return Array.from(this.feeds.values()).map(f => ({
      ...f,
      dataCount: (f.data || []).length
    }));
  }

  /**
   * Get a single feed by ID.
   * @param {string} id - Feed ID
   * @returns {object|undefined}
   */
  getFeed(id) {
    return this.feeds.get(id);
  }

  /**
   * Get data for a specific feed.
   * @param {string} id - Feed ID
   * @returns {object[]} Feed data items
   */
  getFeedData(id) {
    const feed = this.feeds.get(id);
    if (!feed) throw new Error(`Feed not found: ${id}`);
    return feed.data || [];
  }

  /**
   * Get data from all active feeds combined.
   * @returns {object[]} Combined data from all feeds
   */
  getAllData() {
    const allData = [];
    for (const feed of this.feeds.values()) {
      if (feed.data && feed.data.length > 0) {
        allData.push(...feed.data.map(item => ({
          ...item,
          _feedId: feed.id,
          _feedType: feed.type
        })));
      }
    }
    return allData;
  }

  /**
   * Receive webhook data and store it.
   * @param {string} feedId - Webhook feed ID
   * @param {object} payload - Incoming payload
   */
  receiveWebhookData(feedId, payload) {
    const feed = this.feeds.get(feedId);
    if (!feed) return;

    const item = {
      id: `wh_${nanoid(8)}`,
      ...payload,
      receivedAt: new Date().toISOString()
    };

    if (!feed.data) feed.data = [];
    feed.data.unshift(item);
    // Keep only last 100 items
    if (feed.data.length > 100) feed.data = feed.data.slice(0, 100);

    feed.lastUpdated = new Date().toISOString();
    this._saveFeeds();
    this.emit('feed:data', { id: feedId, type: 'webhook', data: [item] });
  }

  /**
   * Get combined data for all feeds (all-data endpoint).
   * @returns {object} Combined data by type
   */
  getAllFeedData() {
    const result = {};
    for (const feed of this.feeds.values()) {
      if (!result[feed.type]) result[feed.type] = [];
      result[feed.type].push({
        feedId: feed.id,
        config: feed.config,
        status: feed.status,
        data: feed.data || [],
        lastUpdated: feed.lastUpdated
      });
    }
    return result;
  }

  /**
   * Cleanup all feeds and timers on shutdown.
   */
  destroy() {
    for (const [id] of this.pollTimers) {
      this.stopFeed(id);
    }
    this.removeAllListeners();
  }
}

/** Singleton instance */
export const feedManager = new DataFeedManager();
