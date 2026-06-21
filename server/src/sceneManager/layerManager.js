/**
 * Layer Manager
 * Operations for managing layers within a scene: add, remove, reorder, group, etc.
 */

import { createLayer } from './sceneModel.js';

/**
 * Add a new layer to a scene
 * @param {Object} scene - The scene to modify
 * @param {Object} layerOpts - Options for the new layer
 * @returns {Object} The created layer
 */
export function addLayer(scene, layerOpts = {}) {
  if (!scene || !Array.isArray(scene.layers)) {
    throw new Error('Invalid scene: missing layers array');
  }
  const layer = createLayer(layerOpts);
  scene.layers.push(layer);
  touchScene(scene);
  return layer;
}

/**
 * Add multiple layers at once
 * @param {Object} scene - The scene to modify
 * @param {Array} layerOptsArray - Array of layer options
 * @returns {Array} Created layers
 */
export function addLayers(scene, layerOptsArray) {
  return layerOptsArray.map(opts => addLayer(scene, opts));
}

/**
 * Remove a layer by ID
 * @param {Object} scene - The scene to modify
 * @param {string} layerId - ID of the layer to remove
 * @returns {Object|null} The removed layer, or null if not found
 */
export function removeLayer(scene, layerId) {
  const idx = scene.layers.findIndex(l => l.id === layerId);
  if (idx === -1) return null;
  const [removed] = scene.layers.splice(idx, 1);
  touchScene(scene);
  return removed;
}

/**
 * Get a layer by ID
 * @param {Object} scene - The scene
 * @param {string} layerId - Layer ID
 * @returns {Object|null} The layer
 */
export function getLayer(scene, layerId) {
  return scene.layers.find(l => l.id === layerId) || null;
}

/**
 * Update a layer's properties
 * @param {Object} scene - The scene
 * @param {string} layerId - Layer ID
 * @param {Object} updates - Properties to update
 * @returns {Object|null} Updated layer
 */
export function updateLayer(scene, layerId, updates) {
  const layer = getLayer(scene, layerId);
  if (!layer) return null;

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'position' && typeof value === 'object') {
      layer.position = { ...layer.position, ...value };
    } else if (key === 'animation' && typeof value === 'object') {
      layer.animation = { ...layer.animation, ...value };
    } else if (key !== 'id') {
      layer[key] = value;
    }
  }
  touchScene(scene);
  return layer;
}

/**
 * Reorder layers by moving a layer to a new index
 * @param {Object} scene - The scene
 * @param {string} layerId - Layer to move
 * @param {number} newIndex - Target index (0 = bottom)
 * @returns {boolean} Success
 */
export function reorderLayer(scene, layerId, newIndex) {
  const idx = scene.layers.findIndex(l => l.id === layerId);
  if (idx === -1) return false;
  if (newIndex < 0 || newIndex >= scene.layers.length) return false;

  const [layer] = scene.layers.splice(idx, 1);
  scene.layers.splice(newIndex, 0, layer);
  touchScene(scene);
  return true;
}

/**
 * Move layer up in z-order (toward top)
 * @param {Object} scene
 * @param {string} layerId
 * @returns {boolean}
 */
export function moveLayerUp(scene, layerId) {
  const idx = scene.layers.findIndex(l => l.id === layerId);
  if (idx === -1 || idx === scene.layers.length - 1) return false;
  return reorderLayer(scene, layerId, idx + 1);
}

/**
 * Move layer down in z-order (toward bottom)
 * @param {Object} scene
 * @param {string} layerId
 * @returns {boolean}
 */
export function moveLayerDown(scene, layerId) {
  const idx = scene.layers.findIndex(l => l.id === layerId);
  if (idx <= 0) return false;
  return reorderLayer(scene, layerId, idx - 1);
}

/**
 * Toggle layer visibility
 * @param {Object} scene
 * @param {string} layerId
 * @returns {Object|null} Updated layer
 */
export function toggleVisibility(scene, layerId) {
  const layer = getLayer(scene, layerId);
  if (!layer) return null;
  layer.visible = !layer.visible;
  touchScene(scene);
  return layer;
}

/**
 * Set visibility for a layer
 * @param {Object} scene
 * @param {string} layerId
 * @param {boolean} visible
 * @returns {Object|null}
 */
