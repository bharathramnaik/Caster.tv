/**
 * Animation Composer
 * Composes multiple element animations with stagger, parallel, and sequential support.
 */

import { generateKeyframes, generateInlineStyle } from './generator.js';

/**
 * Compose animations for multiple elements.
 * @param {Array<Object>} elements - Array of element definitions with animations
 * @param {Object} options - Composition options
 * @returns {{ css: string, timeline: Object, totalDuration: number }}
 */
export function composeAnimations(elements, options = {}) {
  const {
    mode = 'parallel',       // 'parallel' | 'sequential' | 'stagger'
    staggerDelay = 0.1,     // Delay between elements in stagger mode
    baseDelay = 0,           // Base delay for all animations
    groupDelay = 0           // Additional delay for groups
  } = options;

  const cssBlocks = [];
  const timeline = [];
  let currentTime = baseDelay;

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const elementDelay = calculateDelay(mode, i, staggerDelay, currentTime);

    const elementTimeline = composeElementAnimation(element, elementDelay);
    if (elementTimeline) {
      cssBlocks.push(elementTimeline.css);
      timeline.push(elementTimeline);
    }

    if (mode === 'sequential' && elementTimeline) {
      currentTime += elementTimeline.duration + (element.animation?.delay || 0);
    }
  }

  const totalDuration = timeline.length > 0
    ? Math.max(...timeline.map(t => t.startTime + t.duration))
    : 0;

  return {
    css: cssBlocks.join('\n\n'),
    timeline: {
      elements: timeline,
      totalDuration,
      mode
    },
    totalDuration
  };
}

/**
 * Compose animation for a single element with enter/exit sequences.
 * @param {Object} element - Element definition with enter/exit animations
 * @param {number} baseDelay - Base delay for this element
 * @returns {Object|null}
 */
export function composeElementAnimation(element, baseDelay = 0) {
  if (!element || !element.animation) return null;

  const anim = element.animation;
  const cssBlocks = [];
  let currentTime = baseDelay;

  // Enter animation
  if (anim.enter) {
    const enterKeyframes = generateKeyframes({
      ...anim.enter,
      delay: currentTime
    });

    if (enterKeyframes) {
      cssBlocks.push(enterKeyframes.css);
      currentTime += enterKeyframes.duration;
    }
  }

  // Hold/loop animation
  if (anim.hold) {
    const holdKeyframes = generateKeyframes({
      ...anim.hold,
      delay: currentTime
    });

    if (holdKeyframes) {
      cssBlocks.push(holdKeyframes.css);
      currentTime += holdKeyframes.duration;
    }
  }

  // Exit animation
  if (anim.exit) {
    const exitKeyframes = generateKeyframes({
      ...anim.exit,
      delay: currentTime
    });

    if (exitKeyframes) {
      cssBlocks.push(exitKeyframes.css);
      currentTime += exitKeyframes.duration;
    }
  }

  // Single animation (legacy support)
  if (!anim.enter && !anim.hold && !anim.exit) {
    const keyframes = generateKeyframes({
      ...anim,
      delay: currentTime
    });

    if (keyframes) {
      cssBlocks.push(keyframes.css);
      currentTime += keyframes.duration;
    }
  }

  return {
    elementId: element.id,
    css: cssBlocks.join('\n\n'),
    startTime: baseDelay,
    duration: currentTime - baseDelay,
    animations: extractAnimationInfo(anim)
  };
}

/**
 * Create a staggered animation sequence.
 * @param {Array<Object>} elements - Array of elements
 * @param {Object} staggerConfig - Stagger configuration
 * @returns {Object}
 */
export function createStaggerSequence(elements, staggerConfig = {}) {
  const {
    delay = 0.1,
    from = 'first',  // 'first' | 'last' | 'center'
    direction = 'normal'  // 'normal' | 'reverse' | 'alternate'
  } = staggerConfig;

  const orderedElements = orderElements(elements, from, direction);

  return composeAnimations(orderedElements, {
    mode: 'stagger',
    staggerDelay: delay
  });
}

/**
 * Create parallel animations for multiple elements.
 * @param {Array<Object>} elements - Array of elements
 * @param {Object} options - Options
 * @returns {Object}
 */
export function createParallelAnimations(elements, options = {}) {
  return composeAnimations(elements, {
    mode: 'parallel',
    ...options
  });
}

/**
 * Create sequential animations (one after another).
 * @param {Array<Object>} elements - Array of elements
 * @param {Object} options - Options
 * @returns {Object}
 */
export function createSequentialAnimations(elements, options = {}) {
  return composeAnimations(elements, {
    mode: 'sequential',
    ...options
  });
}

