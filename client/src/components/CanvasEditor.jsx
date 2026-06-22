import { useState, useRef, useCallback, useEffect } from 'react';

const GRID_SIZES = [0, 10, 20, 40, 80];

function ElementRenderer({ element, isSelected, onSelect, onDragStart }) {
  const style = buildElementStyle(element);

  return (
    <div
      className={`canvas-element ${isSelected ? 'canvas-element-selected' : ''}`}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.position.width,
        height: element.position.height,
        zIndex: element.position.zIndex ?? 0,
        cursor: 'move',
        ...style
      }}
      onMouseDown={e => {
        e.stopPropagation();
        onSelect(element.id);
        if (!element.locked) onDragStart(e, element);
      }}
    >
      {element.type === 'text' || element.type === 'score' || element.type === 'ticker' ? (
        <span style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}>
          {element.content || 'Text'}
        </span>
      ) : element.type === 'image' ? (
        (element.src || element.content) ? (
          <img src={element.src || element.content} alt="" style={{ width: '100%', height: '100%', objectFit: element.style?.objectFit || 'cover', borderRadius: 'inherit', pointerEvents: 'none' }} draggable={false} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-600)', borderRadius: 'inherit', fontSize: 12, color: 'var(--text-500)' }}>No Image</div>
        )
      ) : element.type === 'shape' ? (
        <div style={{ width: '100%', height: '100%' }} />
      ) : element.type === 'timer' ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>00:00</span>
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 12, color: 'var(--text-500)' }}>{element.type}</span>
      )}
      {isSelected && (
        <>
          <div className="resize-handle resize-nw" />
          <div className="resize-handle resize-ne" />
          <div className="resize-handle resize-sw" />
          <div className="resize-handle resize-se" />
        </>
      )}
    </div>
  );
}

function buildElementStyle(el) {
  const s = el.style || {};
  const css = {
    backgroundColor: s.backgroundColor || 'transparent',
    opacity: s.opacity ?? 1,
    overflow: 'hidden'
  };

  if (s.borderColor && s.borderWidth) {
    css.border = `${s.borderWidth}px solid ${s.borderColor}`;
  }
  if (s.borderRadius) css.borderRadius = s.borderRadius;
  if (s.rotation) css.transform = `rotate(${s.rotation}deg)`;

  const shadow = [];
  if (s.shadowX || s.shadowY || s.shadowBlur) {
    shadow.push(`${s.shadowX || 0}px ${s.shadowY || 0}px ${s.shadowBlur || 0}px ${s.shadowColor || 'rgba(0,0,0,0.5)'}`);
  }
  if (s.glowSize) {
    shadow.push(`0 0 ${s.glowSize}px ${s.glowColor || '#f7c948'}`);
  }
  if (shadow.length) css.boxShadow = shadow.join(', ');

  if (el.type === 'text' || el.type === 'score' || el.type === 'ticker') {
    css.fontFamily = s.fontFamily || 'Outfit, sans-serif';
    css.fontSize = s.fontSize || 24;
    css.fontWeight = s.fontWeight || '400';
    css.color = s.color || '#ffffff';
    css.textAlign = s.textAlign || 'left';
    css.textTransform = s.textTransform || 'none';
    css.letterSpacing = s.letterSpacing ?? 0;
    css.lineHeight = s.lineHeight ?? 1.2;
  }

  return css;
}

