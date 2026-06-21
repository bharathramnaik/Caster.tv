/**
 * Scene Composer
 * Composes multiple layers into a single broadcast output.
 */

import { getVisibleLayers } from './layerManager.js';
import { generateTransitionCSS } from './transitions.js';

/**
 * Compose a scene into HTML/CSS for broadcast output
 * @param {Object} scene - The scene to compose
 * @param {Object} [opts] - Composition options
 * @returns {string} Complete HTML document
 */
export function composeScene(scene, opts = {}) {
  const { includeStyles = true, standalone = true } = opts;
  const canvas = scene.canvas || { width: 1920, height: 1080, background: 'transparent' };
  const layers = getVisibleLayers(scene);

  const css = includeStyles ? generateSceneCSS(scene, layers) : '';
  const html = layers.map(layer => composeLayer(layer, canvas)).join('\n');

  if (standalone) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(scene.name)}</title>
  <style>${css}</style>
</head>
<body>
  <div class="scene-canvas" style="${canvasStyle(canvas)}">
    ${html}
  </div>
</body>
</html>`;
  }

  return `<style>${css}</style>
<div class="scene-canvas" style="${canvasStyle(canvas)}">
  ${html}
</div>`;
}

/**
 * Compose a scene into a self-contained HTML fragment
 * @param {Object} scene
 * @returns {string} HTML fragment
 */
export function composeFragment(scene) {
  return composeScene(scene, { standalone: false });
}

/**
 * Compose a single layer to HTML
 * @param {Object} layer - The layer object
 * @param {Object} canvas - Canvas dimensions
 * @returns {string} HTML string
 */
export function composeLayer(layer, canvas = { width: 1920, height: 1080 }) {
  const pos = layer.position || {};
  const opacity = layer.opacity ?? 1;
  const anim = layer.animation || {};

  const posCSS = [
    `position: absolute`,
    `left: ${pos.x || 0}px`,
    `top: ${pos.y || 0}px`,
    `width: ${pos.width || 200}px`,
    `height: ${pos.height || 50}px`,
    `z-index: ${layer.zIndex || 0}`,
    `opacity: ${opacity}`
  ].join('; ');

  const enterAnim = anim.enter ? `animation: ${anim.enter} ${anim.duration || 0.5}s ease-out forwards` : '';
  const allStyles = [posCSS, enterAnim].filter(Boolean).join('; ');

  const dataAttrs = Object.entries(layer.data || {})
    .map(([k, v]) => `data-${k}="${escapeAttr(typeof v === 'string' ? v : JSON.stringify(v))}"`)
    .join(' ');

  return `<div class="scene-layer layer-${layer.id} ${layer.groupId ? `group-${layer.groupId}` : ''}"
  style="${allStyles}"
  data-layer-id="${escapeAttr(layer.id)}"
  data-template-id="${escapeAttr(layer.templateId || '')}"
  ${dataAttrs}>
</div>`;
}

/**
 * Generate CSS for all animation presets used by scene layers
 * @param {Object} scene
 * @param {Object[]} layers
 * @returns {string} CSS string
 */
function generateSceneCSS(scene, layers) {
  const blocks = [];

  blocks.push(`.scene-canvas {
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', Arial, sans-serif;
  }`);

  blocks.push(`.scene-layer {
    box-sizing: border-box;
  }`);

  // Generate enter/exit animations used by layers
  const usedAnimations = new Set();
  for (const layer of layers) {
    if (layer.animation?.enter) usedAnimations.add(layer.animation.enter);
    if (layer.animation?.exit) usedAnimations.add(layer.animation.exit);
  }

  for (const animName of usedAnimations) {
    const css = generateAnimationKeyframes(animName);
    if (css) blocks.push(css);
  }

  return blocks.join('\n');
}

/**
 * Generate CSS keyframes for an animation preset name
 * @param {string} name - Animation preset name
 * @returns {string} CSS keyframes
 */
function generateAnimationKeyframes(name) {
  const presets = {
    'fade-in': { from: 'opacity: 0', to: 'opacity: 1' },
    'fade-out': { from: 'opacity: 1', to: 'opacity: 0' },
    'slide-in-left': { from: 'transform: translateX(-100%); opacity: 0', to: 'transform: translateX(0); opacity: 1' },
    'slide-in-right': { from: 'transform: translateX(100%); opacity: 0', to: 'transform: translateX(0); opacity: 1' },
    'slide-in-top': { from: 'transform: translateY(-100%); opacity: 0', to: 'transform: translateY(0); opacity: 1' },
    'slide-in-bottom': { from: 'transform: translateY(100%); opacity: 0', to: 'transform: translateY(0); opacity: 1' },
    'slide-out-left': { from: 'transform: translateX(0); opacity: 1', to: 'transform: translateX(-100%); opacity: 0' },
    'slide-out-right': { from: 'transform: translateX(0); opacity: 1', to: 'transform: translateX(100%); opacity: 0' },
    'scale-in': { from: 'transform: scale(0.5); opacity: 0', to: 'transform: scale(1); opacity: 1' },
    'scale-out': { from: 'transform: scale(1); opacity: 1', to: 'transform: scale(0.5); opacity: 0' },
    'bounce-in': { from: 'transform: scale(0); opacity: 0', to: 'transform: scale(1); opacity: 1' },
    'wipe-in-right': { from: 'clip-path: inset(0 100% 0 0); opacity: 0', to: 'clip-path: inset(0 0% 0 0); opacity: 1' },
    'wipe-out-left': { from: 'clip-path: inset(0 0% 0 0); opacity: 1', to: 'clip-path: inset(0 0 0 100%); opacity: 0' }
  };

  const preset = presets[name];
  if (!preset) return '';

  return `@keyframes ${name} {
    from { ${preset.from} }
    to { ${preset.to} }
  }`;
}

/**
 * Compose multiple scenes for transition preview
 * @param {Object} fromScene - Outgoing scene
 * @param {Object} toScene - Incoming scene
 * @param {string} transitionType - Transition type
 * @param {number} [duration] - Duration in seconds
 * @returns {string} HTML with both scenes
 */
export function composeTransitionPreview(fromScene, toScene, transitionType, duration) {
  const fromHTML = composeFragment(fromScene);
  const toHTML = composeFragment(toScene);
  const transitionCSS = generateTransitionCSS(transitionType, duration);

  return `<style>${transitionCSS}</style>
<div class="transition-preview">
  <div class="scene-from">${fromHTML}</div>
  <div class="scene-to">${toHTML}</div>
</div>`;
}

/**
 * Compose scene with custom dimensions (scaling)
 * @param {Object} scene
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @returns {string} Scaled HTML
 */
export function composeScaled(scene, targetWidth, targetHeight) {
  const canvas = scene.canvas || { width: 1920, height: 1080 };
  const scaleX = targetWidth / canvas.width;
  const scaleY = targetHeight / canvas.height;

  const composed = composeScene(scene, { standalone: false });

  return `<div style="width:${targetWidth}px;height:${targetHeight}px;overflow:hidden;">
  <div style="transform:scale(${scaleX},${scaleY});transform-origin:top left;width:${canvas.width}px;height:${canvas.height}px;">
    ${composed}
  </div>
</div>`;
}

/**
 * Generate canvas style string
 */
function canvasStyle(canvas) {
  const bg = canvas.background || 'transparent';
  return `width:${canvas.width}px;height:${canvas.height}px;background:${bg};`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
