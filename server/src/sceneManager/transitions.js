/**
 * Transition Engine
 * Handles transitions between scenes with CSS and JS generation.
 */

/**
 * Available transition types with defaults
 */
export const transitionTypes = {
  'cut': { duration: 0, easing: 'linear' },
  'fade': { duration: 0.5, easing: 'ease-in-out' },
  'slide-left': { duration: 0.5, easing: 'ease-out' },
  'slide-right': { duration: 0.5, easing: 'ease-out' },
  'slide-up': { duration: 0.5, easing: 'ease-out' },
  'slide-down': { duration: 0.5, easing: 'ease-out' },
  'wipe-left': { duration: 0.5, easing: 'ease-linear' },
  'wipe-right': { duration: 0.5, easing: 'ease-linear' },
  'zoom': { duration: 0.5, easing: 'ease-out' },
  'blur': { duration: 0.5, easing: 'ease-in-out' }
};

/**
 * Get transition config by type, with optional overrides
 * @param {string} type - Transition type
 * @param {Object} [overrides] - Override defaults
 * @returns {Object} Transition config
 */
export function getTransition(type, overrides = {}) {
  const base = transitionTypes[type] || transitionTypes['fade'];
  return {
    type,
    duration: overrides.duration ?? base.duration,
    easing: overrides.easing ?? base.easing
  };
}

/**
 * Generate CSS keyframes for a scene transition
 * @param {string} transitionType - Type of transition
 * @param {number} [duration] - Duration in seconds
 * @returns {string} CSS keyframes string
 */
export function generateTransitionCSS(transitionType, duration) {
  const config = getTransition(transitionType, duration != null ? { duration } : {});
  const dur = config.duration;
  const ease = config.easing;
  const name = `scene-transition-${transitionType.replace(/\s+/g, '-')}`;

  const keyframes = getKeyframesForType(transitionType);
  if (!keyframes) return '';

  const css = `@keyframes ${name}-exit {
    from { ${keyframes.exitFrom} }
    to { ${keyframes.exitTo} }
  }
@keyframes ${name}-enter {
    from { ${keyframes.enterFrom} }
    to { ${keyframes.enterTo} }
  }`;

  const style = `.scene-exit {
    animation: ${name}-exit ${dur}s ${ease} forwards;
  }
.scene-enter {
    animation: ${name}-enter ${dur}s ${ease} forwards;
  }`;

  return `${css}\n${style}`;
}

/**
 * Get keyframe definitions for each transition type
 */
function getKeyframesForType(type) {
  switch (type) {
    case 'cut':
      return {
        exitFrom: 'opacity: 1',
        exitTo: 'opacity: 0',
        enterFrom: 'opacity: 1',
        enterTo: 'opacity: 1'
      };
    case 'fade':
      return {
        exitFrom: 'opacity: 1',
        exitTo: 'opacity: 0',
        enterFrom: 'opacity: 0',
        enterTo: 'opacity: 1'
      };
    case 'slide-left':
      return {
        exitFrom: 'transform: translateX(0); opacity: 1',
        exitTo: 'transform: translateX(-100%); opacity: 0',
        enterFrom: 'transform: translateX(100%); opacity: 0',
        enterTo: 'transform: translateX(0); opacity: 1'
      };
    case 'slide-right':
      return {
        exitFrom: 'transform: translateX(0); opacity: 1',
        exitTo: 'transform: translateX(100%); opacity: 0',
        enterFrom: 'transform: translateX(-100%); opacity: 0',
        enterTo: 'transform: translateX(0); opacity: 1'
      };
    case 'slide-up':
      return {
        exitFrom: 'transform: translateY(0); opacity: 1',
        exitTo: 'transform: translateY(-100%); opacity: 0',
        enterFrom: 'transform: translateY(100%); opacity: 0',
        enterTo: 'transform: translateY(0); opacity: 1'
      };
    case 'slide-down':
      return {
        exitFrom: 'transform: translateY(0); opacity: 1',
        exitTo: 'transform: translateY(100%); opacity: 0',
        enterFrom: 'transform: translateY(-100%); opacity: 0',
        enterTo: 'transform: translateY(0); opacity: 1'
      };
    case 'wipe-left':
      return {
        exitFrom: 'clip-path: inset(0 0 0 0)',
        exitTo: 'clip-path: inset(0 100% 0 0)',
        enterFrom: 'clip-path: inset(0 0 0 100%)',
        enterTo: 'clip-path: inset(0 0 0 0)'
      };
    case 'wipe-right':
      return {
        exitFrom: 'clip-path: inset(0 0 0 0)',
        exitTo: 'clip-path: inset(0 0 0 100%)',
        enterFrom: 'clip-path: inset(0 100% 0 0)',
        enterTo: 'clip-path: inset(0 0 0 0)'
      };
    case 'zoom':
      return {
        exitFrom: 'transform: scale(1); opacity: 1',
        exitTo: 'transform: scale(1.5); opacity: 0',
        enterFrom: 'transform: scale(0.5); opacity: 0',
        enterTo: 'transform: scale(1); opacity: 1'
      };
    case 'blur':
      return {
        exitFrom: 'filter: blur(0px); opacity: 1',
        exitTo: 'filter: blur(20px); opacity: 0',
        enterFrom: 'filter: blur(20px); opacity: 0',
        enterTo: 'filter: blur(0px); opacity: 1'
      };
    default:
      return getKeyframesForType('fade');
  }
}

