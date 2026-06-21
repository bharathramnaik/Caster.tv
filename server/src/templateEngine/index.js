/**
 * Template Engine - Main Entry Point
 * Provides a JSON-based template system for broadcast graphics.
 */

export { templateSchema, TEMPLATE_CATEGORIES, ELEMENT_TYPES } from './schema.js';
export { parseTemplate, processTemplate, getTemplateBindings, mergeTemplates } from './parser.js';
export {
  resolveVariables,
  resolveObject,
  registerFilter,
  hasBindings,
  extractBindings,
  evaluateCondition
} from './variables.js';
export { presets, resolveAnimation, generateAnimationCSS } from './animations.js';
export { renderTemplate, renderFragment, renderElement, exportStaticHTML } from './renderer.js';
export { validateTemplate, validateElement } from './validator.js';
