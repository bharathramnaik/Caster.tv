/**
 * Animation Presets Library
 * Professional broadcast-quality animation definitions for WASP3D-style graphics.
 */

export const animationPresets = {
  // ── Entry Animations ──────────────────────────────────────────────
  'slide-in-left': {
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'slide-in-right': {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'slide-in-top': {
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'slide-in-bottom': {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // ── Exit Animations ───────────────────────────────────────────────
  'slide-out-left': {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(-100%)', opacity: 0 },
    duration: 0.5,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },
  'slide-out-right': {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(100%)', opacity: 0 },
    duration: 0.5,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },
  'slide-out-top': {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(-100%)', opacity: 0 },
    duration: 0.5,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },
  'slide-out-bottom': {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(100%)', opacity: 0 },
    duration: 0.5,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },

  // ── Fade Animations ───────────────────────────────────────────────
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 0.3,
    easing: 'ease-out'
  },
  'fade-out': {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 0.3,
    easing: 'ease-in'
  },
  'fade-in-up': {
    from: { transform: 'translateY(20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'fade-in-down': {
    from: { transform: 'translateY(-20px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // ── Scale Animations ──────────────────────────────────────────────
  'scale-in': {
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.4,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'scale-out': {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0)', opacity: 0 },
    duration: 0.4,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },
  'scale-in-bounce': {
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'
  },
  'scale-in-elastic': {
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.8,
    easing: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
  },

  // ── Flip Animations ───────────────────────────────────────────────
  'flip-in-x': {
    from: { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
    to: { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'flip-in-y': {
    from: { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
    to: { transform: 'perspective(400px) rotateY(0)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'flip-out-x': {
    from: { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
    to: { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
    duration: 0.6,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },
  'flip-out-y': {
    from: { transform: 'perspective(400px) rotateY(0)', opacity: 1 },
    to: { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
    duration: 0.6,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },

  // ── Rotate Animations ─────────────────────────────────────────────
  'rotate-in': {
    from: { transform: 'rotate(-180deg) scale(0)', opacity: 0 },
    to: { transform: 'rotate(0) scale(1)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'rotate-out': {
    from: { transform: 'rotate(0) scale(1)', opacity: 1 },
    to: { transform: 'rotate(180deg) scale(0)', opacity: 0 },
    duration: 0.6,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },

  // ── Blur Animations ───────────────────────────────────────────────
  'blur-in': {
    from: { filter: 'blur(20px)', opacity: 0 },
    to: { filter: 'blur(0)', opacity: 1 },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'blur-out': {
    from: { filter: 'blur(0)', opacity: 1 },
    to: { filter: 'blur(20px)', opacity: 0 },
    duration: 0.5,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  },

  // ── Typewriter Effect ─────────────────────────────────────────────
  'typewriter': {
    from: { width: '0', overflow: 'hidden', whiteSpace: 'nowrap' },
    to: { width: '100%', overflow: 'hidden', whiteSpace: 'nowrap' },
    duration: 1.0,
    easing: 'steps(20, end)'
  },

  // ── Number Count Up ───────────────────────────────────────────────
  'count-up': {
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // ── Wipe Animations ───────────────────────────────────────────────
  'wipe-left': {
    from: { clipPath: 'inset(0 100% 0 0)' },
    to: { clipPath: 'inset(0 0 0 0)' },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'wipe-right': {
    from: { clipPath: 'inset(0 0 0 100%)' },
    to: { clipPath: 'inset(0 0 0 0)' },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'wipe-up': {
    from: { clipPath: 'inset(0 0 100% 0)' },
    to: { clipPath: 'inset(0 0 0 0)' },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'wipe-down': {
    from: { clipPath: 'inset(100% 0 0 0)' },
    to: { clipPath: 'inset(0 0 0 0)' },
    duration: 0.5,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // ── Split Animations ──────────────────────────────────────────────
  'split-horizontal': {
    from: { clipPath: 'inset(0 50% 0 50%)', opacity: 0 },
    to: { clipPath: 'inset(0 0 0 0)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },
  'split-vertical': {
    from: { clipPath: 'inset(50% 0 50% 0)', opacity: 0 },
    to: { clipPath: 'inset(0 0 0 0)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // ── Glow Pulse ────────────────────────────────────────────────────
  'glow-pulse': {
    from: { filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))' },
    to: { filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' },
    duration: 1.0,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate'
  },

  // ── Shimmer ───────────────────────────────────────────────────────
  'shimmer': {
    from: { backgroundPosition: '-200% 0' },
    to: { backgroundPosition: '200% 0' },
    duration: 2.0,
    easing: 'linear',
    iterationCount: 'infinite'
  },

  // ── Bounce In (legacy alias) ──────────────────────────────────────
  'bounce-in': {
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'
  },

  // ── Swing ─────────────────────────────────────────────────────────
  'swing': {
    from: { transform: 'rotate(0)' },
    to: { transform: 'rotate(15deg)' },
    duration: 0.5,
    easing: 'ease-in-out',
    iterationCount: 2,
    direction: 'alternate'
  },

  // ── Zoom In ───────────────────────────────────────────────────────
  'zoom-in': {
    from: { transform: 'scale(3)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.4,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // ── Zoom Out ──────────────────────────────────────────────────────
  'zoom-out': {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.2)', opacity: 0 },
    duration: 0.4,
    easing: 'cubic-bezier(0.7, 0, 0.84, 0)'
  }
};

/**
 * Get all available preset names.
 * @returns {string[]}
 */
export function getPresetNames() {
  return Object.keys(animationPresets);
}

/**
 * Get a preset by name.
 * @param {string} name
 * @returns {Object|null}
 */
export function getPreset(name) {
  return animationPresets[name] || null;
}

/**
 * Get presets filtered by category.
 * @param {string} category - 'entry' | 'exit' | 'fade' | 'scale' | 'flip' | 'rotate' | 'blur' | 'wipe' | 'split' | 'effect'
 * @returns {Object}
 */
export function getPresetsByCategory(category) {
  const prefixes = {
    entry: ['slide-in'],
    exit: ['slide-out'],
    fade: ['fade'],
    scale: ['scale'],
    flip: ['flip'],
    rotate: ['rotate'],
    blur: ['blur'],
    wipe: ['wipe'],
    split: ['split'],
    effect: ['typewriter', 'count-up', 'glow', 'shimmer', 'bounce', 'swing', 'zoom']
  };

  const matchPrefixes = prefixes[category] || [];
  const result = {};

  for (const [name, preset] of Object.entries(animationPresets)) {
    if (matchPrefixes.some(p => name.startsWith(p))) {
      result[name] = preset;
    }
  }

  return result;
}
