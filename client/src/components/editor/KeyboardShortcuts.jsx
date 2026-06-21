import { useState, useCallback } from 'react';

const SHORTCUT_GROUPS = [
  {
    title: 'Selection',
    shortcuts: [
      { keys: 'Ctrl+A', action: 'Select all elements' },
      { keys: 'Escape', action: 'Deselect all / Cancel' },
      { keys: 'Delete / Backspace', action: 'Delete selected element(s)' },
      { keys: 'Shift+Click', action: 'Add to selection' },
      { keys: 'Drag (empty area)', action: 'Marquee selection' },
    ]
  },
  {
    title: 'Transform',
    shortcuts: [
      { keys: 'Ctrl+C', action: 'Copy selected element(s)' },
      { keys: 'Ctrl+V', action: 'Paste' },
      { keys: 'Ctrl+X', action: 'Cut selected element(s)' },
      { keys: 'Ctrl+D', action: 'Duplicate selected element(s)' },
      { keys: 'Arrow keys', action: 'Nudge selected element by 1px' },
      { keys: 'Shift+Arrow', action: 'Nudge selected element by 10px' },
    ]
  },
  {
    title: 'Canvas',
    shortcuts: [
      { keys: 'Ctrl++', action: 'Zoom in' },
      { keys: 'Ctrl+-', action: 'Zoom out' },
      { keys: 'Ctrl+0', action: 'Fit canvas to screen' },
      { keys: 'Ctrl+1', action: 'Zoom to 100%' },
      { keys: 'Space+Drag', action: 'Pan canvas' },
      { keys: 'Middle Mouse Drag', action: 'Pan canvas' },
      { keys: 'Scroll Wheel', action: 'Zoom (with Ctrl)' },
    ]
  },
  {
    title: 'History',
    shortcuts: [
      { keys: 'Ctrl+Z', action: 'Undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', action: 'Redo' },
    ]
  },
  {
    title: 'View',
    shortcuts: [
      { keys: 'Ctrl+G', action: 'Toggle grid visibility' },
      { keys: 'Ctrl+R', action: 'Toggle rulers' },
      { keys: 'Ctrl+;', action: 'Toggle snap to grid' },
    ]
  },
  {
    title: 'Tools',
    shortcuts: [
      { keys: 'V', action: 'Select tool' },
      { keys: 'T', action: 'Text tool' },
      { keys: 'R', action: 'Rectangle tool' },
      { keys: 'C', action: 'Circle tool' },
      { keys: 'I', action: 'Image tool' },
      { keys: 'L', action: 'Line tool' },
      { keys: 'H', action: 'Hand/Pan tool' },
    ]
  }
];

export default function KeyboardShortcuts({ isOpen, onClose }) {
  const [search, setSearch] = useState('');

  const filtered = SHORTCUT_GROUPS.map(group => ({
    ...group,
    shortcuts: group.shortcuts.filter(s =>
      !search || s.action.toLowerCase().includes(search.toLowerCase()) ||
      s.keys.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(g => g.shortcuts.length > 0);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose?.();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="shortcuts-overlay" onClick={handleBackdropClick}>
      <div className="shortcuts-modal">
        <div className="shortcuts-header">
          <h3>Keyboard Shortcuts</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="shortcuts-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input"
            placeholder="Search shortcuts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <div className="shortcuts-body">
          {filtered.map(group => (
            <div key={group.title} className="shortcuts-group">
              <h4 className="shortcuts-group-title">{group.title}</h4>
              <div className="shortcuts-list">
                {group.shortcuts.map((s, i) => (
                  <div key={i} className="shortcuts-row">
                    <span className="shortcuts-keys">
                      {s.keys.split(' / ').map((k, j) => (
                        <span key={j}>
                          {j > 0 && <span className="shortcuts-or">/</span>}
                          <kbd className="shortcuts-key">{k}</kbd>
                        </span>
                      ))}
                    </span>
                    <span className="shortcuts-action">{s.action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          Press <kbd>?</kbd> to toggle this panel
        </div>
      </div>
    </div>
  );
}
