/**
 * Transition Presets
 * Scene-to-scene transition definitions for broadcast graphics.
 */

export const transitionPresets = {
  // ── Instant Transitions ───────────────────────────────────────────
  'cut': {
    duration: 0,
    type: 'cut',
    description: 'Instant cut between scenes'
  },

  // ── Fade Transitions ──────────────────────────────────────────────
  'fade': {
    duration: 0.5,
    type: 'crossfade',
    description: 'Smooth crossfade between scenes'
  },
  'fade-slow': {
    duration: 1.0,
    type: 'crossfade',
    description: 'Slow crossfade between scenes'
  },
  'fade-fast': {
    duration: 0.25,
    type: 'crossfade',
    description: 'Fast crossfade between scenes'
  },

  // ── Slide Transitions ─────────────────────────────────────────────
  'slide-left': {
    duration: 0.6,
    type: 'slide',
    direction: 'left',
    description: 'Slide new scene from right'
  },
  'slide-right': {
    duration: 0.6,
    type: 'slide',
    direction: 'right',
    description: 'Slide new scene from left'
  },
  'slide-up': {
    duration: 0.6,
    type: 'slide',
    direction: 'up',
    description: 'Slide new scene from bottom'
  },
  'slide-down': {
    duration: 0.6,
    type: 'slide',
    direction: 'down',
    description: 'Slide new scene from top'
  },

  // ── Wipe Transitions ──────────────────────────────────────────────
  'wipe-left': {
    duration: 0.5,
    type: 'wipe',
    direction: 'left',
    description: 'Wipe reveal from right'
  },
  'wipe-right': {
    duration: 0.5,
    type: 'wipe',
    direction: 'right',
    description: 'Wipe reveal from left'
  },
  'wipe-up': {
    duration: 0.5,
    type: 'wipe',
    direction: 'up',
    description: 'Wipe reveal from bottom'
  },
  'wipe-down': {
    duration: 0.5,
    type: 'wipe',
    direction: 'down',
    description: 'Wipe reveal from top'
  },

  // ── Zoom Transitions ──────────────────────────────────────────────
  'zoom-in': {
    duration: 0.5,
    type: 'zoom',
    direction: 'in',
    description: 'Zoom into new scene'
  },
  'zoom-out': {
    duration: 0.5,
    type: 'zoom',
    direction: 'out',
    description: 'Zoom out to new scene'
  },

  // ── Blur Transitions ──────────────────────────────────────────────
  'blur': {
    duration: 0.4,
    type: 'blur',
    description: 'Blur transition between scenes'
  },

  // ── 3D Transitions ────────────────────────────────────────────────
  'flip': {
    duration: 0.6,
    type: 'flip',
    direction: 'horizontal',
    description: '3D flip transition'
  },
  'flip-vertical': {
    duration: 0.6,
    type: 'flip',
    direction: 'vertical',
    description: '3D vertical flip transition'
  },

  // ── Rotate Transition ─────────────────────────────────────────────
  'rotate': {
    duration: 0.5,
    type: 'rotate',
    description: 'Rotating transition'
  },

  // ── Push Transition ───────────────────────────────────────────────
  'push-left': {
    duration: 0.6,
    type: 'push',
    direction: 'left',
    description: 'Push current scene out to the left'
  },
  'push-right': {
    duration: 0.6,
    type: 'push',
    direction: 'right',
    description: 'Push current scene out to the right'
  },

  // ── Reveal Transition ─────────────────────────────────────────────
  'reveal-left': {
    duration: 0.6,
    type: 'reveal',
    direction: 'left',
    description: 'Reveal new scene under current'
  },
  'reveal-right': {
    duration: 0.6,
    type: 'reveal',
    direction: 'right',
    description: 'Reveal new scene under current'
  },

  // ── Cover Transition ──────────────────────────────────────────────
  'cover-left': {
    duration: 0.6,
    type: 'cover',
    direction: 'left',
    description: 'New scene covers current from right'
  },
  'cover-right': {
    duration: 0.6,
    type: 'cover',
    direction: 'right',
    description: 'New scene covers current from left'
  }
};

/**
 * Get all available transition names.
 * @returns {string[]}
 */
export function getTransitionNames() {
  return Object.keys(transitionPresets);
}

