import { Router } from 'express';
import { AnalyticsEngine, UsageTracker, PerformanceMonitor } from '../analytics/index.js';

const router = Router();
const analytics = new AnalyticsEngine();
const usage = new UsageTracker();
const performance = new PerformanceMonitor();

router.get('/dashboard', (_req, res) => {
  try {
    const dashboard = analytics.getDashboard();
    const usageStats = usage.getStats();
    res.json({ ...dashboard, usage: usageStats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/metrics', (req, res) => {
  try {
    const period = req.query.period || 'daily';
    const metrics = analytics.getMetrics(period);
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/usage/pages', (_req, res) => {
  try {
    const pages = usage.getPopularPages();
    res.json(pages);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/usage/features', (_req, res) => {
  try {
    const features = usage.getFeatureUsage();
    res.json(features);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/usage/peak-hours', (_req, res) => {
  try {
    const hours = analytics.getPeakHours();
    res.json(hours);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/performance', (_req, res) => {
  try {
    const metrics = performance.getMetrics();
    res.json(metrics);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/performance/health', (_req, res) => {
  try {
    const health = performance.getHealth();
    res.json(health);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/track', (req, res) => {
  try {
    const { event, data } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';
    const entry = analytics.trackEvent(userId, event, data);
    if (event === 'page_view' && data?.page) {
      usage.trackPageView(data.page);
    } else if (event === 'action_performed' && data?.action) {
      usage.trackAction(data.action);
    }
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/user/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const userEvents = analytics.data.events.filter(e => e.userId === userId);
    const journey = usage.getUserJourney(userId);
    res.json({ userId, events: userEvents.slice(-50), journey });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
