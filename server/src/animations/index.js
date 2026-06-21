/**
 * Animation Library
 * Professional broadcast-quality animation system for WASP3D-style graphics.
 */

// ── Presets ─────────────────────────────────────────────────────────
export {
  animationPresets,
  getPresetNames,
  getPreset,
  getPresetsByCategory
} from './presets.js';

// ── Transitions ─────────────────────────────────────────────────────
export {
  transitionPresets,
  getTransitionNames,
  getTransition,
  getTransitionsByType,
  generateTransitionCSS as generateTransitionCSSFromPreset
} from './transitions.js';

// ── Generator ───────────────────────────────────────────────────────
export {
  generateKeyframes,
  generateMultiStepKeyframes,
  generateInlineStyle,
  generateAnimationBlock,
  generateMultipleAnimations,
  generateJSAnimationCode,
  generateTransitionCSS,
  combineAnimations
} from './generator.js';

// ── Composer ────────────────────────────────────────────────────────
export {
  composeAnimations,
  composeElementAnimation,
  createStaggerSequence,
  createParallelAnimations,
  createSequentialAnimations,
  createTimeline,
  timelineToCSS,
  timelineToJSON,
  applyAnimationToHTML
} from './composer.js';

// ── Preview ─────────────────────────────────────────────────────────
export {
  generateAnimationPreview,
  generateTransitionPreview,
  generateGalleryPreview,
  generateAllPreviews,
  getAnimationList
} from './preview.js';

// ── Imports for helper functions ─────────────────────────────────────
import { generateKeyframes, generateInlineStyle as genInlineStyle } from './generator.js';
import { getPresetNames } from './presets.js';
import { getTransitionNames } from './transitions.js';
import { composeAnimations } from './composer.js';

/**
 * Quick helper to apply an animation to an element.
 * @param {string} presetName - Animation preset name
 * @param {Object} options - Animation options
 * @returns {{ css: string, inlineStyle: string }}
 */
export function applyAnimation(presetName, options = {}) {
  const keyframes = generateKeyframes({ preset: presetName, ...options });
  if (!keyframes) return { css: '', inlineStyle: '' };

  return {
    css: keyframes.css,
    inlineStyle: genInlineStyle(keyframes)
  };
}

/**
 * Get all available animation and transition names.
 * @returns {{ animations: string[], transitions: string[] }}
 */
export function getAvailableAnimations() {
  return {
    animations: getPresetNames(),
    transitions: getTransitionNames()
  };
}

/**
 * Create a complete animation package for a scene.
 * @param {Array<Object>} elements - Array of element definitions
 * @param {Object} options - Scene options
 * @returns {{ css: string, timeline: Object, totalDuration: number }}
 */
export function createSceneAnimation(elements, options = {}) {
  return composeAnimations(elements, options);
}
