/**
 * Scene Manager - Main Entry Point
 * Multi-layer scene composition and transitions for broadcast graphics.
 */

export {
  createScene,
  createLayer,
  validateScene,
  sceneSchema,
  DEFAULT_CANVAS
} from './sceneModel.js';

export {
  addLayer,
  addLayers,
  removeLayer,
  getLayer,
  updateLayer,
  reorderLayer,
  moveLayerUp,
  moveLayerDown,
  toggleVisibility,
  setVisibility,
  toggleLock,
  setLocked,
  setOpacity,
  groupLayers,
  ungroupLayers,
  getGroupLayers,
  duplicateLayer,
  duplicateLayerMultiple,
  getVisibleLayers,
  getUnlockedLayers,
  getLayersByOpacity
} from './layerManager.js';

export {
  getTransition,
  generateTransitionCSS,
  generateTransitionJS,
  generateTransitionStylesheet,
  generateTransitionHTML,
  listTransitionTypes,
  isValidTransition,
  transitionTypes
} from './transitions.js';

export {
  composeScene,
  composeFragment,
  composeLayer,
  composeTransitionPreview,
  composeScaled
} from './composer.js';

export {
  createStateManager
} from './stateManager.js';

export {
  exportAsHTML,
  exportForOBS,
  exportForNDI,
  exportAsCSS,
  exportAsJSON,
  exportWithData,
  exportForStreaming,
  exportAsPlaylist
} from './exporter.js';
