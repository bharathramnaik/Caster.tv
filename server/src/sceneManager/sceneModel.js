/**
 * Scene Data Model
 * Defines the structure for multi-layer broadcast scenes.
 */

import { nanoid } from 'nanoid';

/**
 * Default scene canvas dimensions (1920x1080 HD)
 */
export const DEFAULT_CANVAS = {
  width: 1920,
  height: 1080,
  background: 'transparent'
};

/**
 * Create a new layer object with defaults
 * @param {Object} opts - Layer options
 * @returns {Object} Layer object
 */
export function createLayer(opts = {}) {
  return {
    id: opts.id || `layer_${nanoid(8)}`,
    templateId: opts.templateId || null,
    position: {
      x: opts.position?.x ?? 0,
      y: opts.position?.y ?? 0,
      width: opts.position?.width ?? 400,
      height: opts.position?.height ?? 100
    },
    visible: opts.visible ?? true,
    locked: opts.locked ?? false,
    opacity: opts.opacity ?? 1,
    data: opts.data || {},
    animation: {
      enter: opts.animation?.enter ?? 'fade-in',
      exit: opts.animation?.exit ?? 'fade-out',
      duration: opts.animation?.duration ?? 0.5
    },
    groupId: opts.groupId ?? null
  };
}

/**
 * Create a new scene object with defaults
 * @param {Object} opts - Scene options
 * @returns {Object} Scene object
 */
export function createScene(opts = {}) {
  const now = new Date().toISOString();
  return {
    id: opts.id || `scene_${nanoid(8)}`,
    name: opts.name || 'Untitled Scene',
    layers: Array.isArray(opts.layers)
      ? opts.layers.map(l => (l.id ? l : createLayer(l)))
      : [],
    transitions: {
      enter: {
        type: opts.transitions?.enter?.type ?? 'fade',
        duration: opts.transitions?.enter?.duration ?? 0.3
      },
      exit: {
        type: opts.transitions?.exit?.type ?? 'fade',
        duration: opts.transitions?.exit?.duration ?? 0.3
      }
    },
    canvas: {
      width: opts.canvas?.width ?? DEFAULT_CANVAS.width,
      height: opts.canvas?.height ?? DEFAULT_CANVAS.height,
      background: opts.canvas?.background ?? DEFAULT_CANVAS.background
    },
    metadata: {
      createdAt: opts.metadata?.createdAt ?? now,
      updatedAt: opts.metadata?.updatedAt ?? now,
      createdBy: opts.metadata?.createdBy ?? null,
      version: opts.metadata?.version ?? 1
    }
  };
}

/**
 * Scene JSON Schema for validation
 */
export const sceneSchema = {
  type: 'object',
  required: ['id', 'name', 'layers'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    layers: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'templateId'],
        properties: {
          id: { type: 'string' },
          templateId: { type: 'string' },
          position: {
            type: 'object',
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' }
            }
          },
          visible: { type: 'boolean' },
          locked: { type: 'boolean' },
          opacity: { type: 'number', minimum: 0, maximum: 1 },
          data: { type: 'object' },
          animation: {
            type: 'object',
            properties: {
              enter: { type: 'string' },
              exit: { type: 'string' },
              duration: { type: 'number' }
            }
          },
          groupId: { type: 'string' }
        }
      }
    },
    transitions: {
      type: 'object',
      properties: {
        enter: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            duration: { type: 'number' }
          }
        },
        exit: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            duration: { type: 'number' }
          }
        }
      }
    },
    canvas: {
      type: 'object',
      properties: {
        width: { type: 'number' },
        height: { type: 'number' },
        background: { type: 'string' }
      }
    },
    metadata: {
      type: 'object',
      properties: {
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        createdBy: { type: 'string' },
        version: { type: 'number' }
      }
    }
  }
};

/**
 * Validate a scene object against the schema
 * @param {Object} scene - Scene to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateScene(scene) {
  const errors = [];

  if (!scene || typeof scene !== 'object') {
    return { valid: false, errors: ['Scene must be a non-null object'] };
  }

  if (!scene.id || typeof scene.id !== 'string') {
    errors.push('Missing or invalid field: id');
  }
  if (!scene.name || typeof scene.name !== 'string') {
    errors.push('Missing or invalid field: name');
  }
  if (!Array.isArray(scene.layers)) {
    errors.push('Field "layers" must be an array');
  } else {
    const layerIds = new Set();
    for (let i = 0; i < scene.layers.length; i++) {
      const layer = scene.layers[i];
      const prefix = `layers[${i}]`;
      if (!layer.id) errors.push(`${prefix}: Missing field "id"`);
      if (layerIds.has(layer.id)) {
        errors.push(`${prefix}: Duplicate layer id "${layer.id}"`);
      }
      layerIds.add(layer.id);
      if (layer.opacity != null && (layer.opacity < 0 || layer.opacity > 1)) {
        errors.push(`${prefix}: Opacity must be between 0 and 1`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