export default function CanvasEditor({
  elements = [],
  selectedIds = [],
  canvasWidth = 1920,
  canvasHeight = 1080,
  canvasBackground = 'transparent',
  onSelect,
  onMultiSelect,
  onUpdate,
  onAddElement,
  onDelete,
  className = ''
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [isPanning, setIsPanning] = useState(false);
  const [dragInfo, setDragInfo] = useState(null);
  const panStart = useRef(null);

  const handleCanvasClick = useCallback(e => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
      onSelect?.(null);
    }
  }, [onSelect]);

  const handleDragStart = useCallback((e, element) => {
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = element.position.x;
    const origY = element.position.y;

    const handleMove = ev => {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      let nx = origX + dx;
      let ny = origY + dy;
      if (gridSize > 0) {
        nx = Math.round(nx / gridSize) * gridSize;
        ny = Math.round(ny / gridSize) * gridSize;
      }
      onUpdate(element.id, { position: { ...element.position, x: nx, y: ny } });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [zoom, gridSize, onUpdate]);

  const handleKeyDown = useCallback(e => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedIds.length > 0) {
        selectedIds.forEach(id => onDelete?.(id));
      }
    }
    if (e.key === 'Escape') onSelect?.(null);
    if (e.key === 'g') setShowGrid(v => !v);
  }, [selectedIds, onDelete, onSelect]);

  useEffect(() => {
    const el = canvasRef.current;
    if (el) el.focus();
  }, []);

  const handleWheel = useCallback(e => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.1, Math.min(3, z + delta)));
    }
  }, []);

  return (
    <div className={`canvas-editor ${className}`}>
      {/* Toolbar */}
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-group">
          <button className="canvas-tool-btn" title="Select (V)" onClick={() => onSelect?.(null)}>▹</button>
          <button className="canvas-tool-btn" title="Add Text (T)" onClick={() => onAddElement?.({ type: 'text', content: 'New Text' })}>T</button>
          <button className="canvas-tool-btn" title="Add Shape (R)" onClick={() => onAddElement?.({ type: 'shape' })}>◻</button>
          <button className="canvas-tool-btn" title="Add Image (I)" onClick={() => onAddElement?.({ type: 'image' })}>🖼</button>
        </div>

        <div className="canvas-toolbar-divider" />

        <div className="canvas-toolbar-group">
          <button className="canvas-tool-btn" title="Zoom Out (-)" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}>-</button>
          <span className="canvas-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="canvas-tool-btn" title="Zoom In (+)" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>+</button>
          <button className="canvas-tool-btn" title="Fit" onClick={() => setZoom(0.5)}>⊡</button>
        </div>

        <div className="canvas-toolbar-divider" />

        <div className="canvas-toolbar-group">
          <button
            className={`canvas-tool-btn ${showGrid ? 'active' : ''}`}
            title="Toggle Grid (G)"
            onClick={() => setShowGrid(v => !v)}
          >⊞</button>
          <select
            className="select"
            value={gridSize}
            onChange={e => setGridSize(Number(e.target.value))}
            style={{ width: 70, padding: '4px 6px', fontSize: '0.75rem' }}
          >
            {GRID_SIZES.map(s => <option key={s} value={s}>{s === 0 ? 'Off' : s + 'px'}</option>)}
          </select>
        </div>

        <div className="canvas-toolbar-divider" />

        <div className="canvas-toolbar-group">
          <span style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>
            {canvasWidth} × {canvasHeight}
          </span>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="canvas-viewport" onWheel={handleWheel}>
        <div
          className="canvas-scroll"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0'
          }}
        >
          <div
            ref={canvasRef}
            className="canvas-surface"
            style={{
              width: canvasWidth,
              height: canvasHeight,
              background: canvasBackground === 'transparent'
                ? 'repeating-conic-gradient(var(--bg-600) 0% 25%, var(--bg-700) 0% 50%) 50% / 20px 20px'
                : canvasBackground
            }}
            tabIndex={0}
            onClick={handleCanvasClick}
            onKeyDown={handleKeyDown}
          >
            {/* Grid overlay */}
            {showGrid && gridSize > 0 && (
              <svg className="canvas-grid" width={canvasWidth} height={canvasHeight} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {Array.from({ length: Math.floor(canvasWidth / gridSize) + 1 }, (_, i) => (
                  <line key={`v${i}`} x1={i * gridSize} y1={0} x2={i * gridSize} y2={canvasHeight} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                ))}
                {Array.from({ length: Math.floor(canvasHeight / gridSize) + 1 }, (_, i) => (
                  <line key={`h${i}`} x1={0} y1={i * gridSize} x2={canvasWidth} y2={i * gridSize} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                ))}
              </svg>
            )}

            {/* Elements */}
            {elements.map(el => (
              <ElementRenderer
                key={el.id}
                element={el}
                isSelected={selectedIds.includes(el.id)}
                onSelect={id => {
                  if (selectedIds.length > 1 && selectedIds.includes(id)) {
                    onMultiSelect?.(selectedIds.filter(s => s !== id));
                  } else if (selectedIds.length > 0) {
                    onMultiSelect?.([...selectedIds, id]);
                  } else {
                    onSelect?.(id);
                  }
                }}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
