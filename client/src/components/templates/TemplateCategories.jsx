import { useState, useCallback } from 'react';

const DEFAULT_CATEGORIES = [
  { id: 'scoreboard', name: 'Scoreboard', icon: '📊', color: '#f97316', count: 0 },
  { id: 'lower-third', name: 'Lower Third', icon: '📰', color: '#3b82f6', count: 0 },
  { id: 'full-screen', name: 'Full Screen', icon: '🖥', color: '#8b5cf6', count: 0 },
  { id: 'ticker', name: 'Ticker', icon: '📰', color: '#06b6d4', count: 0 },
  { id: 'player-card', name: 'Player Card', icon: '🏏', color: '#22c55e', count: 0 },
  { id: 'common', name: 'Common', icon: '📁', color: '#64748b', count: 0 }
];

const ICON_OPTIONS = ['📊', '📰', '🖥', '🏏', '⚽', '🏀', '🎾', '📁', '🎬', '📺', '🎯', '🏆', '⚡', '🌟', '🔥'];

const COLOR_OPTIONS = [
  '#f97316', '#3b82f6', '#8b5cf6', '#06b6d4', '#22c55e',
  '#64748b', '#ef4444', '#f59e0b', '#ec4899', '#14b8a6',
  '#a855f7', '#f43f5e', '#0ea5e9', '#84cc16', '#e11d48'
];

export default function TemplateCategories({ categories, templates, onUpdate }) {
  const [list, setList] = useState(categories?.length ? categories : DEFAULT_CATEGORIES);
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '📁', color: '#64748b' });

  const countByCategory = useCallback(() => {
    const counts = {};
    (templates || []).forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [templates]);

  const counts = countByCategory();

  const handleCreate = useCallback(() => {
    if (!form.name.trim()) return;
    const id = form.name.toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      id,
      name: form.name.trim(),
      icon: form.icon,
      color: form.color,
      count: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [...list, newCat];
    setList(updated);
    onUpdate?.(updated);
    setForm({ name: '', icon: '📁', color: '#64748b' });
    setShowCreate(false);
  }, [form, list, onUpdate]);

  const handleUpdate = useCallback(() => {
    if (!editing || !form.name.trim()) return;
    const updated = list.map(c =>
      c.id === editing.id ? { ...c, name: form.name.trim(), icon: form.icon, color: form.color } : c
    );
    setList(updated);
    onUpdate?.(updated);
    setEditing(null);
    setForm({ name: '', icon: '📁', color: '#64748b' });
  }, [editing, form, list, onUpdate]);

  const handleDelete = useCallback((cat) => {
    const updated = list.filter(c => c.id !== cat.id);
    setList(updated);
    onUpdate?.(updated);
  }, [list, onUpdate]);

  const startEdit = useCallback((cat) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, color: cat.color });
    setShowCreate(false);
  }, []);

  const startCreate = useCallback(() => {
    setEditing(null);
    setForm({ name: '', icon: '📁', color: '#64748b' });
    setShowCreate(true);
  }, []);

  const cancelForm = useCallback(() => {
    setEditing(null);
    setShowCreate(false);
    setForm({ name: '', icon: '📁', color: '#64748b' });
  }, []);

  return (
    <div className="tpl-cat-panel">
      <div className="tpl-cat-header">
        <h4>Categories</h4>
        <button className="btn btn-sm btn-primary" onClick={startCreate}>
          + Add
        </button>
      </div>

      {(showCreate || editing) && (
        <div className="tpl-cat-form">
          <label className="label">{editing ? 'Edit Category' : 'New Category'}</label>
          <input
            type="text"
            className="input"
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            autoFocus
          />

          <label className="label" style={{ marginTop: 12 }}>Icon</label>
          <div className="tpl-cat-icons">
            {ICON_OPTIONS.map(icon => (
              <button
                key={icon}
                className={`tpl-cat-icon-btn ${form.icon === icon ? 'active' : ''}`}
                onClick={() => setForm(f => ({ ...f, icon }))}
              >
                {icon}
              </button>
            ))}
          </div>

          <label className="label" style={{ marginTop: 12 }}>Color</label>
          <div className="tpl-cat-colors">
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                className={`tpl-cat-color-btn ${form.color === color ? 'active' : ''}`}
                style={{ background: color }}
                onClick={() => setForm(f => ({ ...f, color }))}
              />
            ))}
          </div>

          <div className="tpl-cat-form-actions">
            <button className="btn btn-sm btn-secondary" onClick={cancelForm}>Cancel</button>
            <button
              className="btn btn-sm btn-primary"
              onClick={editing ? handleUpdate : handleCreate}
              disabled={!form.name.trim()}
            >
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="tpl-cat-list">
        {list.map(cat => (
          <div
            key={cat.id}
            className="tpl-cat-item"
            style={{ borderLeftColor: cat.color }}
          >
            <div className="tpl-cat-item-info">
              <span className="tpl-cat-item-icon" style={{ background: `${cat.color}20` }}>
                {cat.icon}
              </span>
              <div className="tpl-cat-item-text">
                <span className="tpl-cat-item-name">{cat.name}</span>
                <span className="tpl-cat-item-count">{counts[cat.id] || 0} templates</span>
              </div>
            </div>
            <div className="tpl-cat-item-actions">
              <button className="tpl-cat-action-btn" onClick={() => startEdit(cat)} title="Edit">
                ✏️
              </button>
              <button
                className="tpl-cat-action-btn tpl-cat-action-danger"
                onClick={() => handleDelete(cat)}
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
