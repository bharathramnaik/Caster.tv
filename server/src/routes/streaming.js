/**
 * Streaming API Routes
 * GET    /api/streaming                - List all outputs
 * POST   /api/streaming                - Add new output
 * DELETE /api/streaming/:id            - Remove output
 * POST   /api/streaming/:id/start     - Start specific output
 * POST   /api/streaming/:id/stop      - Stop specific output
 * GET    /api/streaming/health         - Get health metrics
 * GET    /api/streaming/history        - Get metrics history
 * GET    /api/streaming/alerts         - Get active alerts
 * PUT    /api/streaming/:id/config     - Update output config
 * POST   /api/streaming/scene/:sceneId - Switch scene for all outputs
 */
import { Router } from 'express';
import { StreamManager } from '../streaming/index.js';

const router = Router();
const streamManager = new StreamManager();

// Start monitoring on module load
streamManager.startMonitoring();

// GET /api/streaming - List all outputs
router.get('/', (_req, res) => {
  try {
    const outputs = streamManager.getOutputs();
    res.json(outputs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/streaming - Add new output
router.post('/', (req, res) => {
  try {
    const { type, config } = req.body;
    if (!type) return res.status(400).json({ error: 'type is required' });

    const output = streamManager.addOutput(type, config || {});
    res.status(201).json(output);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/streaming/health - Get health metrics
router.get('/health', (_req, res) => {
  try {
    const health = streamManager.getHealth();
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/streaming/history - Get metrics history
router.get('/history', (_req, res) => {
  try {
    const history = streamManager.getHistory();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/streaming/alerts - Get active alerts
router.get('/alerts', (_req, res) => {
  try {
    const alerts = streamManager.getAlerts();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/streaming/scene/:sceneId - Switch scene for all outputs
router.post('/scene/:sceneId', (req, res) => {
  try {
    streamManager.switchScene(req.params.sceneId);
    res.json({ ok: true, sceneId: req.params.sceneId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/streaming/:id - Remove output
router.delete('/:id', (req, res) => {
  try {
    streamManager.removeOutput(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// POST /api/streaming/:id/start - Start specific output
router.post('/:id/start', async (req, res) => {
  try {
    await streamManager.startOutput(req.params.id);
    res.json({ ok: true, state: 'active' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/streaming/:id/stop - Stop specific output
router.post('/:id/stop', (req, res) => {
  try {
    streamManager.stopOutput(req.params.id);
    res.json({ ok: true, state: 'stopped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/streaming/:id/config - Update output config
router.put('/:id/config', (req, res) => {
  try {
    streamManager.updateOutputConfig(req.params.id, req.body);
    const output = streamManager.getOutput(req.params.id);
    res.json(output);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// Export streamManager for use by socket handlers
export { streamManager };
export default router;
