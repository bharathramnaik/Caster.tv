/**
 * Scene API Routes
 * GET /api/scenes - List all scenes
 * GET /api/scenes/:id - Get scene by ID
 * POST /api/scenes - Create new scene
 * PUT /api/scenes/:id - Update scene
 * DELETE /api/scenes/:id - Delete scene
 * POST /api/scenes/:id/duplicate - Duplicate scene
 * POST /api/scenes/:id/preview - Generate preview HTML
 * POST /api/scenes/:id/export - Export scene
 */
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { authStore } from '../authStore.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { createScene, validateScene, createLayer } from '../sceneManager/sceneModel.js';
import { composeScene } from '../sceneManager/composer.js';
import { exportAsHTML, exportForOBS, exportForNDI, exportAsJSON, exportForStreaming } from '../sceneManager/exporter.js';

const router = Router();

// GET /api/scenes
router.get('/', optionalAuth, (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const filters = {};
  if (search) filters.search = search;
  if (req.user) filters.createdBy = req.user.id;

  let scenes = authStore.getAllScenes(filters);

  const total = scenes.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  scenes = scenes.slice(offset, offset + parseInt(limit));

  res.json({ scenes, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/scenes/:id
router.get('/:id', optionalAuth, (req, res) => {
  const scene = authStore.getScene(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });
  res.json(scene);
});

// POST /api/scenes
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, description, layers, transitions, canvas } = req.body;

    const scene = createScene({
      name: name || 'Untitled Scene',
      layers: (layers || []).map(l => createLayer(l)),
      transitions,
      canvas,
      metadata: { createdBy: req.user.id }
    });

    // Store additional fields
    scene.description = description || '';
    scene.createdBy = req.user.id;

    const validation = validateScene(scene);
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid scene', details: validation.errors });
    }

    authStore.createScene(scene);
    res.status(201).json(scene);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create scene' });
  }
});

// PUT /api/scenes/:id
router.put('/:id', requireAuth, (req, res) => {
  const existing = authStore.getScene(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Scene not found' });

  const updates = { ...req.body, id: existing.id, updatedAt: new Date().toISOString() };
  delete updates.createdBy;
  delete updates.createdAt;

  const merged = { ...existing, ...updates };
  const validation = validateScene(merged);
  if (!validation.valid) {
    return res.status(400).json({ error: 'Invalid scene', details: validation.errors });
  }

  const updated = authStore.updateScene(req.params.id, updates);
  res.json(updated);
});

// DELETE /api/scenes/:id
router.delete('/:id', requireAuth, (req, res) => {
  const existing = authStore.getScene(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Scene not found' });

  authStore.deleteScene(req.params.id);
  res.json({ ok: true });
});

// POST /api/scenes/:id/duplicate
router.post('/:id/duplicate', requireAuth, (req, res) => {
  const existing = authStore.getScene(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Scene not found' });

  const duplicate = {
    ...JSON.parse(JSON.stringify(existing)),
    id: `scene_${nanoid(8)}`,
    name: req.body.name || `${existing.name} (Copy)`,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  authStore.createScene(duplicate);
  res.status(201).json(duplicate);
});

// POST /api/scenes/:id/preview
router.post('/:id/preview', requireAuth, (req, res) => {
  const scene = authStore.getScene(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  try {
    const html = composeScene(scene, { standalone: true });
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

// POST /api/scenes/:id/export
router.post('/:id/export', requireAuth, (req, res) => {
  const scene = authStore.getScene(req.params.id);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  const { format = 'html', ...opts } = req.body;

  try {
    let output;
    switch (format) {
      case 'obs':
        output = exportForOBS(scene, opts);
        break;
      case 'ndi':
        output = exportForNDI(scene, opts);
        break;
      case 'streaming':
        output = exportForStreaming(scene, opts);
        break;
      case 'json':
        output = exportAsJSON(scene);
        break;
      case 'html':
      default:
        output = exportAsHTML(scene, opts);
        break;
    }

    const contentTypes = {
      html: 'text/html',
      obs: 'text/html',
      ndi: 'text/html',
      streaming: 'text/html',
      json: 'application/json'
    };

    res.setHeader('Content-Type', contentTypes[format] || 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="scene-${scene.id}.${format === 'json' ? 'json' : 'html'}"`);
    res.send(output);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export scene' });
  }
});

export default router;
