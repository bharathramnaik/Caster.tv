import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import TemplateCard from '../components/templates/TemplateCard';
import TemplatePreview from '../components/templates/TemplatePreview';
import TemplateImportExport from '../components/templates/TemplateImportExport';
import TemplateCategories from '../components/templates/TemplateCategories';
import TemplateVersions from '../components/templates/TemplateVersions';
import TemplateSharing from '../components/templates/TemplateSharing';

const API = import.meta.env.VITE_API_URL || '';

const CATEGORIES = ['all', 'lower-third', 'full-screen', 'ticker', 'scoreboard', 'player-card', 'common'];
const SPORTS = ['all', 'generic', 'cricket', 'football', 'basketball', 'tennis'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'date', label: 'Date' },
  { value: 'category', label: 'Category' },
  { value: 'sport', label: 'Sport' }
];

const DEMO_TEMPLATES = [
  { id: 't1', name: 'Classic Scorebug', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 300, height: 150 }, style: { backgroundColor: '#1a5e1f' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 310, y: 10, width: 400, height: 60 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '700', fontFamily: 'Outfit' }, content: 'IND vs AUS' },
      { id: 'e3', type: 'text', position: { x: 310, y: 80, width: 200, height: 50 }, style: { color: '#E3B23C', fontSize: 48, fontWeight: '900', fontFamily: 'Teko' }, content: '186/4' },
      { id: 'e4', type: 'text', position: { x: 520, y: 90, width: 150, height: 40 }, style: { color: '#aaa', fontSize: 20, fontFamily: 'Outfit' }, content: '(15.2 ov)' },
      { id: 'e5', type: 'shape', position: { x: 1620, y: 0, width: 300, height: 150 }, style: { backgroundColor: '#1a3c5e' }, content: '' },
    ], createdAt: '2025-01-15T10:00:00Z' },
  { id: 't2', name: 'Player Lower Third', category: 'lower-third', sport: 'cricket', canvas: { width: 1920, height: 120 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: '#1a5e1f' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 40, y: 10, width: 300, height: 40 }, style: { color: '#E3B23C', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' }, content: 'BATTER' },
      { id: 'e3', type: 'text', position: { x: 40, y: 50, width: 500, height: 60 }, style: { color: '#ffffff', fontSize: 42, fontWeight: '900', fontFamily: 'Teko' }, content: 'V. Kohli' },
    ], createdAt: '2025-01-14T08:30:00Z' },
  { id: 't3', name: 'Full Scorecard', category: 'full-screen', sport: 'cricket', canvas: { width: 1920, height: 1080 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: '#0f172a' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 40, y: 30, width: 600, height: 60 }, style: { color: '#ffffff', fontSize: 48, fontWeight: '900', fontFamily: 'Teko' }, content: 'FULL SCORECARD' },
      { id: 'e3', type: 'text', position: { x: 40, y: 160, width: 800, height: 50 }, style: { color: '#E3B23C', fontSize: 28, fontWeight: '700', fontFamily: 'Outfit' }, content: 'BATTING' },
    ], createdAt: '2025-01-13T15:00:00Z' },
  { id: 't4', name: 'News Ticker', category: 'ticker', sport: 'generic', canvas: { width: 1920, height: 60 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 60 }, style: { backgroundColor: '#dc2626' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 20, y: 10, width: 200, height: 40 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '900', fontFamily: 'Teko' }, content: 'BREAKING' },
      { id: 'e3', type: 'text', position: { x: 240, y: 12, width: 1600, height: 36 }, style: { color: '#ffffff', fontSize: 22, fontFamily: 'Outfit' }, content: 'Live updates from the match happening at Wankhede Stadium' },
    ], createdAt: '2025-01-12T12:00:00Z' },
  { id: 't5', name: 'Batter Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 250, height: 150 }, style: { backgroundColor: '#1a5e1f' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 260, y: 10, width: 400, height: 50 }, style: { color: '#E3B23C', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' }, content: 'BATTER' },
      { id: 'e3', type: 'text', position: { x: 260, y: 50, width: 500, height: 50 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: 'V. Kohli' },
      { id: 'e4', type: 'text', position: { x: 900, y: 20, width: 120, height: 110 }, style: { color: '#E3B23C', fontSize: 64, fontWeight: '900', fontFamily: 'Teko' }, content: '45' },
    ], createdAt: '2025-01-11T09:00:00Z' },
  { id: 't6', name: 'IPL Scoreboard', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: '#1e1b4b' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 40, y: 20, width: 300, height: 50 }, style: { color: '#818cf8', fontSize: 20, fontWeight: '700', fontFamily: 'Outfit' }, content: 'IPL 2025' },
      { id: 'e3', type: 'text', position: { x: 40, y: 70, width: 400, height: 70 }, style: { color: '#ffffff', fontSize: 56, fontWeight: '900', fontFamily: 'Teko' }, content: 'CSK 192/4' },
    ], createdAt: '2025-01-10T14:00:00Z' },
  { id: 't7', name: 'Football Score', category: 'scoreboard', sport: 'football', canvas: { width: 1920, height: 120 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: '#065f46' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 300, y: 20, width: 400, height: 40 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '700', fontFamily: 'Outfit' }, content: 'MANCHESTER UTD' },
      { id: 'e3', type: 'text', position: { x: 860, y: 15, width: 200, height: 90 }, style: { color: '#fbbf24', fontSize: 72, fontWeight: '900', fontFamily: 'Teko' }, content: '2-1' },
      { id: 'e4', type: 'text', position: { x: 1200, y: 20, width: 400, height: 40 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '700', fontFamily: 'Outfit' }, content: 'LIVERPOOL' },
    ], createdAt: '2025-01-09T11:00:00Z' },
  { id: 't8', name: 'Basketball Overlay', category: 'scoreboard', sport: 'basketball', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: '#991b1b' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 200, y: 20, width: 400, height: 50 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '700', fontFamily: 'Outfit' }, content: 'LAKERS' },
      { id: 'e3', type: 'text', position: { x: 860, y: 15, width: 200, height: 120 }, style: { color: '#fbbf24', fontSize: 80, fontWeight: '900', fontFamily: 'Teko' }, content: '98-102' },
      { id: 'e4', type: 'text', position: { x: 1300, y: 20, width: 400, height: 50 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '700', fontFamily: 'Outfit' }, content: 'CELTICS' },
    ], createdAt: '2025-01-08T16:00:00Z' },
  { id: 't9', name: 'Bowler Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 250, height: 150 }, style: { backgroundColor: '#1a3c5e' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 260, y: 10, width: 400, height: 50 }, style: { color: '#60a5fa', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' }, content: 'BOWLER' },
      { id: 'e3', type: 'text', position: { x: 260, y: 50, width: 500, height: 50 }, style: { color: '#ffffff', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: 'P. Cummins' },
      { id: 'e4', type: 'text', position: { x: 900, y: 20, width: 200, height: 110 }, style: { color: '#ef4444', fontSize: 56, fontWeight: '900', fontFamily: 'Teko' }, content: '2-34' },
    ], createdAt: '2025-01-07T10:00:00Z' },
  { id: 't10', name: 'Over Summary', category: 'ticker', sport: 'cricket', canvas: { width: 1920, height: 80 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 80 }, style: { backgroundColor: '#0f172a' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 20, y: 5, width: 200, height: 35 }, style: { color: '#E3B23C', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit' }, content: 'OVER 16' },
      { id: 'e3', type: 'text', position: { x: 20, y: 40, width: 1880, height: 35 }, style: { color: '#ffffff', fontSize: 22, fontFamily: 'Outfit' }, content: '4 6 • W 1 2' },
    ], createdAt: '2025-01-06T08:00:00Z' },
  { id: 't11', name: 'Team Intro', category: 'full-screen', sport: 'generic', canvas: { width: 1920, height: 1080 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 1080 }, style: { backgroundColor: '#0f172a' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 460, y: 400, width: 1000, height: 120 }, style: { color: '#ffffff', fontSize: 96, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: 'TEAM INTRO' },
      { id: 'e3', type: 'text', position: { x: 660, y: 540, width: 600, height: 60 }, style: { color: '#E3B23C', fontSize: 32, fontFamily: 'Outfit', textAlign: 'center' }, content: 'Wankhede Stadium, Mumbai' },
    ], createdAt: '2025-01-05T13:00:00Z' },
  { id: 't12', name: 'Match Info', category: 'lower-third', sport: 'generic', canvas: { width: 1920, height: 100 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 100 }, style: { backgroundColor: '#1e293b' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 40, y: 15, width: 600, height: 35 }, style: { color: '#94a3b8', fontSize: 16, fontWeight: '600', fontFamily: 'Outfit' }, content: 'MATCH INFO' },
      { id: 'e3', type: 'text', position: { x: 40, y: 50, width: 800, height: 40 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '700', fontFamily: 'Outfit' }, content: 'IPL 2025 · Match 45 · Wankhede Stadium' },
    ], createdAt: '2025-01-04T09:30:00Z' },
  { id: 't13', name: 'Tennis Score', category: 'scoreboard', sport: 'tennis', canvas: { width: 1920, height: 120 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 120 }, style: { backgroundColor: '#14532d' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 200, y: 15, width: 400, height: 40 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '700', fontFamily: 'Outfit' }, content: 'N. DJOKOVIC' },
      { id: 'e3', type: 'text', position: { x: 860, y: 10, width: 200, height: 100 }, style: { color: '#fbbf24', fontSize: 72, fontWeight: '900', fontFamily: 'Teko' }, content: '6-4 3-2' },
      { id: 'e4', type: 'text', position: { x: 1200, y: 15, width: 400, height: 40 }, style: { color: '#ffffff', fontSize: 24, fontWeight: '700', fontFamily: 'Outfit' }, content: 'C. ALCARAZ' },
    ], createdAt: '2025-01-03T11:00:00Z' },
  { id: 't14', name: 'Common Overlay', category: 'common', sport: 'generic', canvas: { width: 1920, height: 200 },
    elements: [
      { id: 'e1', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 200 }, style: { backgroundColor: '#1e1b4b' }, content: '' },
      { id: 'e2', type: 'text', position: { x: 460, y: 40, width: 1000, height: 60 }, style: { color: '#ffffff', fontSize: 48, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: 'SPORTSCASTER LIVE' },
      { id: 'e3', type: 'text', position: { x: 560, y: 110, width: 800, height: 40 }, style: { color: '#818cf8', fontSize: 24, fontFamily: 'Outfit', textAlign: 'center' }, content: 'Professional Broadcast Graphics' },
    ], createdAt: '2025-01-02T14:30:00Z' }
];

