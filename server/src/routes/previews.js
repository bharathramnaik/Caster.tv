/**
 * Preview API Routes
 * GET /api/preview/template/:templateId - Preview template with sample data
 * POST /api/preview/template/:templateId - Preview with custom data
 * GET /api/preview/template/:templateId/page - Full interactive preview page
 * GET /api/preview/template/:templateId/fragment - Preview HTML fragment
 * GET /api/preview/template/:templateId/scaled - Preview scaled to target resolution
 * GET /api/preview/scene/:sceneId - Preview scene
 * GET /api/preview/export/:templateId/html - Export as static HTML
 * GET /api/preview/export/:templateId/obs - Export for OBS Browser Source
 * GET /api/preview/export/:templateId/vmix - Export for vMix
 * GET /api/preview/export/:templateId/wirecast - Export for Wirecast
 * GET /api/preview/gallery - Gallery of all templates
 * GET /api/preview/sports - List available sports with sample data
 * GET /api/preview/data/:sport - Get sample data for a sport
 */

import { Router } from 'express';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderPreview, renderPreviewFragment, renderPreviewScaled, renderGallery } from '../preview/renderer.js';
import { getSampleDataForTemplate, getSampleDataForSport, getAvailableSports, sampleData } from '../preview/sampleData.js';
import { generatePreviewPage } from '../preview/previewPage.js';
import { exportAsHTML, exportForOBS, exportForVMix, exportForWirecast } from '../preview/exporter.js';
import { authStore } from '../authStore.js';
import { optionalAuth } from '../middleware/auth.js';
import { composeScene } from '../sceneManager/composer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

const router = Router();

/**
 * Load all built-in templates from the templates directory.
 */
function loadBuiltinTemplates() {
  const templates = [];
  const sports = ['cricket', 'football', 'basketball', 'tennis', 'common'];

  for (const sport of sports) {
    try {
      const sportDir = join(TEMPLATES_DIR, sport);
      const files = readdirSync(sportDir).filter(f => f.endsWith('.json'));
      for (const file of files) {
        try {
          const content = readFileSync(join(sportDir, file), 'utf-8');
          const template = JSON.parse(content);
          templates.push(template);
        } catch (e) {
          console.warn(`Failed to load template ${sport}/${file}:`, e.message);
        }
      }
    } catch {
      // Directory might not exist
    }
  }

  return templates;
}

/**
 * Get a template by ID, checking both built-in and user-created templates.
 */
function getTemplateById(templateId) {
  // Check built-in templates first
  const builtins = loadBuiltinTemplates();
  const builtin = builtins.find(t => t.id === templateId);
  if (builtin) return builtin;

  // Check user-created templates
  const userTemplate = authStore.getTemplate(templateId);
  if (userTemplate) {
    // User templates store definition separately
    return {
      id: userTemplate.id,
      name: userTemplate.name,
      version: userTemplate.version,
      category: userTemplate.category,
      sport: userTemplate.sport,
      canvas: userTemplate.canvas || { width: 1920, height: 1080 },
      elements: userTemplate.elements || userTemplate.definition?.elements || [],
      animations: userTemplate.animations || userTemplate.definition?.animations || {}
    };
  }

  return null;
}

/**
 * Get all templates (built-in + user-created).
 */
function getAllTemplates() {
  const builtins = loadBuiltinTemplates();
  const userTemplates = authStore.getAllTemplates().map(t => ({
    id: t.id,
    name: t.name,
    version: t.version,
    category: t.category,
    sport: t.sport,
    canvas: t.canvas || { width: 1920, height: 1080 },
    elements: t.elements || t.definition?.elements || []
  }));
  return [...builtins, ...userTemplates];
}

// ── Routes ───────────────────────────────────────────────────────

/**
 * GET /api/preview/sports - List available sports
 */
router.get('/sports', (_req, res) => {
  res.json({
    sports: getAvailableSports(),
    sampleData
  });
});

/**
 * GET /api/preview/data/:sport - Get sample data for a sport
 */
router.get('/data/:sport', (req, res) => {
  const sport = req.params.sport;
  const data = getSampleDataForSport(sport);
  res.json(data);
});

/**
 * GET /api/preview/template/:templateId - Preview template with sample data
 * Query params: background (dark|light|transparent), format (html|json|fragment)
 */
