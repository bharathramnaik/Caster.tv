import { Router } from 'express';
import { generateTemplate, parseDescription } from '../ai/templateGenerator.js';
import { getAllPresets, getPresetById } from '../ai/presets.js';
import { getSuggestions, getRecommendedTemplates, autoComplete } from '../ai/suggestions.js';

const router = Router();

router.post('/generate', (req, res) => {
  try {
    const { description } = req.body;
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }
    const result = generateTemplate(description);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate template', details: err.message });
  }
});

router.get('/presets', (req, res) => {
  try {
    const { sport, type } = req.query;
    const filters = {};
    if (sport) filters.sport = sport;
    if (type) filters.type = type;
    const presets = getAllPresets(filters);
    res.json({ presets, total: presets.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

router.get('/presets/:id', (req, res) => {
  try {
    const preset = getPresetById(req.params.id);
    if (!preset) return res.status(404).json({ error: 'Preset not found' });
    res.json(preset);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preset' });
  }
});

router.post('/suggest', (req, res) => {
  try {
    const { template, context } = req.body;
    const suggestions = getSuggestions(template, context || {});
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

router.post('/autocomplete', (req, res) => {
  try {
    const { partial } = req.body;
    const completions = autoComplete(partial || '');
    res.json({ completions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate completions' });
  }
});

router.get('/recommended', (req, res) => {
  try {
    const { sport, matchType } = req.query;
    const recommendations = getRecommendedTemplates(sport || 'cricket', matchType || 'general');
    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
