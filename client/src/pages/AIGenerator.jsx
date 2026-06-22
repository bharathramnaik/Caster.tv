import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSound } from '../sounds/useSound.js';

const API = import.meta.env.VITE_API_URL || '';

const SPORTS = ['cricket', 'football', 'basketball', 'tennis', 'generic'];
const TYPES = ['scoreboard', 'lower-third', 'timer', 'stats', 'ticker', 'player-card'];

export default function AIGenerator() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState(null);
  const [presets, setPresets] = useState([]);
  const [presetFilter, setPresetFilter] = useState({ sport: '', type: '' });
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [history, setHistory] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [showCompletions, setShowCompletions] = useState(false);
  const inputRef = useRef(null);
  const { playClick, playSuccess } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai-generator-history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [presetFilter]);

  const fetchPresets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (presetFilter.sport) params.set('sport', presetFilter.sport);
      if (presetFilter.type) params.set('type', presetFilter.type);
      const res = await fetch(`${API}/api/ai/presets?${params}`);
      const data = await res.json();
      setPresets(data.presets || []);
    } catch {
      setPresets([]);
    }
  }, [presetFilter]);

  const handleGenerate = useCallback(async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    playClick();
    try {
      const res = await fetch(`${API}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      setGenerated(data);
      playSuccess();
      const newHistory = [
        { id: data.template.id, description, timestamp: Date.now(), template: data.template },
        ...history.slice(0, 19)
      ];
      setHistory(newHistory);
      localStorage.setItem('ai-generator-history', JSON.stringify(newHistory));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [description, history, playClick, playSuccess]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }, [handleGenerate]);

  const handleInputChange = useCallback(async (e) => {
    const val = e.target.value;
    setDescription(val);
    if (val.length >= 2) {
      try {
        const res = await fetch(`${API}/api/ai/autocomplete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partial: val })
        });
        const data = await res.json();
        setCompletions(data.completions || []);
        setShowCompletions(true);
      } catch {
        setCompletions([]);
      }
    } else {
      setCompletions([]);
      setShowCompletions(false);
    }
  }, []);

  const handleUseTemplate = useCallback((template) => {
    playClick();
    try {
      localStorage.setItem('editor-template', JSON.stringify(template));
      navigate('/editor');
    } catch {}
  }, [playClick, navigate]);

  const handleUsePreset = useCallback((preset) => {
    playClick();
    setSelectedPreset(preset);
  }, [playClick]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('ai-generator-history');
  }, []);

  return (
    <div className="page" style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ marginBottom: 8 }}>
          <span className="gradient-text">AI Template Generator</span>
        </h1>
        <p style={{ color: 'var(--text-400)', fontSize: 15 }}>
          Describe your overlay and let AI generate it for you
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>Generate Template</h3>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <textarea
              ref={inputRef}
              value={description}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => completions.length > 0 && setShowCompletions(true)}
              onBlur={() => setTimeout(() => setShowCompletions(false), 200)}
              placeholder='Describe your overlay... (e.g., "cricket scoreboard for MI vs CSK")'
              rows={3}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)', background: 'var(--bg-700)',
                color: 'var(--text-200)', fontSize: 14, fontFamily: 'var(--font-body)',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box'
              }}
            />
            {showCompletions && completions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'var(--bg-700)', border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)', marginTop: 4, maxHeight: 200, overflow: 'auto'
              }}>
                {completions.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => { setDescription(c); setShowCompletions(false); playClick(); }}
                    style={{
                      padding: '8px 16px', cursor: 'pointer', fontSize: 13,
                      color: 'var(--text-300)', borderBottom: i < completions.length - 1 ? '1px solid var(--glass-border)' : 'none'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--surface-hover)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            style={{ width: '100%' }}
          >
            {loading ? (
              <><span className="ipl-loader-spinner" style={{ width: 16, height: 16 }} /> Generating...</>
            ) : 'Generate Template'}
          </button>
          {error && (
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16, fontSize: 18 }}>Preview</h3>
          {generated ? (
            <TemplatePreview template={generated.template} onUse={handleUseTemplate} />
          ) : selectedPreset ? (
            <TemplatePreview template={selectedPreset} onUse={handleUseTemplate} />
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 200, color: 'var(--text-500)', fontSize: 14, textAlign: 'center'
            }}>
              Generated template will appear here
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, margin: 0 }}>Template Presets</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="input"
              value={presetFilter.sport}
              onChange={e => { playClick(); setPresetFilter(f => ({ ...f, sport: e.target.value })); }}
              style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-700)', color: 'var(--text-200)', border: '1px solid var(--glass-border)', fontSize: 13 }}
            >
              <option value="">All Sports</option>
              {SPORTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <select
              className="input"
              value={presetFilter.type}
              onChange={e => { playClick(); setPresetFilter(f => ({ ...f, type: e.target.value })); }}
              style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--bg-700)', color: 'var(--text-200)', border: '1px solid var(--glass-border)', fontSize: 13 }}
            >
              <option value="">All Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {presets.map(preset => (
            <div
              key={preset.id}
              onClick={() => handleUsePreset(preset)}
              style={{
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                border: selectedPreset?.id === preset.id ? '2px solid var(--accent)' : '1px solid var(--glass-border)',
                background: 'var(--bg-700)', cursor: 'pointer', transition: 'all var(--t-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-100)' }}>{preset.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 12,
                  background: 'var(--accent-dim)', color: 'var(--accent)', letterSpacing: 1
                }}>
                  {preset.type}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--text-400)', lineHeight: 1.4 }}>{preset.description}</p>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, margin: 0 }}>Recent Generations</h3>
            <button className="btn btn-secondary btn-sm" onClick={handleClearHistory} style={{ fontSize: 12, padding: '4px 12px' }}>
              Clear
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {history.slice(0, 6).map((item, i) => (
              <div
                key={item.id + i}
                onClick={() => { playClick(); setGenerated({ template: item.template }); }}
                style={{
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--glass-border)', background: 'var(--bg-700)',
                  cursor: 'pointer', transition: 'all var(--t-fast)'
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-200)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.description}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-500)' }}>
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplatePreview({ template, onUse }) {
  if (!template) return null;

  const scale = Math.min(600 / (template.canvas?.width || 1920), 300 / (template.canvas?.height || 150));

  return (
    <div>
      <div style={{
        background: '#0a0a0a', borderRadius: 'var(--radius-md)', padding: 16,
        border: '1px solid var(--glass-border)', marginBottom: 12, overflow: 'hidden'
      }}>
        <div style={{
          position: 'relative', width: template.canvas?.width || 1920, height: template.canvas?.height || 150,
          transform: `scale(${scale})`, transformOrigin: 'top left',
          background: '#000', borderRadius: 4, overflow: 'hidden'
        }}>
          {template.elements?.map(el => {
            if (el.type === 'text') {
              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: el.position.x, top: el.position.y,
                    width: el.position.width, height: el.position.height,
                    ...el.style, lineHeight: el.style?.lineHeight || 1.2,
                    display: 'flex', alignItems: el.style?.textAlign === 'center' ? 'center' : 'flex-start',
                    justifyContent: el.style?.textAlign === 'right' ? 'flex-end' : el.style?.textAlign === 'center' ? 'center' : 'flex-start',
                    textAlign: el.style?.textAlign || 'left'
                  }}
                >
                  {el.content}
                </div>
              );
            }
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: el.position.x, top: el.position.y,
                  width: el.position.width, height: el.position.height,
                  ...el.style
                }}
              />
            );
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-primary" onClick={() => onUse(template)} style={{ flex: 1 }}>
          Use Template
        </button>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-500)' }}>
        {template.name} · {template.elements?.length || 0} elements · {template.canvas?.width}x{template.canvas?.height}
      </div>
    </div>
  );
}
