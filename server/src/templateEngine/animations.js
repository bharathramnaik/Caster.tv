/**
 * Animation Presets
 * Common animation definitions for broadcast graphic elements.
 */

export const presets = {
  'slide-in-left': {
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: 0.5,
    easing: 'ease-out'
  },
  'slide-in-right': {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
    duration: 0.5,
    easing: 'ease-out'
  },
  'slide-in-top': {
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 0.5,
    easing: 'ease-out'
  },
  'slide-in-bottom': {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    duration: 0.5,
    easing: 'ease-out'
  },
  'slide-out-left': {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(-100%)', opacity: 0 },
    duration: 0.5,
    easing: 'ease-in'
  },
  'slide-out-right': {
    from: { transform: 'translateX(0)', opacity: 1 },
    to: { transform: 'translateX(100%)', opacity: 0 },
    duration: 0.5,
    easing: 'ease-in'
  },
  'slide-out-top': {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(-100%)', opacity: 0 },
    duration: 0.5,
    easing: 'ease-in'
  },
  'slide-out-bottom': {
    from: { transform: 'translateY(0)', opacity: 1 },
    to: { transform: 'translateY(100%)', opacity: 0 },
    duration: 0.5,
    easing: 'ease-in'
  },
  'fade-in': {
    from: { opacity: 0 },
    to: { opacity: 1 },
    duration: 0.3,
    easing: 'ease-in'
  },
  'fade-out': {
    from: { opacity: 1 },
    to: { opacity: 0 },
    duration: 0.3,
    easing: 'ease-out'
  },
  'bounce-in': {
    from: { transform: 'scale(0)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.6,
    easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)'
  },
  'scale-in': {
    from: { transform: 'scale(0.5)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    duration: 0.4,
    easing: 'ease-out'
  },
  'scale-out': {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.5)', opacity: 0 },
    duration: 0.4,
    easing: 'ease-in'
  },
  'wipe-in-right': {
    from: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    to: { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
    duration: 0.5,
    easing: 'ease-out'
  },
  'wipe-out-left': {
    from: { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
    to: { clipPath: 'inset(0 0 0 100%)', opacity: 0 },
    duration: 0.5,
    easing: 'ease-in'
  },
  'typewriter': {
    from: { width: '0', overflow: 'hidden', whiteSpace: 'nowrap' },
    to: { width: '100%', overflow: 'hidden', whiteSpace: 'nowrap' },
    duration: 1.0,
    easing: 'steps(20, end)'
  }
};

/**
 * Resolve an animation preset or inline animation definition to CSS keyframes.
 * @param {Object} animDef - Animation definition from template
 * @returns {{ name: string, css: string, duration: number }}
 */
export function resolveAnimation(animDef) {
  if (!animDef) return null;

  const preset = animDef.preset ? presets[animDef.preset] : null;
  const from = animDef.from || preset?.from || {};
  const to = animDef.to || preset?.to || {};
  const duration = animDef.duration || preset?.duration || 0.5;
  const easing = animDef.easing || preset?.easing || 'ease-out';
  const delay = animDef.delay || 0;
  const name = `anim-${animDef.preset || 'custom'}-${hashObj(from + to)}`;

  const fromCSS = styleToCSS(from);
  const toCSS = styleToCSS(to);

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
    fillMode: animDef.fillMode || 'both'
  };
}

/**
 * Convert a style object to a CSS string.
 */
function styleToCSS(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${camelToKebab(k)}: ${v}`)
    .join('; ');
}

/**
 * Generate inline style for an animation.
 */
export function animationToInlineStyle(animResult) {
  if (!animResult) return '';
  return `animation: ${animResult.name} ${animResult.duration}s ${animResult.easing} ${animResult.delay}s ${animResult.fillMode}`;
}

/**
 * Generate all @keyframes CSS from a template's animations.
 */
export function generateAnimationCSS(template) {
  if (!template?.animations) return '';

  const blocks = [];

  if (template.animations.enter) {
    for (const [elementId, animDef] of Object.entries(template.animations.enter)) {
      const resolved = resolveAnimation(animDef);
      if (resolved) {
        blocks.push(resolved.css);
      }
    }
  }

  if (template.animations.exit) {
    for (const [elementId, animDef] of Object.entries(template.animations.exit)) {
      const resolved = resolveAnimation(animDef);
      if (resolved) {
        blocks.push(resolved.css);
      }
    }
  }

  return blocks.join('\n');
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
