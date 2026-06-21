/**
 * Scene Exporter
 * Export scenes in various formats for broadcast use.
 */

import { composeScene, composeFragment, composeScaled } from './composer.js';
import { generateTransitionCSS, generateTransitionJS } from './transitions.js';

/**
 * Export scene as a complete static HTML document
 * @param {Object} scene - The scene to export
 * @param {Object} [opts] - Export options
 * @returns {string} HTML document string
 */
export function exportAsHTML(scene, opts = {}) {
  const { title, width, height } = opts;
  let html = composeScene(scene, { standalone: true });

  // Replace title if provided
  if (title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHTML(title)}</title>`);
  }

  // Scale if dimensions provided
  if (width || height) {
    const canvas = scene.canvas || { width: 1920, height: 1080 };
    const tw = width || canvas.width;
    const th = height || canvas.height;
    html = composeScaled(scene, tw, th);
    html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title || scene.name)}</title>
  <style>
    * { margin: 0; padding: 0; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #000; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
  }

  return html;
}

/**
 * Export scene for OBS Browser Source
 * @param {Object} scene
 * @param {Object} [opts] - OBS-specific options
 * @returns {string} HTML optimized for OBS
 */
export function exportForOBS(scene, opts = {}) {
  const { width = 1920, height = 1080, fps = 30 } = opts;
  const fragment = composeFragment(scene);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
    /* OBS Browser Source - ${width}x${height} @ ${fps}fps */
  </style>
</head>
<body>
  ${fragment}
  <script>
    // OBS Browser Source metadata
    // Resolution: ${width}x${height}
    // Frame Rate: ${fps}
    // Background: Transparent (use chroma key or CSS background in OBS)
  </script>
</body>
</html>`;
}

/**
 * Export scene for NDI output (as standalone HTML)
 * @param {Object} scene
 * @param {Object} [opts]
 * @returns {string} HTML for NDI capture
 */
export function exportForNDI(scene, opts = {}) {
  const { width = 1920, height = 1080 } = opts;
  const fragment = composeFragment(scene);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: #000; }
    /* NDI Output - ${width}x${height} */
  </style>
</head>
<body>
  ${fragment}
</body>
</html>`;
}

/**
 * Export scene as a CSS-only animation (for use with external tools)
 * @param {Object} scene
 * @returns {string} CSS string
 */
export function exportAsCSS(scene) {
  const layers = (scene.layers || []).filter(l => l.visible);
  const lines = [];

  lines.push(`/* Scene: ${scene.name} (${scene.id}) */`);
  lines.push(`.scene-${scene.id} {`);
  lines.push(`  position: relative;`);
  lines.push(`  width: ${scene.canvas?.width || 1920}px;`);
  lines.push(`  height: ${scene.canvas?.height || 1080}px;`);
  lines.push(`  background: ${scene.canvas?.background || 'transparent'};`);
  lines.push(`  overflow: hidden;`);
  lines.push(`}`);

  for (const layer of layers) {
    const pos = layer.position || {};
    lines.push(``);
    lines.push(`.layer-${layer.id} {`);
    lines.push(`  position: absolute;`);
    lines.push(`  left: ${pos.x || 0}px;`);
    lines.push(`  top: ${pos.y || 0}px;`);
    lines.push(`  width: ${pos.width || 200}px;`);
    lines.push(`  height: ${pos.height || 50}px;`);
    lines.push(`  opacity: ${layer.opacity ?? 1};`);
    lines.push(`  z-index: ${layer.zIndex || 0};`);
    if (layer.animation?.enter) {
      lines.push(`  animation: ${layer.animation.enter} ${layer.animation.duration || 0.5}s ease-out forwards;`);
    }
    lines.push(`}`);
  }

  return lines.join('\n');
}

/**
 * Export scene as JSON (for import/export roundtrip)
 * @param {Object} scene
 * @returns {string} JSON string
 */
export function exportAsJSON(scene) {
  return JSON.stringify(scene, null, 2);
}

/**
 * Export scene with embedded data for client-side rendering
 * @param {Object} scene
 * @param {Object} [data] - Data to embed in template bindings
 * @returns {string} HTML with data attributes
 */
export function exportWithData(scene, data = {}) {
  const fragment = composeFragment(scene);

  // Wrap fragment with embedded data as JSON in script tag
  return `${fragment}
<script>
  window.__SCENE_DATA__ = ${JSON.stringify({
    sceneId: scene.id,
    sceneName: scene.name,
    canvas: scene.canvas,
    data,
    exportedAt: new Date().toISOString()
  }, null, 2)};
</script>`;
}

/**
 * Export scene for streaming platforms (Twitch/YouTube)
 * Generates a compact HTML file suitable for overlay use
 * @param {Object} scene
 * @param {Object} [opts]
 * @returns {string}
 */
export function exportForStreaming(scene, opts = {}) {
  const { platform = 'twitch', width = 1920, height = 1080 } = opts;
  const fragment = composeFragment(scene);

  const platformStyles = {
    twitch: 'background: transparent;',
    youtube: 'background: transparent;',
    custom: 'background: transparent;'
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      ${platformStyles[platform] || platformStyles.custom}
    }
    /* ${platform.charAt(0).toUpperCase() + platform.slice(1)} Overlay - ${width}x${height} */
  </style>
</head>
<body>
  ${fragment}
</body>
</html>`;
}

/**
 * Export multiple scenes as a playlist (HTML with scene switching)
 * @param {Object[]} scenes
 * @param {Object} [opts]
 * @returns {string} HTML with scene switching
 */
export function exportAsPlaylist(scenes, opts = {}) {
  const { defaultDuration = 5000, transitionType = 'fade' } = opts;

  if (!scenes || scenes.length === 0) {
    return '<!DOCTYPE html><html><body></body></html>';
  }

  const sceneFragments = scenes.map(s => composeFragment(s)).join('\n');
  const transitionCSS = generateTransitionCSS(transitionType, 0.5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; }
    html, body { width: 100%; height: 100vh; overflow: hidden; background: #000; }
    .playlist-scene { position: absolute; inset: 0; display: none; }
    .playlist-scene.active { display: block; }
    ${transitionCSS}
  </style>
</head>
<body>
  <div class="playlist-container">
    ${scenes.map((s, i) => `<div class="playlist-scene ${i === 0 ? 'active' : ''}" data-scene-id="${s.id}">
      ${composeFragment(s)}
    </div>`).join('\n')}
  </div>
  <script>
    const scenes = document.querySelectorAll('.playlist-scene');
    let current = 0;
    const duration = ${defaultDuration};

    function nextScene() {
      const prev = scenes[current];
      current = (current + 1) % scenes.length;
      const next = scenes[current];
      prev.classList.remove('active');
      next.classList.add('active');
    }

    setInterval(nextScene, duration);
  </script>
</body>
</html>`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
