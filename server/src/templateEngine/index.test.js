import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTemplate,
  processTemplate,
  validateTemplate,
  renderTemplate,
  renderFragment,
  resolveVariables,
  resolveObject,
  hasBindings,
  extractBindings,
  evaluateCondition,
  registerFilter,
  mergeTemplates,
  getTemplateBindings,
  presets,
  resolveAnimation,
  exportStaticHTML,
  templateSchema,
  TEMPLATE_CATEGORIES,
  ELEMENT_TYPES
} from './index.js';

// ── Schema ────────────────────────────────────────────────────────

describe('schema', () => {
  it('exports template categories', () => {
    assert.ok(TEMPLATE_CATEGORIES.includes('lower-third'));
    assert.ok(TEMPLATE_CATEGORIES.includes('full-screen'));
    assert.ok(TEMPLATE_CATEGORIES.includes('ticker'));
    assert.ok(TEMPLATE_CATEGORIES.includes('scoreboard'));
    assert.ok(TEMPLATE_CATEGORIES.includes('player-card'));
  });

  it('exports element types', () => {
    assert.ok(ELEMENT_TYPES.includes('text'));
    assert.ok(ELEMENT_TYPES.includes('image'));
    assert.ok(ELEMENT_TYPES.includes('shape'));
    assert.ok(ELEMENT_TYPES.includes('score'));
    assert.ok(ELEMENT_TYPES.includes('timer'));
    assert.ok(ELEMENT_TYPES.includes('ticker'));
  });

  it('schema has required fields', () => {
    assert.deepStrictEqual(templateSchema.required, ['id', 'name', 'version', 'elements']);
  });
});

// ── Validator ─────────────────────────────────────────────────────

describe('validateTemplate', () => {
  it('validates a valid template', () => {
    const result = validateTemplate({
      id: 'test-1',
      name: 'Test Template',
      version: '1.0.0',
      elements: []
    });
    assert.ok(result.valid);
    assert.strictEqual(result.errors.length, 0);
  });

  it('rejects missing required fields', () => {
    const result = validateTemplate({});
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('id')));
    assert.ok(result.errors.some(e => e.includes('name')));
    assert.ok(result.errors.some(e => e.includes('version')));
    assert.ok(result.errors.some(e => e.includes('elements')));
  });

  it('rejects invalid category', () => {
    const result = validateTemplate({
      id: 't', name: 'T', version: '1', category: 'invalid', elements: []
    });
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('category')));
  });

  it('rejects invalid element type', () => {
    const result = validateTemplate({
      id: 't', name: 'T', version: '1',
      elements: [{ id: 'e1', type: 'invalid', position: { x: 0, y: 0, width: 100, height: 50 } }]
    });
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('type')));
  });

  it('rejects duplicate element ids', () => {
    const result = validateTemplate({
      id: 't', name: 'T', version: '1',
      elements: [
        { id: 'dup', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 } },
        { id: 'dup', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 } }
      ]
    });
    assert.ok(!result.valid);
    assert.ok(result.errors.some(e => e.includes('Duplicate')));
  });

  it('rejects null input', () => {
    const result = validateTemplate(null);
    assert.ok(!result.valid);
  });
});

// ── Parser ────────────────────────────────────────────────────────

describe('parseTemplate', () => {
  it('parses a valid JSON string', () => {
    const json = JSON.stringify({
      id: 'lt-1', name: 'Lower Third', version: '1.0',
      elements: [{ id: 'text1', type: 'text', position: { x: 0, y: 0, width: 400, height: 60 } }]
    });
    const { template, errors } = parseTemplate(json);
    assert.strictEqual(errors.length, 0);
    assert.strictEqual(template.id, 'lt-1');
    assert.strictEqual(template.canvas.width, 1920);
  });

  it('rejects invalid JSON', () => {
    const { template, errors } = parseTemplate('not json');
    assert.strictEqual(template, null);
    assert.ok(errors[0].includes('Invalid JSON'));
  });

  it('normalizes defaults', () => {
    const { template } = parseTemplate({
      id: 't', name: 'T', version: '1',
      elements: [{ id: 'e1', type: 'text', position: { x: 10, y: 20, width: 100, height: 50 } }]
    });
    assert.strictEqual(template.canvas.width, 1920);
    assert.strictEqual(template.canvas.height, 1080);
    assert.strictEqual(template.elements[0].position.zIndex, 0);
    assert.strictEqual(template.elements[0].style, null);
  });

  it('sorts elements by zIndex', () => {
    const { template } = parseTemplate({
      id: 't', name: 'T', version: '1',
      elements: [
        { id: 'a', type: 'text', position: { x: 0, y: 0, width: 100, height: 50, zIndex: 10 } },
        { id: 'b', type: 'text', position: { x: 0, y: 0, width: 100, height: 50, zIndex: 1 } }
      ]
    });
    assert.strictEqual(template.elements[0].id, 'b');
    assert.strictEqual(template.elements[1].id, 'a');
  });
});

