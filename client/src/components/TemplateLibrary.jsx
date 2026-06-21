import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const CATEGORIES = ['all', 'lower-third', 'full-screen', 'ticker', 'scoreboard', 'player-card'];
const SPORTS = ['all', 'generic', 'cricket', 'football', 'basketball'];

const CATEGORY_ICONS = {
  'lower-third': '📰', 'full-screen': '🖥', 'ticker': '📰',
  'scoreboard': '📊', 'player-card': '🏏'
};

const DEMO_TEMPLATES = [
  { id: 't1', name: 'Classic Scorebug', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e1', type: 'text' }] },
  { id: 't2', name: 'Player Lower Third', category: 'lower-third', sport: 'cricket', canvas: { width: 1920, height: 120 }, elements: [{ id: 'e2', type: 'text' }, { id: 'e3', type: 'shape' }] },
  { id: 't3', name: 'Full Scorecard', category: 'full-screen', sport: 'cricket', canvas: { width: 1920, height: 1080 }, elements: [{ id: 'e4', type: 'text' }] },
  { id: 't4', name: 'News Ticker', category: 'ticker', sport: 'generic', canvas: { width: 1920, height: 60 }, elements: [{ id: 'e5', type: 'ticker' }] },
  { id: 't5', name: 'Batter Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e6', type: 'text' }, { id: 'e7', type: 'image' }] },
  { id: 't6', name: 'IPL Scoreboard', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e8', type: 'text' }] },
  { id: 't7', name: 'Football Score', category: 'scoreboard', sport: 'football', canvas: { width: 1920, height: 120 }, elements: [{ id: 'e9', type: 'text' }] },
  { id: 't8', name: 'Basketball Overlay', category: 'scoreboard', sport: 'basketball', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e10', type: 'text' }] },
  { id: 't9', name: 'Bowler Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e11', type: 'text' }, { id: 'e12', type: 'image' }] },
  { id: 't10', name: 'Over Summary', category: 'ticker', sport: 'cricket', canvas: { width: 1920, height: 80 }, elements: [{ id: 'e13', type: 'ticker' }] },
  { id: 't11', name: 'Team Intro', category: 'full-screen', sport: 'generic', canvas: { width: 1920, height: 1080 }, elements: [{ id: 'e14', type: 'text' }, { id: 'e15', type: 'image' }] },
  { id: 't12', name: 'Match Info', category: 'lower-third', sport: 'generic', canvas: { width: 1920, height: 100 }, elements: [{ id: 'e16', type: 'text' }] }
];

function TemplateCard({ template, onEdit, onDelete }) {
  return (
    <div className="tl-card card-static">
      <div className="tl-card-preview">
        <span style={{ fontSize: 32 }}>{CATEGORY_ICONS[template.category] || '📄'}</span>
        <span className="tl-card-elements">{template.elements?.length || 0} elements</span>
      </div>
      <div className="tl-card-body">
        <h4 className="tl-card-name">{template.name}</h4>
        <div className="tl-card-meta">
          <span className="chip" style={{ fontSize: '0.65rem' }}>{template.category}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-500)' }}>{template.sport || 'generic'}</span>
        </div>
        <div className="tl-card-size">
          {template.canvas?.width || 1920} × {template.canvas?.height || 1080}
        </div>
      </div>
      <div className="tl-card-actions">
        <Link to={`/editor/${template.id}`} className="btn btn-sm btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
          Edit
        </Link>
        <button className="btn btn-sm btn-secondary" onClick={onDelete} style={{ padding: '6px 10px' }}>✕</button>
      </div>
    </div>
  );
}

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [category, setCategory] = useState('all');
  const [sport, setSport] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/templates`)
      .then(r => r.ok ? r.json() : DEMO_TEMPLATES)
      .then(data => { setTemplates(data.length ? data : DEMO_TEMPLATES); setLoading(false); })
      .catch(() => { setTemplates(DEMO_TEMPLATES); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return templates.filter(t => {
      if (category !== 'all' && t.category !== category) return false;
      if (sport !== 'all' && t.sport !== sport) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [templates, category, sport, search]);

  const deleteTemplate = useCallback((id) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const exportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-library.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [templates]);

  const importTemplates = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        const arr = Array.isArray(data) ? data : [data];
        setTemplates(prev => [...prev, ...arr.map((t, i) => ({ ...t, id: t.id || `imported_${Date.now()}_${i}` }))]);
      } catch {}
    };
    reader.readAsText(file);
    setShowImportModal(false);
  }, []);

  return (
    <div className="tl-layout">
      <div className="tl-topbar">
        <Link to="/" className="te-back">← Home</Link>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)' }}>Template Library</h2>
        <div className="tl-topbar-right">
          <label className="btn btn-sm btn-secondary" style={{ cursor: 'pointer' }}>
            📥 Import
            <input type="file" accept=".json" onChange={importTemplates} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-sm btn-secondary" onClick={exportAll}>📤 Export All</button>
          <Link to="/editor" className="btn btn-sm btn-primary">+ New Template</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="tl-filters">
        <div className="tl-search-wrap">
          <span className="tl-search-icon">🔍</span>
          <input
            className="tl-search"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="tl-filter-group">
          <span className="tl-filter-label">Category</span>
          <div className="tl-filter-chips">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`tl-chip ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c === 'all' ? 'All' : c}
              </button>
            ))}
          </div>
        </div>
        <div className="tl-filter-group">
          <span className="tl-filter-label">Sport</span>
          <div className="tl-filter-chips">
            {SPORTS.map(s => (
              <button
                key={s}
                className={`tl-chip ${sport === s ? 'active' : ''}`}
                onClick={() => setSport(s)}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>
        <div className="tl-count">{filtered.length} templates</div>
      </div>

      {/* Grid */}
      <div className="tl-grid">
        {loading ? (
          <div className="tl-empty">Loading templates...</div>
        ) : filtered.length === 0 ? (
          <div className="tl-empty">
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>No templates found matching your filters.</p>
            <Link to="/editor" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Create New Template</Link>
          </div>
        ) : (
          filtered.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              onDelete={() => deleteTemplate(t.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