/**
 * Get a transition preset by name.
 * @param {string} name
 * @returns {Object|null}
 */
export function getTransition(name) {
  return transitionPresets[name] || null;
}

/**
 * Get transitions filtered by type.
 * @param {string} type - 'cut' | 'crossfade' | 'slide' | 'wipe' | 'zoom' | 'blur' | 'flip' | 'rotate' | 'push' | 'reveal' | 'cover'
 * @returns {Object}
 */
export function getTransitionsByType(type) {
  const result = {};
  for (const [name, preset] of Object.entries(transitionPresets)) {
    if (preset.type === type) {
      result[name] = preset;
    }
  }
  return result;
}

/**
 * Generate CSS for a transition between two scenes.
 * @param {string} transitionName - Name of the transition preset
 * @param {Object} options - Additional options
 * @returns {{ css: string, duration: number, type: string }}
 */
export function generateTransitionCSS(transitionName, options = {}) {
  const preset = transitionPresets[transitionName];
  if (!preset) {
    return { css: '', duration: 0, type: 'cut' };
  }

  const duration = options.duration || preset.duration;
  const direction = options.direction || preset.direction;

  let css = '';

  switch (preset.type) {
    case 'cut':
      css = generateCutCSS();
      break;
    case 'crossfade':
      css = generateCrossfadeCSS(duration);
      break;
    case 'slide':
      css = generateSlideCSS(duration, direction);
      break;
    case 'wipe':
      css = generateWipeCSS(duration, direction);
      break;
    case 'zoom':
      css = generateZoomCSS(duration, direction);
      break;
    case 'blur':
      css = generateBlurCSS(duration);
      break;
    case 'flip':
      css = generateFlipCSS(duration, direction);
      break;
    case 'rotate':
      css = generateRotateCSS(duration);
      break;
    case 'push':
      css = generatePushCSS(duration, direction);
      break;
    case 'reveal':
      css = generateRevealCSS(duration, direction);
      break;
    case 'cover':
      css = generateCoverCSS(duration, direction);
      break;
    default:
      css = generateCrossfadeCSS(duration);
  }

  return { css, duration, type: preset.type };
}

// ── CSS Generators ──────────────────────────────────────────────────

function generateCutCSS() {
  return `.transition-out { display: none; }
.transition-in { display: block; }`;
}

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

function generateSlideCSS(duration, direction = 'left') {
  const transforms = {
    left: { from: 'translateX(100%)', to: 'translateX(-100%)' },
    right: { from: 'translateX(-100%)', to: 'translateX(100%)' },
    up: { from: 'translateY(100%)', to: 'translateY(-100%)' },
    down: { from: 'translateY(-100%)', to: 'translateY(100%)' }
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
  to { transform: ${t.to}; }
}
@keyframes slide-in-${direction} {
  from { transform: ${t.from}; }
  to { transform: translate(0); }
}`;
}

function generateWipeCSS(duration, direction = 'left') {
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

function generateZoomCSS(duration, direction = 'in') {
  const scales = {
    in: { from: 'scale(3)', to: 'scale(1)' },
    out: { from: 'scale(0.2)', to: 'scale(1)' }
  };

  const s = scales[direction] || scales.in;

  return `.transition-in {
  animation: zoom-in-${direction} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes zoom-in-${direction} {
  from { transform: ${s.from}; opacity: 0; }
  to { transform: ${s.to}; opacity: 1; }
}`;
}

function generateBlurCSS(duration) {
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

function generateFlipCSS(duration, direction = 'horizontal') {
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

function generateRotateCSS(duration) {
  return `.transition-in {
  animation: rotate-in ${duration}s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes rotate-in {
  from { transform: rotate(-180deg) scale(0); opacity: 0; }
  to { transform: rotate(0) scale(1); opacity: 1; }
}`;
}

function generatePushCSS(duration, direction = 'left') {
  const transforms = {
    left: { from: 'translateX(100%)', to: 'translateX(-100%)' },
    right: { from: 'translateX(-100%)', to: 'translateX(100%)' }
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
  to { transform: ${t.to}; }
}
@keyframes push-in-${direction} {
  from { transform: ${t.from}; }
  to { transform: translateX(0); }
}`;
}

function generateRevealCSS(duration, direction = 'left') {
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

function generateCoverCSS(duration, direction = 'left') {
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