router.get('/template/:templateId', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const { background = 'dark', format = 'html' } = req.query;

  try {
    if (format === 'fragment') {
      const fragment = renderPreviewFragment(template, null);
      res.setHeader('Content-Type', 'text/html');
      return res.send(fragment);
    }
    if (format === 'json') {
      const data = getSampleDataForTemplate(template);
      return res.json({ template, data });
    }

    const html = renderPreview(template, null, { background });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

/**
 * POST /api/preview/template/:templateId - Preview with custom data
 */
router.post('/template/:templateId', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const { data, background = 'dark', format = 'html' } = req.body;

  try {
    if (format === 'fragment') {
      const fragment = renderPreviewFragment(template, data);
      res.setHeader('Content-Type', 'text/html');
      return res.send(fragment);
    }

    const html = renderPreview(template, data, { background });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Preview error:', err);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

/**
 * GET /api/preview/template/:templateId/page - Full interactive preview page
 */
router.get('/template/:templateId/page', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const { background = 'dark', showGrid = 'false', showCode = 'false' } = req.query;

  try {
    const html = generatePreviewPage(template, null, {
      background,
      showGrid: showGrid === 'true',
      showCode: showCode === 'true',
      showControls: true
    });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Preview page error:', err);
    res.status(500).json({ error: 'Failed to generate preview page' });
  }
});

/**
 * GET /api/preview/template/:templateId/fragment - Preview HTML fragment
 */
router.get('/template/:templateId/fragment', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  try {
    const fragment = renderPreviewFragment(template);
    res.setHeader('Content-Type', 'text/html');
    res.send(fragment);
  } catch (err) {
    console.error('Fragment error:', err);
    res.status(500).json({ error: 'Failed to generate fragment' });
  }
});

/**
 * GET /api/preview/template/:templateId/scaled - Preview scaled to target resolution
 * Query params: width, height
 */
router.get('/template/:templateId/scaled', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const width = parseInt(req.query.width) || 640;
  const height = parseInt(req.query.height) || 360;

  try {
    const html = renderPreviewScaled(template, width, height);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Scaled preview error:', err);
    res.status(500).json({ error: 'Failed to generate scaled preview' });
  }
});

/**
 * GET /api/preview/scene/:sceneId - Preview scene
 */
router.get('/scene/:sceneId', optionalAuth, (req, res) => {
  const scene = authStore.getScene(req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  try {
    const html = composeScene(scene, { standalone: true });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Scene preview error:', err);
    res.status(500).json({ error: 'Failed to generate scene preview' });
  }
});

// ── Export Routes ────────────────────────────────────────────────

/**
 * GET /api/preview/export/:templateId/html - Export as static HTML
 */
router.get('/export/:templateId/html', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const { background = 'transparent' } = req.query;

  try {
    const html = exportAsHTML(template, null, { background });
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${template.id || 'template'}.html"`);
    res.send(html);
  } catch (err) {
    console.error('HTML export error:', err);
    res.status(500).json({ error: 'Failed to export HTML' });
  }
});

/**
 * GET /api/preview/export/:templateId/obs - Export for OBS Browser Source
 */
router.get('/export/:templateId/obs', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const width = parseInt(req.query.width) || 1920;
  const height = parseInt(req.query.height) || 1080;

  try {
    const html = exportForOBS(template, null, { width, height });
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${template.id || 'template'}-obs.html"`);
    res.send(html);
  } catch (err) {
    console.error('OBS export error:', err);
    res.status(500).json({ error: 'Failed to export for OBS' });
  }
});

/**
 * GET /api/preview/export/:templateId/vmix - Export for vMix
 */
router.get('/export/:templateId/vmix', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const width = parseInt(req.query.width) || 1920;
  const height = parseInt(req.query.height) || 1080;

  try {
    const html = exportForVMix(template, null, { width, height });
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${template.id || 'template'}-vmix.html"`);
    res.send(html);
  } catch (err) {
    console.error('vMix export error:', err);
    res.status(500).json({ error: 'Failed to export for vMix' });
  }
});

/**
 * GET /api/preview/export/:templateId/wirecast - Export for Wirecast
 */
router.get('/export/:templateId/wirecast', optionalAuth, (req, res) => {
  const template = getTemplateById(req.params.templateId);
  if (!template) return res.status(404).json({ error: 'Template not found' });

  const width = parseInt(req.query.width) || 1920;
  const height = parseInt(req.query.height) || 1080;

  try {
    const html = exportForWirecast(template, null, { width, height });
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Disposition', `attachment; filename="${template.id || 'template'}-wirecast.html"`);
    res.send(html);
  } catch (err) {
    console.error('Wirecast export error:', err);
    res.status(500).json({ error: 'Failed to export for Wirecast' });
  }
});

/**
 * GET /api/preview/gallery - Gallery of all templates
 */
router.get('/gallery', optionalAuth, (req, res) => {
  const { background = 'dark', columns = 3 } = req.query;

  try {
    const templates = getAllTemplates();
    const html = renderGallery(templates, { background, columns: parseInt(columns) || 3 });
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (err) {
    console.error('Gallery error:', err);
    res.status(500).json({ error: 'Failed to generate gallery' });
  }
});

/**
 * GET /api/preview/list - List all templates available for preview
 */
router.get('/list', optionalAuth, (_req, res) => {
  try {
    const templates = getAllTemplates();
    const summaries = templates.map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      sport: t.sport,
      canvas: t.canvas || { width: 1920, height: 1080 },
      elementCount: (t.elements || []).length
    }));
    res.json({ templates: summaries, total: summaries.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

export default router;
