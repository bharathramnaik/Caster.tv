/**
 * Animation Generator
 * Generates CSS keyframes and JavaScript animation code from preset definitions.
 */

import { animationPresets, getPreset } from './presets.js';
import { transitionPresets, getTransition } from './transitions.js';

/**
 * Generate CSS keyframes from an animation definition.
 * @param {Object} animDef - Animation definition (preset name or inline definition)
 * @returns {{ name: string, css: string, duration: number, easing: string, delay: number, fillMode: string }}
 */
export function generateKeyframes(animDef) {
  if (!animDef) return null;

  const preset = animDef.preset ? getPreset(animDef.preset) : null;
  const from = animDef.from || preset?.from || {};
  const to = animDef.to || preset?.to || {};
  const duration = animDef.duration || preset?.duration || 0.5;
  const easing = animDef.easing || preset?.ease || 'ease-out';
  const delay = animDef.delay || 0;
  const fillMode = animDef.fillMode || preset?.fillMode || 'both';
  const iterationCount = animDef.iterationCount || preset?.iterationCount || 1;
  const direction = animDef.direction || preset?.direction || 'normal';

  const name = `anim-${animDef.preset || 'custom'}-${hashObj(JSON.stringify(from) + JSON.stringify(to))}`;
  const fromCSS = styleObjectToCSS(from);
  const toCSS = styleObjectToCSS(to);

  const css = `@keyframes ${name} {
  from { ${fromCSS} }
  to { ${toCSS} }
}`;

  return {
    name,
    css,
    duration,
    easing,
    delay,
    fillMode,
    iterationCount,
    direction
  };
}

/**
 * Generate CSS keyframes for multi-step animations.
 * @param {string} name - Animation name
 * @param {Array<Object>} steps - Array of keyframe steps [{percent: 0, styles: {...}}, ...]
 * @returns {{ name: string, css: string }}
 */
export function generateMultiStepKeyframes(name, steps) {
  if (!steps || steps.length === 0) return null;

  const keyframeBlocks = steps.map(step => {
    const percent = step.percent !== undefined ? `${step.percent}%` : 'from';
    const css = styleObjectToCSS(step.styles);
    return `  ${percent} { ${css} }`;
  });

  const css = `@keyframes ${name} {
${keyframeBlocks.join('\n')}
}`;

  return { name, css };
}

/**
 * Generate inline animation style string.
 * @param {Object} animResult - Result from generateKeyframes
 * @returns {string}
 */
export function generateInlineStyle(animResult) {
  if (!animResult) return '';

  const parts = [
    animResult.name,
    `${animResult.duration}s`,
    animResult.easing
  ];

  if (animResult.delay) parts.push(`${animResult.delay}s`);
  if (animResult.fillMode) parts.push(animResult.fillMode);
  if (animResult.iterationCount && animResult.iterationCount !== 1) {
    parts.push(animResult.iterationCount);
  }
  if (animResult.direction && animResult.direction !== 'normal') {
    parts.push(animResult.direction);
  }

  return `animation: ${parts.join(' ')}`;
}

/**
 * Generate complete CSS block for an animation.
 * @param {Object} animDef - Animation definition
 * @returns {{ css: string, inlineStyle: string, metadata: Object }}
 */
export function generateAnimationBlock(animDef) {
  const keyframes = generateKeyframes(animDef);
  if (!keyframes) return null;

  const inlineStyle = generateInlineStyle(keyframes);

  return {
    css: keyframes.css,
    inlineStyle,
    metadata: {
      name: keyframes.name,
      duration: keyframes.duration,
      easing: keyframes.easing,
      delay: keyframes.delay,
      fillMode: keyframes.fillMode
    }
  };
}

/**
 * Generate CSS for multiple animations.
 * @param {Array<Object>} animDefs - Array of animation definitions
 * @returns {{ css: string, animations: Array<Object> }}
 */
export function generateMultipleAnimations(animDefs) {
  const cssBlocks = [];
  const animations = [];

  for (const animDef of animDefs) {
    const block = generateAnimationBlock(animDef);
    if (block) {
      cssBlocks.push(block.css);
      animations.push(block);
    }
  }

  return {
    css: cssBlocks.join('\n\n'),
    animations
  };
}

/**
 * Generate JavaScript animation code for Web Animations API.
 * @param {Object} animDef - Animation definition
 * @returns {string}
 */
