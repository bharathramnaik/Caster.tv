/**
 * RSS/Atom feed parser with regex-based XML parsing.
 * Fetches and parses RSS and Atom feeds.
 */
import { EventEmitter } from 'events';

/**
 * @class RSSFeed
 * @description Parses RSS/Atom feeds from a URL using regex-based XML parsing.
 */
export class RSSFeed {
  /**
   * @param {object} config
   * @param {string} config.url - Feed URL
   * @param {number} [config.pollInterval=30] - Poll interval in seconds
   * @param {number} [config.maxItems=20] - Max items to keep
   * @param {string} [config.category] - Feed category
   */
  constructor(config) {
    this.url = config.url;
    this.pollInterval = config.pollInterval || 30;
    this.maxItems = config.maxItems || 20;
    this.category = config.category || 'general';
    this.items = [];
    this.lastFetch = null;
    this.error = null;
  }

  /**
   * Fetch and parse the RSS/Atom feed.
   * @returns {Promise<object[]>} Parsed feed items
   */
  async fetch() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(this.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'SportsCaster/1.0 RSS Reader' }
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xml = await response.text();
      this.items = this._parseXML(xml).slice(0, this.maxItems);
      this.lastFetch = new Date().toISOString();
      this.error = null;

      return this.items;
    } catch (err) {
      this.error = err.message;
      console.error(`[RSSFeed] Fetch error for ${this.url}:`, err.message);
      throw err;
    }
  }

  /**
   * Parse XML string into feed items using regex.
   * @private
   * @param {string} xml - Raw XML content
   * @returns {object[]} Parsed items
   */
  _parseXML(xml) {
    const items = [];

    // Try RSS <item> first
    const rssItemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
    let match;
    while ((match = rssItemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      items.push(this._parseRSSItem(itemXml));
    }

    // If no RSS items, try Atom <entry>
    if (items.length === 0) {
      const atomEntryRegex = /<entry[\s>]([\s\S]*?)<\/entry>/gi;
      while ((match = atomEntryRegex.exec(xml)) !== null) {
        const entryXml = match[1];
        items.push(this._parseAtomEntry(entryXml));
      }
    }

    return items.filter(Boolean);
  }

  /**
   * Parse a single RSS <item> element.
   * @private
   * @param {string} xml - Item XML
   * @returns {object} Parsed item
   */
  _parseRSSItem(xml) {
    const getField = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
      const m = xml.match(regex);
      return m ? m[1].trim() : '';
    };

    const title = this._unescape(getField('title'));
    const link = getField('link') || getField('url');
    const description = this._unescape(getField('description'));
    const pubDate = getField('pubDate') || getField('published') || getField('updated');
    const author = getField('author') || getField('dc:creator');
    const category = getField('category') || this.category;

    if (!title && !link) return null;

    return {
      title,
      link,
      description: this._stripHTML(description).substring(0, 500),
      pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      author: author || 'Unknown',
      category,
      fetchedAt: new Date().toISOString()
    };
  }

  /**
   * Parse a single Atom <entry> element.
   * @private
   * @param {string} xml - Entry XML
   * @returns {object} Parsed entry
   */
  _parseAtomEntry(xml) {
    const getField = (tag) => {
      const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</${tag}>`, 'i');
      const m = xml.match(regex);
      return m ? m[1].trim() : '';
    };

    const getAttr = (tag, attr) => {
      const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']*)["']`, 'i');
      const m = xml.match(regex);
      return m ? m[1] : '';
    };

    const title = this._unescape(getField('title'));
    const link = getAttr('link', 'href') || getField('link');
    const description = this._unescape(getField('summary') || getField('content'));
    const pubDate = getField('published') || getField('updated');
    const author = getField('name') || getField('author');
    const category = getAttr('category', 'term') || this.category;

    if (!title && !link) return null;

    return {
      title,
      link,
      description: this._stripHTML(description).substring(0, 500),
      pubDate: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      author: author || 'Unknown',
      category,
      fetchedAt: new Date().toISOString()
    };
  }

  /** @private Unescape XML entities */
  _unescape(str) {
    if (!str) return '';
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'")
      .replace(/\n/g, ' ')
      .trim();
  }

  /** @private Strip HTML tags */
  _stripHTML(str) {
    if (!str) return '';
    return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Get all parsed items.
   * @returns {object[]}
   */
  getItems() {
    return [...this.items];
  }

  /**
   * Get the latest item.
   * @returns {object|null}
   */
  getLatest() {
    return this.items.length > 0 ? { ...this.items[0] } : null;
  }

  /**
   * Search items by query string.
   * @param {string} query - Search term
   * @returns {object[]} Matching items
   */
  search(query) {
    const q = query.toLowerCase();
    return this.items.filter(item =>
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q))
    );
  }
}
