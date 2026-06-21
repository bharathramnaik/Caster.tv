/**
 * Scene State Manager
 * Tracks current scene, history (undo/redo), and persistence.
 */

import { createScene, validateScene } from './sceneModel.js';

/**
 * Create a new state manager instance
 * @param {Object} [opts] - Options
 * @param {number} [opts.maxHistory=50] - Max history entries
 * @returns {Object} State manager
 */
export function createStateManager(opts = {}) {
  const maxHistory = opts.maxHistory || 50;
  const state = {
    scenes: new Map(),
    activeSceneId: null,
    history: [],
    historyIndex: -1,
    versions: new Map()
  };

  return {
    /**
     * Create a new scene and set it as active
     * @param {Object} sceneOpts
     * @returns {Object} Created scene
     */
    createScene(sceneOpts = {}) {
      const scene = createScene(sceneOpts);
      state.scenes.set(scene.id, scene);
      state.activeSceneId = scene.id;
      pushHistory(state, { type: 'create', sceneId: scene.id, scene: cloneScene(scene) });
      return scene;
    },

    /**
     * Get a scene by ID
     * @param {string} sceneId
     * @returns {Object|null}
     */
    getScene(sceneId) {
      return state.scenes.get(sceneId) || null;
    },

    /**
     * Get all scenes
     * @returns {Object[]}
     */
    getAllScenes() {
      return Array.from(state.scenes.values());
    },

    /**
     * Delete a scene
     * @param {string} sceneId
     * @returns {boolean}
     */
    deleteScene(sceneId) {
      if (!state.scenes.has(sceneId)) return false;
      const scene = cloneScene(state.scenes.get(sceneId));
      state.scenes.delete(sceneId);
      if (state.activeSceneId === sceneId) {
        const remaining = Array.from(state.scenes.keys());
        state.activeSceneId = remaining.length > 0 ? remaining[0] : null;
      }
      pushHistory(state, { type: 'delete', sceneId, scene });
      return true;
    },

    /**
     * Set the active scene
     * @param {string} sceneId
     * @returns {Object|null} Active scene
     */
    setActiveScene(sceneId) {
      if (!state.scenes.has(sceneId)) return null;
      const prevId = state.activeSceneId;
      state.activeSceneId = sceneId;
      pushHistory(state, { type: 'activate', sceneId, prevId });
      return state.scenes.get(sceneId);
    },

    /**
     * Get the active scene
     * @returns {Object|null}
     */
    getActiveScene() {
      return state.activeSceneId ? state.scenes.get(state.activeSceneId) : null;
    },

    /**
     * Get the active scene ID
     * @returns {string|null}
     */
    getActiveSceneId() {
      return state.activeSceneId;
    },

    /**
     * Update a scene (with history tracking)
     * @param {string} sceneId
     * @param {Function} mutator - Function that mutates the scene
     * @returns {Object|null} Updated scene
     */
    updateScene(sceneId, mutator) {
      const scene = state.scenes.get(sceneId);
      if (!scene) return null;
      const prev = cloneScene(scene);
      mutator(scene);
      scene.metadata.updatedAt = new Date().toISOString();
      scene.metadata.version = (scene.metadata.version || 0) + 1;
      pushHistory(state, {
        type: 'update',
        sceneId,
        before: prev,
        after: cloneScene(scene)
      });
      return scene;
    },

    /**
     * Save a version snapshot of a scene
     * @param {string} sceneId
     * @param {string} [label] - Version label
     * @returns {string} Version ID
     */
    saveVersion(sceneId, label) {
      const scene = state.scenes.get(sceneId);
      if (!scene) return null;
      const versionId = `v_${Date.now()}`;
      if (!state.versions.has(sceneId)) {
        state.versions.set(sceneId, []);
      }
      state.versions.get(sceneId).push({
        id: versionId,
        label: label || `Version ${state.versions.get(sceneId).length + 1}`,
        snapshot: cloneScene(scene),
        savedAt: new Date().toISOString()
      });
      return versionId;
    },

    /**
     * Restore a scene to a specific version
     * @param {string} sceneId
     * @param {string} versionId
     * @returns {Object|null} Restored scene
     */
    restoreVersion(sceneId, versionId) {
      const versions = state.versions.get(sceneId);
      if (!versions) return null;
      const version = versions.find(v => v.id === versionId);
      if (!version) return null;
      const prev = cloneScene(state.scenes.get(sceneId));
      const restored = cloneScene(version.snapshot);
      restored.metadata.updatedAt = new Date().toISOString();
      restored.metadata.version = (restored.metadata.version || 0) + 1;
      state.scenes.set(sceneId, restored);
      pushHistory(state, {
        type: 'restore',
        sceneId,
        before: prev,
        after: cloneScene(restored),
        versionId
      });
      return restored;
    },

    /**
     * Get all versions for a scene
     * @param {string} sceneId
     * @returns {Array}
     */
    getVersions(sceneId) {
      return (state.versions.get(sceneId) || []).map(v => ({
        id: v.id,
        label: v.label,
        savedAt: v.savedAt
      }));
    },

    /**
     * Undo the last action
     * @returns {Object|null} The restored scene state
     */
    undo() {
      if (state.historyIndex < 0) return null;
      const entry = state.history[state.historyIndex];
      state.historyIndex--;

      if (entry.type === 'create') {
        state.scenes.delete(entry.sceneId);
        if (state.activeSceneId === entry.sceneId) {
          state.activeSceneId = null;
        }
      } else if (entry.type === 'delete') {
        state.scenes.set(entry.sceneId, entry.scene);
      } else if (entry.type === 'update') {
        state.scenes.set(entry.sceneId, entry.before);
      } else if (entry.type === 'activate') {
        state.activeSceneId = entry.prevId || null;
      } else if (entry.type === 'restore') {
        state.scenes.set(entry.sceneId, entry.before);
      }

      return state.scenes.get(entry.sceneId) || null;
    },

    /**
     * Redo a previously undone action
     * @returns {Object|null} The restored scene state
     */
    redo() {
      if (state.historyIndex >= state.history.length - 1) return null;
      state.historyIndex++;
      const entry = state.history[state.historyIndex];

      if (entry.type === 'create') {
        state.scenes.set(entry.sceneId, entry.scene);
        state.activeSceneId = entry.sceneId;
      } else if (entry.type === 'delete') {
        state.scenes.delete(entry.sceneId);
        if (state.activeSceneId === entry.sceneId) {
          state.activeSceneId = null;
        }
      } else if (entry.type === 'update') {
        state.scenes.set(entry.sceneId, entry.after);
      } else if (entry.type === 'activate') {
        state.activeSceneId = entry.sceneId;
      } else if (entry.type === 'restore') {
        state.scenes.set(entry.sceneId, entry.after);
      }

      return state.scenes.get(entry.sceneId) || null;
    },

    /**
     * Check if undo is available
     * @returns {boolean}
     */
    canUndo() {
      return state.historyIndex >= 0;
    },

    /**
     * Check if redo is available
     * @returns {boolean}
     */
    canRedo() {
      return state.historyIndex < state.history.length - 1;
    },

    /**
     * Get history log
     * @returns {Array}
     */
    getHistory() {
      return state.history.slice(0, state.historyIndex + 1).map(h => ({
        type: h.type,
        sceneId: h.sceneId,
        timestamp: h.after?.metadata?.updatedAt || h.scene?.metadata?.createdAt || new Date().toISOString()
      }));
    },

    /**
     * Export all state as JSON-serializable object
     * @returns {Object}
     */
    exportState() {
      const scenes = {};
      for (const [id, scene] of state.scenes) {
        scenes[id] = cloneScene(scene);
      }
      return {
        scenes,
        activeSceneId: state.activeSceneId
      };
    },

    /**
     * Import state from a JSON object
     * @param {Object} data
     */
    importState(data) {
      state.scenes.clear();
      if (data.scenes) {
        for (const [id, scene] of Object.entries(data.scenes)) {
          state.scenes.set(id, scene);
        }
      }
      state.activeSceneId = data.activeSceneId || null;
      state.history = [];
      state.historyIndex = -1;
    },

    /**
     * Clear all history
     */
    clearHistory() {
      state.history = [];
      state.historyIndex = -1;
    }
  };
}

/**
 * Push an entry to history, trimming if over max
 */
function pushHistory(state, entry) {
  // Remove any redo entries beyond current index
  state.history = state.history.slice(0, state.historyIndex + 1);
  state.history.push(entry);
  state.historyIndex = state.history.length - 1;

  // Trim history if too long
  if (state.history.length > 50) {
    const trim = state.history.length - 50;
    state.history.splice(0, trim);
    state.historyIndex -= trim;
  }
}

/**
 * Deep clone a scene object
 */
function cloneScene(scene) {
  return JSON.parse(JSON.stringify(scene));
}
