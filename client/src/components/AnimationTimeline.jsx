import { useState, useRef, useCallback, useEffect } from 'react';

const EASING_OPTIONS = [
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'ease-in' },
  { label: 'Ease Out', value: 'ease-out' },
  { label: 'Ease In-Out', value: 'ease-in-out' },
  { label: 'Bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  { label: 'Elastic', value: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)' },
  { label: 'Smooth', value: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { label: 'Step', value: 'steps(20, end)' }
];

function EasingPreview({ easing }) {
  const points = [];
  const steps = 50;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let v = t;
    if (easing === 'ease-in') v = t * t;
    else if (easing === 'ease-out') v = t * (2 - t);
    else if (easing === 'ease-in-out') v = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    else if (easing.includes('0.34')) v = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    points.push(`${(t * 40).toFixed(1)},${(40 - v * 40).toFixed(1)}`);
  }

  return (
    <svg width="44" height="44" viewBox="0 0 44 44" className="easing-preview">
      <rect x="0" y="0" width="44" height="44" fill="var(--bg-700)" rx="4" />
      <polyline points={points.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

function KeyframeTrack({ track, duration, onAddKeyframe, onUpdateKeyframe, onDeleteKeyframe, selectedKeyframeId, onSelectKeyframe }) {
  const trackRef = useRef(null);

  const handleClick = useCallback(e => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, x * duration));
    onAddKeyframe(track.property, time);
  }, [track.property, duration, onAddKeyframe]);

  return (
    <div className="timeline-track">
      <div className="timeline-track-label">{track.label}</div>
      <div className="timeline-track-area" ref={trackRef} onClick={handleClick}>
        <svg width="100%" height="100%" className="timeline-track-svg">
          {track.keyframes.map(kf => {
            const x = (kf.time / duration) * 100;
            return (
              <g key={kf.id}>
                <circle
                  cx={`${x}%`}
                  cy="50%"
                  r="6"
                  className={`timeline-keyframe ${selectedKeyframeId === kf.id ? 'selected' : ''}`}
                  onClick={e => { e.stopPropagation(); onSelectKeyframe(kf.id); }}
                />
                {kf.easing && kf.easing !== 'linear' && (
                  <line x1={`${x}%`} y1="20%" x2={`${x + 5}%`} y2="80%" stroke="var(--accent)" strokeWidth="1" opacity="0.4" />
                )}
              </g>
            );
          })}
          {/* Connection lines */}
          {track.keyframes.length > 1 && (
            <polyline
              points={track.keyframes
                .sort((a, b) => a.time - b.time)
                .map(kf => `${(kf.time / duration) * 100}%,50%`)
                .join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              opacity="0.6"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

export default function AnimationTimeline({
  elements = [],
  selectedElementId = null,
  duration = 5,
  currentTime = 0,
  onTimeChange,
  onKeyframeAdd,
  onKeyframeUpdate,
  onKeyframeDelete,
  onPlay,
  onPause,
  isPlaying = false
}) {
  const [selectedKeyframeId, setSelectedKeyframeId] = useState(null);
  const [copiedKeyframe, setCopiedKeyframe] = useState(null);
  const timelineRef = useRef(null);
  const animFrame = useRef(null);

  const selectedElement = elements.find(e => e.id === selectedElementId);
  const tracks = selectedElement?.animation?.tracks || [];

  const handleTimelineClick = useCallback(e => {
    if (e.target === timelineRef.current || e.target.classList.contains('timeline-ruler')) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      onTimeChange?.(Math.max(0, Math.min(duration, x * duration)));
    }
  }, [duration, onTimeChange]);

  const handleAddKeyframe = useCallback((property, time) => {
    const existing = tracks.find(t => t.property === property)?.keyframes.find(kf => Math.abs(kf.time - time) < 0.05);
    if (existing) {
      setSelectedKeyframeId(existing.id);
      return;
    }
    const kf = {
      id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      time,
      value: 0,
      easing: 'ease-out'
    };
    onKeyframeAdd?.(selectedElementId, property, kf);
  }, [selectedElementId, tracks, onKeyframeAdd]);

  const handleDeleteKeyframe = useCallback(() => {
    if (selectedKeyframeId && selectedElementId) {
      const track = tracks.find(t => t.keyframes.some(kf => kf.id === selectedKeyframeId));
      if (track) {
        onKeyframeDelete?.(selectedElementId, track.property, selectedKeyframeId);
        setSelectedKeyframeId(null);
      }
    }
  }, [selectedKeyframeId, selectedElementId, tracks, onKeyframeDelete]);

  const handleCopyKeyframe = useCallback(() => {
    if (selectedKeyframeId) {
      const track = tracks.find(t => t.keyframes.some(kf => kf.id === selectedKeyframeId));
      const kf = track?.keyframes.find(k => k.id === selectedKeyframeId);
      if (kf) setCopiedKeyframe({ ...kf });
    }
  }, [selectedKeyframeId, tracks]);

  const handlePasteKeyframe = useCallback(() => {
    if (copiedKeyframe && selectedElementId) {
      const newKf = {
        ...copiedKeyframe,
        id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        time: currentTime
      };
      onKeyframeAdd?.(selectedElementId, copiedKeyframe.property || 'opacity', newKf);
    }
  }, [copiedKeyframe, selectedElementId, currentTime, onKeyframeAdd]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'Delete' || e.key === 'Backspace') handleDeleteKeyframe();
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') handleCopyKeyframe();
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') handlePasteKeyframe();
      if (e.key === ' ') { e.preventDefault(); isPlaying ? onPause?.() : onPlay?.(); }
      if (e.key === 'ArrowLeft') onTimeChange?.(Math.max(0, currentTime - 0.1));
      if (e.key === 'ArrowRight') onTimeChange?.(Math.min(duration, currentTime + 0.1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteKeyframe, handleCopyKeyframe, handlePasteKeyframe, isPlaying, onPlay, onPause, currentTime, duration, onTimeChange]);

  const selectedKf = selectedKeyframeId
    ? tracks.flatMap(t => t.keyframes).find(kf => kf.id === selectedKeyframeId)
    : null;

  return (
    <div className="animation-timeline">
      {/* Transport Controls */}
      <div className="timeline-transport">
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(0)} title="Go to start">⏮</button>
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(Math.max(0, currentTime - 1))} title="Step back">◀</button>
        <button className={`btn btn-sm ${isPlaying ? 'btn-primary' : 'btn-secondary'}`} onClick={isPlaying ? onPause : onPlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(Math.min(duration, currentTime + 1))} title="Step forward">▶</button>
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(duration)} title="Go to end">⏭</button>
        <span className="timeline-time">{currentTime.toFixed(1)}s / {duration}s</span>
      </div>

      {/* Timeline Ruler */}
      <div className="timeline-ruler-wrap" ref={timelineRef} onClick={handleTimelineClick}>
        <div className="timeline-ruler">
          {Array.from({ length: Math.floor(duration) + 1 }, (_, i) => (
            <div key={i} className="timeline-ruler-mark" style={{ left: `${(i / duration) * 100}%` }}>
              <div className="timeline-ruler-tick" />
              <span className="timeline-ruler-label">{i}s</span>
            </div>
          ))}
        </div>
        <div className="timeline-playhead" style={{ left: `${(currentTime / duration) * 100}%` }} />
      </div>

      {/* Tracks */}
      <div className="timeline-tracks">
        {!selectedElement ? (
          <div className="timeline-empty">Select an element to view its animation tracks.</div>
        ) : tracks.length === 0 ? (
          <div className="timeline-empty">
            No animation tracks. Select an element and add keyframes.
          </div>
        ) : (
          tracks.map(track => (
            <KeyframeTrack
              key={track.property}
              track={track}
              duration={duration}
              onAddKeyframe={handleAddKeyframe}
              onUpdateKeyframe={(kfId, updates) => onKeyframeUpdate?.(selectedElementId, track.property, kfId, updates)}
              onDeleteKeyframe={kfId => onKeyframeDelete?.(selectedElementId, track.property, kfId)}
              selectedKeyframeId={selectedKeyframeId}
              onSelectKeyframe={setSelectedKeyframeId}
            />
          ))
        )}
      </div>

      {/* Keyframe Editor */}
      {selectedKf && (
        <div className="timeline-kf-editor">
          <div className="timeline-kf-field">
            <label className="prop-label">Time</label>
            <input
              type="number"
              className="input"
              value={selectedKf.time}
              min={0}
              max={duration}
              step={0.1}
              onChange={e => {
                const track = tracks.find(t => t.keyframes.some(kf => kf.id === selectedKeyframeId));
                if (track) onKeyframeUpdate?.(selectedElementId, track.property, selectedKeyframeId, { time: parseFloat(e.target.value) || 0 });
              }}
              style={{ width: 70 }}
            />
          </div>
          <div className="timeline-kf-field">
            <label className="prop-label">Value</label>
            <input
              type="number"
              className="input"
              value={selectedKf.value}
              onChange={e => {
                const track = tracks.find(t => t.keyframes.some(kf => kf.id === selectedKeyframeId));
                if (track) onKeyframeUpdate?.(selectedElementId, track.property, selectedKeyframeId, { value: parseFloat(e.target.value) || 0 });
              }}
              style={{ width: 70 }}
            />
          </div>
          <div className="timeline-kf-field">
            <label className="prop-label">Easing</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {EASING_OPTIONS.slice(0, 4).map(e => (
                <button
                  key={e.value}
                  className={`btn btn-sm ${selectedKf.easing === e.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    const track = tracks.find(t => t.keyframes.some(kf => kf.id === selectedKeyframeId));
                    if (track) onKeyframeUpdate?.(selectedElementId, track.property, selectedKeyframeId, { easing: e.value });
                  }}
                  style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                >{e.label}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <button className="btn btn-sm btn-secondary" onClick={handleCopyKeyframe} title="Copy (Ctrl+C)">📋</button>
            <button className="btn btn-sm btn-secondary" onClick={handlePasteKeyframe} title="Paste (Ctrl+V)">📄</button>
            <button className="btn btn-sm btn-danger" onClick={handleDeleteKeyframe} title="Delete">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
