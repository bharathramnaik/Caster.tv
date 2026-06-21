/**
 * Playlist API Routes
 * GET /api/playlists - List all playlists
 * GET /api/playlists/:id - Get playlist by ID
 * POST /api/playlists - Create new playlist
 * PUT /api/playlists/:id - Update playlist
 * DELETE /api/playlists/:id - Delete playlist
 * POST /api/playlists/:id/reorder - Reorder scenes in playlist
 */
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { authStore } from '../authStore.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/playlists
router.get('/', optionalAuth, (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const filters = {};
  if (search) filters.search = search;
  if (req.user) filters.createdBy = req.user.id;

  let playlists = authStore.getAllPlaylists(filters);

  const total = playlists.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  playlists = playlists.slice(offset, offset + parseInt(limit));

  res.json({ playlists, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/playlists/:id
router.get('/:id', optionalAuth, (req, res) => {
  const playlist = authStore.getPlaylist(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
  res.json(playlist);
});

// POST /api/playlists
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, description, sceneIds, defaultDuration, transitionType } = req.body;

    if (!name) return res.status(400).json({ error: 'Playlist name is required' });

    const playlist = {
      id: `pl_${nanoid(8)}`,
      name,
      description: description || '',
      sceneIds: sceneIds || [],
      defaultDuration: defaultDuration || 5000,
      transitionType: transitionType || 'fade',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    authStore.createPlaylist(playlist);
    res.status(201).json(playlist);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// PUT /api/playlists/:id
router.put('/:id', requireAuth, (req, res) => {
  const existing = authStore.getPlaylist(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Playlist not found' });

  if (existing.createdBy !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = { ...req.body, id: existing.id, updatedAt: new Date().toISOString() };
  delete updates.createdBy;
  delete updates.createdAt;

  const updated = authStore.updatePlaylist(req.params.id, updates);
  res.json(updated);
});

// DELETE /api/playlists/:id
router.delete('/:id', requireAuth, (req, res) => {
  const existing = authStore.getPlaylist(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Playlist not found' });

  if (existing.createdBy !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'Access denied' });
  }

  authStore.deletePlaylist(req.params.id);
  res.json({ ok: true });
});

// POST /api/playlists/:id/reorder
router.post('/:id/reorder', requireAuth, (req, res) => {
  const existing = authStore.getPlaylist(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Playlist not found' });

  const { sceneIds } = req.body;
  if (!Array.isArray(sceneIds)) {
    return res.status(400).json({ error: 'sceneIds must be an array' });
  }

  // Validate all scene IDs exist
  for (const sid of sceneIds) {
    if (!authStore.getScene(sid)) {
      return res.status(400).json({ error: `Scene not found: ${sid}` });
    }
  }

  const updated = authStore.updatePlaylist(req.params.id, {
    sceneIds,
    updatedAt: new Date().toISOString()
  });

  res.json(updated);
});

export default router;
