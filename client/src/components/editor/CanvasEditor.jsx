import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

const GRID_SIZES = [0, 10, 20, 40, 80];

function buildElementStyle(el) {
  const s = el.style || {};
  const css = {
    backgroundColor: s.backgroundColor || 'transparent',
    opacity: s.opacity ?? 1,
    overflow: 'hidden'
  };
  if (s.borderColor && s.borderWidth) css.border = `${s.borderWidth}px solid ${s.borderColor}`;
  if (s.borderRadius) css.borderRadius = s.borderRadius;
  if (s.clipPath) css.clipPath = s.clipPath;
  if (s.rotation) css.transform = `rotate(${s.rotation}deg)`;

  const shadow = [];
  if (s.shadowX || s.shadowY || s.shadowBlur) shadow.push(`${s.shadowX || 0}px ${s.shadowY || 0}px ${s.shadowBlur || 0}px ${s.shadowColor || 'rgba(0,0,0,0.5)'}`);
  if (s.glowSize) shadow.push(`0 0 ${s.glowSize}px ${s.glowColor || '#f7c948'}`);
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

function ElementRenderer({ element, isSelected, onSelect, onMouseDown, onResizeStart, onRotateStart }) {
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
        cursor: element.locked ? 'default' : 'move',
        ...style
      }}
      onMouseDown={e => {
        e.stopPropagation();
        onSelect?.(element.id);
        if (!element.locked) onMouseDown?.(e, element);
      }}
    >
      {element.type === 'text' || element.type === 'score' || element.type === 'ticker' ? (
        <span style={{ display: 'block', width: '100%', height: '100%', overflow: 'hidden' }}>
          {element.content || 'Text'}
        </span>
      ) : element.type === 'image' ? (
        element.src ? (
          <img src={element.src} alt="" style={{ width: '100%', height: '100%', objectFit: element.style?.objectFit || 'cover', borderRadius: 'inherit' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-600)', borderRadius: 'inherit', fontSize: 12, color: 'var(--text-500)' }}>No Image</div>
        )
      ) : element.type === 'timer' ? (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>00:00</span>
      ) : element.type === 'shape' ? (
        <div style={{ width: '100%', height: '100%' }} />
      ) : (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 12, color: 'var(--text-500)' }}>{element.type}</span>
      )}
      {isSelected && !element.locked && (
        <>
          <div className="resize-handle resize-n" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'n'); }} />
          <div className="resize-handle resize-s" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 's'); }} />
          <div className="resize-handle resize-e" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'e'); }} />
          <div className="resize-handle resize-w" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'w'); }} />
          <div className="resize-handle resize-nw" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'nw'); }} />
          <div className="resize-handle resize-ne" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'ne'); }} />
          <div className="resize-handle resize-sw" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'sw'); }} />
          <div className="resize-handle resize-se" onMouseDown={e => { e.stopPropagation(); onResizeStart?.(e, element, 'se'); }} />
          <div className="rotate-handle" onMouseDown={e => { e.stopPropagation(); onRotateStart?.(e, element); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

function SmartGuides({ guides }) {
  if (!guides || guides.length === 0) return null;
  return (
    <div className="smart-guides" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
      {guides.map((g, i) => (
        <div key={i} className={`smart-guide smart-guide-${g.type}`} style={g.style} />
      ))}
    </div>
  );
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
  showRulers = true,
  showGrid = true,
  snapToGrid = true,
  className = ''
}) {
  const canvasRef = useRef(null);
  const viewportRef = useRef(null);
  const [zoom, setZoom] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [gridSize, setGridSize] = useState(20);
  const [localShowGrid, setLocalShowGrid] = useState(showGrid);
  const [localShowRulers, setLocalShowRulers] = useState(showRulers);
  const [localSnap, setLocalSnap] = useState(snapToGrid);
  const [isPanning, setIsPanning] = useState(false);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const [marquee, setMarquee] = useState(null);
  const [smartGuides, setSmartGuides] = useState([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorCanvasPos, setCursorCanvasPos] = useState({ x: 0, y: 0 });
  const panStart = useRef(null);
  const marqueeStart = useRef(null);

  const effectiveShowGrid = localShowGrid;
  const effectiveSnap = localSnap;

  const snapValue = useCallback((val) => {
    if (!effectiveSnap || gridSize <= 0) return val;
    return Math.round(val / gridSize) * gridSize;
  }, [effectiveSnap, gridSize]);

  const getSmartGuides = useCallback((movingId, x, y, w, h) => {
    const guides = [];
    const threshold = 5;
    const cx = x + w / 2, cy = y + h / 2;

    const canvasCx = canvasWidth / 2, canvasCy = canvasHeight / 2;
    if (Math.abs(cx - canvasCx) < threshold) guides.push({ type: 'vertical', style: { position: 'absolute', left: canvasCx, top: 0, width: 1, height: canvasHeight, background: 'var(--accent)', zIndex: 9999, pointerEvents: 'none' } });
    if (Math.abs(cy - canvasCy) < threshold) guides.push({ type: 'horizontal', style: { position: 'absolute', left: 0, top: canvasCy, width: canvasWidth, height: 1, background: 'var(--accent)', zIndex: 9999, pointerEvents: 'none' } });

    elements.forEach(el => {
      if (el.id === movingId) return;
      const ex = el.position.x, ey = el.position.y, ew = el.position.width, eh = el.position.height;
      const ecx = ex + ew / 2, ecy = ey + eh / 2;

      if (Math.abs(cx - ecx) < threshold) guides.push({ type: 'vertical', style: { position: 'absolute', left: ecx, top: Math.min(y, ey), width: 1, height: Math.max(y + h, ey + eh) - Math.min(y, ey), background: 'var(--accent)', opacity: 0.6, zIndex: 9999, pointerEvents: 'none' } });
      if (Math.abs(cy - ecy) < threshold) guides.push({ type: 'horizontal', style: { position: 'absolute', left: Math.min(x, ex), top: ecy, width: Math.max(x + w, ex + ew) - Math.min(x, ex), height: 1, background: 'var(--accent)', opacity: 0.6, zIndex: 9999, pointerEvents: 'none' } });

      if (Math.abs(x - ex) < threshold) guides.push({ type: 'vertical', style: { position: 'absolute', left: ex, top: 0, width: 1, height: canvasHeight, background: 'var(--cyan)', opacity: 0.4, zIndex: 9999, pointerEvents: 'none' } });
      if (Math.abs(y - ey) < threshold) guides.push({ type: 'horizontal', style: { position: 'absolute', left: 0, top: ey, width: canvasWidth, height: 1, background: 'var(--cyan)', opacity: 0.4, zIndex: 9999, pointerEvents: 'none' } });

      if (Math.abs(x + w - ex - ew) < threshold) guides.push({ type: 'vertical', style: { position: 'absolute', left: ex + ew, top: 0, width: 1, height: canvasHeight, background: 'var(--cyan)', opacity: 0.4, zIndex: 9999, pointerEvents: 'none' } });
      if (Math.abs(y + h - ey - eh) < threshold) guides.push({ type: 'horizontal', style: { position: 'absolute', left: 0, top: ey + eh, width: canvasWidth, height: 1, background: 'var(--cyan)', opacity: 0.4, zIndex: 9999, pointerEvents: 'none' } });
    });
    return guides;
  }, [elements, canvasWidth, canvasHeight]);

  const handleCanvasClick = useCallback(e => {
    if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg') || e.target.classList.contains('canvas-grid') || e.target.tagName === 'line') {
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
      nx = snapValue(nx);
      ny = snapValue(ny);

      const guides = getSmartGuides(element.id, nx, ny, element.position.width, element.position.height);
      setSmartGuides(guides);

      onUpdate(element.id, { position: { ...element.position, x: nx, y: ny } });
    };

    const handleUp = () => {
      setSmartGuides([]);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [zoom, snapValue, getSmartGuides, onUpdate]);

  const handleResizeStart = useCallback((e, element, direction) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const orig = { ...element.position };
    const aspectRatio = orig.width / orig.height;

    const handleMove = ev => {
      const dx = (ev.clientX - startX) / zoom;
      const dy = (ev.clientY - startY) / zoom;
      let { x, y, width, height } = orig;

      if (direction.includes('e')) width = Math.max(20, orig.width + dx);
      if (direction.includes('w')) { width = Math.max(20, orig.width - dx); x = orig.x + orig.width - width; }
      if (direction.includes('s')) height = Math.max(20, orig.height + dy);
      if (direction.includes('n')) { height = Math.max(20, orig.height - dy); y = orig.y + orig.height - height; }

      if (e.shiftKey) {
        if (direction === 'nw' || direction === 'ne' || direction === 'sw' || direction === 'se') {
          const maxD = Math.max(Math.abs(dx), Math.abs(dy));
          const signX = (direction === 'nw' || direction === 'sw') ? -1 : 1;
          const signY = (direction === 'nw' || direction === 'ne') ? -1 : 1;
          width = Math.max(20, orig.width + signX * maxD);
          height = width / aspectRatio;
          if (signX < 0) x = orig.x + orig.width - width;
          if (signY < 0) y = orig.y + orig.height - height;
        }
      }

      x = snapValue(x);
      y = snapValue(y);
      width = Math.max(20, snapValue(width));
      height = Math.max(20, snapValue(height));

      onUpdate(element.id, { position: { ...element.position, x, y, width, height } });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [zoom, snapValue, onUpdate]);

  const handleRotateStart = useCallback((e, element) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.left + element.position.x * zoom + (element.position.width * zoom) / 2;
    const cy = rect.top + element.position.y * zoom + (element.position.height * zoom) / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
    const startRotation = element.style?.rotation || 0;

    const handleMove = ev => {
      const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
      let rotation = startRotation + (angle - startAngle);
      if (e.shiftKey) rotation = Math.round(rotation / 15) * 15;
      onUpdate(element.id, { style: { ...element.style, rotation } });
    };

    const handleUp = () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [zoom, onUpdate]);

  const handleMarqueeStart = useCallback((e) => {
    if (isSpaceHeld) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    marqueeStart.current = { x, y };

    const handleMove = ev => {
      const mx = (ev.clientX - rect.left) / zoom;
      const my = (ev.clientY - rect.top) / zoom;
      const sx = marqueeStart.current.x;
      const sy = marqueeStart.current.y;
      setMarquee({
        x: Math.min(sx, mx),
        y: Math.min(sy, my),
        width: Math.abs(mx - sx),
        height: Math.abs(my - sy)
      });
    };

    const handleUp = () => {
      setMarquee(null);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [zoom, isSpaceHeld]);

  const handleKeyDown = useCallback(e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedIds.length > 0) selectedIds.forEach(id => onDelete?.(id));
    }
    if (e.key === 'Escape') {
      onSelect?.(null);
      setMarquee(null);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      onMultiSelect?.(elements.map(el => el.id));
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
      e.preventDefault();
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) {
          onAddElement?.({
            ...el,
            id: undefined,
            position: { ...el.position, x: el.position.x + 20, y: el.position.y + 20 }
          });
        }
      });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '=') { e.preventDefault(); setZoom(z => Math.min(3, z + 0.1)); }
    if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); setZoom(z => Math.max(0.1, z - 0.1)); }
    if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); setZoom(0.5); setPan({ x: 0, y: 0 }); }
    if ((e.ctrlKey || e.metaKey) && e.key === '1') { e.preventDefault(); setZoom(1); }
    if (e.key === 'g' && !e.ctrlKey && !e.metaKey) setLocalShowGrid(v => !v);
    if (e.key === 'r' && !e.ctrlKey && !e.metaKey) setLocalShowRulers(v => !v);
    if (e.key === ';') setLocalSnap(v => !v);
    if (e.key === ' ') { e.preventDefault(); setIsSpaceHeld(true); }
    if (e.key === '?') { /* handled by parent */ }

    const nudge = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowLeft' && selectedIds.length) {
      e.preventDefault();
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) onUpdate(id, { position: { ...el.position, x: el.position.x - nudge } });
      });
    }
    if (e.key === 'ArrowRight' && selectedIds.length) {
      e.preventDefault();
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) onUpdate(id, { position: { ...el.position, x: el.position.x + nudge } });
      });
    }
    if (e.key === 'ArrowUp' && selectedIds.length) {
      e.preventDefault();
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) onUpdate(id, { position: { ...el.position, y: el.position.y - nudge } });
      });
    }
    if (e.key === 'ArrowDown' && selectedIds.length) {
      e.preventDefault();
      selectedIds.forEach(id => {
        const el = elements.find(e => e.id === id);
        if (el) onUpdate(id, { position: { ...el.position, y: el.position.y + nudge } });
      });
    }
  }, [selectedIds, elements, onDelete, onSelect, onMultiSelect, onAddElement, onUpdate]);

  const handleKeyUp = useCallback((e) => {
    if (e.key === ' ') setIsSpaceHeld(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

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

  const handleViewportMouseDown = useCallback((e) => {
    if (isSpaceHeld || e.button === 1) {
      e.preventDefault();
      panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      setIsPanning(true);

      const handleMove = ev => {
        setPan({ x: ev.clientX - panStart.current.x, y: ev.clientY - panStart.current.y });
      };
      const handleUp = () => {
        setIsPanning(false);
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
      };
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
    }
  }, [isSpaceHeld, pan]);

  const handleViewportMouseMove = useCallback((e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = Math.round((e.clientX - rect.left) / zoom);
    const cy = Math.round((e.clientY - rect.top) / zoom);
    setCursorPos({ x: e.clientX, y: e.clientY });
    setCursorCanvasPos({ x: Math.max(0, Math.min(canvasWidth, cx)), y: Math.max(0, Math.min(canvasHeight, cy)) });
  }, [zoom, canvasWidth, canvasHeight]);

  const rulerMarks = useMemo(() => {
    const step = gridSize > 0 ? gridSize : 100;
    const h = [], v = [];
    for (let x = 0; x <= canvasWidth; x += step) h.push(x);
    for (let y = 0; y <= canvasHeight; y += step) v.push(y);
    return { h, v };
  }, [canvasWidth, canvasHeight, gridSize]);

  return (
    <div className={`canvas-editor ${className}`}>
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-group">
          <button className="canvas-tool-btn" title="Select (V)" onClick={() => onSelect?.(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
            </svg>
          </button>
          <button className="canvas-tool-btn" title="Add Text (T)" onClick={() => onAddElement?.({ type: 'text', content: 'New Text', style: { fontFamily: 'Outfit', fontSize: 24, fontWeight: '400', color: '#ffffff', backgroundColor: 'transparent', borderRadius: 0 } })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
            </svg>
          </button>
          <button className="canvas-tool-btn" title="Add Shape (R)" onClick={() => onAddElement?.({ type: 'shape', style: { backgroundColor: 'rgba(247,201,72,0.3)', borderRadius: 8 } })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
          </button>
          <button className="canvas-tool-btn" title="Add Image (I)" onClick={() => onAddElement?.({ type: 'image', style: { objectFit: 'cover', borderRadius: 0 } })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
        </div>

        <div className="canvas-toolbar-divider" />

        <div className="canvas-toolbar-group">
          <button className="canvas-tool-btn" title="Zoom Out (-)" onClick={() => setZoom(z => Math.max(0.1, z - 0.1))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <span className="canvas-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="canvas-tool-btn" title="Zoom In (+)" onClick={() => setZoom(z => Math.min(3, z + 0.1))}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <button className="canvas-tool-btn" title="Fit to Screen (Ctrl+0)" onClick={() => { setZoom(0.5); setPan({ x: 0, y: 0 }); }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
          <button className="canvas-tool-btn" title="Actual Size (Ctrl+1)" onClick={() => setZoom(1)}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>1:1</span>
          </button>
        </div>

        <div className="canvas-toolbar-divider" />

        <div className="canvas-toolbar-group">
          <button
            className={`canvas-tool-btn ${localShowGrid ? 'active' : ''}`}
            title="Toggle Grid (G)"
            onClick={() => setLocalShowGrid(v => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" />
            </svg>
          </button>
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
          <button
            className={`canvas-tool-btn ${localShowRulers ? 'active' : ''}`}
            title="Toggle Rulers (R)"
            onClick={() => setLocalShowRulers(v => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
              <path d="m14.5 12.5 2-2" /><path d="m11.5 9.5 2-2" /><path d="m8.5 6.5 2-2" />
              <path d="m17.5 15.5 2-2" />
            </svg>
          </button>
          <button
            className={`canvas-tool-btn ${localSnap ? 'active' : ''}`}
            title="Toggle Snap (;)"
            onClick={() => setLocalSnap(v => !v)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" /><path d="M20 12h4" /><path d="M12 4v-0" /><path d="M12 20v4" /><path d="M4 12H0" /><path d="m6.3 6.3-2.1-2.1" /><path d="m17.7 6.3 2.1-2.1" /><path d="m17.7 17.7 2.1 2.1" /><path d="m6.3 17.7-2.1 2.1" />
            </svg>
          </button>
        </div>

        <div className="canvas-toolbar-divider" />

        <div className="canvas-toolbar-group">
          <span className="canvas-coord-display">
            {cursorCanvasPos.x}, {cursorCanvasPos.y}
          </span>
        </div>

        <div className="canvas-toolbar-group" style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-500)' }}>
            {canvasWidth} × {canvasHeight}
          </span>
        </div>
      </div>

      <div
        className={`canvas-viewport ${isPanning ? 'panning' : ''} ${isSpaceHeld ? 'space-held' : ''}`}
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleViewportMouseDown}
        onMouseMove={handleViewportMouseMove}
      >
        {localShowRulers && (
          <>
            <div className="canvas-ruler canvas-ruler-h">
              <div className="canvas-ruler-inner" style={{ width: canvasWidth * zoom }}>
                {rulerMarks.h.map(x => (
                  <div key={x} className="canvas-ruler-mark" style={{ left: x * zoom }}>
                    <div className="canvas-ruler-tick" />
                    <span className="canvas-ruler-label">{x}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="canvas-ruler canvas-ruler-v">
              <div className="canvas-ruler-inner" style={{ height: canvasHeight * zoom }}>
                {rulerMarks.v.map(y => (
                  <div key={y} className="canvas-ruler-mark canvas-ruler-mark-v" style={{ top: y * zoom }}>
                    <div className="canvas-ruler-tick" />
                    <span className="canvas-ruler-label">{y}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="canvas-ruler canvas-ruler-corner" />
          </>
        )}

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
            onMouseDown={e => {
              if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg')) {
                handleMarqueeStart(e);
              }
            }}
          >
            {effectiveShowGrid && gridSize > 0 && (
              <svg className="canvas-grid" width={canvasWidth} height={canvasHeight} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {Array.from({ length: Math.floor(canvasWidth / gridSize) + 1 }, (_, i) => (
                  <line key={`v${i}`} x1={i * gridSize} y1={0} x2={i * gridSize} y2={canvasHeight} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                ))}
                {Array.from({ length: Math.floor(canvasHeight / gridSize) + 1 }, (_, i) => (
                  <line key={`h${i}`} x1={0} y1={i * gridSize} x2={canvasWidth} y2={i * gridSize} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5} />
                ))}
              </svg>
            )}

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
                onMouseDown={handleDragStart}
                onResizeStart={handleResizeStart}
                onRotateStart={handleRotateStart}
              />
            ))}

            {marquee && (
              <div
                className="canvas-marquee"
                style={{
                  position: 'absolute',
                  left: marquee.x,
                  top: marquee.y,
                  width: marquee.width,
                  height: marquee.height,
                  border: '1px dashed var(--accent)',
                  background: 'rgba(247,201,72,0.05)',
                  pointerEvents: 'none'
                }}
              />
            )}

            <SmartGuides guides={smartGuides} />
          </div>
        </div>
      </div>
    </div>
  );
}
