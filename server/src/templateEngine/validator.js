/**
 * Template Validator
 * Validates template JSON structure, required fields, element positions, etc.
 */

import { templateSchema, TEMPLATE_CATEGORIES, ELEMENT_TYPES } from './schema.js';

/**
 * Validate a template object against the schema.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateTemplate(template) {
  const errors = [];

  if (!template || typeof template !== 'object') {
    return { valid: false, errors: ['Template must be a non-null object'] };
  }

  // Required top-level fields
  for (const field of templateSchema.required) {
    if (template[field] == null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Type checks
  if (template.id != null && typeof template.id !== 'string') {
    errors.push('Field "id" must be a string');
  }
  if (template.name != null && typeof template.name !== 'string') {
    errors.push('Field "name" must be a string');
  }
  if (template.version != null && typeof template.version !== 'string') {
    errors.push('Field "version" must be a string');
  }

  // Category validation
  if (template.category != null && !TEMPLATE_CATEGORIES.includes(template.category)) {
    errors.push(`Invalid category "${template.category}". Must be one of: ${TEMPLATE_CATEGORIES.join(', ')}`);
  }

  // Canvas validation
  if (template.canvas != null) {
    if (typeof template.canvas !== 'object') {
      errors.push('Field "canvas" must be an object');
    } else {
      if (template.canvas.width != null && (typeof template.canvas.width !== 'number' || template.canvas.width <= 0)) {
        errors.push('Canvas width must be a positive number');
      }
      if (template.canvas.height != null && (typeof template.canvas.height !== 'number' || template.canvas.height <= 0)) {
        errors.push('Canvas height must be a positive number');
      }
    }
  }

  // Elements validation
  if (!Array.isArray(template.elements)) {
    errors.push('Field "elements" must be an array');
  } else {
    const elementIds = new Set();
    const canvasW = template.canvas?.width || 1920;
    const canvasH = template.canvas?.height || 1080;

    for (let i = 0; i < template.elements.length; i++) {
      const el = template.elements[i];
      const prefix = `elements[${i}]`;

      if (!el || typeof el !== 'object') {
        errors.push(`${prefix}: Element must be an object`);
        continue;
      }

      // Required element fields
      if (!el.id) errors.push(`${prefix}: Missing required field "id"`);
      if (!el.type) errors.push(`${prefix}: Missing required field "type"`);
      if (!el.position) errors.push(`${prefix}: Missing required field "position"`);

      // Unique IDs
      if (el.id) {
        if (elementIds.has(el.id)) {
          errors.push(`${prefix}: Duplicate element id "${el.id}"`);
        }
        elementIds.add(el.id);
      }

      // Type validation
      if (el.type && !ELEMENT_TYPES.includes(el.type)) {
        errors.push(`${prefix}: Invalid type "${el.type}". Must be one of: ${ELEMENT_TYPES.join(', ')}`);
      }

      // Position validation
      if (el.position) {
        const pos = el.position;
        if (typeof pos.x !== 'number') errors.push(`${prefix}: position.x must be a number`);
        if (typeof pos.y !== 'number') errors.push(`${prefix}: position.y must be a number`);
        if (typeof pos.width !== 'number' || pos.width < 0) errors.push(`${prefix}: position.width must be a non-negative number`);
        if (typeof pos.height !== 'number' || pos.height < 0) errors.push(`${prefix}: position.height must be a non-negative number`);

        // Bounds check (warning, not error)
        if (pos.x + pos.width > canvasW) {
          errors.push(`${prefix}: Element extends beyond canvas width (${pos.x + pos.width} > ${canvasW})`);
        }
        if (pos.y + pos.height > canvasH) {
          errors.push(`${prefix}: Element extends beyond canvas height (${pos.y + pos.height} > ${canvasH})`);
        }
      }
    }
  }

  // Circular reference check (for element bindings referencing other elements)
  if (Array.isArray(template.elements)) {
    const refs = new Map();
    for (const el of template.elements) {
      if (el.binding) {
        refs.set(el.id, el.binding);
      }
    }
    // Simple cycle detection: follow references and check for loops
    for (const [id, binding] of refs) {
      const visited = new Set();
      let current = id;
      while (refs.has(current)) {
        if (visited.has(current)) {
          errors.push(`Circular reference detected involving element "${id}"`);
          break;
        }
        visited.add(current);
        const nextBinding = refs.get(current);
        const nextId = nextBinding.split('.')[0];
        current = nextId;
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an individual element.
 */
export function validateElement(element, canvasWidth = 1920, canvasHeight = 1080) {
  const errors = [];

  if (!element || typeof element !== 'object') {
    return { valid: false, errors: ['Element must be an object'] };
  }

  if (!element.id) errors.push('Missing required field "id"');
  if (!element.type) errors.push('Missing required field "type"');
  if (!element.position) errors.push('Missing required field "position"');

  if (element.type && !ELEMENT_TYPES.includes(element.type)) {
    errors.push(`Invalid type "${element.type}"`);
  }

  if (element.position) {
    const pos = element.position;
    if (pos.width > canvasWidth) errors.push('Element width exceeds canvas');
    if (pos.height > canvasHeight) errors.push('Element height exceeds canvas');
    if (pos.x < 0 || pos.y < 0) errors.push('Element position cannot be negative');
  }

  return { valid: errors.length === 0, errors };
}
