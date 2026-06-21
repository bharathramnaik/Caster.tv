/**
 * Project API Routes
 * GET /api/projects - List user's projects
 * GET /api/projects/:id - Get project
 * POST /api/projects - Create project
 * PUT /api/projects/:id - Update project
 * DELETE /api/projects/:id - Delete project
 * POST /api/projects/:id/members - Add member
 * DELETE /api/projects/:id/members/:userId - Remove member
 */
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { authStore } from '../authStore.js';
import { requireAuth, requireProjectAccess } from '../middleware/auth.js';

const router = Router();

// GET /api/projects
router.get('/', requireAuth, (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const filters = {};
  if (search) filters.search = search;

  // Admin sees all, others see owned + member projects
  if (req.user.role !== 'admin') {
    filters.memberId = req.user.id;
  }

  let projects = authStore.getAllProjects(filters);

  const total = projects.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  projects = projects.slice(offset, offset + parseInt(limit));

  res.json({ projects, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/projects/:id
router.get('/:id', requireAuth, requireProjectAccess('viewer'), (req, res) => {
  const project = authStore.getProject(req.params.id);
  res.json(project);
});

// POST /api/projects
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, description, settings } = req.body;

    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const project = {
      id: `proj_${nanoid(8)}`,
      name,
      description: description || '',
      ownerId: req.user.id,
      members: [{ userId: req.user.id, role: 'admin', joinedAt: new Date().toISOString() }],
      settings: settings || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    authStore.createProject(project);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id
router.put('/:id', requireAuth, requireProjectAccess('editor'), (req, res) => {
  const existing = authStore.getProject(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Project not found' });

  const updates = { ...req.body, id: existing.id, updatedAt: new Date().toISOString() };
  delete updates.ownerId;
  delete updates.members;
  delete updates.createdAt;

  const updated = authStore.updateProject(req.params.id, updates);
  res.json(updated);
});

// DELETE /api/projects/:id
router.delete('/:id', requireAuth, requireProjectAccess('admin'), (req, res) => {
  authStore.deleteProject(req.params.id);
  res.json({ ok: true });
});

// POST /api/projects/:id/members - Add member
router.post('/:id/members', requireAuth, requireProjectAccess('admin'), (req, res) => {
  const { userId, role } = req.body;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const user = authStore.getUser(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const project = authStore.getProject(req.params.id);
  const existingMember = (project.members || []).find(m => m.userId === userId);

  if (existingMember) {
    return res.status(409).json({ error: 'User is already a member' });
  }

  const validRoles = ['admin', 'editor', 'viewer'];
  const memberRole = validRoles.includes(role) ? role : 'viewer';

  const members = [
    ...(project.members || []),
    { userId, role: memberRole, joinedAt: new Date().toISOString() }
  ];

  const updated = authStore.updateProject(req.params.id, { members });
  res.json(updated);
});

// DELETE /api/projects/:id/members/:userId - Remove member
router.delete('/:id/members/:userId', requireAuth, requireProjectAccess('admin'), (req, res) => {
  const project = authStore.getProject(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Cannot remove the owner
  if (req.params.userId === project.ownerId) {
    return res.status(400).json({ error: 'Cannot remove the project owner' });
  }

  const members = (project.members || []).filter(m => m.userId !== req.params.userId);
  const updated = authStore.updateProject(req.params.id, { members });
  res.json(updated);
});

export default router;
