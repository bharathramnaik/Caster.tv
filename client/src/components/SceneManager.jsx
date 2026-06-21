import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DEMO_TEMPLATES = [
  { id: 't1', name: 'Classic Scorebug', category: 'scoreboard' },
  { id: 't2', name: 'Player Lower Third', category: 'lower-third' },
  { id: 't3', name: 'Full Scorecard', category: 'full-screen' },
  { id: 't4', name: 'News Ticker', category: 'ticker' },
  { id: 't5', name: 'Batter Card', category: 'player-card' },
];

const TRANSITION_TYPES = [
  { label: 'Cut', value: 'cut' },
  { label: 'Fade', value: 'fade' },
  { label: 'Slide Left', value: 'slide-left' },
  { label: 'Slide Right', value: 'slide-right' },
  { label: 'Slide Up', value: 'slide-up' },
  { label: 'Slide Down', value: 'slide-down' },
  { label: 'Wipe Left', value: 'wipe-left' },
  { label: 'Wipe Right', value: 'wipe-right' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Blur', value: 'blur' }
];

function createEmptyScene(index) {
  return {
    id: `scene_${Date.now()}_${index}`,
    name: `Scene ${index + 1}`,
    layers: [],
    transitions: {
      enter: { type: 'fade', duration: 0.3 },
      exit: { type: 'fade', duration: 0.3 }
    },
    canvas: { width: 1920, height: 1080, background: 'transparent' },
    metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), version: 1 }
  };
}

