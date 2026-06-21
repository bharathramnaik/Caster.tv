/**
 * Data Integrations - Barrel Export
 * Central export point for all data integration modules.
 */
import { DataFeedManager, feedManager } from './dataFeedManager.js';
import { RSSFeed } from './rssFeed.js';
import { WebhookReceiver, webhookReceiver } from './webhookReceiver.js';
import { SocialFeed } from './socialFeed.js';
import { ScoreTicker } from './scoreTicker.js';
import { DataTransformer, dataTransformer } from './dataTransformer.js';

export {
  DataFeedManager,
  feedManager,
  RSSFeed,
  WebhookReceiver,
  webhookReceiver,
  SocialFeed,
  ScoreTicker,
  DataTransformer,
  dataTransformer
};
