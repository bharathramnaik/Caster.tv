/**
 * Data transformation pipeline for converting external data to overlay format.
 * Supports custom transformers and built-in transformation functions.
 */
import { nanoid } from 'nanoid';

/**
 * @class DataTransformer
 * @description Transforms raw data into overlay-compatible format through a pipeline.
 */
export class DataTransformer {
  constructor() {
    /** @type {Map<string, Function>} Registered custom transformers */
    this.transformers = new Map();
    /** @type {Function[]} Active pipeline */
    this.pipeline = [];
  }

  /**
   * Add a custom transformer function.
   * @param {Function} fn - Transformer function (data) => transformedData
   * @param {string} [name] - Optional name for the transformer
   * @returns {string} Transformer ID
   */
  addTransformer(fn, name) {
    const id = `transformer_${nanoid(8)}`;
    this.transformers.set(id, { fn, name: name || id });
    return id;
  }

  /**
   * Remove a transformer by ID.
   * @param {string} id - Transformer ID
   * @returns {boolean}
   */
  removeTransformer(id) {
    return this.transformers.delete(id);
  }

  /**
   * Transform data through the pipeline.
   * Pipeline: raw data -> filter -> transform -> merge -> overlay format
   * @param {object|object[]} data - Raw data to transform
   * @param {object} [options] - Transformation options
   * @returns {object|object[]} Transformed data
   */
  transform(data, options = {}) {
    let result = data;

    // Apply custom pipeline transformers
    for (const transformer of this.pipeline) {
      const t = this.transformers.get(transformer);
      if (t && typeof t.fn === 'function') {
        result = t.fn(result, options);
      }
    }

    // Apply filter if sport specified
    if (options.sport) {
      result = this.filterBySport(options.sport, result);
    }

    // Convert to overlay vars if requested
    if (options.toOverlay !== false) {
      result = this.toOverlayVars(result);
    }

    return result;
  }

  /**
   * Convert data to overlay template variable format.
   * Maps data fields to `{{key}}` format variables.
   * @param {object|object[]} data - Input data
   * @returns {object} Overlay variables object
   */
  toOverlayVars(data) {
    if (Array.isArray(data)) {
      const vars = {};
      data.forEach((item, idx) => {
        if (item && typeof item === 'object') {
          for (const [key, value] of Object.entries(item)) {
            vars[`${key}`] = value;
            if (idx < 3) {
              vars[`${key}_${idx + 1}`] = value;
            }
          }
        }
      });
      return vars;
    }

    if (data && typeof data === 'object') {
      const vars = {};
      for (const [key, value] of Object.entries(data)) {
        vars[key] = typeof value === 'object' ? JSON.stringify(value) : value;
      }
      return vars;
    }

    return { value: data };
  }

  /**
   * Merge multiple data objects into one.
   * @param {object} a - First data object
   * @param {object} b - Second data object
   * @returns {object} Merged object
   */
  mergeData(a, b) {
    if (!a || !b) return a || b || {};
    const result = { ...this._flatten(a) };

    for (const [key, value] of Object.entries(this._flatten(b))) {
      if (key in result) {
        result[`${key}_2`] = value;
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  /**
   * Filter data array by sport type.
   * @param {string} sport - Sport to filter by
   * @param {object[]|object} data - Data to filter
   * @returns {object[]|object} Filtered data
   */
  filterBySport(sport, data) {
    const q = sport.toLowerCase();

    if (Array.isArray(data)) {
      return data.filter(item => {
        if (!item) return false;
        const itemSport = (item.sport || item._feedType || '').toLowerCase();
        return itemSport === q || itemSport.includes(q);
      });
    }

    if (data && typeof data === 'object') {
      const itemSport = (data.sport || '').toLowerCase();
      if (itemSport === q || itemSport.includes(q)) return data;
      return {};
    }

    return data;
  }

  /**
   * Transform data to match a specific template's variable format.
   * @param {object|object[]} data - Input data
   * @param {string} templateId - Template identifier
   * @returns {object} Template-formatted variables
   */
  toTemplateFormat(data, templateId) {
    const overlayVars = this.toOverlayVars(data);

    // Add template metadata
    overlayVars._templateId = templateId;
    overlayVars._timestamp = new Date().toISOString();
    overlayVars._source = 'data-integration';

    return overlayVars;
  }

  /** @private Flatten nested objects */
  _flatten(obj, prefix = '') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, this._flatten(value, fullKey));
      } else if (Array.isArray(value)) {
        result[fullKey] = value.map(v =>
          typeof v === 'object' ? JSON.stringify(v) : v
        ).join(', ');
      } else {
        result[fullKey] = value;
      }
    }
    return result;
  }

  /**
   * Get all registered transformers.
   * @returns {object[]}
   */
  getTransformers() {
    return Array.from(this.transformers.entries()).map(([id, t]) => ({
      id,
      name: t.name
    }));
  }

  /**
   * Set the active pipeline order.
   * @param {string[]} transformerIds - Ordered list of transformer IDs
   */
  setPipeline(transformerIds) {
    this.pipeline = transformerIds.filter(id => this.transformers.has(id));
  }

  /**
   * Add a transformer to the pipeline.
   * @param {string} id - Transformer ID
   */
  addToPipeline(id) {
    if (this.transformers.has(id) && !this.pipeline.includes(id)) {
      this.pipeline.push(id);
    }
  }
}

/** Singleton instance */
export const dataTransformer = new DataTransformer();