export function setVisibility(scene, layerId, visible) {
  const layer = getLayer(scene, layerId);
  if (!layer) return null;
  layer.visible = visible;
  touchScene(scene);
  return layer;
}

/**
 * Toggle layer lock state
 * @param {Object} scene
 * @param {string} layerId
 * @returns {Object|null}
 */
export function toggleLock(scene, layerId) {
  const layer = getLayer(scene, layerId);
  if (!layer) return null;
  layer.locked = !layer.locked;
  touchScene(scene);
  return layer;
}

/**
 * Set lock state for a layer
 * @param {Object} scene
 * @param {string} layerId
 * @param {boolean} locked
 * @returns {Object|null}
 */
export function setLocked(scene, layerId, locked) {
  const layer = getLayer(scene, layerId);
  if (!layer) return null;
  layer.locked = locked;
  touchScene(scene);
  return layer;
}

/**
 * Set layer opacity
 * @param {Object} scene
 * @param {string} layerId
 * @param {number} opacity - 0 to 1
 * @returns {Object|null}
 */
export function setOpacity(scene, layerId, opacity) {
  const layer = getLayer(scene, layerId);
  if (!layer) return null;
  layer.opacity = Math.max(0, Math.min(1, opacity));
  touchScene(scene);
  return layer;
}

/**
 * Group layers together
 * @param {Object} scene
 * @param {string[]} layerIds - IDs of layers to group
 * @param {string} [groupId] - Optional group ID (auto-generated if omitted)
 * @returns {string} The group ID
 */
export function groupLayers(scene, layerIds, groupId) {
  const gid = groupId || `group_${Date.now()}`;
  for (const id of layerIds) {
    const layer = getLayer(scene, id);
    if (layer) {
      layer.groupId = gid;
    }
  }
  touchScene(scene);
  return gid;
}

/**
 * Ungroup layers
 * @param {Object} scene
 * @param {string} groupId - The group ID to remove
 * @returns {string[]} IDs of ungrouped layers
 */
export function ungroupLayers(scene, groupId) {
  const ungrouped = [];
  for (const layer of scene.layers) {
    if (layer.groupId === groupId) {
      layer.groupId = null;
      ungrouped.push(layer.id);
    }
  }
  touchScene(scene);
  return ungrouped;
}

/**
 * Get all layers in a group
 * @param {Object} scene
 * @param {string} groupId
 * @returns {Object[]}
 */
export function getGroupLayers(scene, groupId) {
  return scene.layers.filter(l => l.groupId === groupId);
}

/**
 * Duplicate a layer
 * @param {Object} scene
 * @param {string} layerId
 * @param {Object} [overrides] - Optional property overrides
 * @returns {Object|null} The duplicated layer
 */
export function duplicateLayer(scene, layerId, overrides = {}) {
  const original = getLayer(scene, layerId);
  if (!original) return null;

  const duplicate = createLayer({
    ...JSON.parse(JSON.stringify(original)),
    ...overrides
  });

  scene.layers.push(duplicate);
  touchScene(scene);
  return duplicate;
}

/**
 * Duplicate a layer N times
 * @param {Object} scene
 * @param {string} layerId
 * @param {number} count
 * @returns {Object[]}
 */
export function duplicateLayerMultiple(scene, layerId, count) {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push(duplicateLayer(scene, layerId));
  }
  return results;
}

/**
 * Get visible layers ordered by z-index (bottom to top)
 * @param {Object} scene
 * @returns {Object[]}
 */
export function getVisibleLayers(scene) {
  return scene.layers.filter(l => l.visible);
}

/**
 * Get unlocked layers
 * @param {Object} scene
 * @returns {Object[]}
 */
export function getUnlockedLayers(scene) {
  return scene.layers.filter(l => !l.locked);
}

/**
 * Sort layers by opacity (for compositing)
 * @param {Object} scene
 * @returns {Object[]}
 */
export function getLayersByOpacity(scene) {
  return [...scene.layers].sort((a, b) => a.opacity - b.opacity);
}

/**
 * Update the scene's updatedAt timestamp
 */
function touchScene(scene) {
  if (scene.metadata) {
    scene.metadata.updatedAt = new Date().toISOString();
    scene.metadata.version = (scene.metadata.version || 0) + 1;
  }
}