export default function TemplateLibrary() {
  const [templates, setTemplates] = useState(DEMO_TEMPLATES);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('all');
  const [sport, setSport] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [versionsTemplate, setVersionsTemplate] = useState(null);
  const [sharingTemplate, setSharingTemplate] = useState(null);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/api/templates`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.templates || []);
        setTemplates(list.length > 0 ? list : DEMO_TEMPLATES);
        setLoading(false);
      })
      .catch(() => {
        setTemplates(DEMO_TEMPLATES);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let result = templates.filter(t => {
      if (category !== 'all' && t.category !== category) return false;
      if (sport !== 'all' && t.sport !== sport) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'sport':
          return (a.sport || 'generic').localeCompare(b.sport || 'generic');
        default:
          return 0;
      }
    });

    return result;
  }, [templates, category, sport, search, sortBy]);

  const handleImport = useCallback((template) => {
    setTemplates(prev => [...prev, template]);
  }, []);

  const handleDelete = useCallback((template) => {
    if (window.confirm(`Delete "${template.name}"?`)) {
      setTemplates(prev => prev.filter(t => t.id !== template.id));
    }
  }, []);

  const handleDuplicate = useCallback((template) => {
    const dupe = {
      ...template,
      id: `dup_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    setTemplates(prev => [...prev, dupe]);
  }, []);

  const handleExport = useCallback((template) => {
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template.name || 'template'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportAll = useCallback(() => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-library.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [templates]);

  const toggleBulkSelect = useCallback((id) => {
    setSelectedTemplates(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const bulkDelete = useCallback(() => {
    if (window.confirm(`Delete ${selectedTemplates.length} templates?`)) {
      setTemplates(prev => prev.filter(t => !selectedTemplates.includes(t.id)));
      setSelectedTemplates([]);
      setBulkMode(false);
    }
  }, [selectedTemplates]);

  const bulkExport = useCallback(() => {
    const selected = templates.filter(t => selectedTemplates.includes(t.id));
    const blob = new Blob([JSON.stringify(selected, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'templates-selected.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [templates, selectedTemplates]);

  return (
    <div className="tl-layout">
      <div className="tl-topbar">
        <Link to="/" className="te-back">← Home</Link>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-100)' }}>Template Library</h2>
        <div className="tl-topbar-right">
          {bulkMode && selectedTemplates.length > 0 && (
            <>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-400)' }}>
                {selectedTemplates.length} selected
              </span>
              <button className="btn btn-sm btn-secondary" onClick={bulkExport}>📤 Export</button>
              <button className="btn btn-sm btn-danger" onClick={bulkDelete}>🗑 Delete</button>
              <button className="btn btn-sm btn-secondary" onClick={() => { setBulkMode(false); setSelectedTemplates([]); }}>
                Cancel
              </button>
            </>
          )}
          <button
            className={`btn btn-sm ${bulkMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setBulkMode(!bulkMode); setSelectedTemplates([]); }}
          >
            {bulkMode ? '✓ Bulk' : '☑ Bulk'}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowCategories(!showCategories)}>
            📂 Categories
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowImportExport(true)}>
            📥 Import/Export
          </button>
          <button className="btn btn-sm btn-secondary" onClick={handleExportAll}>
            📤 Export All
          </button>
          <Link to="/editor" className="btn btn-sm btn-primary">+ New Template</Link>
        </div>
      </div>

      <div className="tl-filters">
        <div className="tl-filters-top">
          <div className="tl-search-wrap">
            <span className="tl-search-icon">🔍</span>
            <input
              className="tl-search"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="tl-view-toggle">
            <button
              className={`tl-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ▦
            </button>
            <button
              className={`tl-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ☰
            </button>
          </div>
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 140 }}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="tl-filters-row">
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
      </div>

      {showCategories && (
        <div className="tl-categories-panel">
          <TemplateCategories
            categories={categories}
            templates={templates}
            onUpdate={setCategories}
          />
        </div>
      )}

      <div className={viewMode === 'grid' ? 'tl-grid' : 'tl-list'}>
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
              viewMode={viewMode}
              onEdit={() => {}}
              onDelete={() => handleDelete(t)}
              onDuplicate={() => handleDuplicate(t)}
              onExport={() => handleExport(t)}
              onPreview={() => setPreviewTemplate(t)}
            />
          ))
        )}
      </div>

      {showImportExport && (
        <TemplateImportExport
          onImport={handleImport}
          onClose={() => setShowImportExport(false)}
        />
      )}

      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onEdit={() => {}}
          onDuplicate={() => handleDuplicate(previewTemplate)}
        />
      )}

      {versionsTemplate && (
        <TemplateVersions
          template={versionsTemplate}
          onClose={() => setVersionsTemplate(null)}
          onRestore={() => {}}
        />
      )}

      {sharingTemplate && (
        <TemplateSharing
          template={sharingTemplate}
          onClose={() => setSharingTemplate(null)}
        />
      )}
    </div>
  );
}