// ── Variables ─────────────────────────────────────────────────────

describe('resolveVariables', () => {
  it('resolves simple bindings', () => {
    const result = resolveVariables('Hello {{name}}!', { name: 'World' });
    assert.strictEqual(result, 'Hello World!');
  });

  it('resolves nested bindings', () => {
    const result = resolveVariables('{{player.name}} - {{player.runs}}', {
      player: { name: 'Virat', runs: 100 }
    });
    assert.strictEqual(result, 'Virat - 100');
  });

  it('applies filters', () => {
    const result = resolveVariables('{{name | uppercase}}', { name: 'india' });
    assert.strictEqual(result, 'INDIA');
  });

  it('handles missing values', () => {
    const result = resolveVariables('Hello {{missing}}!', {});
    assert.strictEqual(result, 'Hello !');
  });

  it('returns non-string inputs as-is', () => {
    assert.strictEqual(resolveVariables(42, {}), 42);
    assert.strictEqual(resolveVariables(null, {}), null);
  });
});

describe('resolveObject', () => {
  it('resolves bindings in nested objects', () => {
    const result = resolveObject(
      { text: '{{player}}', style: { color: '{{teamColor}}' } },
      { player: 'Kohli', teamColor: 'blue' }
    );
    assert.strictEqual(result.text, 'Kohli');
    assert.strictEqual(result.style.color, 'blue');
  });

  it('resolves bindings in arrays', () => {
    const result = resolveObject(
      ['{{a}}', '{{b}}'],
      { a: 'first', b: 'second' }
    );
    assert.deepStrictEqual(result, ['first', 'second']);
  });
});

describe('hasBindings', () => {
  it('detects bindings', () => {
    assert.ok(hasBindings('{{x}}'));
    assert.ok(hasBindings('Hello {{name}}'));
    assert.ok(!hasBindings('no bindings'));
    assert.ok(!hasBindings(123));
  });
});

describe('extractBindings', () => {
  it('extracts variable paths', () => {
    const result = extractBindings('{{player.name}} score: {{score.runs}}');
    assert.deepStrictEqual(result, ['player.name', 'score.runs']);
  });

  it('ignores conditionals', () => {
    const result = extractBindings('{{#if x}}{{name}}{{/if}}');
    assert.deepStrictEqual(result, ['name']);
  });
});

describe('evaluateCondition', () => {
  it('evaluates truthiness', () => {
    assert.ok(evaluateCondition('flag', { flag: true }));
    assert.ok(!evaluateCondition('flag', { flag: false }));
    assert.ok(!evaluateCondition('missing', {}));
  });

  it('evaluates comparisons', () => {
    assert.ok(evaluateCondition('score > 100', { score: 150 }));
    assert.ok(!evaluateCondition('score > 100', { score: 50 }));
    assert.ok(evaluateCondition('score == 100', { score: 100 }));
    assert.ok(evaluateCondition('score != 50', { score: 100 }));
    assert.ok(evaluateCondition('score >= 100', { score: 100 }));
    assert.ok(evaluateCondition('score <= 100', { score: 100 }));
  });
});

describe('registerFilter', () => {
  it('registers and uses custom filter', () => {
    registerFilter('double', (val) => Number(val) * 2);
    const result = resolveVariables('{{num | double}}', { num: 5 });
    assert.strictEqual(result, '10');
  });
});

// ── Animations ────────────────────────────────────────────────────

describe('presets', () => {
  it('has expected presets', () => {
    assert.ok(presets['slide-in-left']);
    assert.ok(presets['slide-in-right']);
    assert.ok(presets['fade-in']);
    assert.ok(presets['fade-out']);
    assert.ok(presets['bounce-in']);
    assert.ok(presets['scale-in']);
    assert.ok(presets['slide-out-left']);
    assert.ok(presets['slide-out-right']);
    assert.ok(presets['typewriter']);
  });

  it('preset has required fields', () => {
    const anim = presets['slide-in-left'];
    assert.ok(anim.from);
    assert.ok(anim.to);
    assert.ok(typeof anim.duration === 'number');
    assert.ok(anim.easing);
  });
});

describe('resolveAnimation', () => {
  it('resolves a preset', () => {
    const result = resolveAnimation({ preset: 'fade-in' });
    assert.ok(result.name);
    assert.ok(result.css.includes('@keyframes'));
    assert.strictEqual(result.duration, 0.3);
  });

  it('returns null for null input', () => {
    assert.strictEqual(resolveAnimation(null), null);
    assert.strictEqual(resolveAnimation(undefined), null);
  });

  it('handles inline animation', () => {
    const result = resolveAnimation({
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 0.2,
      easing: 'linear'
    });
    assert.ok(result.name);
    assert.strictEqual(result.duration, 0.2);
  });
});

