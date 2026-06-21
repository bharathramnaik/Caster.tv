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
  { id: 't1', name: 'Classic Scorebug', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e1', type: 'text' }], createdAt: '2025-01-15T10:00:00Z' },
  { id: 't2', name: 'Player Lower Third', category: 'lower-third', sport: 'cricket', canvas: { width: 1920, height: 120 }, elements: [{ id: 'e2', type: 'text' }, { id: 'e3', type: 'shape' }], createdAt: '2025-01-14T08:30:00Z' },
  { id: 't3', name: 'Full Scorecard', category: 'full-screen', sport: 'cricket', canvas: { width: 1920, height: 1080 }, elements: [{ id: 'e4', type: 'text' }], createdAt: '2025-01-13T15:00:00Z' },
  { id: 't4', name: 'News Ticker', category: 'ticker', sport: 'generic', canvas: { width: 1920, height: 60 }, elements: [{ id: 'e5', type: 'ticker' }], createdAt: '2025-01-12T12:00:00Z' },
  { id: 't5', name: 'Batter Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e6', type: 'text' }, { id: 'e7', type: 'image' }], createdAt: '2025-01-11T09:00:00Z' },
  { id: 't6', name: 'IPL Scoreboard', category: 'scoreboard', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e8', type: 'text' }], createdAt: '2025-01-10T14:00:00Z' },
  { id: 't7', name: 'Football Score', category: 'scoreboard', sport: 'football', canvas: { width: 1920, height: 120 }, elements: [{ id: 'e9', type: 'text' }], createdAt: '2025-01-09T11:00:00Z' },
  { id: 't8', name: 'Basketball Overlay', category: 'scoreboard', sport: 'basketball', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e10', type: 'text' }], createdAt: '2025-01-08T16:00:00Z' },
  { id: 't9', name: 'Bowler Card', category: 'player-card', sport: 'cricket', canvas: { width: 1920, height: 150 }, elements: [{ id: 'e11', type: 'text' }, { id: 'e12', type: 'image' }], createdAt: '2025-01-07T10:00:00Z' },
  { id: 't10', name: 'Over Summary', category: 'ticker', sport: 'cricket', canvas: { width: 1920, height: 80 }, elements: [{ id: 'e13', type: 'ticker' }], createdAt: '2025-01-06T08:00:00Z' },
  { id: 't11', name: 'Team Intro', category: 'full-screen', sport: 'generic', canvas: { width: 1920, height: 1080 }, elements: [{ id: 'e14', type: 'text' }, { id: 'e15', type: 'image' }], createdAt: '2025-01-05T13:00:00Z' },
  { id: 't12', name: 'Match Info', category: 'lower-third', sport: 'generic', canvas: { width: 1920, height: 100 }, elements: [{ id: 'e16', type: 'text' }], createdAt: '2025-01-04T09:30:00Z' },
  { id: 't13', name: 'Tennis Score', category: 'scoreboard', sport: 'tennis', canvas: { width: 1920, height: 120 }, elements: [{ id: 'e17', type: 'text' }], createdAt: '2025-01-03T11:00:00Z' },
  { id: 't14', name: 'Common Overlay', category: 'common', sport: 'generic', canvas: { width: 1920, height: 200 }, elements: [{ id: 'e18', type: 'text' }], createdAt: '2025-01-02T14:30:00Z' }
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
      .then(r => r.ok ? r.json() : DEMO_TEMPLATES)
      .then(data => {
        setTemplates(data.length ? data : DEMO_TEMPLATES);
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
