/**
 * Preview Renderer
 * Renders templates with sample data for live preview, supporting all template types
 * and dark/light background modes.
 */

import { processTemplate } from '../templateEngine/parser.js';
import { generateAnimationCSS, resolveAnimation, animationToInlineStyle } from '../templateEngine/animations.js';
import { getSampleDataForTemplate } from './sampleData.js';

/**
 * Render a template as a preview HTML string with sample data.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Optional custom data (defaults to sample data)
 * @param {Object} [opts] - Preview options
 * @returns {string} Complete HTML document for preview
 */
export function renderPreview(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const { background = 'dark', scale = 1, showGrid = false, interactive = true } = opts;

  const processed = processTemplate(template, previewData);
  const css = generatePreviewCSS(processed, { background, scale, showGrid });
  const html = generateElements(processed);

  const bgColor = background === 'dark' ? '#1a1a2e' : background === 'light' ? '#f0f0f0' : background;
  const canvas = processed.canvas || { width: 1920, height: 1080 };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${escapeHTML(processed.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${css}</style>
  ${interactive ? generateInteractiveJS(processed) : ''}
</head>
<body>
  <div class="preview-wrapper">
    <div class="preview-canvas" style="${canvasStyles(canvas)}" data-template-id="${escapeAttr(processed.id || '')}">
      ${html}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Render a template as a self-contained HTML fragment (no doctype/head).
 * @param {Object} template - Template definition
 * @param {Object} [data] - Optional custom data
 * @returns {string} HTML fragment
 */
export function renderPreviewFragment(template, data = null) {
  const previewData = data || getSampleDataForTemplate(template);
  const processed = processTemplate(template, previewData);
  const css = generatePreviewCSS(processed, { background: 'transparent', scale: 1, showGrid: false });
  const html = generateElements(processed);
  const canvas = processed.canvas || { width: 1920, height: 1080 };

  return `<style>${css}</style>
<div class="preview-canvas" style="${canvasStyles(canvas)}" data-template-id="${escapeAttr(processed.id || '')}">
  ${html}
</div>`;
}

/**
 * Render a template scaled to fit a target resolution.
 * @param {Object} template - Template definition
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @param {Object} [data] - Optional custom data
 * @returns {string} Scaled HTML fragment
 */
export function renderPreviewScaled(template, targetWidth, targetHeight, data = null) {
  const previewData = data || getSampleDataForTemplate(template);
  const processed = processTemplate(template, previewData);
  const canvas = processed.canvas || { width: 1920, height: 1080 };

  const scaleX = targetWidth / canvas.width;
  const scaleY = targetHeight / canvas.height;

  const fragment = renderPreviewFragment(template, data);

  return `<div style="width:${targetWidth}px;height:${targetHeight}px;overflow:hidden;position:relative;">
  <div style="transform:scale(${scaleX},${scaleY});transform-origin:top left;width:${canvas.width}px;height:${canvas.height}px;position:absolute;top:0;left:0;">
    ${fragment}
  </div>
</div>`;
}

/**
 * Render multiple template previews for a gallery view.
 * @param {Object[]} templates - Array of template definitions
 * @param {Object} [opts] - Gallery options
 * @returns {string} HTML gallery page
 */
export function renderGallery(templates, opts = {}) {
  const { background = 'dark', columns = 3 } = opts;
  const bgColor = background === 'dark' ? '#1a1a2e' : background === 'light' ? '#f0f0f0' : background;

  const cards = templates.map(template => {
    const fragment = renderPreviewFragment(template);
    const canvas = template.canvas || { width: 1920, height: 1080 };
    const aspectRatio = canvas.height / canvas.width;
    const cardHeight = Math.round(300 * aspectRatio);

    return `<div class="gallery-card" data-template-id="${escapeAttr(template.id)}" data-category="${escapeAttr(template.category || '')}" data-sport="${escapeAttr(template.sport || '')}">
      <div class="gallery-card-preview" style="height:${cardHeight}px;">
        ${fragment}
      </div>
      <div class="gallery-card-info">
        <h3>${escapeHTML(template.name)}</h3>
        <span class="gallery-card-meta">${escapeHTML(template.category || 'general')} | ${escapeHTML(template.sport || 'generic')}</span>
        <span class="gallery-card-size">${canvas.width}×${canvas.height}</span>
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Gallery</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: ${bgColor}; color: #fff; padding: 24px; }
    .gallery-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 20px; max-width: 1400px; margin: 0 auto; }
    .gallery-card { background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; transition: transform 0.2s; }
    .gallery-card:hover { transform: translateY(-2px); }
    .gallery-card-preview { position: relative; overflow: hidden; background: #111; }
    .gallery-card-info { padding: 12px 16px; }
    .gallery-card-info h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 4px; }
    .gallery-card-meta { font-size: 0.75rem; color: rgba(255,255,255,0.5); display: block; }
    .gallery-card-size { font-size: 0.65rem; color: rgba(255,255,255,0.3); display: block; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="gallery-grid">
    ${cards}
  </div>
</body>
</html>`;
}

// ── Element Renderers ────────────────────────────────────────────

function generateElements(template) {
  if (!template.elements || template.elements.length === 0) return '';
  const canvas = template.canvas || { width: 1920, height: 1080 };
  return template.elements.map(el => renderElement(el, canvas)).join('\n');
}

function renderElement(element, canvas) {
  const pos = element.position || {};
  const style = element.style || {};
  const anim = resolveAnimation(element.animation);
  const animStyle = anim ? animationToInlineStyle(anim) : '';

  const posCSS = [
    `position: absolute`,
    `left: ${pos.x || 0}px`,
    `top: ${pos.y || 0}px`,
    `width: ${pos.width || 200}px`,
    `height: ${pos.height || 50}px`,
    `z-index: ${pos.zIndex || 0}`
  ].join('; ');

  const styleCSS = styleObjectToCSS(style);

  switch (element.type) {
    case 'text':
      return `<div class="el el-text el-${element.id}" style="${posCSS};${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}">
        ${escapeHTML(element.content || '')}
      </div>`;
    case 'image':
      return `<div class="el el-image el-${element.id}" style="${posCSS};${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}">
        <img src="${escapeAttr(element.src || '')}" style="width:100%;height:100%;object-fit:cover;" alt="">
      </div>`;
    case 'shape':
    case 'rect':
    case 'circle':
      return `<div class="el el-shape el-${element.id} el-${element.type}" style="${posCSS};${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}"></div>`;
    case 'score':
      return `<div class="el el-score el-${element.id}" style="${posCSS};${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}">
        ${escapeHTML(element.content || '{{score}}')}
      </div>`;
    case 'timer':
      return `<div class="el el-timer el-${element.id}" style="${posCSS};${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}">
        ${escapeHTML(element.content || '00:00')}
      </div>`;
    case 'ticker':
      return `<div class="el el-ticker el-${element.id}" style="${posCSS};overflow:hidden;${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}">
        <div class="ticker-content">${escapeHTML(element.content || '')}</div>
      </div>`;
    default:
      return `<div class="el el-${element.id}" style="${posCSS};${styleCSS};${animStyle}" data-binding="${escapeAttr(element.binding || '')}">
        ${escapeHTML(element.content || '')}
      </div>`;
  }
}

// ── CSS Generation ───────────────────────────────────────────────

function generatePreviewCSS(template, opts) {
  const { background = 'dark', scale = 1, showGrid = false } = opts;
  const blocks = [];

  blocks.push(`* { margin: 0; padding: 0; box-sizing: border-box; }`);
  blocks.push(`body { display: flex; justify-content: center; align-items: center; min-height: 100vh; overflow: auto; }`);
  blocks.push(`.preview-wrapper { display: flex; justify-content: center; align-items: center; padding: 20px; }`);

  if (scale !== 1) {
    blocks.push(`.preview-canvas { transform: scale(${scale}); transform-origin: center center; }`);
  }

  if (showGrid) {
    blocks.push(`.preview-canvas::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
      z-index: 9999;
    }`);
  }

  // Base canvas styles
  blocks.push(`.preview-canvas {
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', Arial, sans-serif;
    border-radius: 4px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.3);
  }`);

  blocks.push(`.el { box-sizing: border-box; }`);

  blocks.push(`.el-text {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    color: #ffffff;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }`);

  blocks.push(`.el-score {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  }`);

  blocks.push(`.el-timer {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36px;
    font-weight: bold;
    font-family: 'Courier New', monospace;
    color: #ffffff;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
  }`);

  blocks.push(`.el-ticker {
    display: flex;
    align-items: center;
    background: rgba(0,0,0,0.7);
    color: #ffffff;
    padding: 8px 16px;
    font-size: 20px;
  }`);

  blocks.push(`.ticker-content {
    white-space: nowrap;
    animation: ticker-scroll 10s linear infinite;
  }`);

  blocks.push(`@keyframes ticker-scroll {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }`);

  blocks.push(`.el-circle {
    border-radius: 50%;
  }`);

  const animCSS = generateAnimationCSS(template);
  if (animCSS) blocks.push(animCSS);

  return blocks.join('\n');
}

function canvasStyles(canvas) {
  const c = canvas || { width: 1920, height: 1080 };
  const bg = c.background || 'transparent';
  return `width:${c.width}px;height:${c.height}px;background:${bg};`;
}

// ── Interactive JS ───────────────────────────────────────────────

function generateInteractiveJS(template) {
  return `<script>
(function() {
  const canvas = document.querySelector('.preview-canvas');
  if (!canvas) return;

  // Add hover highlight to elements
  canvas.querySelectorAll('.el').forEach(el => {
    el.addEventListener('mouseenter', function() {
      this.style.outline = '2px solid #4ade80';
      this.style.outlineOffset = '-1px';
      const binding = this.getAttribute('data-binding');
      if (binding) {
        this.title = 'Binding: ' + binding;
      }
    });
    el.addEventListener('mouseleave', function() {
      this.style.outline = '';
      this.style.outlineOffset = '';
      this.title = '';
    });
  });
})();
</script>`;
}

// ── Utilities ────────────────────────────────────────────────────

function styleObjectToCSS(obj) {
  if (!obj || typeof obj !== 'object') return '';
  return Object.entries(obj)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');
}

function camelToKebab(str) {
  return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
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
