/**
 * Template Parser
 * Parses JSON template definitions, validates, and prepares for rendering.
 */

import { validateTemplate } from './validator.js';
import { resolveObject, extractBindings, evaluateCondition } from './variables.js';

/**
 * Parse a JSON template definition.
 * @param {Object|string} input - JSON template or JSON string
 * @returns {{ template: Object, errors: string[] }}
 */
export function parseTemplate(input) {
  let template;

  if (typeof input === 'string') {
    try {
      template = JSON.parse(input);
    } catch (e) {
      return { template: null, errors: [`Invalid JSON: ${e.message}`] };
    }
  } else {
    template = input;
  }

  const validation = validateTemplate(template);
  if (!validation.valid) {
    return { template: null, errors: validation.errors };
  }

  // Normalize defaults
  const normalized = normalizeTemplate(template);

  return { template: normalized, errors: [] };
}

/**
 * Normalize a parsed template, applying defaults.
 */
function normalizeTemplate(template) {
  const canvas = {
    width: 1920,
    height: 1080,
    background: 'transparent',
    ...template.canvas
  };

  const elements = (template.elements || []).map((el, idx) => ({
    id: el.id || `el_${idx}`,
    type: el.type,
    position: {
      x: 0,
      y: 0,
      width: 200,
      height: 50,
      zIndex: 0,
      ...el.position
    },
    style: el.style || null,
    animation: el.animation || null,
    binding: el.binding || null,
    condition: el.condition || null,
    content: el.content || '',
    src: el.src || null
  }));

  // Sort by zIndex
  elements.sort((a, b) => (a.position.zIndex || 0) - (b.position.zIndex || 0));

  return {
    id: template.id,
    name: template.name,
    version: template.version,
    category: template.category || null,
    sport: template.sport || null,
    canvas,
    elements,
    animations: template.animations || {}
  };
}

/**
 * Process a template with data, resolving bindings and filtering elements.
 * @param {Object} template - Parsed template
 * @param {Object} data - Dynamic data for variable resolution
 * @returns {Object} Processed template ready for rendering
 */
export function processTemplate(template, data = {}) {
  const processedElements = template.elements
    .filter(el => {
      if (el.condition) {
        return evaluateCondition(el.condition, data);
      }
      return true;
    })
    .map(el => {
      const resolved = resolveObject(el, data);
      return resolved;
    });

  return {
    ...template,
    elements: processedElements
  };
}

/**
 * Get all variable bindings used in a template.
 */
export function getTemplateBindings(template) {
  const bindings = new Set();

  function walk(obj) {
    if (obj == null) return;
    if (typeof obj === 'string') {
      extractBindings(obj).forEach(b => bindings.add(b));
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    for (const val of Object.values(obj)) {
      walk(val);
    }
  }

  walk(template);
  return [...bindings];
}

/**
 * Merge two templates, with the overlay overriding the base.
 */
export function mergeTemplates(base, overlay) {
  return {
    ...base,
    ...overlay,
    canvas: { ...base.canvas, ...overlay.canvas },
    elements: overlay.elements || base.elements,
    animations: {
      enter: { ...base.animations?.enter, ...overlay.animations?.enter },
      exit: { ...base.animations?.exit, ...overlay.animations?.exit },
      states: { ...base.animations?.states, ...overlay.animations?.states }
    }
  };
}
