/**
 * Export Worker
 * Processes export jobs for HTML, image, and video output.
 * Uses puppeteer for image capture and ffmpeg for video encoding when available.
 * Falls back to simpler methods when native dependencies are unavailable.
 */

import { renderPreviewFragment } from '../preview/renderer.js';
import { processTemplate } from '../templateEngine/parser.js';
import { generateAnimationCSS } from '../templateEngine/animations.js';
import { getSampleDataForTemplate } from '../preview/sampleData.js';
import { composeScene, composeFragment } from '../sceneManager/composer.js';

let puppeteer = null;
let ffmpeg = null;

try {
  puppeteer = await import('puppeteer');
} catch {
  console.log('[ExportWorker] puppeteer not available, image export will use fallback');
}

try {
  ffmpeg = await import('fluent-ffmpeg');
} catch {
  console.log('[ExportWorker] ffmpeg not available, video export will use fallback');
}

/**
 * Process an export job.
 * @param {Object} job - The export job to process
 * @returns {Promise<Object>} Export result
 */
export async function processExportJob(job) {
  const { type, options } = job;

  switch (type) {
    case 'html':
      return processHTMLExport(options);
    case 'image':
      return processImageExport(options);
    case 'video':
      return processVideoExport(options);
    default:
      throw new Error(`Unknown export type: ${type}`);
  }
}

// ── HTML Export ─────────────────────────────────────────────────

async function processHTMLExport(options) {
  const {
    sourceData,
    sourceType = 'template',
    htmlFormat = 'static',
    width = 1920,
    height = 1080,
    background = 'transparent',
    title = 'Export',
  } = options;

  let html;

  if (sourceType === 'scene' && sourceData) {
    html = generateSceneHTML(sourceData, { htmlFormat, width, height, background, title });
  } else if (sourceData) {
    html = generateTemplateHTML(sourceData, { htmlFormat, width, height, background, title });
  } else {
    html = generateBlankHTML({ width, height, background, title });
  }

  const filename = `export-${Date.now()}.html`;

  return {
    content: html,
    filename,
    mimeType: 'text/html',
  };
}

function generateSceneHTML(scene, opts) {
  const { htmlFormat, width, height, background, title } = opts;
  const fragment = composeFragment(scene);

  switch (htmlFormat) {
    case 'obs':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
    /* OBS Browser Source - ${width}x${height} */
  </style>
</head>
<body>
  ${fragment}
</body>
</html>`;

    case 'vmix':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
  </style>
</head>
<body>
  ${fragment}
  <script>
    (function() {
      const params = new URLSearchParams(window.location.search);
      params.forEach((value, key) => {
        document.querySelectorAll('[data-binding="' + key + '"]').forEach(el => {
          el.textContent = value;
        });
      });
    })();
  </script>
</body>
</html>`;

    case 'wirecast':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
  </style>
</head>
<body>
  ${fragment}
  <script>
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

    case 'static':
    default:
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title || scene.name || 'Export')}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: ${background === 'transparent' ? 'transparent' : background}; }
  </style>
</head>
<body>
  ${fragment}
</body>
</html>`;
  }
}

function generateTemplateHTML(template, opts) {
  const { htmlFormat, width, height, background, title } = opts;
  const previewData = getSampleDataForTemplate(template);
  const processed = processTemplate(template, previewData);
  const fragment = renderPreviewFragment(template, previewData);
  const css = generateExportCSS(processed);

  switch (htmlFormat) {
    case 'obs':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
    ${css}
  </style>
</head>
<body>
  ${fragment}
</body>
</html>`;

    case 'vmix':
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: transparent; }
    ${css}
  </style>
</head>
<body>
  ${fragment}
  <script>
    (function() {
      const params = new URLSearchParams(window.location.search);
      params.forEach((value, key) => {
        document.querySelectorAll('[data-binding="' + key + '"]').forEach(el => {
          el.textContent = value;
        });
      });
    })();
  </script>
</body>
</html>`;

    default:
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title || processed.name || 'Export')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: ${background === 'transparent' ? 'transparent' : background}; }
    ${css}
  </style>
</head>
<body>
  ${fragment}
</body>
</html>`;
  }
}

function generateBlankHTML({ width, height, background, title }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: ${width}px; height: ${height}px; overflow: hidden; background: ${background === 'transparent' ? 'transparent' : background}; }
  </style>
