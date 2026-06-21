import { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_ICONS = {
  'lower-third': '📰',
  'full-screen': '🖥',
  'ticker': '📰',
  'scoreboard': '📊',
  'player-card': '🏏',
  'common': '📁',
  'cricket': '🏏',
  'football': '⚽',
  'basketball': '🏀',
  'tennis': '🎾'
};

const CATEGORY_COLORS = {
  'lower-third': '#3b82f6',
  'full-screen': '#8b5cf6',
  'ticker': '#06b6d4',
  'scoreboard': '#f97316',
  'player-card': '#22c55e',
  'common': '#64748b'
};

const SPORT_COLORS = {
  cricket: '#f7c948',
  football: '#22c55e',
  basketball: '#f97316',
  tennis: '#06b6d4',
  generic: '#94a3b8'
};

export default function TemplateCard({
  template,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
  onPreview,
  viewMode = 'grid'
}) {
  const [contextMenu, setContextMenu] = useState(null);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const rect = cardRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleAction = useCallback((action, e) => {
    e?.stopPropagation();
    setContextMenu(null);
    switch (action) {
      case 'edit':
        onEdit?.(template);
        break;
      case 'duplicate':
        onDuplicate?.(template);
        break;
      case 'delete':
        onDelete?.(template);
        break;
      case 'export':
        onExport?.(template);
        break;
      case 'preview':
        onPreview?.(template);
        break;
    }
  }, [template, onEdit, onDelete, onDuplicate, onExport, onPreview]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (viewMode === 'list') {
    return (
      <div
        ref={cardRef}
        className="tl-list-row card-static"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onContextMenu={handleContextMenu}
        style={{ position: 'relative' }}
      >
        <div className="tl-list-icon" style={{ background: CATEGORY_COLORS[template.category] || '#64748b' }}>
          {CATEGORY_ICONS[template.category] || '📄'}
        </div>
        <div className="tl-list-info">
          <span className="tl-list-name">{template.name}</span>
          <span className="tl-list-meta">
            {template.canvas?.width || 1920}x{template.canvas?.height || 1080}
            {template.elements?.length ? ` · ${template.elements.length} elements` : ''}
          </span>
        </div>
        <span className="chip" style={{
          background: `${CATEGORY_COLORS[template.category] || '#64748b'}20`,
          color: CATEGORY_COLORS[template.category] || '#64748b',
          fontSize: '0.65rem'
        }}>
          {template.category}
        </span>
        <span className="chip" style={{
          background: `${SPORT_COLORS[template.sport] || '#94a3b8'}20`,
          color: SPORT_COLORS[template.sport] || '#94a3b8',
          fontSize: '0.65rem'
        }}>
          {template.sport || 'generic'}
        </span>
        {template.createdAt && (
          <span className="tl-list-date">{formatDate(template.createdAt)}</span>
        )}
        <div className={`tl-list-actions ${hovered ? 'visible' : ''}`}>
          <button className="tl-action-btn" onClick={(e) => handleAction('preview', e)} title="Preview">👁</button>
          <Link to={`/editor/${template.id}`} className="tl-action-btn" title="Edit">✏️</Link>
          <button className="tl-action-btn" onClick={(e) => handleAction('duplicate', e)} title="Duplicate">📋</button>
          <button className="tl-action-btn" onClick={(e) => handleAction('export', e)} title="Export">📤</button>
          <button className="tl-action-btn tl-action-danger" onClick={(e) => handleAction('delete', e)} title="Delete">🗑</button>
        </div>
        {contextMenu && renderContextMenu(contextMenu, handleAction)}
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="tl-card card-static"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onContextMenu={handleContextMenu}
      style={{ position: 'relative' }}
    >
      <div className="tl-card-preview" onClick={() => handleAction('preview')}>
        <span style={{ fontSize: 40 }}>{CATEGORY_ICONS[template.category] || '📄'}</span>
        <span className="tl-card-elements">{template.elements?.length || 0} elements</span>
        {hovered && (
          <div className="tl-card-hover-overlay">
            <button className="tl-card-overlay-btn" onClick={(e) => { e.stopPropagation(); handleAction('preview'); }}>
              👁 Preview
            </button>
          </div>
        )}
      </div>
      <div className="tl-card-body">
        <h4 className="tl-card-name">{template.name}</h4>
        <div className="tl-card-meta">
          <span className="chip" style={{
            background: `${CATEGORY_COLORS[template.category] || '#64748b'}20`,
            color: CATEGORY_COLORS[template.category] || '#64748b',
            fontSize: '0.65rem'
          }}>
            {template.category}
          </span>
          <span className="chip" style={{
            background: `${SPORT_COLORS[template.sport] || '#94a3b8'}20`,
            color: SPORT_COLORS[template.sport] || '#94a3b8',
            fontSize: '0.65rem'
          }}>
            {template.sport || 'generic'}
          </span>
        </div>
        <div className="tl-card-bottom">
          <span className="tl-card-size">
            {template.canvas?.width || 1920} × {template.canvas?.height || 1080}
          </span>
          {template.createdAt && (
            <span className="tl-card-date">{formatDate(template.createdAt)}</span>
          )}
        </div>
      </div>
      <div className="tl-card-actions">
        <Link to={`/editor/${template.id}`} className="btn btn-sm btn-primary" style={{ flex: 1, textAlign: 'center', fontSize: '0.8rem' }}>
          Edit
        </Link>
        <button className="btn btn-sm btn-secondary" onClick={(e) => handleAction('duplicate', e)} title="Duplicate" style={{ padding: '6px 10px' }}>📋</button>
        <button className="btn btn-sm btn-secondary" onClick={(e) => handleAction('export', e)} title="Export" style={{ padding: '6px 10px' }}>📤</button>
        <button className="btn btn-sm btn-secondary" onClick={(e) => handleAction('delete', e)} title="Delete" style={{ padding: '6px 10px' }}>✕</button>
      </div>
      {contextMenu && renderContextMenu(contextMenu, handleAction)}
    </div>
  );
}

function renderContextMenu(menu, handleAction) {
  return (
    <div className="tl-context-menu" style={{ left: menu.x, top: menu.y }}>
      <button onClick={(e) => handleAction('preview', e)}>👁 Preview</button>
      <button onClick={(e) => handleAction('edit', e)}>✏️ Edit</button>
      <button onClick={(e) => handleAction('duplicate', e)}>📋 Duplicate</button>
      <button onClick={(e) => handleAction('export', e)}>📤 Export</button>
      <div className="tl-context-divider" />
      <button className="tl-context-danger" onClick={(e) => handleAction('delete', e)}>🗑 Delete</button>
    </div>
  );
}
