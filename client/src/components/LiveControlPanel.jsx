import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const DEMO_SCENES = [
  { id: 's1', name: 'Scorebug', layers: [{ id: 'l1', visible: true }], thumbnail: '📊' },
  { id: 's2', name: 'Lower Third', layers: [{ id: 'l2', visible: true }], thumbnail: '📰' },
  { id: 's3', name: 'Full Screen', layers: [{ id: 'l3', visible: true }, { id: 'l4', visible: true }], thumbnail: '🖥' },
  { id: 's4', name: 'Ticker', layers: [{ id: 'l5', visible: true }], thumbnail: '📰' },
  { id: 's5', name: 'Player Card', layers: [{ id: 'l6', visible: true }], thumbnail: '🏏' },
  { id: 's6', name: 'Replay', layers: [{ id: 'l7', visible: true }], thumbnail: '▶' }
];

const TRANSITIONS = [
  { label: 'Cut', value: 'cut' },
  { label: 'Fade', value: 'fade' },
  { label: 'Slide L', value: 'slide-left' },
  { label: 'Slide R', value: 'slide-right' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Wipe', value: 'wipe-left' }
];

export default function LiveControlPanel() {
  const [scenes] = useState(DEMO_SCENES);
  const [currentSceneId, setCurrentSceneId] = useState('s1');
  const [transition, setTransition] = useState('fade');
  const [isLive, setIsLive] = useState(false);
  const [previewMode, setPreviewMode] = useState('preview');
  const [layerVisibility, setLayerVisibility] = useState(() => {
    const vis = {};
    scenes.forEach(s => s.layers.forEach(l => { vis[l.id] = true; }));
    return vis;
  });

  const currentScene = scenes.find(s => s.id === currentSceneId);

  const switchScene = useCallback((sceneId) => {
    setCurrentSceneId(sceneId);
  }, []);

  const toggleLayerVisibility = useCallback((layerId) => {
    setLayerVisibility(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  }, []);

  return (
    <div className="lcp-layout">
      {/* Top Bar */}
      <div className="lcp-topbar">
        <Link to="/" className="te-back">← Home</Link>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)' }}>Live Control Panel</h2>
        <div className="lcp-topbar-right">
          {isLive && <span className="live-dot" style={{ marginRight: 12 }}>ON AIR</span>}
          <span className={`conn-dot ${isLive ? 'on' : 'off'}`} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>{isLive ? 'Live' : 'Standby'}</span>
        </div>
      </div>

      <div className="lcp-body">
        {/* Main: Current Scene Display */}
        <div className="lcp-main">
          <div className="lcp-preview-area">
            <div className="lcp-mode-tabs">
              <button
                className={`lcp-mode-tab ${previewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setPreviewMode('preview')}
              >Preview</button>
              <button
                className={`lcp-mode-tab ${previewMode === 'program' ? 'active' : ''}`}
                onClick={() => setPreviewMode('program')}
              >Program</button>
            </div>
            <div className={`lcp-canvas ${previewMode === 'program' ? 'lcp-canvas-live' : ''}`}>
              <div className="lcp-canvas-content">
                <span style={{ fontSize: 48 }}>{currentScene?.thumbnail}</span>
                <span style={{ color: 'var(--text-400)', fontSize: '0.9rem' }}>{currentScene?.name}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lcp-actions">
            <button
              className={`lcp-action-btn lcp-go-live ${isLive ? 'active' : ''}`}
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? '⏹ End Live' : '🔴 GO LIVE'}
            </button>
            <button
              className="lcp-action-btn"
              onClick={() => setPreviewMode(p => p === 'preview' ? 'program' : 'preview')}
            >
              👁 Toggle View
            </button>
            <button className="lcp-action-btn" onClick={() => {}}>
              🔄 Clear All
            </button>
          </div>

          {/* Layer Visibility */}
          {currentScene && (
            <div className="lcp-layers-section">
              <div className="section-label">Layer Visibility</div>
              <div className="lcp-layers-list">
                {currentScene.layers.map(layer => (
                  <div key={layer.id} className="lcp-layer-item">
                    <button
                      className="lcp-layer-vis"
                      onClick={() => toggleLayerVisibility(layer.id)}
                      style={{ opacity: layerVisibility[layer.id] ? 1 : 0.3 }}
                    >
                      {layerVisibility[layer.id] ? '👁' : '👁‍🗨'}
                    </button>
                    <span className="lcp-layer-name">{layer.id}</span>
                    <span className="lcp-layer-status">
                      {layerVisibility[layer.id] ? 'Visible' : 'Hidden'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Scene Switcher + Transition */}
        <div className="lcp-sidebar">
          {/* Scene Grid */}
          <div className="lcp-scene-switcher">
            <div className="section-label">Scene Switcher</div>
            <div className="lcp-scene-grid">
              {scenes.map(scene => (
                <button
                  key={scene.id}
                  className={`lcp-scene-btn ${scene.id === currentSceneId ? 'active' : ''}`}
                  onClick={() => switchScene(scene.id)}
                >
                  <span className="lcp-scene-thumb">{scene.thumbnail}</span>
                  <span className="lcp-scene-name">{scene.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transition Selector */}
          <div className="lcp-transition-section">
            <div className="section-label">Transition</div>
            <div className="lcp-transition-grid">
              {TRANSITIONS.map(t => (
                <button
                  key={t.value}
                  className={`lcp-transition-btn ${transition === t.value ? 'active' : ''}`}
                  onClick={() => setTransition(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="lcp-status-section">
            <div className="lcp-status-item">
              <span className="lcp-status-label">Mode</span>
              <span className={`lcp-status-value ${isLive ? 'live' : ''}`}>{isLive ? 'LIVE' : 'STANDBY'}</span>
            </div>
            <div className="lcp-status-item">
              <span className="lcp-status-label">Scene</span>
              <span className="lcp-status-value">{currentScene?.name}</span>
            </div>
            <div className="lcp-status-item">
              <span className="lcp-status-label">Transition</span>
              <span className="lcp-status-value">{transition}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
