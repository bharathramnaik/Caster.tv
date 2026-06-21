import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CanvasEditor from './CanvasEditor';
import PropertyPanel from './PropertyPanel';
import AnimationTimeline from './AnimationTimeline';

const API = import.meta.env.VITE_API_URL || '';

function getAuthHeaders() {
  const token = localStorage.getItem('sc-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

let nextId = 1;
function genId() { return `el_${Date.now()}_${nextId++}`; }

const DEFAULT_TEMPLATE = {
  id: '',
  name: 'New Template',
  version: '1.0',
  category: 'lower-third',
  sport: 'generic',
  canvas: { width: 1920, height: 1080, background: 'transparent' },
  elements: [],
  animations: { enter: {}, exit: {}, states: {} }
};

const ANIMATION_PRESETS = [
  { label: 'Slide In Left', value: 'slide-in-left' },
  { label: 'Slide In Right', value: 'slide-in-right' },
  { label: 'Slide In Top', value: 'slide-in-top' },
  { label: 'Slide In Bottom', value: 'slide-in-bottom' },
  { label: 'Fade In', value: 'fade-in' },
  { label: 'Bounce In', value: 'bounce-in' },
  { label: 'Scale In', value: 'scale-in' },
  { label: 'Wipe In Right', value: 'wipe-in-right' },
  { label: 'Typewriter', value: 'typewriter' }
];

export default function TemplateEditor() {
  const { templateId } = useParams();
  const [template, setTemplate] = useState({ ...DEFAULT_TEMPLATE });
  const [selectedIds, setSelectedIds] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(5);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const templateRef = useRef(template);
  templateRef.current = template;

  useEffect(() => {
    if (templateId) {
      fetch(`${API}/api/templates/${templateId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setTemplate(data); })
        .catch(() => {});
    }
  }, [templateId]);

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

  const updateTemplate = useCallback((patch) => {
    setTemplate(prev => ({ ...prev, ...patch }));
    setHasUnsavedChanges(true);
  }, []);

  const addElement = useCallback((opts) => {
    const id = genId();
    const el = {
      id,
      type: opts.type || 'text',
      position: { x: 100, y: 100, width: 200, height: 60, zIndex: template.elements.length },
      style: {
        fontFamily: 'Outfit',
        fontSize: opts.type === 'text' ? 24 : 14,
        fontWeight: '400',
        color: '#ffffff',
        backgroundColor: opts.type === 'shape' ? 'rgba(247,201,72,0.3)' : 'transparent',
        borderRadius: 8
      },
      animation: { enter: 'fade-in', exit: 'fade-out', duration: 0.5, easing: 'ease-out', tracks: [] },
      content: opts.content || (opts.type === 'text' ? 'New Text' : ''),
      src: opts.src || '',
      binding: '',
      condition: '',
      ...opts
    };
    updateTemplate({ elements: [...template.elements, el] });
    setSelectedIds([id]);
  }, [template.elements, updateTemplate]);

  const updateElement = useCallback((id, patch) => {
    updateTemplate({
      elements: template.elements.map(el => {
        if (el.id !== id) return el;
        if (patch.position) return { ...el, position: { ...el.position, ...patch.position } };
        if (patch.style) return { ...el, style: { ...el.style, ...patch.style } };
        if (patch.animation) return { ...el, animation: { ...el.animation, ...patch.animation } };
        return { ...el, ...patch };
      })
    });
  }, [template.elements, updateTemplate]);

  const deleteElement = useCallback((id) => {
    updateTemplate({ elements: template.elements.filter(el => el.id !== id) });
    setSelectedIds(prev => prev.filter(i => i !== id));
  }, [template.elements, updateTemplate]);

  const handleAddKeyframe = useCallback((elementId, property, kf) => {
    updateTemplate({
      elements: template.elements.map(el => {
        if (el.id !== elementId) return el;
        const tracks = el.animation?.tracks || [];
        const existing = tracks.find(t => t.property === property);
        if (existing) {
          return { ...el, animation: { ...el.animation, tracks: tracks.map(t => t.property === property ? { ...t, keyframes: [...t.keyframes, kf] } : t) } };
        }
        return { ...el, animation: { ...el.animation, tracks: [...tracks, { property, label: property, keyframes: [kf] }] } };
      })
    });
  }, [template.elements, updateTemplate]);

  const handleUpdateKeyframe = useCallback((elementId, property, kfId, updates) => {
    updateTemplate({
      elements: template.elements.map(el => {
        if (el.id !== elementId) return el;
        const tracks = el.animation?.tracks || [];
        return { ...el, animation: { ...el.animation, tracks: tracks.map(t => t.property === property ? { ...t, keyframes: t.keyframes.map(kf => kf.id === kfId ? { ...kf, ...updates } : kf) } : t) } };
      })
    });
  }, [template.elements, updateTemplate]);

  const handleDeleteKeyframe = useCallback((elementId, property, kfId) => {
    updateTemplate({
      elements: template.elements.map(el => {
        if (el.id !== elementId) return el;
        const tracks = el.animation?.tracks || [];
        return { ...el, animation: { ...el.animation, tracks: tracks.map(t => t.property === property ? { ...t, keyframes: t.keyframes.filter(kf => kf.id !== kfId) } : t) } };
      })
    });
  }, [template.elements, updateTemplate]);

  const saveTemplate = useCallback(async () => {
    setSaving(true);
    setStatus('');
    try {
      const url = template.id ? `${API}/api/templates/${template.id}` : `${API}/api/templates`;
      const method = template.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(template)
      });
      if (res.ok) {
        const data = await res.json();
        setTemplate(data);
        setHasUnsavedChanges(false);
        setStatus('Saved!');
      } else {
        setStatus('Save failed');
      }
    } catch {
      setStatus('Network error');
    }
    setSaving(false);
    setTimeout(() => setStatus(''), 2000);
  }, [template]);

  const exportTemplate = useCallback(() => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [template]);

  const importTemplate = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        setTemplate(data);
        setStatus('Imported!');
      } catch {
        setStatus('Invalid file');
      }
      setTimeout(() => setStatus(''), 2000);
    };
    reader.readAsText(file);
  }, []);

  const selectedElement = template.elements.find(e => selectedIds.includes(e.id));

  return (
    <div className="template-editor-layout">
      {/* Top Bar */}
      <div className="te-topbar">
        <Link to="/" className="te-back">← Home</Link>
        <input
          className="te-name-input"
          value={template.name}
          onChange={e => updateTemplate({ name: e.target.value })}
          placeholder="Template name"
        />
        <div className="te-topbar-right">
          <select
            className="select"
            value={template.category}
            onChange={e => updateTemplate({ category: e.target.value })}
            style={{ width: 140 }}
          >
            {['lower-third', 'full-screen', 'ticker', 'scoreboard', 'player-card'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="select"
            value={template.sport}
            onChange={e => updateTemplate({ sport: e.target.value })}
            style={{ width: 100 }}
          >
            {['generic', 'cricket', 'football', 'basketball'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
            📥 Import
            <input type="file" accept=".json" onChange={importTemplate} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-sm btn-secondary" onClick={exportTemplate}>📤 Export</button>
          <button className="btn btn-sm btn-primary" onClick={saveTemplate} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
          {status && <span className="te-status">{status}</span>}
          <button className="btn btn-sm btn-secondary" onClick={() => setShowPreview(!showPreview)}>👁</button>
        </div>
      </div>

      <div className="te-body">
        {/* Left: Canvas */}
        <div className="te-canvas-wrap">
          <CanvasEditor
            elements={template.elements}
            selectedIds={selectedIds}
            canvasWidth={template.canvas.width}
            canvasHeight={template.canvas.height}
            canvasBackground={template.canvas.background}
            onSelect={id => setSelectedIds(id ? [id] : [])}
            onMultiSelect={ids => setSelectedIds(ids)}
            onUpdate={(id, patch) => updateElement(id, patch)}
            onAddElement={opts => addElement(opts)}
            onDelete={deleteElement}
          />
        </div>

        {/* Right: Properties */}
        <div className="te-sidebar">
          <PropertyPanel
            element={selectedElement}
            onUpdate={patch => {
              if (selectedElement) updateElement(selectedElement.id, patch);
            }}
          />
        </div>
      </div>

      {/* Bottom: Timeline */}
      <div className="te-timeline">
        <AnimationTimeline
          elements={template.elements}
          selectedElementId={selectedElement?.id}
          duration={duration}
          currentTime={currentTime}
          onTimeChange={setCurrentTime}
          onKeyframeAdd={handleAddKeyframe}
          onKeyframeUpdate={handleUpdateKeyframe}
          onKeyframeDelete={handleDeleteKeyframe}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          isPlaying={playing}
        />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 960, width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>Live Preview</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowPreview(false)}>✕</button>
            </div>
            <div style={{ background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden', aspectRatio: '16/9', position: 'relative' }}>
              {template.elements.map(el => {
                const s = el.style || {};
                return (
                  <div key={el.id} style={{
                    position: 'absolute',
                    left: el.position.x * 0.5,
                    top: el.position.y * 0.5,
                    width: el.position.width * 0.5,
                    height: el.position.height * 0.5,
                    backgroundColor: s.backgroundColor || 'transparent',
                    color: s.color || '#fff',
                    fontFamily: s.fontFamily || 'Outfit',
                    fontSize: (s.fontSize || 24) * 0.5,
                    fontWeight: s.fontWeight || '400',
                    borderRadius: (s.borderRadius || 0) * 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: s.textAlign || 'center'
                  }}>
                    {el.content || el.type}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