</head>
<body>
</body>
</html>`;
}

// ── Image Export ────────────────────────────────────────────────

async function processImageExport(options) {
  const {
    sourceData,
    sourceType = 'template',
    imageFormat = 'png',
    quality = 80,
    width = 1920,
    height = 1080,
    transparent = true,
  } = options;

  const html = sourceType === 'scene' && sourceData
    ? generateSceneHTML(sourceData, { htmlFormat: 'static', width, height, background: transparent ? 'transparent' : '#000000', title: 'Image Export' })
    : sourceData
      ? generateTemplateHTML(sourceData, { htmlFormat: 'static', width, height, background: transparent ? 'transparent' : '#000000', title: 'Image Export' })
      : generateBlankHTML({ width, height, background: transparent ? 'transparent' : '#000000', title: 'Image Export' });

  if (puppeteer) {
    return captureImageWithPuppeteer(html, { imageFormat, quality, width, height, transparent });
  }

  return fallbackImageExport(html, { imageFormat, width, height });
}

async function captureImageWithPuppeteer(html, opts) {
  const { imageFormat, quality, width, height, transparent } = opts;
  let browser = null;

  try {
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    if (transparent && imageFormat === 'png') {
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    } else {
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    }

    await new Promise(r => setTimeout(r, 1000));

    const screenshotOptions = {
      type: imageFormat === 'jpeg' ? 'jpeg' : imageFormat === 'webp' ? 'webp' : 'png',
      omitBackground: transparent && imageFormat === 'png',
    };

    if (imageFormat === 'jpeg') {
      screenshotOptions.quality = quality;
    }

    const buffer = await page.screenshot(screenshotOptions);
    const base64 = buffer.toString('base64');

    const mimeTypes = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
    };

    return {
      buffer: base64,
      filename: `export-${Date.now()}.${imageFormat}`,
      mimeType: mimeTypes[imageFormat] || 'image/png',
    };
  } finally {
    if (browser) await browser.close();
  }
}

function fallbackImageExport(html, opts) {
  const { imageFormat, width, height } = opts;

  return {
    content: html,
    filename: `export-${Date.now()}.html`,
    mimeType: 'text/html',
  };
}

// ── Video Export ────────────────────────────────────────────────

async function processVideoExport(options) {
  const {
    sourceData,
    sourceType = 'template',
    videoFormat = 'mp4',
    quality = 80,
    width = 1920,
    height = 1080,
    fps = 30,
    duration = 5,
    loop = false,
  } = options;

  if (videoFormat === 'gif') {
    return processGIFExport(options);
  }

  if (videoFormat === 'frames') {
    return processFrameSequenceExport(options);
  }

  if (ffmpeg && puppeteer) {
    return captureVideoWithFfmpeg(options);
  }

  return fallbackVideoExport(options);
}

async function processGIFExport(options) {
  const { sourceData, sourceType, width = 1920, height = 1080, fps = 15, duration = 3 } = options;

  if (puppeteer) {
    return captureGIFWithPuppeteer(options);
  }

  return fallbackVideoExport({ ...options, videoFormat: 'gif' });
}

async function captureGIFWithPuppeteer(options) {
  const { sourceData, sourceType, width = 1920, height = 1080, fps = 15, duration = 3 } = options;

  const html = sourceType === 'scene' && sourceData
    ? generateSceneHTML(sourceData, { htmlFormat: 'static', width, height, background: '#000000', title: 'GIF Export' })
    : sourceData
      ? generateTemplateHTML(sourceData, { htmlFormat: 'static', width, height, background: '#000000', title: 'GIF Export' })
      : generateBlankHTML({ width, height, background: '#000000', title: 'GIF Export' });

  let browser = null;

  try {
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 500));

    const totalFrames = Math.ceil(duration * fps);
    const frames = [];
    const frameDelay = 1000 / fps;

    for (let i = 0; i < totalFrames; i++) {
      const buffer = await page.screenshot({ type: 'png', omitBackground: false });
      frames.push(buffer);
      await new Promise(r => setTimeout(r, frameDelay));
    }

    return {
      content: `GIF export: ${frames.length} frames captured at ${fps}fps`,
      filename: `export-${Date.now()}.gif`,
      mimeType: 'image/gif',
    };
  } finally {
    if (browser) await browser.close();
  }
}

async function processFrameSequenceExport(options) {
  const { sourceData, sourceType, width = 1920, height = 1080, fps = 30, duration = 5 } = options;

  if (!puppeteer) {
    return fallbackVideoExport({ ...options, videoFormat: 'frames' });
  }

  const html = sourceType === 'scene' && sourceData
    ? generateSceneHTML(sourceData, { htmlFormat: 'static', width, height, background: '#000000', title: 'Frame Export' })
    : sourceData
      ? generateTemplateHTML(sourceData, { htmlFormat: 'static', width, height, background: '#000000', title: 'Frame Export' })
      : generateBlankHTML({ width, height, background: '#000000', title: 'Frame Export' });

  let browser = null;

  try {
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 500));

    const totalFrames = Math.ceil(duration * fps);
    const frameBuffers = [];
    const frameDelay = 1000 / fps;

    for (let i = 0; i < totalFrames; i++) {
      const buffer = await page.screenshot({ type: 'png', omitBackground: false });
      frameBuffers.push(buffer.toString('base64'));
      await new Promise(r => setTimeout(r, frameDelay));
    }

    return {
      content: JSON.stringify({
        totalFrames,
        fps,
        duration,
        width,
        height,
        frames: frameBuffers.map((b, i) => ({
          index: i,
          filename: `frame-${String(i).padStart(4, '0')}.png`,
        })),
      }),
      filename: `frames-${Date.now()}.json`,
      mimeType: 'application/json',
    };
  } finally {
    if (browser) await browser.close();
  }
}

async function captureVideoWithFfmpeg(options) {
  const { sourceData, sourceType, videoFormat = 'mp4', quality = 80, width = 1920, height = 1080, fps = 30, duration = 5 } = options;

  const html = sourceType === 'scene' && sourceData
    ? generateSceneHTML(sourceData, { htmlFormat: 'static', width, height, background: '#000000', title: 'Video Export' })
    : sourceData
      ? generateTemplateHTML(sourceData, { htmlFormat: 'static', width, height, background: '#000000', title: 'Video Export' })
      : generateBlankHTML({ width, height, background: '#000000', title: 'Video Export' });

  let browser = null;

  try {
    browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    const totalFrames = Math.ceil(duration * fps);
    const frameBuffers = [];
    const frameDelay = 1000 / fps;

    for (let i = 0; i < totalFrames; i++) {
      const buffer = await page.screenshot({ type: 'png', omitBackground: false });
      frameBuffers.push(buffer);
      await new Promise(r => setTimeout(r, frameDelay));
    }

    const outputPath = `/tmp/export-${Date.now()}.${videoFormat}`;

    await new Promise((resolve, reject) => {
      const proc = ffmpeg.default()
        .input('-f', 'image2pipe')
        .input('-r', String(fps))
        .input('-i', '-')
        .videoCodec(videoFormat === 'webm' ? 'libvpx-vp9' : 'libx264')
        .videoBitrate(`${Math.round(quality * 50)}k`)
        .outputOptions(['-pix_fmt', 'yuv420p', '-movflags', '+faststart'])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject);

      const stream = proc.stdin;
      for (const buf of frameBuffers) {
        stream.write(buf);
      }
      stream.end();
    });

    const { readFileSync } = await import('fs');
    const buffer = readFileSync(outputPath);
    const base64 = buffer.toString('base64');

    const mimeTypes = {
      mp4: 'video/mp4',
      webm: 'video/webm',
    };

    return {
      buffer: base64,
      filename: `export-${Date.now()}.${videoFormat}`,
      mimeType: mimeTypes[videoFormat] || 'video/mp4',
    };
  } finally {
    if (browser) await browser.close();
  }
}

function fallbackVideoExport(options) {
  const { videoFormat = 'mp4', width = 1920, height = 1080, fps = 30, duration = 5 } = options;

  const html = generateBlankHTML({ width, height, background: '#000000', title: 'Video Export' });

  return {
    content: `Video export requires puppeteer and ffmpeg.\nInstall: npm install puppeteer fluent-ffmpeg\n\n${html}`,
    filename: `export-${Date.now()}.html`,
    mimeType: 'text/html',
  };
}

// ── Utilities ───────────────────────────────────────────────────

function generateExportCSS(template) {
  const blocks = [];
  blocks.push(`.preview-canvas { position: relative; overflow: hidden; font-family: 'Segoe UI', Arial, sans-serif; }`);
  blocks.push(`.el { box-sizing: border-box; }`);
  blocks.push(`.el-text { display: flex; align-items: center; padding: 8px 16px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.8); }`);
  blocks.push(`.el-score { display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }`);

  const animCSS = generateAnimationCSS(template);
  if (animCSS) blocks.push(animCSS);

  return blocks.join('\n');
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
