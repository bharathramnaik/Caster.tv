# Animation Library

Professional broadcast-quality animation system for WASP3D-style graphics.

## Overview

This library provides 35+ animation presets, 20+ transition presets, and tools for composing complex multi-element animations with stagger, parallel, and sequential execution.

## Quick Start

```javascript
import {
  animationPresets,
  generateKeyframes,
  generateInlineStyle,
  composeAnimations
} from './animations/index.js';

// Generate CSS keyframes for a preset
const keyframes = generateKeyframes({ preset: 'slide-in-left' });
console.log(keyframes.css);

// Get inline style for an element
const inlineStyle = generateInlineStyle(keyframes);
// Output: "animation: slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0s both"
```

## Animation Presets

### Entry Animations (8)
| Preset | Duration | Description |
|--------|----------|-------------|
| `slide-in-left` | 0.5s | Slide in from left |
| `slide-in-right` | 0.5s | Slide in from right |
| `slide-in-top` | 0.5s | Slide in from top |
| `slide-in-bottom` | 0.5s | Slide in from bottom |
| `fade-in` | 0.3s | Simple fade in |
| `fade-in-up` | 0.5s | Fade in while moving up |
| `fade-in-down` | 0.5s | Fade in while moving down |
| `scale-in` | 0.4s | Scale up from center |

### Exit Animations (8)
| Preset | Duration | Description |
|--------|----------|-------------|
| `slide-out-left` | 0.5s | Slide out to left |
| `slide-out-right` | 0.5s | Slide out to right |
| `slide-out-top` | 0.5s | Slide out to top |
| `slide-out-bottom` | 0.5s | Slide out to bottom |
| `fade-out` | 0.3s | Simple fade out |
| `scale-out` | 0.4s | Scale down to center |
| `blur-out` | 0.5s | Blur and fade out |
| `zoom-out` | 0.4s | Zoom out and fade |

### Effect Animations (12)
| Preset | Duration | Description |
|--------|----------|-------------|
| `scale-in-bounce` | 0.6s | Scale with bounce effect |
| `scale-in-elastic` | 0.8s | Scale with elastic effect |
| `flip-in-x` | 0.6s | 3D flip on X axis |
| `flip-in-y` | 0.6s | 3D flip on Y axis |
| `rotate-in` | 0.6s | Rotate in from 180° |
| `blur-in` | 0.5s | Blur to clear |
| `typewriter` | 1.0s | Typewriter text reveal |
| `count-up` | 0.5s | Number count up effect |
| `glow-pulse` | 1.0s | Pulsing glow effect |
| `shimmer` | 2.0s | Shimmer sweep effect |
| `swing` | 0.5s | Swing rotation |
| `zoom-in` | 0.4s | Zoom in from large |

### Wipe Animations (4)
| Preset | Duration | Description |
|--------|----------|-------------|
| `wipe-left` | 0.5s | Wipe reveal from right |
| `wipe-right` | 0.5s | Wipe reveal from left |
| `wipe-up` | 0.5s | Wipe reveal from bottom |
| `wipe-down` | 0.5s | Wipe reveal from top |

### Split Animations (2)
| Preset | Duration | Description |
|--------|----------|-------------|
| `split-horizontal` | 0.6s | Split from center horizontally |
| `split-vertical` | 0.6s | Split from center vertically |

## Transition Presets

### Instant (1)
| Preset | Duration | Type |
|--------|----------|------|
| `cut` | 0s | cut |

### Crossfade (3)
| Preset | Duration | Type |
|--------|----------|------|
| `fade` | 0.5s | crossfade |
| `fade-slow` | 1.0s | crossfade |
| `fade-fast` | 0.25s | crossfade |

### Slide (4)
| Preset | Duration | Direction |
|--------|----------|-----------|
| `slide-left` | 0.6s | left |
| `slide-right` | 0.6s | right |
| `slide-up` | 0.6s | up |
| `slide-down` | 0.6s | down |

### Wipe (4)
| Preset | Duration | Direction |
|--------|----------|-----------|
| `wipe-left` | 0.5s | left |
| `wipe-right` | 0.5s | right |
| `wipe-up` | 0.5s | up |
| `wipe-down` | 0.5s | down |

### Zoom (2)
| Preset | Duration | Direction |
|--------|----------|-----------|
| `zoom-in` | 0.5s | in |
| `zoom-out` | 0.5s | out |

### 3D Effects (3)
| Preset | Duration | Type |
|--------|----------|------|
| `blur` | 0.4s | blur |
| `flip` | 0.6s | flip |
| `flip-vertical` | 0.6s | flip |
| `rotate` | 0.5s | rotate |

### Push/Reveal/Cover (6)
| Preset | Duration | Type |
|--------|----------|------|
| `push-left` | 0.6s | push |
| `push-right` | 0.6s | push |
| `reveal-left` | 0.6s | reveal |
| `reveal-right` | 0.6s | reveal |
| `cover-left` | 0.6s | cover |
| `cover-right` | 0.6s | cover |

## Usage Examples

### Basic Animation

```javascript
import { generateKeyframes, generateInlineStyle } from './animations/index.js';

// Generate keyframes CSS
const keyframes = generateKeyframes({ preset: 'slide-in-left' });
const css = `
  <style>${keyframes.css}</style>
  <div style="${generateInlineStyle(keyframes)}">Hello World</div>
`;
```

### Custom Animation

```javascript
const custom = generateKeyframes({
  from: { transform: 'translateX(-100%) rotate(-10deg)', opacity: 0 },
  to: { transform: 'translateX(0) rotate(0)', opacity: 1 },
  duration: 0.7,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
});
```

### Staggered Animations

