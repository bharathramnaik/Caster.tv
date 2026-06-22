import { Router } from 'express';
import { RealtimeEngine, UsageAnalytics, PerformanceMonitor, AnalyticsEngine, UsageTracker } from '../analytics/index.js';

const router = Router();
const realtime = new RealtimeEngine();
const usageAnalytics = new UsageAnalytics();
const performanceMonitor = new PerformanceMonitor();
const analyticsEngine = new AnalyticsEngine();
const usageTracker = new UsageTracker();

router.get('/realtime', (_req, res) => {
  try {
    const summary = realtime.getSummary();
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/trends', (req, res) => {
  try {
    const metric = req.query.metric || 'requests';
    const periods = parseInt(req.query.periods) || 6;
    const trends = realtime.getTrend(metric, periods);
    res.json({ metric, periods, data: trends });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/usage', (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const stats = usageAnalytics.getUsageStats(days);
    res.json(stats);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/performance', (_req, res) => {
  try {
    const report = performanceMonitor.getPerformanceReport();
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/popular', (req, res) => {
  try {
    const templates = usageAnalytics.getPopularTemplates(parseInt(req.query.limit) || 10);
    const sports = usageAnalytics.getPopularSports(parseInt(req.query.limit) || 10);
    res.json({ templates, sports });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/sessions', (_req, res) => {
  try {
    const sessions = usageAnalytics.getSessionAnalytics();
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/export', (req, res) => {
  try {
    const format = req.query.format || 'csv';
    if (format === 'csv') {
      const csv = usageAnalytics.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.csv"`);
      res.send(csv);
    } else {
      const stats = usageAnalytics.getUsageStats(30);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.json"`);
      res.json(stats);
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/slow-endpoints', (_req, res) => {
  try {
    const endpoints = performanceMonitor.getSlowEndpoints(parseInt(req.query.limit) || 10);
    res.json(endpoints);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/slow-queries', (_req, res) => {
  try {
    const queries = performanceMonitor.getSlowQueries(parseInt(req.query.limit) || 20);
    res.json(queries);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/dashboard', (_req, res) => {
  try {
    const realtimeSummary = realtime.getSummary();
    const usageStats = usageAnalytics.getUsageStats(7);
    const performanceReport = performanceMonitor.getPerformanceReport();
    const sessions = usageAnalytics.getSessionAnalytics();
    const dashboard = analyticsEngine.getDashboard();
    const popular = {
      templates: usageAnalytics.getPopularTemplates(5),
      sports: usageAnalytics.getPopularSports(5)
    };

    res.json({
      realtime: realtimeSummary,
      usage: usageStats,
      performance: performanceReport,
      sessions,
      dashboard,
      popular,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/track', (req, res) => {
  try {
    const { event, data } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';

    const rtEvent = realtime.trackEvent({
      type: event,
      userId,
      endpoint: data?.endpoint || '/',
      method: data?.method || 'GET',
      statusCode: data?.statusCode || 200,
      responseTime: data?.responseTime || 0,
      data
    });

    const legacyEvent = analyticsEngine.trackEvent(userId, event, data);

    if (event === 'page_view' && data?.page) {
      usageAnalytics.trackPageView(data.page, userId);
      usageTracker.trackPageView(data.page);
    } else if (event === 'feature_used' && data?.feature) {
      usageAnalytics.trackFeature(data.feature, userId, data);
      usageTracker.trackFeature(data.feature);
    } else if (event === 'template_used' && data?.templateId) {
      usageAnalytics.trackTemplate(data.templateId, data.templateName || 'unknown');
    } else if (event === 'sport_viewed' && data?.sport) {
      usageAnalytics.trackSport(data.sport, userId);
    }

    res.json({ realtime: rtEvent, legacy: legacyEvent });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
