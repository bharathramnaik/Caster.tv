/**
 * Webhook receiver for ingesting external data.
 * Manages webhook endpoints, rate limiting, HMAC validation, and payload history.
 */
import { nanoid } from 'nanoid';
import { createHmac, timingSafeEqual } from 'crypto';
import { EventEmitter } from 'events';

/** @type {Map<string, { requests: number[], history: object[] }>} */
const rateLimitStore = new Map();

/**
 * @class WebhookReceiver
 * @description Handles incoming webhook payloads with validation and rate limiting.
 */
export class WebhookReceiver extends EventEmitter {
  constructor() {
    super();
    /** @type {Map<string, object>} Webhook configs */
    this.webhooks = new Map();
    /** @type {Map<string, object[]>} Webhook data history */
    this.history = new Map();
    /** Max history per webhook */
    this.maxHistory = 100;
    /** Max requests per minute per webhook */
    this.maxRateLimit = 100;
  }

  /**
   * Create a new webhook endpoint.
   * @param {object} config
   * @param {string} config.path - URL path segment
   * @param {string} [config.secret] - HMAC secret for signature validation
   * @param {'POST'|'PUT'} [config.method='POST'] - Accepted HTTP method
   * @returns {object} Created webhook info
   */
  create(config) {
    const id = `wh_${nanoid(8)}`;
    const webhook = {
      id,
      path: config.path || nanoid(12),
      secret: config.secret || null,
      method: (config.method || 'POST').toUpperCase(),
      url: `/api/webhooks/${config.path || 'default'}/${id}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    this.webhooks.set(id, webhook);
    this.history.set(id, []);
    rateLimitStore.set(id, { requests: [] });

    console.log(`[WebhookReceiver] Created webhook: ${id} at ${webhook.url}`);
    return { ...webhook };
  }

  /**
   * Remove a webhook endpoint.
   * @param {string} id - Webhook ID
   * @returns {boolean}
   */
  remove(id) {
    this.webhooks.delete(id);
    this.history.delete(id);
    rateLimitStore.delete(id);
    return true;
  }

  /**
   * Validate HMAC signature if secret is configured.
   * @private
   * @param {string} id - Webhook ID
   * @param {string} payload - Raw body
   * @param {string} signature - Provided signature
   * @returns {boolean}
   */
  _validateSignature(id, payload, signature) {
    const webhook = this.webhooks.get(id);
    if (!webhook || !webhook.secret) return true; // No secret = skip validation
    if (!signature) return false;

    try {
      const expected = createHmac('sha256', webhook.secret)
        .update(payload, 'utf8')
        .digest('hex');
      const sig = signature.replace(/^sha256=/, '');
      const expectedBuf = Buffer.from(expected, 'hex');
      const sigBuf = Buffer.from(sig, 'hex');
      if (expectedBuf.length !== sigBuf.length) return false;
      return timingSafeEqual(expectedBuf, sigBuf);
    } catch {
      return false;
    }
  }

  /**
   * Check rate limit for a webhook (max 100 req/min).
   * @private
   * @param {string} id - Webhook ID
   * @returns {boolean} True if within rate limit
   */
  _checkRateLimit(id) {
    const store = rateLimitStore.get(id);
    if (!store) return true;

    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    store.requests = store.requests.filter(t => t > oneMinuteAgo);

    if (store.requests.length >= this.maxRateLimit) {
      return false;
    }

    store.requests.push(now);
    return true;
  }

  /**
   * Process an incoming webhook request.
   * @param {string} id - Webhook ID
   * @param {object} params - Request params
   * @param {string} params.body - Raw body
   * @param {object} params.headers - Request headers
   * @param {string} params.method - HTTP method
   * @returns {object} Processing result
   * @throws {Error} On validation/rate limit failure
   */
  receive(id, { body, headers, method }) {
    const webhook = this.webhooks.get(id);
    if (!webhook) {
      throw new Error(`Webhook not found: ${id}`);
    }

    if (webhook.status !== 'active') {
      throw new Error(`Webhook ${id} is not active`);
    }

    if (webhook.method !== method.toUpperCase()) {
      throw new Error(`Method not allowed. Expected ${webhook.method}`);
    }

    // Rate limit check
    if (!this._checkRateLimit(id)) {
      throw new Error('Rate limit exceeded (max 100 requests per minute)');
    }

    // HMAC validation
    const signature = headers['x-hub-signature-256'] || headers['x-signature'] || '';
    if (webhook.secret && !this._validateSignature(id, body, signature)) {
      throw new Error('Invalid HMAC signature');
    }

    // Parse payload
    let payload;
    try {
      payload = typeof body === 'string' ? JSON.parse(body) : body;
    } catch {
      payload = { raw: body };
    }

    const entry = {
      id: `payload_${nanoid(8)}`,
      webhookId: id,
      payload,
      headers: {
        'content-type': headers['content-type'],
        'user-agent': headers['user-agent']
      },
      receivedAt: new Date().toISOString()
    };

    // Store in history
    const history = this.history.get(id) || [];
    history.unshift(entry);
    if (history.length > this.maxHistory) {
      history.length = this.maxHistory;
    }
    this.history.set(id, history);

    this.emit('webhook:received', { id, entry });
    console.log(`[WebhookReceiver] Received payload for webhook: ${id}`);

    return entry;
  }

  /**
   * Get data for a webhook (latest payloads).
   * @param {string} id - Webhook ID
   * @returns {object[]}
   */
  getData(id) {
    return this.history.get(id) || [];
  }

  /**
   * Get full history for a webhook.
   * @param {string} id - Webhook ID
   * @returns {object[]}
   */
  getHistory(id) {
    return this.history.get(id) || [];
  }

  /**
   * Get all registered webhooks.
   * @returns {object[]}
   */
  getAll() {
    return Array.from(this.webhooks.values());
  }
}

/** Singleton instance */
export const webhookReceiver = new WebhookReceiver();
