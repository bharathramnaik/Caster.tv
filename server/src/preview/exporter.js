/**
 * Template Exporter
 * Export templates in various formats for broadcast use:
 * - Static HTML
 * - Image (PNG/JPEG) via headless browser
 * - OBS Browser Source
 * - vMix
 * - Wirecast
 */

import { renderPreviewFragment } from './renderer.js';
import { processTemplate } from '../templateEngine/parser.js';
import { generateAnimationCSS } from '../templateEngine/animations.js';
import { getSampleDataForTemplate } from './sampleData.js';

/**
 * Export template as a static HTML file.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Data to render with
 * @param {Object} [opts] - Export options
 * @returns {string} Complete HTML document
 */
export function exportAsHTML(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const { width, height, title, background = 'transparent' } = opts;

  const processed = processTemplate(template, previewData);
  const canvas = processed.canvas || { width: 1920, height: 1080 };
  const css = generateExportCSS(processed, { background });
  const html = renderPreviewFragment(template, previewData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title || processed.name || 'Broadcast Template')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: ${background === 'transparent' ? 'transparent' : background}; }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

/**
 * Export template for OBS Browser Source.
 * Transparent background, sized to canvas dimensions.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Data to render with
 * @param {Object} [opts] - OBS options (width, height, fps)
 * @returns {string} HTML optimized for OBS
 */
export function exportForOBS(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const { width = 1920, height = 1080, fps = 30 } = opts;

  const processed = processTemplate(template, previewData);
  const css = generateExportCSS(processed, { background: 'transparent' });
  const html = renderPreviewFragment(template, previewData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
    /* OBS Browser Source - ${width}x${height} @ ${fps}fps */
    /* Template: ${escapeAttr(processed.name || '')} (${escapeAttr(processed.id || '')}) */
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

/**
 * Export template for vMix.
 * Similar to OBS but with vMix-specific metadata and URL parameters.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Data to render with
 * @param {Object} [opts] - vMix options
 * @returns {string} HTML for vMix
 */
export function exportForVMix(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const { width = 1920, height = 1080 } = opts;

  const processed = processTemplate(template, previewData);
  const css = generateExportCSS(processed, { background: 'transparent' });
  const html = renderPreviewFragment(template, previewData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; font-smoothing: antialiased; }
    /* vMix Input - ${width}x${height} */
    /* Template: ${escapeAttr(processed.name || '')} */
    /* Use URL parameters to update data dynamically */
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // vMix dynamic data support
    // Append ?param=value to the URL to update template data
    (function() {
      const params = new URLSearchParams(window.location.search);
      if (params.size > 0) {
        const dataEl = document.querySelector('[data-binding]');
        // Update elements with matching data attributes
        params.forEach((value, key) => {
          document.querySelectorAll('[data-binding="' + key + '"]').forEach(el => {
            el.textContent = value;
          });
        });
      }
    })();
  </script>
</body>
</html>`;
}

/**
 * Export template for Wirecast.
 * Self-contained HTML with Wirecast-compatible structure.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Data to render with
 * @param {Object} [opts] - Wirecast options
 * @returns {string} HTML for Wirecast
 */
export function exportForWirecast(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const { width = 1920, height = 1080 } = opts;

  const processed = processTemplate(template, previewData);
  const css = generateExportCSS(processed, { background: 'transparent' });
  const html = renderPreviewFragment(template, previewData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
    /* Wirecast HTML Title Source - ${width}x${height} */
    /* Template: ${escapeAttr(processed.name || '')} */
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Wirecast URL parameter support
    // wirecast:// URL parameters can update template data
    (function() {
      try {
        const hash = window.location.hash.substring(1);
        if (hash) {
          const params = JSON.parse(decodeURIComponent(hash));
          Object.entries(params).forEach(([key, value]) => {
            document.querySelectorAll('[data-binding="' + key + '"]').forEach(el => {
              el.textContent = value;
            });
          });
        }
      } catch (e) {}
    })();
  </script>
</body>
</html>`;
}

/**
 * Export template as image data (returns HTML that can be captured by a headless browser).
 * This generates an HTML page optimized for screenshot capture.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Data to render with
 * @param {Object} [opts] - Image options (format, quality, background)
 * @returns {string} HTML page optimized for image capture
 */
export function exportAsImageHTML(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const { background = '#000000' } = opts;

  const processed = processTemplate(template, previewData);
  const canvas = processed.canvas || { width: 1920, height: 1080 };
  const css = generateExportCSS(processed, { background });
  const html = renderPreviewFragment(template, previewData);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${canvas.width}px; height: ${canvas.height}px; overflow: hidden; background: ${background}; }
    ${css}
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

/**
 * Export multiple templates as a single gallery page.
 * @param {Object[]} templates - Array of template definitions
 * @param {Object} [opts] - Gallery options
 * @returns {string} HTML gallery page
 */
export function exportAsGallery(templates, opts = {}) {
  const { columns = 3, background = '#1a1a2e' } = opts;

  const cards = templates.map(template => {
    const previewData = getSampleDataForTemplate(template);
    const processed = processTemplate(template, previewData);
    const fragment = renderPreviewFragment(template, previewData);
    const canvas = processed.canvas || { width: 1920, height: 1080 };
    const aspect = canvas.height / canvas.width;
    const cardH = Math.round(280 * aspect);

    return `<div class="gallery-card">
      <div class="gallery-card-preview" style="height:${cardH}px;">${fragment}</div>
      <div class="gallery-card-info">
        <h3>${escapeHTML(processed.name)}</h3>
        <span>${escapeHTML(processed.category || '')} | ${escapeHTML(processed.sport || 'generic')}</span>
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Template Gallery</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: ${background}; color: #fff; padding: 24px; }
    .gallery-grid { display: grid; grid-template-columns: repeat(${columns}, 1fr); gap: 16px; }
    .gallery-card { background: rgba(255,255,255,0.04); border-radius: 8px; overflow: hidden; }
    .gallery-card-preview { position: relative; overflow: hidden; background: #111; }
    .gallery-card-info { padding: 10px 14px; }
    .gallery-card-info h3 { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
    .gallery-card-info span { font-size: 0.7rem; color: rgba(255,255,255,0.4); }
  </style>
</head>
<body>
  <div class="gallery-grid">${cards}</div>
</body>
</html>`;
}

// ── Internal CSS Generator ───────────────────────────────────────

function generateExportCSS(template, opts) {
  const { background = 'transparent' } = opts;
  const blocks = [];

  blocks.push(`.preview-canvas { position: relative; overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif; }`);
  blocks.push(`.el { box-sizing: border-box; }`);
  blocks.push(`.el-text { display: flex; align-items: center; padding: 8px 16px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-score { display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-timer { display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; font-family: 'Courier New', monospace; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-ticker { display: flex; align-items: center; background: rgba(0,0,0,0.7); color: #fff; padding: 8px 16px; font-size: 20px; overflow: hidden; }`);
  blocks.push(`.ticker-content { white-space: nowrap; animation: ticker-scroll 10s linear infinite; }`);
  blocks.push(`@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`);
  blocks.push(`.el-circle { border-radius: 50%; }`);

  const animCSS = generateAnimationCSS(template);
  if (animCSS) blocks.push(animCSS);

  return blocks.join('\n');
}

// ── Utilities ────────────────────────────────────────────────────

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