```javascript
import { createStaggerSequence } from './animations/index.js';

const elements = [
  { id: 'el1', animation: { preset: 'fade-in-up' } },
  { id: 'el2', animation: { preset: 'fade-in-up' } },
  { id: 'el3', animation: { preset: 'fade-in-up' } }
];

const result = createStaggerSequence(elements, {
  delay: 0.1,
  from: 'first'
});

// result.css contains all keyframes
// result.timeline contains timing info
```

### Parallel Animations

```javascript
import { createParallelAnimations } from './animations/index.js';

const result = createParallelAnimations(elements, {
  baseDelay: 0.2
});
```

### Sequential Animations

```javascript
import { createSequentialAnimations } from './animations/index.js';

const result = createSequentialAnimations(elements);
// Elements animate one after another
```

### Complex Timeline

```javascript
import { createTimeline } from './animations/index.js';

const timeline = createTimeline([
  {
    id: 'track1',
    elementId: 'title',
    animations: [
      { preset: 'slide-in-left', duration: 0.5 },
      { preset: 'glow-pulse', duration: 1.0, delay: 0.5 }
    ]
  },
  {
    id: 'track2',
    elementId: 'score',
    offset: 0.3,
    animations: [
      { preset: 'count-up', duration: 0.8 }
    ]
  }
]);

// Export as CSS
const css = timeline.toCSS();

// Export as JSON for client-side rendering
const json = timeline.toJSON();
```

### Scene Transition

```javascript
import { generateTransitionCSS } from './animations/index.js';

const transition = generateTransitionCSS('slide-left', {
  duration: 0.8
});

// Apply to scene elements
const html = `
  <div class="transition-out old-scene">...</div>
  <div class="transition-in new-scene">...</div>
  <style>${transition.css}</style>
`;
```

## Custom Animation Creation

### Define a Custom Preset

```javascript
import { animationPresets } from './animations/index.js';

animationPresets['my-custom'] = {
  from: {
    transform: 'translateY(100px) scale(0.8)',
    opacity: 0,
    filter: 'blur(10px)'
  },
  to: {
    transform: 'translateY(0) scale(1)',
    opacity: 1,
    filter: 'blur(0)'
  },
  duration: 0.6,
  easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
};
```

### Multi-Step Animation

```javascript
import { generateMultiStepKeyframes } from './animations/index.js';

const shake = generateMultiStepKeyframes('shake', [
  { percent: 0, styles: { transform: 'translateX(0)' } },
  { percent: 10, styles: { transform: 'translateX(-10px)' } },
  { percent: 20, styles: { transform: 'translateX(10px)' } },
  { percent: 30, styles: { transform: 'translateX(-10px)' } },
  { percent: 40, styles: { transform: 'translateX(10px)' } },
  { percent: 50, styles: { transform: 'translateX(-5px)' } },
  { percent: 60, styles: { transform: 'translateX(5px)' } },
  { percent: 70, styles: { transform: 'translateX(-2px)' } },
  { percent: 80, styles: { transform: 'translateX(2px)' } },
  { percent: 90, styles: { transform: 'translateX(-1px)' } },
  { percent: 100, styles: { transform: 'translateX(0)' } }
]);
```

## API Reference

### Generator Functions

| Function | Description |
|----------|-------------|
| `generateKeyframes(animDef)` | Generate CSS keyframes from animation definition |
| `generateMultiStepKeyframes(name, steps)` | Generate multi-step keyframes |
| `generateInlineStyle(animResult)` | Generate inline animation style |
| `generateAnimationBlock(animDef)` | Generate complete CSS block |
| `generateMultipleAnimations(animDefs)` | Generate CSS for multiple animations |
| `generateJSAnimationCode(animDef)` | Generate Web Animations API code |
| `generateTransitionCSS(name, options)` | Generate transition CSS |
| `combineAnimations(animDefs)` | Combine animations into sequence |

### Composer Functions

| Function | Description |
|----------|-------------|
| `composeAnimations(elements, options)` | Compose animations for multiple elements |
| `composeElementAnimation(element, delay)` | Compose animation for single element |
| `createStaggerSequence(elements, config)` | Create staggered animation sequence |
| `createParallelAnimations(elements, options)` | Create parallel animations |
| `createSequentialAnimations(elements, options)` | Create sequential animations |
| `createTimeline(tracks)` | Create complex timeline |
| `timelineToCSS(timeline)` | Convert timeline to CSS |
| `timelineToJSON(timeline, duration)` | Convert timeline to JSON |
| `applyAnimationToHTML(html, animResult)` | Apply animation to HTML |

### Preview Functions

| Function | Description |
|----------|-------------|
| `generateAnimationPreview(name, options)` | Generate animation preview HTML |
| `generateTransitionPreview(name, options)` | Generate transition preview HTML |
| `generateGalleryPreview(options)` | Generate gallery preview HTML |
| `generateAllPreviews()` | Generate all previews HTML |
| `getAnimationList()` | Get list of all animations |

## Performance Tips

1. **Use GPU-accelerated properties**: `transform` and `opacity` are best for performance
2. **Avoid animating layout properties**: `width`, `height`, `margin`, `padding` trigger layout recalculation
3. **Use `will-change` sparingly**: Only for elements that will animate
4. **Limit simultaneous animations**: Too many concurrent animations can cause jank
5. **Use `requestAnimationFrame`** for JavaScript-driven animations
6. **Prefer CSS animations** over JavaScript animations when possible

## Browser Support

- Chrome 43+
- Firefox 16+
- Safari 9+
- Edge 12+

## File Structure

```
animations/
├── index.js          # Main exports
├── presets.js        # Animation presets (35+)
├── transitions.js    # Transition presets (20+)
├── generator.js      # CSS/JS code generator
├── composer.js       # Multi-element composer
├── preview.js        # Preview generator
└── README.md         # This file
```