/**
 * Generate JavaScript code to execute a transition between two scenes
 * @param {string} transitionType - Type of transition
 * @param {number} [duration] - Duration in seconds
 * @returns {string} JavaScript code string
 */
export function generateTransitionJS(transitionType, duration) {
  const config = getTransition(transitionType, duration != null ? { duration } : {});
  const dur = config.duration * 1000; // Convert to ms
  const ease = config.easing;
  const name = `scene-transition-${transitionType.replace(/\s+/g, '-')}`;

  if (transitionType === 'cut') {
    return `// Cut transition - instant swap
function transitionScenes(fromEl, toEl) {
  if (fromEl) fromEl.style.display = 'none';
  if (toEl) toEl.style.display = 'block';
}`;
  }

  return `// ${transitionType} transition - ${config.duration}s
function transitionScenes(fromEl, toEl) {
  return new Promise((resolve) => {
    const dur = ${dur};
    const ease = '${ease}';

    // Apply exit animation to current scene
    if (fromEl) {
      fromEl.style.animation = '${name}-exit ' + dur + 'ms ' + ease + ' forwards';
    }

    // Apply enter animation to new scene
    if (toEl) {
      toEl.style.display = 'block';
      toEl.style.opacity = '0';
      toEl.style.animation = '${name}-enter ' + dur + 'ms ' + ease + ' forwards';
    }

    // Clean up after animation
    setTimeout(() => {
      if (fromEl) {
        fromEl.style.display = 'none';
        fromEl.style.animation = '';
      }
      if (toEl) {
        toEl.style.animation = '';
        toEl.style.opacity = '1';
      }
      resolve();
    }, dur);
  });
}`;
}

/**
 * Generate complete transition stylesheet (CSS keyframes + classes)
 * @param {string} transitionType
 * @param {number} [duration]
 * @returns {string} Complete CSS
 */
export function generateTransitionStylesheet(transitionType, duration) {
  const css = generateTransitionCSS(transitionType, duration);
  if (!css) return '';

  return `<style>
/* Scene Transition: ${transitionType} */
${css}
</style>`;
}

/**
 * Generate transition HTML template for swapping scenes
 * @param {string} fromHTML - HTML of outgoing scene
 * @param {string} toHTML - HTML of incoming scene
 * @param {string} transitionType
 * @param {number} [duration]
 * @returns {string} HTML with transition wrapper
 */
export function generateTransitionHTML(fromHTML, toHTML, transitionType, duration) {
  const config = getTransition(transitionType, duration != null ? { duration } : {});
  const stylesheet = generateTransitionStylesheet(transitionType, config.duration);
  const js = generateTransitionJS(transitionType, config.duration);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scene Transition</title>
  ${stylesheet}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    .scene-container { position: relative; width: 100%; height: 100vh; overflow: hidden; }
    .scene-from, .scene-to { position: absolute; inset: 0; }
    .scene-to { display: none; }
  </style>
</head>
<body>
  <div class="scene-container">
    <div class="scene-from scene-exit">${fromHTML}</div>
    <div class="scene-to scene-enter">${toHTML}</div>
  </div>
  <script>
    ${js}
    const fromEl = document.querySelector('.scene-from');
    const toEl = document.querySelector('.scene-to');
    transitionScenes(fromEl, toEl);
  </script>
</body>
</html>`;
}

/**
 * List all available transition types
 * @returns {string[]}
 */
export function listTransitionTypes() {
  return Object.keys(transitionTypes);
}

/**
 * Check if a transition type is valid
 * @param {string} type
 * @returns {boolean}
 */
export function isValidTransition(type) {
  return type in transitionTypes;
}