export function generateJSAnimationCode(animDef) {
  const preset = animDef.preset ? getPreset(animDef.preset) : null;
  const from = animDef.from || preset?.from || {};
  const to = animDef.to || preset?.to || {};
  const duration = (animDef.duration || preset?.duration || 0.5) * 1000;
  const easing = animDef.easing || preset?.ease || 'ease-out';
  const delay = (animDef.delay || 0) * 1000;

  const fromObj = formatJSObject(from);
  const toObj = formatJSObject(to);

  return `element.animate([
  ${fromObj},
  ${toObj}
], {
  duration: ${duration},
  easing: '${easing}',
  delay: ${delay},
  fill: '${animDef.fillMode || 'both'}'
});`;
}

/**
 * Generate CSS for transition presets.
 * @param {string} transitionName - Transition preset name
 * @param {Object} options - Override options
 * @returns {{ css: string, duration: number }}
 */
export function generateTransitionCSS(transitionName, options = {}) {
  const preset = getTransition(transitionName);
  if (!preset) return { css: '', duration: 0 };

  const duration = options.duration || preset.duration;
  const direction = options.direction || preset.direction;

  let css = '';

  switch (preset.type) {
    case 'cut':
      css = `.transition-out { display: none; }
.transition-in { display: block; }`;
      break;

    case 'crossfade':
      css = generateCrossfadeCSS(duration);
      break;

    case 'slide':
      css = generateSlideTransitionCSS(duration, direction);
      break;

    case 'wipe':
      css = generateWipeTransitionCSS(duration, direction);
      break;

    case 'zoom':
      css = generateZoomTransitionCSS(duration, direction);
      break;

    case 'blur':
      css = generateBlurTransitionCSS(duration);
      break;

    case 'flip':
      css = generateFlipTransitionCSS(duration, direction);
      break;

    case 'rotate':
      css = generateRotateTransitionCSS(duration);
      break;

    case 'push':
      css = generatePushTransitionCSS(duration, direction);
      break;

    case 'reveal':
      css = generateRevealTransitionCSS(duration, direction);
      break;

    case 'cover':
      css = generateCoverTransitionCSS(duration, direction);
      break;

    default:
      css = generateCrossfadeCSS(duration);
  }

  return { css, duration };
}

/**
 * Combine multiple animations into a sequence.
 * @param {Array<Object>} animDefs - Array of animation definitions
 * @returns {{ css: string, totalDuration: number, timeline: Array<Object> }}
 */
export function combineAnimations(animDefs) {
  if (!animDefs || animDefs.length === 0) {
    return { css: '', totalDuration: 0, timeline: [] };
  }

  const cssBlocks = [];
  const timeline = [];
  let currentTime = 0;

  for (const animDef of animDefs) {
    const preset = animDef.preset ? getPreset(animDef.preset) : null;
    const duration = animDef.duration || preset?.duration || 0.5;
    const delay = animDef.delay || 0;

    const block = generateAnimationBlock({
      ...animDef,
      delay: currentTime + delay
    });

    if (block) {
      cssBlocks.push(block.css);
      timeline.push({
        name: block.metadata.name,
        startTime: currentTime + delay,
        duration: block.metadata.duration,
        endTime: currentTime + delay + block.metadata.duration
      });
    }

    if (!animDef.parallel) {
      currentTime += duration + delay;
    }
  }

  const totalDuration = timeline.length > 0
    ? Math.max(...timeline.map(t => t.endTime))
    : 0;

  return {
    css: cssBlocks.join('\n\n'),
    totalDuration,
    timeline
  };
}

// ── CSS Generators for Transitions ──────────────────────────────────

function generateCrossfadeCSS(duration) {
  return `.transition-out {
  animation: crossfade-out ${duration}s ease-in-out forwards;
}
.transition-in {
  animation: crossfade-in ${duration}s ease-in-out forwards;
}
@keyframes crossfade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes crossfade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}`;
}

function generateSlideTransitionCSS(duration, direction = 'left') {
  const transforms = {
    left: { out: 'translateX(-100%)', in: 'translateX(100%)' },
    right: { out: 'translateX(100%)', in: 'translateX(-100%)' },
    up: { out: 'translateY(-100%)', in: 'translateY(100%)' },
    down: { out: 'translateY(100%)', in: 'translateY(-100%)' }
  };

  const t = transforms[direction] || transforms.left;

  return `.transition-out {
  animation: slide-out-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.transition-in {
  animation: slide-in-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes slide-out-${direction} {
  from { transform: translate(0); }
  to { transform: ${t.out}; }
}
@keyframes slide-in-${direction} {
  from { transform: ${t.in}; }
  to { transform: translate(0); }
}`;
}

