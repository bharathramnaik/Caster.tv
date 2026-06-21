/**
 * Animation Preview
 * Generates preview HTML for animation visualization.
 */

import { animationPresets, getPresetNames } from './presets.js';
import { transitionPresets, getTransitionNames } from './transitions.js';
import { generateKeyframes, generateInlineStyle, generateTransitionCSS } from './generator.js';

/**
 * Generate preview HTML for a single animation.
 * @param {string} presetName - Animation preset name
 * @param {Object} options - Preview options
 * @returns {string}
 */
export function generateAnimationPreview(presetName, options = {}) {
  const preset = animationPresets[presetName];
  if (!preset) {
    return generateErrorPreview(`Animation "${presetName}" not found`);
  }

  const keyframes = generateKeyframes({ preset: presetName });
  if (!keyframes) {
    return generateErrorPreview(`Failed to generate keyframes for "${presetName}"`);
  }

  const {
    width = 400,
    height = 300,
    background = '#1a1a2e',
    elementColor = '#e94560',
    elementSize = 100,
    label = presetName,
    autoplay = true,
    loop = false
  } = options;

  const loopAttr = loop ? 'infinite' : '1';
  const playState = autoplay ? 'running' : 'paused';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animation Preview: ${presetName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .preview-container {
      background: ${background};
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .preview-header {
      padding: 16px 20px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .preview-header h2 {
      font-size: 14px;
      font-weight: 500;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .preview-canvas {
      position: relative;
      width: ${width}px;
      height: ${height}px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preview-element {
      width: ${elementSize}px;
      height: ${elementSize}px;
      background: ${elementColor};
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
      ${keyframes ? `animation: ${keyframes.name} ${keyframes.duration}s ${keyframes.easing} ${keyframes.delay || 0}s ${loopAttr} ${keyframes.fillMode || 'both'} ${playState};` : ''}
    }
    ${keyframes ? keyframes.css : ''}
    .preview-controls {
      padding: 16px 20px;
      background: rgba(255,255,255,0.05);
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .preview-info {
      font-size: 12px;
      color: #666;
    }
    .preview-info span {
      color: #aaa;
      font-weight: 500;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: ${elementColor};
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
    }
    button:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }
    button:active {
      transform: translateY(0);
    }
    .replay-btn {
      background: rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <h2>${label}</h2>
    </div>
    <div class="preview-canvas">
      <div class="preview-element" id="previewEl">
        Preview
      </div>
    </div>
    <div class="preview-controls">
      <button class="replay-btn" onclick="replayAnimation()">Replay</button>
      <div class="preview-info">
        Duration: <span>${keyframes.duration}s</span> | 
        Easing: <span>${keyframes.easing}</span>
      </div>
    </div>
  </div>
  <script>
    function replayAnimation() {
      const el = document.getElementById('previewEl');
      el.style.animation = 'none';
      el.offsetHeight; // Trigger reflow
      el.style.animation = '';
    }
  </script>
</body>
</html>`;
}

/**
 * Generate preview HTML for a transition.
 * @param {string} transitionName - Transition preset name
 * @param {Object} options - Preview options
 * @returns {string}
 */
export function generateTransitionPreview(transitionName, options = {}) {
  const preset = transitionPresets[transitionName];
  if (!preset) {
    return generateErrorPreview(`Transition "${transitionName}" not found`);
  }

  const transitionCSS = generateTransitionCSS(transitionName);
  const {
    width = 400,
    height = 300,
    duration = transitionCSS.duration
  } = options;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Transition Preview: ${transitionName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .preview-container {
      background: #1a1a2e;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }
    .preview-header {
      padding: 16px 20px;
      background: rgba(255,255,255,0.05);
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .preview-header h2 {
      font-size: 14px;
      font-weight: 500;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .preview-canvas {
      position: relative;
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
    }
    .scene {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
    }
    .scene-1 {
      background: linear-gradient(135deg, #e94560 0%, #0f3460 100%);
      z-index: 1;
    }
    .scene-2 {
      background: linear-gradient(135deg, #16213e 0%, #533483 100%);
      z-index: 0;
    }
    ${transitionCSS.css}
    .preview-controls {
      padding: 16px 20px;
      background: rgba(255,255,255,0.05);
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .preview-info {
      font-size: 12px;
      color: #666;
    }
    .preview-info span {
      color: #aaa;
      font-weight: 500;
    }
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      background: #e94560;
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.15s, opacity 0.15s;
    }
    button:hover {
      transform: translateY(-1px);
      opacity: 0.9;
    }
    button:active {
      transform: translateY(0);
    }
    .replay-btn {
      background: rgba(255,255,255,0.1);
    }
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <h2>${preset.description || transitionName}</h2>
    </div>
    <div class="preview-canvas">
      <div class="scene scene-1 transition-out" id="scene1">Scene 1</div>
      <div class="scene scene-2 transition-in" id="scene2">Scene 2</div>
    </div>
    <div class="preview-controls">
      <button class="replay-btn" onclick="replayTransition()">Replay</button>
      <div class="preview-info">
        Type: <span>${preset.type}</span> | 
        Duration: <span>${duration}s</span>
      </div>
    </div>
  </div>
  <script>
    function replayTransition() {
      const s1 = document.getElementById('scene1');
      const s2 = document.getElementById('scene2');
      s1.style.animation = 'none';
      s2.style.animation = 'none';
      s1.offsetHeight;
      s2.offsetHeight;
      s1.style.animation = '';
      s2.style.animation = '';
    }
  </script>
</body>
</html>`;
}

/**
 * Generate a gallery preview showing all animations.
 * @param {Object} options - Preview options
 * @returns {string}
 */
export function generateGalleryPreview(options = {}) {
  const {
    columns = 4,
    cellWidth = 200,
    cellHeight = 150
  } = options;

  const presetNames = getPresetNames();
  const cells = presetNames.map(name => {
    const preset = animationPresets[name];
    const keyframes = generateKeyframes({ preset: name });

    return `
    <div class="gallery-cell" onclick="showPreview('${name}')">
      <div class="gallery-preview" style="
        width: ${cellWidth * 0.6}px;
        height: ${cellHeight * 0.6}px;
        background: #e94560;
        border-radius: 6px;
        ${keyframes ? `animation: ${keyframes.name} ${keyframes.duration}s ${keyframes.easing} infinite both;` : ''}
      "></div>
      <div class="gallery-label">${name}</div>
    </div>`;
  }).join('\n');

  const keyframesCSS = presetNames
    .map(name => generateKeyframes({ preset: name }))
    .filter(Boolean)
    .map(k => k.css)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Animation Gallery</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #fff;
      padding: 40px 20px;
    }
    h1 {
      text-align: center;
      margin-bottom: 40px;
      font-size: 28px;
      font-weight: 600;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    .gallery-cell {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .gallery-cell:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(233, 69, 96, 0.3);
    }
    .gallery-preview {
      margin-bottom: 12px;
    }
    .gallery-label {
      font-size: 12px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    ${keyframesCSS}
  </style>
</head>
<body>
  <h1>Animation Gallery</h1>
  <div class="gallery">
    ${cells}
  </div>
  <script>
    function showPreview(name) {
      // Could open a modal or navigate to detail view
      console.log('Preview:', name);
    }
  </script>
</body>
</html>`;
}

/**
 * Generate preview HTML page with all animation presets.
 * @returns {string}
 */
export function generateAllPreviews() {
  const presetNames = getPresetNames();
  const previews = presetNames.map(name => {
    const preset = animationPresets[name];
    const keyframes = generateKeyframes({ preset: name });

    return `
    <div class="preview-item">
      <h3>${name}</h3>
      <div class="preview-box" style="
        animation: ${keyframes ? keyframes.name : 'none'} ${keyframes ? keyframes.duration : 0}s ${keyframes ? keyframes.easing : 'ease'} infinite both;
      "></div>
      <div class="preview-meta">
        Duration: ${keyframes?.duration || 0}s | Easing: ${keyframes?.easing || 'N/A'}
      </div>
    </div>`;
  }).join('\n');

  const allKeyframes = presetNames
    .map(name => generateKeyframes({ preset: name }))
    .filter(Boolean)
    .map(k => k.css)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Animation Previews</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #fff;
      padding: 40px 20px;
    }
    h1 { text-align: center; margin-bottom: 40px; }
    .previews {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }
    .preview-item {
      background: #1a1a2e;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    .preview-item h3 {
      font-size: 13px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .preview-box {
      width: 80px;
      height: 80px;
      background: #e94560;
      border-radius: 8px;
      margin: 0 auto 16px;
    }
    .preview-meta {
      font-size: 11px;
      color: #666;
    }
    ${allKeyframes}
  </style>
</head>
<body>
  <h1>Animation Previews</h1>
  <div class="previews">
    ${previews}
  </div>
</body>
</html>`;
}

/**
 * Get list of available animations.
 * @returns {Object}
 */
export function getAnimationList() {
  const presets = getPresetNames().map(name => ({
    name,
    category: categorizeAnimation(name),
    duration: animationPresets[name].duration,
    easing: animationPresets[name].easing
  }));

  const transitions = getTransitionNames().map(name => ({
    name,
    type: transitionPresets[name].type,
    duration: transitionPresets[name].duration
  }));

  return { presets, transitions };
}

// ── Helper Functions ────────────────────────────────────────────────

function generateErrorPreview(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0f0f1a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .error {
      background: #1a1a2e;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
    }
    .error h2 { color: #e94560; margin-bottom: 12px; }
    .error p { color: #888; }
  </style>
</head>
<body>
  <div class="error">
    <h2>Error</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;
}

function categorizeAnimation(name) {
  if (name.startsWith('slide-in')) return 'entry';
  if (name.startsWith('slide-out')) return 'exit';
  if (name.startsWith('fade')) return 'fade';
  if (name.startsWith('scale')) return 'scale';
  if (name.startsWith('flip')) return 'flip';
  if (name.startsWith('rotate')) return 'rotate';
  if (name.startsWith('blur')) return 'blur';
  if (name.startsWith('wipe')) return 'wipe';
  if (name.startsWith('split')) return 'split';
  return 'effect';
}
