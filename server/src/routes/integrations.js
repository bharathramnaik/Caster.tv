/**
 * Data Integrations API Routes
 * Manages data feeds, webhooks, social feeds, and scores.
 */
import { Router } from 'express';
import { feedManager, webhookReceiver, dataTransformer } from '../integrations/index.js';
import { SocialFeed } from '../integrations/socialFeed.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ── Feed Management ──────────────────────────────────────────

// GET /api/integrations - List all feeds
router.get('/', requireAuth, (_req, res) => {
  try {
    const feeds = feedManager.getFeeds();
    res.json(feeds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations - Add new feed
router.post('/', requireAuth, (req, res) => {
  try {
    const { type, config } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });

    const feed = feedManager.addFeed(type, config || {});
    res.status(201).json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/integrations/:id - Remove feed
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const removed = feedManager.removeFeed(req.params.id);
    if (!removed) return res.status(404).json({ error: 'Feed not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/:id/start - Start feed
router.post('/:id/start', requireAuth, (req, res) => {
  try {
    const feed = feedManager.startFeed(req.params.id);
    res.json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/integrations/:id/stop - Stop feed
router.post('/:id/stop', requireAuth, (req, res) => {
  try {
    const feed = feedManager.stopFeed(req.params.id);
    res.json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/integrations/:id/data - Get feed data
router.get('/:id/data', requireAuth, (req, res) => {
  try {
    const data = feedManager.getFeedData(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// GET /api/integrations/:id/history - Get feed history
router.get('/:id/history', requireAuth, (req, res) => {
  try {
    const feed = feedManager.getFeed(req.params.id);
    if (!feed) return res.status(404).json({ error: 'Feed not found' });
    res.json({
      data: feed.data || [],
      lastUpdated: feed.lastUpdated,
      status: feed.status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/integrations/all-data - Get all feed data combined
router.get('/all-data', requireAuth, (_req, res) => {
  try {
    const data = feedManager.getAllFeedData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/transform - Transform data to overlay format
router.post('/transform', requireAuth, (req, res) => {
  try {
    const { data, options } = req.body;
    if (!data) return res.status(400).json({ error: 'data is required' });

    const result = dataTransformer.transform(data, options || {});
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Social Routes ────────────────────────────────────────────

// GET /api/integrations/social/search - Search social feeds
router.get('/social/search', requireAuth, (req, res) => {
  try {
    const { query, platform } = req.query;
    const socialFeed = feedManager.getFeeds().find(f => f.type === 'social');
    if (!socialFeed) {
      return res.json({ results: [], message: 'No social feed configured' });
    }

    const sf = new SocialFeed(socialFeed.config);
    const posts = query ? sf.search(query) : sf.getPosts();
    res.json({ results: posts, platform: socialFeed.config.platform });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/social/configure - Configure social feed
router.post('/social/configure', requireAuth, (req, res) => {
  try {
    const { platform, keywords, accountId } = req.body;
    if (!platform) return res.status(400).json({ error: 'platform is required' });

    // Remove existing social feeds
    const existing = feedManager.getFeeds().filter(f => f.type === 'social');
    for (const f of existing) {
      feedManager.removeFeed(f.id);
    }

    const feed = feedManager.addFeed('social', { platform, keywords, accountId });
    res.status(201).json(feed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Score Routes ─────────────────────────────────────────────

// GET /api/integrations/scores - Get all scores
router.get('/scores', requireAuth, (_req, res) => {
  try {
    const scoreFeeds = feedManager.getFeeds().filter(f => f.type === 'score');
    const allScores = scoreFeeds.flatMap(f => f.data || []);
    res.json(allScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/integrations/scores/:sport - Get scores by sport
router.get('/scores/:sport', requireAuth, (req, res) => {
  try {
    const scoreFeeds = feedManager.getFeeds().filter(f => f.type === 'score');
    const scores = scoreFeeds
      .flatMap(f => f.data || [])
      .filter(s => s.sport === req.params.sport);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/integrations/scores/:league - Get scores by league
router.get('/scores/league/:league', requireAuth, (req, res) => {
  try {
    const scoreFeeds = feedManager.getFeeds().filter(f => f.type === 'score');
    const scores = scoreFeeds
      .flatMap(f => f.data || [])
      .filter(s => s.league === req.params.league);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Transformer Routes ───────────────────────────────────────

// GET /api/integrations/transformers - List transformers
router.get('/transformers', requireAuth, (_req, res) => {
  try {
    const transformers = dataTransformer.getTransformers();
    res.json(transformers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