function generateWipeTransitionCSS(duration, direction = 'left') {
  const clipPaths = {
    left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0 0 0)' },
    right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0)' },
    up: { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0 0)' },
    down: { from: 'inset(100% 0 0 0)', to: 'inset(0 0 0 0)' }
  };

  const c = clipPaths[direction] || clipPaths.left;

  return `.transition-in {
  animation: wipe-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes wipe-${direction} {
  from { clip-path: ${c.from}; }
  to { clip-path: ${c.to}; }
}`;
}

function generateZoomTransitionCSS(duration, direction = 'in') {
  return `.transition-in {
  animation: zoom-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes zoom-in {
  from { transform: scale(3); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes zoom-out {
  from { transform: scale(0.2); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}`;
}

function generateBlurTransitionCSS(duration) {
  return `.transition-out {
  animation: blur-out ${duration}s ease-in-out forwards;
}
.transition-in {
  animation: blur-in ${duration}s ease-in-out forwards;
}
@keyframes blur-out {
  from { filter: blur(0); }
  to { filter: blur(20px); opacity: 0; }
}
@keyframes blur-in {
  from { filter: blur(20px); opacity: 0; }
  to { filter: blur(0); opacity: 1; }
}`;
}

function generateFlipTransitionCSS(duration, direction = 'horizontal') {
  const axis = direction === 'vertical' ? 'X' : 'Y';

  return `.transition-out {
  animation: flip-out-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.transition-in {
  animation: flip-in-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes flip-out-${direction} {
  from { transform: perspective(400px) rotate${axis}(0); }
  to { transform: perspective(400px) rotate${axis}(90deg); opacity: 0; }
}
@keyframes flip-in-${direction} {
  from { transform: perspective(400px) rotate${axis}(-90deg); opacity: 0; }
  to { transform: perspective(400px) rotate${axis}(0); opacity: 1; }
}`;
}

function generateRotateTransitionCSS(duration) {
  return `.transition-in {
  animation: rotate-in ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes rotate-in {
  from { transform: rotate(-180deg) scale(0); opacity: 0; }
  to { transform: rotate(0) scale(1); opacity: 1; }
}`;
}

function generatePushTransitionCSS(duration, direction = 'left') {
  const transforms = {
    left: { out: 'translateX(-100%)', in: 'translateX(100%)' },
    right: { out: 'translateX(100%)', in: 'translateX(-100%)' }
  };

  const t = transforms[direction] || transforms.left;

  return `.transition-out {
  animation: push-out-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.transition-in {
  animation: push-in-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes push-out-${direction} {
  from { transform: translateX(0); }
  to { transform: ${t.out}; }
}
@keyframes push-in-${direction} {
  from { transform: ${t.in}; }
  to { transform: translateX(0); }
}`;
}

function generateRevealTransitionCSS(duration, direction = 'left') {
  const clipPaths = {
    left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0 0 0)' },
    right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0)' }
  };

  const c = clipPaths[direction] || clipPaths.left;

  return `.transition-in {
  animation: reveal-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes reveal-${direction} {
  from { clip-path: ${c.from}; }
  to { clip-path: ${c.to}; }
}`;
}

function generateCoverTransitionCSS(duration, direction = 'left') {
  const transforms = {
    left: 'translateX(100%)',
    right: 'translateX(-100%)'
  };

  const t = transforms[direction] || transforms.left;

  return `.transition-in {
  animation: cover-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes cover-${direction} {
  from { transform: ${t}; }
  to { transform: translateX(0); }
}`;
}

// ── Utility Functions ───────────────────────────────────────────────

function styleObjectToCSS(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');
}

function camelToKebab(str) {
  return str.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`);
}

function hashObj(val) {
  const str = typeof val === 'string' ? val : JSON.stringify(val);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(36);
}

function formatJSObject(obj) {
  const entries = Object.entries(obj)
    .map(([k, v]) => `  ${camelToKebab(k)}: '${v}'`)
    .join(',\n');
  return `{\n${entries}\n}`;
}
