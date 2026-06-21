/**
 * Bot API Routes
 * POST   /api/bot/message              - Send message to bot
 * GET    /api/bot/suggestions           - Get contextual suggestions
 * GET    /api/bot/quick-actions/:page   - Get quick actions for page
 * POST   /api/bot/action               - Execute a quick action
 * GET    /api/bot/history               - Get conversation history
 * POST   /api/bot/clear                 - Clear conversation
 * GET    /api/bot/context               - Get current context
 * GET    /api/bot/knowledge             - Get bot knowledge/guides
 */
import { Router } from 'express';
import { SparkBot } from '../bot/index.js';

const router = Router();
const bot = new SparkBot();

// POST /api/bot/message
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const userId = req.user?.id || req.ip;
    const context = req.body.context || {};

    const response = await bot.processMessage(userId, message, context);
    res.json({ response, userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/suggestions
router.get('/suggestions', (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const context = bot.getUserContext(userId);
    const suggestions = bot.getSuggestion(context);
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/quick-actions/:page
router.get('/quick-actions/:page', (req, res) => {
  try {
    const actions = bot.getQuickActions(req.params.page);
    res.json(actions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bot/action
router.post('/action', async (req, res) => {
  try {
    const { actionId, params } = req.body;
    if (!actionId) {
      return res.status(400).json({ error: 'actionId is required' });
    }

    const userId = req.user?.id || req.ip;
    const result = await bot.handleAction(userId, actionId, params || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/history
router.get('/history', (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const limit = parseInt(req.query.limit, 10) || 20;
    const history = bot.getHistory(userId, limit);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/bot/clear
router.post('/clear', (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    bot.clearConversation(userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/context
router.get('/context', (req, res) => {
  try {
    const userId = req.user?.id || req.ip;
    const context = bot.getUserContext(userId);
    res.json(context);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bot/knowledge
router.get('/knowledge', (_req, res) => {
  try {
    const knowledge = bot.getKnowledge();
    res.json(knowledge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
