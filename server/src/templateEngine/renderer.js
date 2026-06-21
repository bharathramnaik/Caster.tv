/**
 * Template Renderer
 * Generates HTML/CSS from template + data for server-side rendering.
 */

import { processTemplate } from './parser.js';
import { resolveVariables, resolveObject } from './variables.js';
import { resolveAnimation, animationToInlineStyle, generateAnimationCSS } from './animations.js';

/**
 * Render a template to a complete HTML document.
 */
export function renderTemplate(template, data = {}) {
  const processed = processTemplate(template, data);
  const css = generateCSS(processed);
  const html = generateElements(processed);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(processed.name)}</title>
  <style>${css}</style>
</head>
<body>
  <div class="broadcast-canvas" style="${canvasStyles(processed.canvas)}">
    ${html}
  </div>
</body>
</html>`;
}

/**
 * Render a template to a self-contained HTML fragment (no doctype/head).
 */
export function renderFragment(template, data = {}) {
  const processed = processTemplate(template, data);
  const css = generateCSS(processed);
  const html = generateElements(processed);

  return `<style>${css}</style>
<div class="broadcast-canvas" style="${canvasStyles(processed.canvas)}">
  ${html}
</div>`;
}

/**
 * Generate HTML for all elements in a processed template.
 */
function generateElements(template) {
  if (!template.elements || template.elements.length === 0) return '';
  const canvas = template.canvas || { width: 1920, height: 1080 };
  return template.elements.map(el => renderElement(el, canvas)).join('\n');
}

/**
 * Render a single element to HTML.
 */
export function renderElement(element, canvas = { width: 1920, height: 1080 }) {
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
  const bindingCSS = element.binding ? `data-binding="${escapeAttr(element.binding)}` : '';

  switch (element.type) {
    case 'text':
      return renderTextElement(element, posCSS, styleCSS, animStyle, bindingCSS);
    case 'image':
      return renderImageElement(element, posCSS, styleCSS, animStyle, bindingCSS);
    case 'shape':
      return renderShapeElement(element, posCSS, styleCSS, animStyle, bindingCSS);
    case 'score':
      return renderScoreElement(element, posCSS, styleCSS, animStyle, bindingCSS);
    case 'timer':
      return renderTimerElement(element, posCSS, styleCSS, animStyle, bindingCSS);
    case 'ticker':
      return renderTickerElement(element, posCSS, styleCSS, animStyle, bindingCSS);
    default:
      return `<div class="el el-${element.id}" style="${posCSS};${styleCSS};${animStyle}" ${bindingCSS}>
        ${escapeHTML(element.content || '')}
      </div>`;
  }
}

// ── Element Renderers ────────────────────────────────────────────

function renderTextElement(el, posCSS, styleCSS, animStyle, bindingCSS) {
  const content = el.content || '';
  return `<div class="el el-text el-${el.id}" style="${posCSS};${styleCSS};${animStyle}" ${bindingCSS}>
    ${escapeHTML(content)}
  </div>`;
}

function renderImageElement(el, posCSS, styleCSS, animStyle, bindingCSS) {
  const src = el.src || '';
  return `<div class="el el-image el-${el.id}" style="${posCSS};${styleCSS};${animStyle}" ${bindingCSS}>
    <img src="${escapeAttr(src)}" style="width:100%;height:100%;object-fit:cover;" alt="">
  </div>`;
}

function renderShapeElement(el, posCSS, styleCSS, animStyle, bindingCSS) {
  return `<div class="el el-shape el-${el.id}" style="${posCSS};${styleCSS};${animStyle}" ${bindingCSS}></div>`;
}

function renderScoreElement(el, posCSS, styleCSS, animStyle, bindingCSS) {
  const content = el.content || '{{score}}';
  return `<div class="el el-score el-${el.id}" style="${posCSS};${styleCSS};${animStyle}" ${bindingCSS}>
    ${escapeHTML(content)}
  </div>`;
}

function renderTimerElement(el, posCSS, styleCSS, animStyle, bindingCSS) {
  const content = el.content || '00:00';
  return `<div class="el el-timer el-${el.id}" style="${posCSS};${styleCSS};${animStyle}" ${bindingCSS}>
    ${escapeHTML(content)}
  </div>`;
}

function renderTickerElement(el, posCSS, styleCSS, animStyle, bindingCSS) {
  const content = el.content || '';
  return `<div class="el el-ticker el-${el.id}" style="${posCSS};overflow:hidden;${styleCSS};${animStyle}" ${bindingCSS}>
    <div class="ticker-content">${escapeHTML(content)}</div>
  </div>`;
}

// ── CSS Generation ───────────────────────────────────────────────

function generateCSS(template) {
  const blocks = [];

  // Base canvas styles
  blocks.push(`.broadcast-canvas {
    position: relative;
    overflow: hidden;
    font-family: 'Segoe UI', Arial, sans-serif;
  }`);

  // Element base styles
  blocks.push(`.el {
    box-sizing: border-box;
  }`);

  // Type-specific defaults
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

  // Animation keyframes from template
  const animCSS = generateAnimationCSS(template);
  if (animCSS) blocks.push(animCSS);

  return blocks.join('\n');
}

function canvasStyles(canvas) {
  const c = canvas || { width: 1920, height: 1080 };
  const bg = c.background || 'transparent';
  return `width:${c.width}px;height:${c.height}px;background:${bg};`;
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

/**
 * Generate a static HTML export string for a template with data.
 */
export function exportStaticHTML(template, data = {}) {
  return renderTemplate(template, data);
}
