import { useState, useRef, useCallback } from 'react';

const ELEMENT_GROUPS = [
  {
    label: 'Text',
    items: [
      { type: 'text', icon: 'T', label: 'Text', content: 'New Text', shortcut: 'T' },
      { type: 'text', icon: 'H', label: 'Heading', content: 'Heading', shortcut: '', style: { fontSize: 48, fontWeight: '700' } },
      { type: 'text', icon: 'P', label: 'Paragraph', content: 'Paragraph text', shortcut: '', style: { fontSize: 16 } },
    ]
  },
  {
    label: 'Shapes',
    items: [
      { type: 'shape', icon: '◻', label: 'Rectangle', shape: 'rectangle', shortcut: 'R' },
      { type: 'shape', icon: '◯', label: 'Circle', shape: 'circle', shortcut: 'C' },
      { type: 'shape', icon: '△', label: 'Triangle', shape: 'triangle', shortcut: '' },
      { type: 'shape', icon: '▬', label: 'Line', shape: 'line', shortcut: 'L' },
    ]
  },
  {
    label: 'Media',
    items: [
      { type: 'image', icon: '🖼', label: 'Image', shortcut: 'I' },
    ]
  },
  {
    label: 'Widgets',
    items: [
      { type: 'score', icon: '#', label: 'Score', content: '0', shortcut: '' },
      { type: 'timer', icon: '⏱', label: 'Timer', content: '00:00', shortcut: '' },
      { type: 'ticker', icon: '📰', label: 'Ticker', content: 'TICKER TEXT', shortcut: '' },
    ]
  }
];

function ToolbarButton({ item, onAdd }) {
  const [hovering, setHovering] = useState(false);

  return (
    <button
      className="etoolbar-btn"
      title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
      onClick={() => onAdd(item)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <span className="etoolbar-btn-icon">{item.icon}</span>
      {hovering && <span className="etoolbar-btn-label">{item.label}</span>}
    </button>
  );
}

export default function ElementToolbar({ onAddElement }) {
  const [expandedGroup, setExpandedGroup] = useState(null);

  const handleAdd = useCallback((item) => {
    const opts = {
      type: item.type,
      content: item.content || '',
      shape: item.shape,
      style: item.style || {}
    };

    if (item.type === 'text') {
      opts.content = opts.content || 'New Text';
      opts.style = {
        fontFamily: 'Outfit',
        fontSize: opts.style.fontSize || 24,
        fontWeight: opts.style.fontWeight || '400',
        color: '#ffffff',
        backgroundColor: 'transparent',
        borderRadius: 0,
        ...opts.style
      };
    } else if (item.type === 'shape') {
      const shapeStyles = {
        rectangle: { borderRadius: 8 },
        circle: { borderRadius: '50%' },
        triangle: { borderRadius: 0, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' },
        line: { height: 4, borderRadius: 2 }
      };
      opts.style = {
        backgroundColor: 'rgba(247,201,72,0.3)',
        borderColor: 'rgba(247,201,72,0.6)',
        borderWidth: 1,
        opacity: 1,
        ...(shapeStyles[item.shape] || {}),
        ...opts.style
      };
    } else if (item.type === 'image') {
      opts.src = '';
      opts.style = { objectFit: 'cover', borderRadius: 0 };
    } else if (item.type === 'score') {
      opts.style = {
        fontFamily: 'Teko',
        fontSize: 48,
        fontWeight: '800',
        color: '#ffffff',
        backgroundColor: 'rgba(192,57,43,0.9)',
        borderRadius: 4,
        textAlign: 'center'
      };
    } else if (item.type === 'timer') {
      opts.style = {
        fontFamily: 'Teko',
        fontSize: 36,
        fontWeight: '700',
        color: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 4,
        textAlign: 'center'
      };
    } else if (item.type === 'ticker') {
      opts.position = { x: 0, y: 0, width: 1920, height: 50, zIndex: 100 };
      opts.style = {
        fontFamily: 'Teko',
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
        backgroundColor: 'rgba(227,178,60,0.9)',
        borderRadius: 0,
        textAlign: 'center',
        letterSpacing: 0.08
      };
    }

    onAddElement(opts);
  }, [onAddElement]);

  return (
    <div className="element-toolbar">
      <div className="etoolbar-header">
        <span className="etoolbar-title">Elements</span>
      </div>
      <div className="etoolbar-groups">
        {ELEMENT_GROUPS.map(group => (
          <div key={group.label} className="etoolbar-group">
            <button
              className="etoolbar-group-header"
              onClick={() => setExpandedGroup(expandedGroup === group.label ? null : group.label)}
            >
              <span>{group.label}</span>
              <span className={`etoolbar-chevron ${expandedGroup === group.label ? 'open' : ''}`}>▾</span>
            </button>
            {expandedGroup === group.label && (
              <div className="etoolbar-group-items">
                {group.items.map((item, i) => (
                  <ToolbarButton key={i} item={item} onAdd={handleAdd} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="etoolbar-quick">
        {ELEMENT_GROUPS.flatMap(g => g.items.filter(i => i.shortcut)).map(item => (
          <button
            key={item.type + item.label}
            className="etoolbar-quick-btn"
            title={`${item.label} (${item.shortcut})`}
            onClick={() => handleAdd(item)}
          >
            <span className="etoolbar-quick-icon">{item.icon}</span>
            <span className="etoolbar-quick-key">{item.shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
