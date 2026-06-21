import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * TBar - Vertical slider for manual transition control.
 * @param {Object} props
 * @param {number} props.progress - Current progress 0-100
 * @param {Function} props.onChange - Callback with new progress value
 * @param {boolean} [props.disabled=false]
 * @param {number} [props.height=200]
 */
export default function TBar({ progress = 0, onChange, disabled = false, height = 200 }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [snapIndicator, setSnapIndicator] = useState(null);

  const calculateProgress = useCallback((clientY) => {
    if (!trackRef.current) return progress;
    const rect = trackRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const pct = 100 - (y / rect.height) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [progress]);

  const snapToNearest = useCallback((val) => {
    if (val < 5) return 0;
    if (val > 95) return 100;
    return val;
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    const newProgress = snapToNearest(calculateProgress(e.clientY));
    onChange?.(newProgress);
    setSnapIndicator(newProgress === 0 || newProgress === 100 ? newProgress : null);
  }, [disabled, calculateProgress, onChange, snapToNearest]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newProgress = snapToNearest(calculateProgress(e.clientY));
      onChange?.(newProgress);
      setSnapIndicator(newProgress === 0 || newProgress === 100 ? newProgress : null);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setSnapIndicator(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, calculateProgress, onChange, snapToNearest]);

  const handleTrackClick = useCallback((e) => {
    if (disabled) return;
    const newProgress = snapToNearest(calculateProgress(e.clientY));
    onChange?.(newProgress);
  }, [disabled, calculateProgress, onChange, snapToNearest]);

  const handleDoubleClick = useCallback(() => {
    if (disabled) return;
    // Snap to nearest endpoint
    onChange?.(progress < 50 ? 0 : 100);
  }, [disabled, progress, onChange]);

  const thumbTop = `${100 - progress}%`;

  return (
    <div className="t-bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
      <span style={{
        fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)',
        textTransform: 'uppercase', letterSpacing: '0.1em'
      }}>
        100
      </span>

      <div
        ref={trackRef}
        className="t-bar-track"
        onClick={handleTrackClick}
        onDoubleClick={handleDoubleClick}
        style={{
          position: 'relative',
          width: '32px',
          height: `${height}px`,
          background: 'var(--bg-800)',
          borderRadius: '4px',
          border: '1px solid var(--glass-border)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          overflow: 'visible'
        }}
      >
        {/* Progress fill */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${progress}%`,
          background: `linear-gradient(to top, var(--accent), var(--accent-hover))`,
          borderRadius: '0 0 3px 3px',
          transition: isDragging ? 'none' : 'height 0.1s ease'
        }} />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map(tick => (
          <div key={tick} style={{
            position: 'absolute',
            bottom: `${tick}%`,
            left: '-4px',
            right: '-4px',
            height: '1px',
            background: 'var(--glass-border)',
            pointerEvents: 'none'
          }} />
        ))}

        {/* Thumb */}
        <div
          onMouseDown={handleMouseDown}
          style={{
            position: 'absolute',
            top: thumbTop,
            left: '-6px',
            right: '-6px',
            height: '14px',
            marginTop: '-7px',
            background: 'var(--bg-600)',
            border: '2px solid var(--accent)',
            borderRadius: '3px',
            cursor: disabled ? 'not-allowed' : 'grab',
            zIndex: 2,
            transition: isDragging ? 'none' : 'top 0.1s ease',
            boxShadow: isDragging ? '0 0 8px var(--accent)' : 'var(--shadow-sm)'
          }}
        >
          {/* Grip lines */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px'
          }}>
            <div style={{ width: '10px', height: '1px', background: 'var(--text-500)' }} />
            <div style={{ width: '10px', height: '1px', background: 'var(--text-500)' }} />
            <div style={{ width: '10px', height: '1px', background: 'var(--text-500)' }} />
          </div>
        </div>

        {/* Snap indicator */}
        {snapIndicator !== null && (
          <div style={{
            position: 'absolute',
            [snapIndicator === 0 ? 'bottom' : 'top']: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 6px',
            background: 'var(--accent)',
            color: '#000',
            borderRadius: '3px',
            fontSize: '0.55rem',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            {snapIndicator === 0 ? '0%' : '100%'}
          </div>
        )}
      </div>

      <span style={{
        fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-400)',
        textTransform: 'uppercase', letterSpacing: '0.1em'
      }}>
        0
      </span>

      <span style={{
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        color: 'var(--accent)',
        fontWeight: 600
      }}>
        {Math.round(progress)}%
      </span>
    </div>
  );
}
