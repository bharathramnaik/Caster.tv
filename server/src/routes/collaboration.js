import { Router } from 'express';
import { requireAuth, requireProjectAccess } from '../middleware/auth.js';

const router = Router();

router.get('/:projectId/users', requireAuth, requireProjectAccess('viewer'), (req, res) => {
  const project = req.app.get('collabManager');
  if (!project) return res.status(500).json({ error: 'Collaboration not available' });

  const users = project.getUsers(req.params.projectId);
  res.json({ users });
});

router.get('/:projectId/activity', requireAuth, requireProjectAccess('viewer'), (req, res) => {
  const collab = req.app.get('collabManager');
  if (!collab) return res.status(500).json({ error: 'Collaboration not available' });

  const { limit = 50, offset = 0 } = req.query;
  const log = collab.getActivityLog(req.params.projectId);
  const paginated = log.slice(-parseInt(limit) - parseInt(offset), -parseInt(offset) || undefined);

  res.json({ activities: paginated.reverse(), total: log.length });
});

router.post('/:projectId/roles', requireAuth, requireProjectAccess('admin'), (req, res) => {
  const collab = req.app.get('collabManager');
  if (!collab) return res.status(500).json({ error: 'Collaboration not available' });

  const { userId, role } = req.body;
  if (!userId || !role) {
    return res.status(400).json({ error: 'userId and role are required' });
  }

  const result = collab.setRole(req.params.projectId, userId, role, req.user.id);
  if (result.error) return res.status(400).json({ error: result.error });

  res.json(result);
});

router.delete('/:projectId/users/:userId', requireAuth, requireProjectAccess('admin'), (req, res) => {
  const collab = req.app.get('collabManager');
  if (!collab) return res.status(500).json({ error: 'Collaboration not available' });

  const result = collab.removeUser(req.params.projectId, req.params.userId, req.user.id);
  if (result.error) return res.status(400).json({ error: result.error });

  res.json(result);
});

router.get('/:projectId/state', requireAuth, requireProjectAccess('viewer'), (req, res) => {
  const collab = req.app.get('collabManager');
  if (!collab) return res.status(500).json({ error: 'Collaboration not available' });

  const state = collab.getProjectState(req.params.projectId);
  res.json({ state: state || {} });
});

export default router;
