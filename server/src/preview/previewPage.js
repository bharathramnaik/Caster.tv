/**
 * Preview Page Generator
 * Generates interactive HTML preview pages with data editing controls,
 * animation playback, and responsive scaling.
 */

import { processTemplate } from '../templateEngine/parser.js';
import { generateAnimationCSS, presets, resolveAnimation, animationToInlineStyle } from '../templateEngine/animations.js';
import { getSampleDataForTemplate, flattenData } from './sampleData.js';

/**
 * Generate a complete interactive preview page with editing controls.
 * @param {Object} template - Template definition
 * @param {Object} [data] - Optional custom data
 * @param {Object} [opts] - Preview options
 * @returns {string} Complete interactive HTML page
 */
export function generatePreviewPage(template, data = null, opts = {}) {
  const previewData = data || getSampleDataForTemplate(template);
  const {
    background = 'dark',
    showControls = true,
    showCode = false,
    resizable = false
  } = opts;

  const processed = processTemplate(template, previewData);
  const canvas = processed.canvas || { width: 1920, height: 1080 };
  const flatData = flattenData(previewData);
  const css = generatePreviewPageCSS(processed);
  const html = generateElements(processed);
  const animPresetsList = Object.keys(presets);

  const dataJSON = JSON.stringify(previewData, null, 2);
  const templateJSON = JSON.stringify(template, null, 2);

  const bgColor = background === 'dark' ? '#1a1a2e' : background === 'light' ? '#f0f0f0' : background;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview: ${escapeHTML(processed.name)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Teko:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
  <div class="preview-app">
    ${showControls ? generateControlsPanel(processed, flatData, animPresetsList) : ''}
    
    <div class="preview-main">
      <div class="preview-toolbar">
        <div class="toolbar-left">
          <h2 class="preview-title">${escapeHTML(processed.name)}</h2>
          <span class="preview-meta">${canvas.width}×${canvas.height} | ${escapeHTML(processed.category || 'general')}</span>
        </div>
        <div class="toolbar-right">
          <button class="btn btn-sm" id="btn-scale-fit" title="Fit to viewport">Fit</button>
          <button class="btn btn-sm" id="btn-scale-50" title="50% zoom">50%</button>
          <button class="btn btn-sm active" id="btn-scale-100" title="100% zoom">100%</button>
          <select id="bg-select" class="select-sm">
            <option value="dark" ${background === 'dark' ? 'selected' : ''}>Dark</option>
            <option value="light" ${background === 'light' ? 'selected' : ''}>Light</option>
            <option value="transparent" ${background === 'transparent' ? 'selected' : ''}>Transparent</option>
          </select>
          <button class="btn btn-sm" id="btn-grid" title="Toggle grid">Grid</button>
        </div>
      </div>

      <div class="preview-viewport" id="viewport">
        <div class="preview-canvas-wrap" id="canvas-wrap">
          <div class="preview-canvas" id="preview-canvas" style="${canvasStyles(canvas)}" data-template-id="${escapeAttr(processed.id || '')}">
            ${html}
          </div>
        </div>
      </div>

      ${showCode ? generateCodePanel(template, previewData) : ''}
    </div>
  </div>

  <script>
(function() {
  const previewData = ${dataJSON};
  const template = ${templateJSON};

  // ── Zoom Controls ────────────────────────────────────────
  const viewport = document.getElementById('viewport');
  const canvasWrap = document.getElementById('canvas-wrap');
  const previewCanvas = document.getElementById('preview-canvas');
  let currentScale = 1;
  const canvasW = ${canvas.width};
  const canvasH = ${canvas.height};

  function setScale(scale) {
    currentScale = scale;
    canvasWrap.style.transform = 'scale(' + scale + ')';
    document.querySelectorAll('[id^="btn-scale-"]').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-scale-' + Math.round(scale * 100));
    if (btn) btn.classList.add('active');
  }

  function fitToViewport() {
    const vw = viewport.clientWidth - 40;
    const vh = viewport.clientHeight - 40;
    const sx = vw / canvasW;
    const sy = vh / canvasH;
    setScale(Math.min(sx, sy, 1));
  }

  document.getElementById('btn-scale-fit').addEventListener('click', fitToViewport);
  document.getElementById('btn-scale-50').addEventListener('click', () => setScale(0.5));
  document.getElementById('btn-scale-100').addEventListener('click', () => setScale(1));

  // ── Background Toggle ────────────────────────────────────
  document.getElementById('bg-select').addEventListener('change', function() {
    const val = this.value;
    const bg = val === 'dark' ? '#1a1a2e' : val === 'light' ? '#f0f0f0' : val;
    previewCanvas.style.background = bg;
  });

  // ── Grid Toggle ──────────────────────────────────────────
  let gridVisible = false;
  document.getElementById('btn-grid').addEventListener('click', function() {
    gridVisible = !gridVisible;
    this.classList.toggle('active', gridVisible);
    if (gridVisible) {
      previewCanvas.style.backgroundImage = 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)';
      previewCanvas.style.backgroundSize = '50px 50px';
    } else {
      previewCanvas.style.backgroundImage = 'none';
    }
  });

  // ── Data Editor ──────────────────────────────────────────
  const dataEditor = document.getElementById('data-editor');
  if (dataEditor) {
    dataEditor.addEventListener('input', function(e) {
      if (e.target.classList.contains('data-field')) {
        const path = e.target.dataset.path;
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setNestedValue(previewData, path, value);
        refreshPreview();
      }
    });
  }

  function setNestedValue(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  function refreshPreview() {
    const fragment = renderPreviewFragment(previewCanvas, previewData);
    const temp = document.createElement('div');
    temp.innerHTML = fragment;
    const newCanvas = temp.querySelector('.preview-canvas');
    if (newCanvas) {
      previewCanvas.innerHTML = newCanvas.innerHTML;
    }
  }

  function renderPreviewFragment(container, data) {
    return container.outerHTML;
  }

  // ── Animation Playback ──────────────────────────────────
  window.replayAnimations = function() {
    previewCanvas.querySelectorAll('.el').forEach(el => {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
    });
  };

  // ── Export Buttons ──────────────────────────────────────
  window.exportAsHTML = function() {
    const fullHTML = document.documentElement.outerHTML;
    downloadFile(fullHTML, template.name + '-preview.html', 'text/html');
  };

  window.exportAsJSON = function() {
    downloadFile(JSON.stringify({ template, data: previewData }, null, 2), template.name + '-export.json', 'application/json');
  };

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Init
  fitToViewport();
  window.addEventListener('resize', fitToViewport);
})();
  </script>
</body>
</html>`;
}

// ── Controls Panel ───────────────────────────────────────────────

function generateControlsPanel(template, flatData, animPresetsList) {
  const dataFields = Object.entries(flatData).map(([path, value]) => {
    const inputType = typeof value === 'number' ? 'number' : 'text';
    const displayPath = path.split('.').pop();
    return `<div class="control-group">
      <label class="control-label" title="${escapeAttr(path)}">${escapeHTML(displayPath)}</label>
      <input class="data-field" type="${inputType}" data-path="${escapeAttr(path)}" value="${escapeAttr(String(value))}">
    </div>`;
  }).join('\n');

  return `<div class="controls-panel">
    <div class="controls-section">
      <h3 class="controls-heading">Data</h3>
      <div id="data-editor" class="controls-scroll">
        ${dataFields}
      </div>
    </div>
    <div class="controls-section">
      <h3 class="controls-heading">Animation</h3>
      <div class="controls-row">
        <button class="btn btn-primary btn-sm" onclick="replayAnimations()">Replay</button>
      </div>
      <div class="anim-presets">
        ${animPresetsList.map(p => `<span class="anim-preset-chip">${p}</span>`).join('')}
      </div>
    </div>
    <div class="controls-section">
      <h3 class="controls-heading">Export</h3>
      <div class="controls-row">
        <button class="btn btn-sm" onclick="exportAsHTML()">HTML</button>
        <button class="btn btn-sm" onclick="exportAsJSON()">JSON</button>
      </div>
    </div>
  </div>`;
}

// ── Code Panel ───────────────────────────────────────────────────

function generateCodePanel(template, data) {
  const dataJSON = JSON.stringify(data, null, 2);
  const templateJSON = JSON.stringify(template, null, 2);

  return `<div class="code-panel">
    <div class="code-tabs">
      <button class="code-tab active" data-tab="template">Template</button>
      <button class="code-tab" data-tab="data">Data</button>
    </div>
    <div class="code-content">
      <pre id="code-template" class="code-block active"><code>${escapeHTML(templateJSON)}</code></pre>
      <pre id="code-data" class="code-block"><code>${escapeHTML(dataJSON)}</code></pre>
    </div>
  </div>`;
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

// ── CSS ──────────────────────────────────────────────────────────

function generatePreviewPageCSS(template) {
  const blocks = [];

  blocks.push(`* { margin: 0; padding: 0; box-sizing: border-box; }`);
  blocks.push(`body { font-family: 'Inter', sans-serif; background: #0f0f1a; color: #e0e0e0; overflow: hidden; height: 100vh; }`);
  blocks.push(`.preview-app { display: flex; height: 100vh; }`);

  // Controls panel
  blocks.push(`.controls-panel { width: 280px; background: #1a1a2e; border-right: 1px solid rgba(255,255,255,0.08); display: flex; flex-direction: column; flex-shrink: 0; }`);
  blocks.push(`.controls-section { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }`);
  blocks.push(`.controls-heading { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); margin-bottom: 8px; }`);
  blocks.push(`.controls-scroll { max-height: 400px; overflow-y: auto; }`);
  blocks.push(`.control-group { margin-bottom: 6px; }`);
  blocks.push(`.control-label { display: block; font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }`);
  blocks.push(`.data-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: #fff; padding: 4px 8px; font-size: 0.8rem; font-family: 'Courier New', monospace; }`);
  blocks.push(`.data-field:focus { outline: none; border-color: #4ade80; }`);
  blocks.push(`.controls-row { display: flex; gap: 6px; }`);

  // Buttons
  blocks.push(`.btn { background: rgba(255,255,255,0.08); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }`);
  blocks.push(`.btn:hover { background: rgba(255,255,255,0.15); }`);
  blocks.push(`.btn-sm { padding: 4px 8px; font-size: 0.75rem; }`);
  blocks.push(`.btn-primary { background: #4ade80; color: #000; border-color: #4ade80; font-weight: 600; }`);
  blocks.push(`.btn-primary:hover { background: #22c55e; }`);
  blocks.push(`.btn.active { background: #4ade80; color: #000; border-color: #4ade80; }`);
  blocks.push(`.select-sm { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e0e0e0; border-radius: 4px; padding: 4px 8px; font-size: 0.75rem; }`);

  // Main preview area
  blocks.push(`.preview-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }`);
  blocks.push(`.preview-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #12121e; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }`);
  blocks.push(`.toolbar-left { display: flex; align-items: center; gap: 12px; }`);
  blocks.push(`.toolbar-right { display: flex; align-items: center; gap: 6px; }`);
  blocks.push(`.preview-title { font-size: 0.9rem; font-weight: 600; }`);
  blocks.push(`.preview-meta { font-size: 0.7rem; color: rgba(255,255,255,0.4); }`);

  // Viewport
  blocks.push(`.preview-viewport { flex: 1; display: flex; justify-content: center; align-items: center; overflow: auto; background: #0a0a14; }`);
  blocks.push(`.preview-canvas-wrap { transition: transform 0.2s ease; transform-origin: center center; }`);
  blocks.push(`.preview-canvas { position: relative; overflow: hidden; border-radius: 4px; box-shadow: 0 4px 24px rgba(0,0,0,0.5); }`);

  // Element styles
  blocks.push(`.el { box-sizing: border-box; }`);
  blocks.push(`.el-text { display: flex; align-items: center; padding: 8px 16px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-score { display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-timer { display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; font-family: 'Courier New', monospace; color: #fff; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-ticker { display: flex; align-items: center; background: rgba(0,0,0,0.7); color: #fff; padding: 8px 16px; font-size: 20px; overflow: hidden; }`);
  blocks.push(`.ticker-content { white-space: nowrap; animation: ticker-scroll 10s linear infinite; }`);
  blocks.push(`@keyframes ticker-scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`);
  blocks.push(`.el-circle { border-radius: 50%; }`);

  // Anim presets chips
  blocks.push(`.anim-presets { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }`);
  blocks.push(`.anim-preset-chip { background: rgba(255,255,255,0.05); border-radius: 4px; padding: 2px 6px; font-size: 0.6rem; color: rgba(255,255,255,0.4); }`);

  // Code panel
  blocks.push(`.code-panel { height: 200px; background: #12121e; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }`);
  blocks.push(`.code-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.06); }`);
  blocks.push(`.code-tab { background: transparent; border: none; color: rgba(255,255,255,0.4); padding: 8px 16px; cursor: pointer; font-size: 0.75rem; }`);
  blocks.push(`.code-tab.active { color: #4ade80; border-bottom: 2px solid #4ade80; }`);
  blocks.push(`.code-content { height: calc(100% - 36px); overflow: auto; }`);
  blocks.push(`.code-block { display: none; margin: 0; padding: 12px; font-size: 0.7rem; line-height: 1.5; color: rgba(255,255,255,0.7); }`);
  blocks.push(`.code-block.active { display: block; }`);

  // Animation CSS
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
