import { useState, useEffect, useCallback, useRef } from 'react';

const API = import.meta.env.VITE_API_URL || '';

/**
 * PreviewPanel Component
 * Live preview of broadcast templates with data editing, animation playback,
 * responsive scaling, and export options.
 */
export default function PreviewPanel({ templateId, template, onClose }) {
  const [previewData, setPreviewData] = useState(null);
  const [previewHTML, setPreviewHTML] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [background, setBackground] = useState('dark');
  const [scale, setScale] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const iframeRef = useRef(null);
  const viewportRef = useRef(null);

  // Fetch preview HTML
  const fetchPreview = useCallback(async (customData = null) => {
    const id = templateId || template?.id;
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      if (customData) {
        const res = await fetch(`${API}/api/preview/template/${id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: customData, background, format: 'html' })
        });
        if (!res.ok) throw new Error('Failed to load preview');
        const html = await res.text();
        setPreviewHTML(html);
      } else {
        const res = await fetch(`${API}/api/preview/template/${id}?background=${background}`);
        if (!res.ok) throw new Error('Failed to load preview');
        const html = await res.text();
        setPreviewHTML(html);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [templateId, template, background]);

  // Fetch sample data
  useEffect(() => {
    const id = templateId || template?.id;
    if (!id) return;

    fetch(`${API}/api/preview/template/${id}?format=json`)
      .then(r => r.ok ? r.json() : null)
      .then(result => {
        if (result?.data) setPreviewData(result.data);
      })
      .catch(() => {});
  }, [templateId, template]);

  // Fetch preview on mount and when background changes
  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // Handle data field changes
  const handleDataChange = useCallback((path, value) => {
    setPreviewData(prev => {
      const updated = { ...prev };
      const parts = path.split('.');
      let current = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    });
  }, []);

  // Apply data changes to preview
  const applyDataChanges = useCallback(() => {
    if (previewData) fetchPreview(previewData);
  }, [previewData, fetchPreview]);

  // Replay animations
  const replayAnimations = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'replay-animations' }, '*');
    }
  }, []);

  // Auto-fit to viewport
  useEffect(() => {
    if (!viewportRef.current || !expanded) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) setScale(Math.min(width / (template?.canvas?.width || 1920), 1));
      }
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, [expanded, template]);

  // Export handlers
  const handleExport = useCallback((format) => {
    const id = templateId || template?.id;
    if (!id) return;

    const url = `${API}/api/preview/export/${id}/${format}`;
    window.open(url, '_blank');
    setExportMenuOpen(false);
  }, [templateId, template]);

  // Flatten data for display
  const flatData = flattenData(previewData || {});

  // Render the preview in an iframe for isolation
  const renderPreviewFrame = () => {
    if (loading) {
      return <div className="preview-loading">Loading preview...</div>;
    }

    if (error) {
      return <div className="preview-error">Error: {error}</div>;
    }

    if (expanded) {
      return (
        <div className="preview-viewport" ref={viewportRef}>
          <div
            className="preview-canvas-wrap"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={previewHTML}
              className="preview-iframe"
              title="Template Preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="preview-thumb">
        <iframe
          srcDoc={previewHTML}
          className="preview-iframe-thumb"
          title="Template Preview"
          sandbox="allow-scripts"
        />
      </div>
    );
  };

  return (
    <div className={`preview-panel ${expanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="preview-header">
        <div className="preview-header-left">
          <h3 className="preview-name">{template?.name || templateId || 'Preview'}</h3>
          {template?.canvas && (
            <span className="preview-size">{template.canvas.width}×{template.canvas.height}</span>
          )}
        </div>
        <div className="preview-header-right">
          <button
            className="preview-btn preview-btn-sm"
            onClick={() => setExpanded(!expanded)}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? '⊟' : '⊞'}
          </button>
          {expanded && (
            <>
              <select
                className="preview-select"
                value={background}
                onChange={e => setBackground(e.target.value)}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="transparent">Transparent</option>
              </select>
              <button
                className={`preview-btn preview-btn-sm ${showGrid ? 'active' : ''}`}
                onClick={() => setShowGrid(!showGrid)}
                title="Toggle grid"
              >
                Grid
              </button>
              <button className="preview-btn preview-btn-sm" onClick={replayAnimations} title="Replay animations">
                ▶ Replay
              </button>
            </>
          )}
          <div className="preview-export-wrap">
            <button
              className="preview-btn preview-btn-sm"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
            >
              Export ▾
            </button>
            {exportMenuOpen && (
              <div className="preview-export-menu">
                <button onClick={() => handleExport('html')}>Static HTML</button>
                <button onClick={() => handleExport('obs')}>OBS Browser Source</button>
                <button onClick={() => handleExport('vmix')}>vMix</button>
                <button onClick={() => handleExport('wirecast')}>Wirecast</button>
              </div>
            )}
          </div>
          {onClose && (
            <button className="preview-btn preview-btn-sm" onClick={onClose}>✕</button>
          )}
        </div>
      </div>

      {/* Preview Content */}
      {renderPreviewFrame()}

      {/* Data Editor (expanded mode) */}
      {expanded && previewData && (
        <div className="preview-data-panel">
          <div className="preview-data-header">
            <h4>Data Editor</h4>
            <button className="preview-btn preview-btn-primary preview-btn-sm" onClick={applyDataChanges}>
              Apply
            </button>
          </div>
          <div className="preview-data-fields">
            {Object.entries(flatData).map(([path, value]) => (
              <div key={path} className="preview-data-field">
                <label title={path}>{path.split('.').pop()}</label>
                <input
                  type={typeof value === 'number' ? 'number' : 'text'}
                  value={value ?? ''}
                  onChange={e => {
                    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
                    handleDataChange(path, val);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .preview-panel { display: flex; flex-direction: column; background: #12121e; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); }
        .preview-panel.expanded { position: fixed; inset: 0; z-index: 1000; border-radius: 0; }
        .preview-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .preview-header-left { display: flex; align-items: center; gap: 8px; }
        .preview-header-right { display: flex; align-items: center; gap: 4px; }
        .preview-name { font-size: 0.85rem; font-weight: 600; color: #e0e0e0; margin: 0; }
        .preview-size { font-size: 0.7rem; color: rgba(255,255,255,0.4); }
        .preview-btn { background: rgba(255,255,255,0.06); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 0.75rem; transition: background 0.15s; }
        .preview-btn:hover { background: rgba(255,255,255,0.12); }
        .preview-btn-sm { padding: 3px 6px; font-size: 0.7rem; }
        .preview-btn-primary { background: #4ade80; color: #000; border-color: #4ade80; font-weight: 600; }
        .preview-btn-primary:hover { background: #22c55e; }
        .preview-btn.active { background: #4ade80; color: #000; }
        .preview-select { background: rgba(255,255,255,0.05); color: #e0e0e0; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; padding: 3px 6px; font-size: 0.7rem; }
        .preview-export-wrap { position: relative; }
        .preview-export-menu { position: absolute; top: 100%; right: 0; background: #1e1e30; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 0; z-index: 10; min-width: 160px; box-shadow: 0 4px 12px rgba(0,0,0,0.4); }
        .preview-export-menu button { display: block; width: 100%; text-align: left; background: none; border: none; color: #e0e0e0; padding: 6px 12px; font-size: 0.8rem; cursor: pointer; }
        .preview-export-menu button:hover { background: rgba(255,255,255,0.08); }
        .preview-thumb { height: 120px; background: #0a0a14; position: relative; overflow: hidden; }
        .preview-iframe-thumb { width: 100%; height: 100%; border: none; }
        .preview-viewport { flex: 1; background: #0a0a14; overflow: auto; position: relative; }
        .preview-iframe { border: none; width: 100%; height: 100%; min-height: 400px; }
        .preview-loading { display: flex; align-items: center; justify-content: center; height: 120px; color: rgba(255,255,255,0.4); font-size: 0.8rem; }
        .preview-error { display: flex; align-items: center; justify-content: center; height: 120px; color: #ef4444; font-size: 0.8rem; }
        .preview-data-panel { border-top: 1px solid rgba(255,255,255,0.06); max-height: 250px; overflow-y: auto; }
        .preview-data-header { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: rgba(255,255,255,0.03); }
        .preview-data-header h4 { font-size: 0.75rem; color: rgba(255,255,255,0.5); margin: 0; }
        .preview-data-fields { padding: 8px 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .preview-data-field { display: flex; flex-direction: column; }
        .preview-data-field label { font-size: 0.65rem; color: rgba(255,255,255,0.4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .preview-data-field input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 3px; color: #fff; padding: 3px 6px; font-size: 0.75rem; font-family: 'Courier New', monospace; }
        .preview-data-field input:focus { outline: none; border-color: #4ade80; }
      `}</style>
    </div>
  );
}

// ── Utility ──────────────────────────────────────────────────────

function flattenData(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenData(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}
