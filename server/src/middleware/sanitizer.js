/**
 * Input sanitizer middleware — strips dangerous HTML/JS from user inputs.
 */

const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const JS_PROTOCOL = /javascript\s*:/gi;
const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
const ENTITY_MATCHER = /[&<>"']/g;

/**
 * Escapes HTML entities in a string.
 * @param {string} str
 * @returns {string}
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(SCRIPT_TAG, '')
    .replace(JS_PROTOCOL, '')
    .replace(ENTITY_MATCHER, ch => HTML_ENTITIES[ch]);
}

function sanitizeValue(value) {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = sanitizeValue(value);
  }
  return result;
}

/**
 * Middleware that sanitizes all string fields in req.body.
 */
export const sanitizeInput = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};