// ── Renderer ──────────────────────────────────────────────────────

describe('renderTemplate', () => {
  it('renders a complete HTML document', () => {
    const template = {
      id: 'test', name: 'Test', version: '1.0',
      elements: [
        { id: 'title', type: 'text', position: { x: 10, y: 20, width: 400, height: 60 }, content: 'Hello' }
      ]
    };
    const html = renderTemplate(template);
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('Hello'));
    assert.ok(html.includes('broadcast-canvas'));
  });

  it('renders with data', () => {
    const template = {
      id: 'test', name: 'Test', version: '1.0',
      elements: [
        { id: 'title', type: 'text', position: { x: 0, y: 0, width: 400, height: 60 }, content: '{{team}}' }
      ]
    };
    const html = renderTemplate(template, { team: 'India' });
    assert.ok(html.includes('India'));
  });
});

describe('renderFragment', () => {
  it('renders HTML fragment without doctype', () => {
    const template = {
      id: 'test', name: 'Test', version: '1.0',
      elements: [
        { id: 'el', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, content: 'Fragment' }
      ]
    };
    const html = renderFragment(template);
    assert.ok(!html.includes('<!DOCTYPE'));
    assert.ok(html.includes('Fragment'));
    assert.ok(html.includes('broadcast-canvas'));
  });
});

describe('exportStaticHTML', () => {
  it('exports a full HTML document', () => {
    const template = {
      id: 'export', name: 'Export Test', version: '1.0',
      elements: [
        { id: 'score', type: 'score', position: { x: 0, y: 0, width: 200, height: 100 }, content: '{{score}}' }
      ]
    };
    const html = exportStaticHTML(template, { score: '245/3' });
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('245/3'));
  });
});

// ── Parser processTemplate ────────────────────────────────────────

describe('processTemplate', () => {
  it('resolves bindings in elements', () => {
    const template = {
      id: 't', name: 'T', version: '1',
      elements: [
        { id: 'e1', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, content: '{{player}}' }
      ]
    };
    const result = processTemplate(template, { player: 'Kohli' });
    assert.strictEqual(result.elements[0].content, 'Kohli');
  });

  it('filters elements by condition', () => {
    const template = {
      id: 't', name: 'T', version: '1',
      elements: [
        { id: 'e1', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, content: 'A' },
        { id: 'e2', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, content: 'B', condition: 'showB' }
      ]
    };
    const result = processTemplate(template, { showB: false });
    assert.strictEqual(result.elements.length, 1);
    assert.strictEqual(result.elements[0].id, 'e1');
  });

  it('filters with comparison conditions', () => {
    const template = {
      id: 't', name: 'T', version: '1',
      elements: [
        { id: 'e1', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, content: 'A', condition: 'score > 100' }
      ]
    };
    const result = processTemplate(template, { score: 150 });
    assert.strictEqual(result.elements.length, 1);

    const result2 = processTemplate(template, { score: 50 });
    assert.strictEqual(result2.elements.length, 0);
  });
});

// ── mergeTemplates ────────────────────────────────────────────────

describe('mergeTemplates', () => {
  it('merges two templates', () => {
    const base = {
      id: 'base', name: 'Base', version: '1',
      canvas: { width: 1920, height: 1080 },
      elements: [{ id: 'a', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 } }],
      animations: { enter: { a: { preset: 'fade-in' } } }
    };
    const overlay = {
      id: 'overlay', name: 'Overlay', version: '2',
      elements: [{ id: 'b', type: 'text', position: { x: 10, y: 10, width: 200, height: 80 } }]
    };
    const result = mergeTemplates(base, overlay);
    assert.strictEqual(result.id, 'overlay');
    assert.strictEqual(result.canvas.width, 1920);
    assert.strictEqual(result.elements[0].id, 'b');
    assert.ok(result.animations.enter.a);
  });
});

// ── getTemplateBindings ───────────────────────────────────────────

describe('getTemplateBindings', () => {
  it('extracts all bindings from a template', () => {
    const template = {
      id: 't', name: 'T', version: '1',
      elements: [
        { id: 'e1', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, content: '{{player.name}}' },
        { id: 'e2', type: 'text', position: { x: 0, y: 0, width: 100, height: 50 }, binding: '{{score.runs}}' }
      ]
    };
    const bindings = getTemplateBindings(template);
    assert.ok(bindings.includes('player.name'));
    assert.ok(bindings.includes('score.runs'));
  });
});
