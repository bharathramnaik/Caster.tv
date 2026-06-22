import { useState, useCallback, useMemo } from 'react';
import SceneBuilder3D from '../components/three/SceneBuilder3D';
import PresetScenes, { PRESET_SCENES } from '../components/three/PresetScenes';

const API = import.meta.env.VITE_API_URL || '';

const SPORT_FILTERS = ['all', 'cricket', 'football', 'basketball', 'generic'];

export default function SceneBuilder() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activePreset, setActivePreset] = useState('cricket-stadium');
  const [sportFilter, setSportFilter] = useState('all');
  const [sidebarTab, setSidebarTab] = useState('presets');
  const [exportFormat, setExportFormat] = useState('json');

  const selectedElement = useMemo(
    () => elements.find((e) => e.id === selectedId),
    [elements, selectedId]
  );

  const filteredPresets = useMemo(() => {
    if (sportFilter === 'all') return PRESET_SCENES;
    return PRESET_SCENES.filter((s) => s.sport === sportFilter);
  }, [sportFilter]);

  const handleAddElement = useCallback((el) => {
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }, []);

  const handleUpdateElement = useCallback((id, updates) => {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const handleDeleteElement = useCallback((id) => {
    setElements((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [selectedId]);

  const handleDuplicateElement = useCallback((id) => {
    setElements((prev) => {
      const el = prev.find((e) => e.id === id);
      if (!el) return prev;
      const dup = {
        ...JSON.parse(JSON.stringify(el)),
        id: `el_${Date.now()}`,
        name: `${el.name} (Copy)`,
        position: el.position.map((v) => v + 0.3),
      };
      return [...prev, dup];
    });
  }, []);

  const handleExport = useCallback(async () => {
    const scene = {
      name: 'Custom Scene',
      sport: 'generic',
      elements,
      camera: { position: [5, 4, 8], fov: 50 },
      lighting: { ambient: 0.4, directional: 1, point: 0.5 },
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'scene-3d.json';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      try {
        const res = await fetch(`${API}/api/scenes3d/export`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scene, format: 'html' }),
        });
        const data = await res.json();
        if (data.html) {
          const blob = new Blob([data.html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'scene-3d.html';
          a.click();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Export failed:', err);
      }
    }
  }, [elements, exportFormat]);

  const handlePresetLoad = useCallback((preset) => {
    setActivePreset(preset.id);
    setElements([]);
    setSelectedId(null);
  }, []);

  const selectedProps = selectedElement
    ? [
        { key: 'name', label: 'Name', type: 'text', value: selectedElement.name },
        { key: 'position', label: 'Position', type: 'vec3', value: selectedElement.position },
        { key: 'rotation', label: 'Rotation', type: 'vec3', value: selectedElement.rotation },
        { key: 'scale', label: 'Scale', type: 'vec3', value: selectedElement.scale },
        { key: 'color', label: 'Color', type: 'color', value: selectedElement.color },
      ]
    : [];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-900)',
      color: 'var(--text-200)',
      overflow: 'hidden',
    }}>
      <div style={{
        width: 260,
        background: 'var(--bg-800)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{
          padding: '16px 14px 8px',
          borderBottom: '1px solid var(--glass-border)',
        }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--text-100)',
            marginBottom: 10,
            letterSpacing: 0.5,
          }}>
            3D Scene Builder
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['presets', 'layers'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: 6,
                  border: 'none',
                  background: sidebarTab === tab ? 'var(--accent)' : 'var(--surface)',
                  color: sidebarTab === tab ? 'var(--bg-900)' : 'var(--text-400)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {sidebarTab === 'presets' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>
            <div style={{ display: 'flex', gap: 3, marginBottom: 8, flexWrap: 'wrap' }}>
              {SPORT_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setSportFilter(f)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    border: 'none',
                    background: sportFilter === f ? 'var(--accent-dim)' : 'transparent',
                    color: sportFilter === f ? 'var(--accent)' : 'var(--text-500)',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetLoad(preset)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: activePreset === preset.id ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    background: activePreset === preset.id ? 'var(--accent-dim)' : 'var(--surface)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-100)', marginBottom: 2 }}>
                    {preset.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-500)', lineHeight: 1.3 }}>
                    {preset.description}
                  </div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {preset.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} style={{
                        fontSize: 9,
                        padding: '1px 5px',
                        borderRadius: 3,
                        background: 'var(--accent-dim)',
                        color: 'var(--accent)',
                        fontWeight: 600,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {sidebarTab === 'layers' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 10px' }}>
            {elements.length === 0 && (
              <div style={{ fontSize: 11, color: 'var(--text-500)', textAlign: 'center', padding: '30px 0' }}>
                No elements yet. Use the canvas tools to add elements.
              </div>
            )}
            {elements.map((el) => (
              <div
                key={el.id}
                onClick={() => setSelectedId(el.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 6,
                  border: selectedId === el.id ? '1px solid var(--accent)' : '1px solid transparent',
                  background: selectedId === el.id ? 'var(--accent-dim)' : 'var(--surface)',
                  marginBottom: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: el.color,
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-200)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {el.name}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-500)', textTransform: 'capitalize' }}>
                    {el.type}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDuplicateElement(el.id); }}
                    style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: 'var(--surface-hover)', color: 'var(--text-400)', fontSize: 10, cursor: 'pointer' }}
                    title="Duplicate"
                  >
                    +
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteElement(el.id); }}
                    style={{ width: 22, height: 22, borderRadius: 4, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 10, cursor: 'pointer' }}
                    title="Delete"
                  >
                    x
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--glass-border)',
          display: 'flex',
          gap: 6,
        }}>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 8px',
              borderRadius: 6,
              border: '1px solid var(--glass-border)',
              background: 'var(--surface)',
              color: 'var(--text-200)',
              fontSize: 11,
              outline: 'none',
            }}
          >
            <option value="json">JSON</option>
            <option value="html">HTML Embed</option>
          </select>
          <button
            onClick={handleExport}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: 'var(--accent)',
              color: 'var(--bg-900)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Export
          </button>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <SceneBuilder3D
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onAddElement={handleAddElement}
            onUpdateElement={handleUpdateElement}
          />
        </div>

        <div style={{
          width: 240,
          background: 'var(--bg-800)',
          borderLeft: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid var(--glass-border)',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-100)',
          }}>
            Properties
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '10px 14px' }}>
            {!selectedElement ? (
              <div style={{ fontSize: 11, color: 'var(--text-500)', textAlign: 'center', padding: '30px 0' }}>
                Select an element to edit its properties
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedProps.map((prop) => (
                  <div key={prop.key}>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 4 }}>
                      {prop.label}
                    </label>
                    {prop.type === 'text' && (
                      <input
                        value={prop.value}
                        onChange={(e) => handleUpdateElement(selectedId, { [prop.key]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: 4,
                          border: '1px solid var(--glass-border)',
                          background: 'var(--surface)',
                          color: 'var(--text-200)',
                          fontSize: 11,
                          outline: 'none',
                        }}
                      />
                    )}
                    {prop.type === 'color' && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input
                          type="color"
                          value={prop.value}
                          onChange={(e) => handleUpdateElement(selectedId, { [prop.key]: e.target.value })}
                          style={{ width: 28, height: 28, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                        />
                        <input
                          value={prop.value}
                          onChange={(e) => handleUpdateElement(selectedId, { [prop.key]: e.target.value })}
                          style={{
                            flex: 1,
                            padding: '5px 8px',
                            borderRadius: 4,
                            border: '1px solid var(--glass-border)',
                            background: 'var(--surface)',
                            color: 'var(--text-200)',
                            fontSize: 11,
                            outline: 'none',
                            fontFamily: 'monospace',
                          }}
                        />
                      </div>
                    )}
                    {prop.type === 'vec3' && (
                      <div style={{ display: 'flex', gap: 4 }}>
                        {['x', 'y', 'z'].map((axis, i) => (
                          <div key={axis} style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: 'var(--text-500)', marginBottom: 2, textTransform: 'uppercase' }}>{axis}</div>
                            <input
                              type="number"
                              step={0.1}
                              value={prop.value[i] ?? 0}
                              onChange={(e) => {
                                const newVal = [...prop.value];
                                newVal[i] = parseFloat(e.target.value) || 0;
                                handleUpdateElement(selectedId, { [prop.key]: newVal });
                              }}
                              style={{
                                width: '100%',
                                padding: '4px 6px',
                                borderRadius: 4,
                                border: '1px solid var(--glass-border)',
                                background: 'var(--surface)',
                                color: 'var(--text-200)',
                                fontSize: 11,
                                outline: 'none',
                                fontFamily: 'monospace',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--glass-border)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-400)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Preview Preset
            </div>
            <div style={{ height: 140, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
              <PresetScenes activeScene={activePreset} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
