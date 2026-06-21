/**
 * Live Control API Routes
 * GET /api/live - Get current live state
 * POST /api/live/scene - Switch to scene
 * POST /api/live/transition - Trigger transition
 * POST /api/live/layer/:id/visibility - Toggle layer visibility
 * POST /api/live/layer/:id/data - Update layer data
 * GET /api/live/preview - Get preview URL
 * GET /api/live/output - Get broadcast output URL
 */
import { Router } from 'express';
import { authStore } from '../authStore.js';
import { requireAuth } from '../middleware/auth.js';
import { composeScene } from '../sceneManager/composer.js';
import { toggleVisibility, updateLayer } from '../sceneManager/layerManager.js';

const router = Router();

// GET /api/live - Get current live state
router.get('/', requireAuth, (_req, res) => {
  const state = authStore.getLiveState();
  const scene = state.sceneId ? authStore.getScene(state.sceneId) : null;
  res.json({ ...state, scene });
});

// POST /api/live/scene - Switch live scene
router.post('/scene', requireAuth, (req, res) => {
  const { sceneId } = req.body;
  if (!sceneId) return res.status(400).json({ error: 'sceneId is required' });

  const scene = authStore.getScene(sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  const state = authStore.updateLiveState({
    sceneId,
    activeLayers: (scene.layers || []).filter(l => l.visible).map(l => l.id),
    graphicsState: {}
  });

  res.json(state);
});

// POST /api/live/transition - Trigger a transition
router.post('/transition', requireAuth, (req, res) => {
  const { sceneId, transitionType, duration } = req.body;

  if (sceneId) {
    const scene = authStore.getScene(sceneId);
    if (!scene) return res.status(404).json({ error: 'Scene not found' });
  }

  const state = authStore.getLiveState();
  const updates = { transitionPending: true };
  if (sceneId) updates.pendingSceneId = sceneId;
  if (transitionType) updates.transitionType = transitionType;
  if (duration) updates.transitionDuration = duration;

  const updated = authStore.updateLiveState(updates);
  res.json(updated);
});

// POST /api/live/layer/:id/visibility - Toggle layer visibility
router.post('/layer/:id/visibility', requireAuth, (req, res) => {
  const { sceneId } = req.body;
  if (!sceneId) return res.status(400).json({ error: 'sceneId is required' });

  const scene = authStore.getScene(sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  const layer = scene.layers.find(l => l.id === req.params.id);
  if (!layer) return res.status(404).json({ error: 'Layer not found' });

  layer.visible = !layer.visible;
  authStore.updateScene(sceneId, { layers: scene.layers, updatedAt: new Date().toISOString() });

  const state = authStore.updateLiveState({
    activeLayers: scene.layers.filter(l => l.visible).map(l => l.id)
  });

  res.json({ layer, liveState: state });
});

// POST /api/live/layer/:id/data - Update layer data
router.post('/layer/:id/data', requireAuth, (req, res) => {
  const { sceneId, data } = req.body;
  if (!sceneId) return res.status(400).json({ error: 'sceneId is required' });

  const scene = authStore.getScene(sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  const layer = scene.layers.find(l => l.id === req.params.id);
  if (!layer) return res.status(404).json({ error: 'Layer not found' });

  layer.data = { ...layer.data, ...data };
  authStore.updateScene(sceneId, { layers: scene.layers, updatedAt: new Date().toISOString() });

  const state = authStore.updateLiveState({
    graphicsState: {
      ...(authStore.getLiveState().graphicsState || {}),
      [req.params.id]: layer.data
    }
  });

  res.json({ layer, liveState: state });
});

// GET /api/live/preview - Get preview HTML
router.get('/preview', requireAuth, (_req, res) => {
  const state = authStore.getLiveState();
  if (!state.sceneId) {
    return res.json({ html: '<html><body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h2>No scene active</h2></body></html>' });
  }

  const scene = authStore.getScene(state.sceneId);
  if (!scene) return res.status(404).json({ error: 'Active scene not found' });

  try {
    const html = composeScene(scene, { standalone: true });
    res.json({ html, sceneId: state.sceneId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// GET /api/live/output - Get broadcast output URL
router.get('/output', requireAuth, (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({
    previewUrl: `${baseUrl}/api/live/preview`,
    websocketUrl: `${baseUrl}`,
    sceneId: authStore.getLiveState().sceneId,
    resolution: { width: 1920, height: 1080 }
  });
});

export default router;