function SceneThumbnail({ scene, isActive, onClick, onDuplicate, onDelete }) {
  return (
    <div
      className={`scene-thumb ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="scene-thumb-preview">
        {scene.layers.length === 0 ? (
          <span style={{ fontSize: 20, opacity: 0.3 }}>🎬</span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-400)' }}>{scene.layers.length} layers</span>
        )}
      </div>
      <div className="scene-thumb-info">
        <span className="scene-thumb-name">{scene.name}</span>
        <div className="scene-thumb-actions">
          <button className="scene-thumb-btn" onClick={e => { e.stopPropagation(); onDuplicate(); }} title="Duplicate">⧉</button>
          <button className="scene-thumb-btn scene-thumb-btn-danger" onClick={e => { e.stopPropagation(); onDelete(); }} title="Delete">✕</button>
        </div>
      </div>
    </div>
  );
}

function LayerItem({ layer, isActive, onSelect, onToggleVisibility, onToggleLock, onRemove, onMoveUp, onMoveDown, index, total }) {
  return (
    <div className={`layer-item ${isActive ? 'active' : ''}`} onClick={() => onSelect(layer.id)}>
      <button
        className="layer-vis-btn"
        onClick={e => { e.stopPropagation(); onToggleVisibility(); }}
        title={layer.visible ? 'Hide' : 'Show'}
        style={{ opacity: layer.visible ? 1 : 0.3 }}
      >
        {layer.visible ? '👁' : '👁‍🗨'}
      </button>
      <button
        className="layer-lock-btn"
        onClick={e => { e.stopPropagation(); onToggleLock(); }}
        title={layer.locked ? 'Unlock' : 'Lock'}
        style={{ opacity: layer.locked ? 1 : 0.3 }}
      >
        {layer.locked ? '🔒' : '🔓'}
      </button>
      <span className="layer-name">{layer.templateId || layer.id}</span>
      <span className="layer-opacity">{Math.round((layer.opacity ?? 1) * 100)}%</span>
      <div className="layer-order-btns">
        <button className="layer-order-btn" onClick={e => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0}>↑</button>
        <button className="layer-order-btn" onClick={e => { e.stopPropagation(); onMoveDown(); }} disabled={index === total - 1}>↓</button>
      </div>
      <button className="layer-remove-btn" onClick={e => { e.stopPropagation(); onRemove(); }}>✕</button>
    </div>
  );
}

export default function SceneManager() {
  const { sceneId } = useParams();
  const [scenes, setScenes] = useState([createEmptyScene(0)]);
  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];

  useEffect(() => {
    fetch(`${API}/api/templates`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : DEMO_TEMPLATES)
      .then(data => { if (data.length) setTemplates(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const updateScene = useCallback((sceneId, patch) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, ...patch, metadata: { ...s.metadata, updatedAt: new Date().toISOString() } } : s));
    setHasUnsavedChanges(true);
  }, []);

  const addScene = useCallback(() => {
    const scene = createEmptyScene(scenes.length);
    setScenes(prev => [...prev, scene]);
    setActiveSceneId(scene.id);
  }, [scenes.length]);

  const duplicateScene = useCallback((sceneId) => {
    const original = scenes.find(s => s.id === sceneId);
    if (!original) return;
    const dup = {
      ...JSON.parse(JSON.stringify(original)),
      id: `scene_${Date.now()}_dup`,
      name: `${original.name} (copy)`,
      metadata: { ...original.metadata, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    };
    setScenes(prev => [...prev, dup]);
    setActiveSceneId(dup.id);
  }, [scenes]);

  const deleteScene = useCallback((sceneId) => {
    if (scenes.length <= 1) return;
    setScenes(prev => prev.filter(s => s.id !== sceneId));
    if (activeSceneId === sceneId) {
      setActiveSceneId(scenes.find(s => s.id !== sceneId)?.id || scenes[0].id);
    }
  }, [scenes, activeSceneId]);

  const addLayer = useCallback((templateId = '') => {
    const layer = {
      id: `layer_${Date.now()}`,
      templateId,
      position: { x: 0, y: 0, width: 400, height: 100 },
      visible: true,
      locked: false,
      opacity: 1,
      data: {},
      animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.5 }
    };
    updateScene(activeSceneId, { layers: [...activeScene.layers, layer] });
    setActiveLayerId(layer.id);
  }, [activeSceneId, activeScene.layers, updateScene]);

  const addLayerWithPicker = useCallback(() => {
    setShowTemplatePicker(true);
  }, []);

  const handleTemplateSelect = useCallback((templateId) => {
    addLayer(templateId);
    setShowTemplatePicker(false);
  }, [addLayer]);

  const toggleVisibility = useCallback((layerId) => {
    updateScene(activeSceneId, {
      layers: activeScene.layers.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l)
    });
  }, [activeSceneId, activeScene.layers, updateScene]);

  const toggleLock = useCallback((layerId) => {
    updateScene(activeSceneId, {
      layers: activeScene.layers.map(l => l.id === layerId ? { ...l, locked: !l.locked } : l)
    });
  }, [activeSceneId, activeScene.layers, updateScene]);

  const removeLayer = useCallback((layerId) => {
    updateScene(activeSceneId, { layers: activeScene.layers.filter(l => l.id !== layerId) });
    if (activeLayerId === layerId) setActiveLayerId(null);
  }, [activeSceneId, activeScene.layers, activeLayerId, updateScene]);

  const moveLayer = useCallback((layerId, direction) => {
    const layers = [...activeScene.layers];
    const idx = layers.findIndex(l => l.id === layerId);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (newIdx < 0 || newIdx >= layers.length) return;
    [layers[idx], layers[newIdx]] = [layers[newIdx], layers[idx]];
    updateScene(activeSceneId, { layers });
  }, [activeSceneId, activeScene.layers, updateScene]);

  const saveScenes = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ scenes })
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        setStatus('Saved!');
      } else {
        setStatus('Failed');
      }
    } catch {
      setStatus('Error');
    }
    setSaving(false);
    setTimeout(() => setStatus(''), 2000);
  }, [scenes]);

  return (
    <div className="scene-manager-layout">
      <div className="sm-topbar">
        <Link to="/" className="te-back">← Home</Link>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)' }}>Scene Manager</h2>
        <div className="sm-topbar-right">
          <button className="btn btn-sm btn-secondary" onClick={addScene}>+ Add Scene</button>
          <button className="btn btn-sm btn-primary" onClick={saveScenes} disabled={saving}>{saving ? '...' : '💾 Save'}</button>
          {status && <span className="te-status">{status}</span>}
        </div>
      </div>

      <div className="sm-body">
        {/* Scene List */}
        <div className="sm-scenes-panel">
          <div className="sm-panel-header">
            <span>Scenes ({scenes.length})</span>
          </div>
          <div className="sm-scenes-list">
            {scenes.map((scene, i) => (
              <SceneThumbnail
                key={scene.id}
                scene={scene}
                isActive={scene.id === activeSceneId}
                onClick={() => setActiveSceneId(scene.id)}
                onDuplicate={() => duplicateScene(scene.id)}
                onDelete={() => deleteScene(scene.id)}
              />
            ))}
          </div>
          <button className="btn btn-sm btn-secondary" onClick={addScene} style={{ margin: 12, width: 'calc(100% - 24px)' }}>+ New Scene</button>
        </div>

        {/* Layer Panel */}
        <div className="sm-layers-panel">
          <div className="sm-panel-header">
            <span>Layers</span>
            <button className="btn btn-sm btn-primary" onClick={addLayerWithPicker}>+ Add</button>
          </div>
          <div className="sm-layers-list">
            {activeScene.layers.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-500)', fontSize: '0.8rem' }}>
                No layers yet. Add one to get started.
              </div>
            ) : (
              activeScene.layers.map((layer, i) => (
                <LayerItem
                  key={layer.id}
                  layer={layer}
                  index={i}
                  total={activeScene.layers.length}
                  isActive={layer.id === activeLayerId}
                  onSelect={setActiveLayerId}
                  onToggleVisibility={() => toggleVisibility(layer.id)}
                  onToggleLock={() => toggleLock(layer.id)}
                  onRemove={() => removeLayer(layer.id)}
                  onMoveUp={() => moveLayer(layer.id, 'up')}
                  onMoveDown={() => moveLayer(layer.id, 'down')}
                />
              ))
            )}
          </div>
        </div>

        {/* Scene Settings */}
        <div className="sm-settings-panel">
          <div className="sm-panel-header"><span>Scene Settings</span></div>
          <div className="sm-settings-body">
            <div className="field">
              <label className="label">Scene Name</label>
              <input
                className="input"
                value={activeScene.name}
                onChange={e => updateScene(activeSceneId, { name: e.target.value })}
              />
            </div>

            <div className="field">
              <label className="label">Enter Transition</label>
              <div className="sm-transition-grid">
                {TRANSITION_TYPES.map(t => (
                  <button
                    key={t.value}
                    className={`sm-transition-btn ${activeScene.transitions?.enter?.type === t.value ? 'active' : ''}`}
                    onClick={() => updateScene(activeSceneId, {
                      transitions: { ...activeScene.transitions, enter: { ...activeScene.transitions?.enter, type: t.value } }
                    })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Exit Transition</label>
              <div className="sm-transition-grid">
                {TRANSITION_TYPES.map(t => (
                  <button
                    key={t.value}
                    className={`sm-transition-btn ${activeScene.transitions?.exit?.type === t.value ? 'active' : ''}`}
                    onClick={() => updateScene(activeSceneId, {
                      transitions: { ...activeScene.transitions, exit: { ...activeScene.transitions?.exit, type: t.value } }
                    })}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="label">Transition Duration</label>
              <input
                type="number"
                className="input"
                value={activeScene.transitions?.enter?.duration ?? 0.3}
                min={0.1}
                max={5}
                step={0.1}
                onChange={e => {
                  const dur = parseFloat(e.target.value) || 0.3;
                  updateScene(activeSceneId, {
                    transitions: {
                      enter: { ...activeScene.transitions?.enter, duration: dur },
                      exit: { ...activeScene.transitions?.exit, duration: dur }
                    }
                  });
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showTemplatePicker && (
        <div className="modal-overlay" onClick={() => setShowTemplatePicker(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 560, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Select Template</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowTemplatePicker(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleTemplateSelect('')}
                style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
              >
                <span style={{ fontSize: 24 }}>+</span>
                <span style={{ fontSize: '0.8rem' }}>Blank Layer</span>
              </button>
              {templates.map(t => (
                <button
                  key={t.id}
                  className="btn btn-secondary"
                  onClick={() => handleTemplateSelect(t.id)}
                  style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                  <span style={{ fontSize: 24 }}>📄</span>
                  <span style={{ fontSize: '0.75rem', textAlign: 'center' }}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