/**
 * Create a timeline for complex animation sequences.
 * @param {Array<Object>} tracks - Array of animation tracks
 * @returns {Object}
 */
export function createTimeline(tracks) {
  const timeline = [];
  let totalDuration = 0;

  for (const track of tracks) {
    const trackTimeline = {
      id: track.id,
      elementId: track.elementId,
      animations: []
    };

    let trackTime = track.offset || 0;

    for (const anim of track.animations) {
      const keyframes = generateKeyframes(anim);
      if (keyframes) {
        trackTimeline.animations.push({
          name: keyframes.name,
          startTime: trackTime,
          duration: keyframes.duration,
          endTime: trackTime + keyframes.duration,
          css: keyframes.css,
          inlineStyle: generateInlineStyle(keyframes)
        });

        trackTime += keyframes.duration + (anim.delay || 0);
      }
    }

    trackTimeline.duration = trackTime - (track.offset || 0);
    totalDuration = Math.max(totalDuration, trackTime);
    timeline.push(trackTimeline);
  }

  return {
    tracks: timeline,
    totalDuration,
    toCSS: () => timelineToCSS(timeline),
    toJSON: () => timelineToJSON(timeline, totalDuration)
  };
}

/**
 * Generate a master timeline CSS that combines all tracks.
 * @param {Object} timeline - Timeline object from createTimeline
 * @returns {string}
 */
export function timelineToCSS(timeline) {
  const cssBlocks = [];

  for (const track of timeline) {
    for (const anim of track.animations) {
      cssBlocks.push(anim.css);
    }
  }

  return cssBlocks.join('\n\n');
}

/**
 * Convert timeline to JSON format for client-side rendering.
 * @param {Array} timeline - Timeline tracks
 * @param {number} totalDuration - Total duration in seconds
 * @returns {Object}
 */
export function timelineToJSON(timeline, totalDuration) {
  return {
    version: '1.0',
    totalDuration,
    tracks: timeline.map(track => ({
      id: track.id,
      elementId: track.elementId,
      duration: track.duration,
      animations: track.animations.map(anim => ({
        name: anim.name,
        startTime: anim.startTime,
        duration: anim.duration,
        endTime: anim.endTime
      }))
    }))
  };
}

/**
 * Apply animation to element HTML.
 * @param {string} html - Element HTML
 * @param {Object} animResult - Animation result from composeElementAnimation
 * @returns {string}
 */
export function applyAnimationToHTML(html, animResult) {
  if (!animResult || !animResult.animations || animResult.animations.length === 0) {
    return html;
  }

  const firstAnim = animResult.animations.enter || animResult.animations[0];
  if (!firstAnim) return html;

  const animStyle = generateInlineStyle({
    name: firstAnim.name,
    duration: firstAnim.duration,
    easing: firstAnim.easing,
    delay: animResult.startTime,
    fillMode: 'both'
  });

  // Insert animation style into existing style attribute
  const styleMatch = html.match(/style="([^"]*)"/);
  if (styleMatch) {
    const existingStyle = styleMatch[1];
    return html.replace(
      `style="${existingStyle}"`,
      `style="${existingStyle};${animStyle}"`
    );
  }

  return html.replace('>', ` ${animStyle}>`);
}

// ── Helper Functions ────────────────────────────────────────────────

function calculateDelay(mode, index, staggerDelay, baseTime) {
  switch (mode) {
    case 'parallel':
      return baseTime;
    case 'sequential':
      return baseTime;
    case 'stagger':
      return baseTime + (index * staggerDelay);
    default:
      return baseTime;
  }
}

function orderElements(elements, from, direction) {
  const ordered = [...elements];

  switch (from) {
    case 'last':
      ordered.reverse();
      break;
    case 'center':
      const center = Math.floor(ordered.length / 2);
      ordered.sort((a, b) => {
        const distA = Math.abs(elements.indexOf(a) - center);
        const distB = Math.abs(elements.indexOf(b) - center);
        return distA - distB;
      });
      break;
    default:
      break;
  }

  if (direction === 'reverse') {
    ordered.reverse();
  }

  return ordered;
}

function extractAnimationInfo(anim) {
  if (!anim) return {};

  const info = {};

  if (anim.enter) {
    info.enter = {
      preset: anim.enter.preset,
      duration: anim.enter.duration
    };
  }

  if (anim.hold) {
    info.hold = {
      preset: anim.hold.preset,
      duration: anim.hold.duration
    };
  }

  if (anim.exit) {
    info.exit = {
      preset: anim.exit.preset,
      duration: anim.exit.duration
    };
  }

  // Legacy single animation
  if (!anim.enter && !anim.hold && !anim.exit) {
    info.preset = anim.preset;
    info.duration = anim.duration;
  }

  return info;
}
