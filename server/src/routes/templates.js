/**
 * Template API Routes
 * GET /api/templates - List all templates (with filters)
 * GET /api/templates/categories - List template categories
 * GET /api/templates/:id - Get template by ID
 * POST /api/templates - Create new template
 * PUT /api/templates/:id - Update template
 * DELETE /api/templates/:id - Delete template
 * POST /api/templates/:id/duplicate - Duplicate template
 */
import { Router } from 'express';
import { nanoid } from 'nanoid';
import { authStore } from '../authStore.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validateTemplate } from '../templateEngine/validator.js';
import { TEMPLATE_CATEGORIES } from '../templateEngine/schema.js';

const router = Router();

// GET /api/templates/categories
router.get('/categories', (_req, res) => {
  res.json(TEMPLATE_CATEGORIES);
});

// GET /api/templates - List templates with filters
router.get('/', optionalAuth, (req, res) => {
  const { category, sport, search, isPublic, page = 1, limit = 50 } = req.query;
  const filters = {};
  if (category) filters.category = category;
  if (sport) filters.sport = sport;
  if (search) filters.search = search;
  if (isPublic !== undefined) filters.isPublic = isPublic === 'true';

  let templates = authStore.getAllTemplates(filters);

  // Non-admin users only see public templates or their own
  if (!req.user || req.user.role === 'operator') {
    templates = templates.filter(t => t.isPublic || (req.user && t.createdBy === req.user.id));
  }

  const total = templates.length;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  templates = templates.slice(offset, offset + parseInt(limit));

  res.json({ templates, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/templates/:id
router.get('/:id', optionalAuth, (req, res) => {
  const template = authStore.getTemplate(req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  if (!template.isPublic && (!req.user || (req.user.role === 'operator' && template.createdBy !== req.user.id))) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(template);
});

// POST /api/templates - Create template
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, category, sport, definition, isPublic, elements, canvas, animations } = req.body;

    if (!name) return res.status(400).json({ error: 'Template name is required' });

    const template = {
      id: `tpl_${nanoid(8)}`,
      name,
      version: '1.0.0',
      category: category || null,
      sport: sport || 'generic',
      definition: definition || { elements: elements || [], canvas: canvas || { width: 1920, height: 1080 }, animations: animations || {} },
      elements: elements || definition?.elements || [],
      canvas: canvas || definition?.canvas || { width: 1920, height: 1080 },
      animations: animations || definition?.animations || {},
      isPublic: isPublic || false,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const validation = validateTemplate({ ...template, elements: template.elements });
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid template', details: validation.errors });
    }

    authStore.createTemplate(template);
    res.status(201).json(template);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// PUT /api/templates/:id
router.put('/:id', requireAuth, (req, res) => {
  const existing = authStore.getTemplate(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Template not found' });

  if (existing.createdBy !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const updates = { ...req.body, id: existing.id, updatedAt: new Date().toISOString() };
  delete updates.createdBy;
  delete updates.createdAt;

  if (updates.definition || updates.elements) {
    const merged = { ...existing, ...updates };
    const validation = validateTemplate({ ...merged, elements: merged.elements || merged.definition?.elements || [] });
    if (!validation.valid) {
      return res.status(400).json({ error: 'Invalid template', details: validation.errors });
    }
  }

  const updated = authStore.updateTemplate(req.params.id, updates);
  res.json(updated);
});

// DELETE /api/templates/:id
router.delete('/:id', requireAuth, (req, res) => {
  const existing = authStore.getTemplate(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Template not found' });

  if (existing.createdBy !== req.user.id && req.user.role === 'operator') {
    return res.status(403).json({ error: 'Access denied' });
  }

  authStore.deleteTemplate(req.params.id);
  res.json({ ok: true });
});

// POST /api/templates/:id/duplicate
router.post('/:id/duplicate', requireAuth, (req, res) => {
  const existing = authStore.getTemplate(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Template not found' });

  const duplicate = {
    ...JSON.parse(JSON.stringify(existing)),
    id: `tpl_${nanoid(8)}`,
    name: req.body.name || `${existing.name} (Copy)`,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  authStore.createTemplate(duplicate);
  res.status(201).json(duplicate);
});

export default router;
