import { useState, useCallback, useRef } from 'react';

const ELEMENT_ICONS = {
  text: 'T',
  shape: '◻',
  image: '🖼',
  score: '#',
  timer: '⏱',
  ticker: '📰'
};

function LayerItem({ element, isSelected, isLocked, isVisible, onSelect, onToggleVisibility, onToggleLock, onRename, onReorder, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(element.content || element.type);
  const inputRef = useRef(null);

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
    setName(element.content || element.type);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [element]);

  const handleRenameSubmit = useCallback(() => {
    setEditing(false);
    if (name.trim()) onRename?.(element.id, name.trim());
  }, [name, element.id, onRename]);

  const handleDragStart = useCallback((e) => {
    e.dataTransfer.setData('text/plain', element.id);
    e.dataTransfer.effectAllowed = 'move';
  }, [element.id]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== element.id) {
      onReorder?.(draggedId, element.id);
    }
  }, [element.id, onReorder]);

  return (
    <div
      className={`layer-item ${isSelected ? 'active' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelect?.(element.id)}
    >
      <button
        className="layer-vis-btn"
        title={isVisible ? 'Hide' : 'Show'}
        onClick={(e) => { e.stopPropagation(); onToggleVisibility?.(element.id); }}
      >
        {isVisible ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        )}
      </button>

      <span className="layer-icon" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-500)' }}>
        {ELEMENT_ICONS[element.type] || '?'}
      </span>

      {editing ? (
        <input
          ref={inputRef}
          type="text"
          className="layer-name-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={handleRenameSubmit}
          onKeyDown={e => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setEditing(false); }}
          onClick={e => e.stopPropagation()}
        />
      ) : (
        <span className="layer-name" onDoubleClick={handleDoubleClick}>
          {element.content || element.type}
        </span>
      )}

      {element.style?.opacity !== undefined && element.style.opacity !== 1 && (
        <span className="layer-opacity">{Math.round(element.style.opacity * 100)}%</span>
      )}

      <button
        className="layer-lock-btn"
        title={isLocked ? 'Unlock' : 'Lock'}
        onClick={(e) => { e.stopPropagation(); onToggleLock?.(element.id); }}
      >
        {isLocked ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        )}
      </button>

      <button
        className="layer-remove-btn"
        title="Remove"
        onClick={(e) => { e.stopPropagation(); onRemove?.(element.id); }}
      >
        ×
      </button>
    </div>
  );
}

export default function LayerPanel({
  elements = [],
  selectedIds = [],
  onSelect,
  onUpdateElement,
  onDelete,
  onReorder
}) {
  const [sortBy, setSortBy] = useState('z-index');

  const sorted = [...elements].sort((a, b) => {
    if (sortBy === 'z-index') return (b.position?.zIndex ?? 0) - (a.position?.zIndex ?? 0);
    if (sortBy === 'name') return (a.content || a.type).localeCompare(b.content || b.type);
    return 0;
  });

  const handleToggleVisibility = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    onUpdateElement?.(id, { style: { ...el.style, opacity: el.style?.opacity === 0 ? 1 : 0 } });
  }, [elements, onUpdateElement]);

  const handleToggleLock = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    onUpdateElement?.(id, { locked: !el.locked });
  }, [elements, onUpdateElement]);

  const handleRename = useCallback((id, name) => {
    onUpdateElement?.(id, { content: name });
  }, [onUpdateElement]);

  const handleMoveUp = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    onUpdateElement?.(id, { position: { ...el.position, zIndex: (el.position?.zIndex ?? 0) + 1 } });
  }, [elements, onUpdateElement]);

  const handleMoveDown = useCallback((id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    onUpdateElement?.(id, { position: { ...el.position, zIndex: Math.max(0, (el.position?.zIndex ?? 0) - 1) } });
  }, [elements, onUpdateElement]);

  return (
    <div className="layer-panel">
      <div className="layer-panel-header">
        <span className="layer-panel-title">Layers</span>
        <div className="layer-panel-actions">
          <select
            className="layer-sort-select"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="z-index">By Z-Index</option>
            <option value="name">By Name</option>
          </select>
        </div>
      </div>
      <div className="layer-panel-list">
        {sorted.length === 0 ? (
          <div className="layer-panel-empty">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
            <span>No elements yet</span>
          </div>
        ) : (
          sorted.map(el => (
            <LayerItem
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              isLocked={el.locked}
              isVisible={el.style?.opacity !== 0}
              onSelect={onSelect}
              onToggleVisibility={handleToggleVisibility}
              onToggleLock={handleToggleLock}
              onRename={handleRename}
              onReorder={onReorder}
              onRemove={onDelete}
            />
          ))
        )}
      </div>
      <div className="layer-panel-footer">
        <button className="canvas-tool-btn" title="Move Up" onClick={() => selectedIds[0] && handleMoveUp(selectedIds[0])} disabled={!selectedIds.length}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
        <button className="canvas-tool-btn" title="Move Down" onClick={() => selectedIds[0] && handleMoveDown(selectedIds[0])} disabled={!selectedIds.length}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <span className="layer-panel-count">{elements.length} element{elements.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}
