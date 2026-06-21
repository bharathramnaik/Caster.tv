/**
 * Variable Substitution System
 * Parses template strings like {{player.name}}, {{score.runs}}
 * Supports nested objects, filters, and conditional helpers.
 */

const FILTER_REGISTRY = {
  formatNumber: (val) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return num.toLocaleString();
  },
  uppercase: (val) => String(val).toUpperCase(),
  lowercase: (val) => String(val).toLowerCase(),
  capitalize: (val) => {
    const s = String(val);
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  default: (val, fallback) => (val == null || val === '' ? fallback : val),
  truncate: (val, maxLen) => {
    const s = String(val);
    const limit = parseInt(maxLen) || 50;
    return s.length > limit ? s.slice(0, limit) + '...' : s;
  }
};

/**
 * Resolve a dot-notation path against a data object.
 * Supports bracket notation: {{arr[0].name}}
 */
function resolvePath(path, data) {
  if (!data || !path) return undefined;
  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);
  let current = data;
  for (const seg of segments) {
    if (current == null) return undefined;
    current = current[seg];
  }
  return current;
}

/**
 * Parse a single binding expression like "player.name | uppercase"
 * Returns { path, filters: [{ name, args }] }
 */
function parseExpression(expr) {
  const trimmed = expr.trim();
  const parts = trimmed.split('|').map(s => s.trim());
  const path = parts[0];
  const filters = [];
  for (let i = 1; i < parts.length; i++) {
    const filterParts = parts[i].split(':').map(s => s.trim());
    filters.push({ name: filterParts[0], args: filterParts.slice(1) });
  }
  return { path, filters };
}

/**
 * Evaluate a single binding expression against data.
 */
function evaluateExpression(expr, data) {
  const { path, filters } = parseExpression(expr);
  let value = resolvePath(path, data);
  for (const f of filters) {
    const fn = FILTER_REGISTRY[f.name];
    if (fn) {
      value = fn(value, ...f.args);
    }
  }
  return value;
}

/**
 * Process conditional blocks: {{#if condition}}...{{/if}}
 * Also supports negation: {{#unless condition}}...{{/unless}}
 */
function processConditionals(template, data) {
  let result = template;

  // Process {{#if var}}...{{/if}}
  const ifRegex = /\{\{#if\s+(\S+?)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (_, varPath, content) => {
    const val = resolvePath(varPath.trim(), data);
    return val ? content : '';
  });

  // Process {{#unless var}}...{{/unless}}
  const unlessRegex = /\{\{#unless\s+(\S+?)\}\}([\s\S]*?)\{\{\/unless\}\}/g;
  result = result.replace(unlessRegex, (_, varPath, content) => {
    const val = resolvePath(varPath.trim(), data);
    return !val ? content : '';
  });

  return result;
}

/**
 * Replace all {{expression}} tokens in a string with resolved values.
 */
export function resolveVariables(template, data) {
  if (typeof template !== 'string') return template;

  let result = processConditionals(template, data);

  // Replace {{expression}} tokens
  result = result.replace(/\{\{(.+?)\}\}/g, (_, expr) => {
    const value = evaluateExpression(expr, data);
    return value != null ? String(value) : '';
  });

  return result;
}

/**
 * Recursively resolve all variable bindings in an object tree.
 */
export function resolveObject(obj, data) {
  if (obj == null) return obj;
  if (typeof obj === 'string') return resolveVariables(obj, data);
  if (Array.isArray(obj)) return obj.map(item => resolveObject(item, data));

  const resolved = {};
  for (const [key, value] of Object.entries(obj)) {
    resolved[key] = resolveObject(value, data);
  }
  return resolved;
}

/**
 * Register a custom filter function.
 */
export function registerFilter(name, fn) {
  FILTER_REGISTRY[name] = fn;
}

/**
 * Check if a string contains any variable bindings.
 */
export function hasBindings(str) {
  return typeof str === 'string' && /\{\{/.test(str);
}

/**
 * Extract all variable paths from a template string.
 */
export function extractBindings(str) {
  if (typeof str !== 'string') return [];
  const matches = [];
  const regex = /\{\{(.+?)\}\}/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const expr = match[1].trim();
    if (expr.startsWith('#if') || expr.startsWith('#unless') || expr.startsWith('/if') || expr.startsWith('/unless')) {
      continue;
    }
    matches.push(parseExpression(expr).path);
  }
  return matches;
}

/**
 * Evaluate a condition expression for conditional rendering.
 * Supports: {{#if striker}}, {{#if score.runs > 100}}
 */
export function evaluateCondition(condition, data) {
  if (!condition) return true;

  // Simple variable truthiness check
  if (!condition.includes('>') && !condition.includes('<') && !condition.includes('==') && !condition.includes('!=')) {
    const val = resolvePath(condition.trim(), data);
    return !!val;
  }

  // Comparison operators
  const compMatch = condition.match(/(.+?)\s*(>=|<=|!=|==|>|<)\s*(.+)/);
  if (compMatch) {
    const [, leftExpr, op, rightExpr] = compMatch;
    let left = resolvePath(leftExpr.trim(), data);
    let right = resolvePath(rightExpr.trim(), data);

    // Handle literal values (numbers and quoted strings)
    const trimmedRight = rightExpr.trim();
    if (right === undefined) {
      const numVal = Number(trimmedRight);
      if (!isNaN(numVal)) {
        right = numVal;
      } else if ((trimmedRight.startsWith('"') && trimmedRight.endsWith('"')) ||
                 (trimmedRight.startsWith("'") && trimmedRight.endsWith("'"))) {
        right = trimmedRight.slice(1, -1);
      }
    }

    if (typeof right === 'number' && !isNaN(Number(left))) {
      left = Number(left);
    }

    switch (op) {
      case '>': return left > right;
      case '<': return left < right;
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '==': return left == right;
      case '!=': return left != right;
    }
  }

  return !!resolvePath(condition.trim(), data);
}
