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
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    let v = t;
    if (easing === 'ease-in') v = t * t;
    else if (easing === 'ease-out') v = t * (2 - t);
    else if (easing === 'ease-in-out') v = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    else if (easing.includes('0.34')) v = t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    points.push(`${(t * 36).toFixed(1)},${(36 - v * 36).toFixed(1)}`);
  }

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="easing-preview">
      <rect x="0" y="0" width="40" height="40" fill="var(--bg-700)" rx="4" />
      <polyline points={points.join(' ')} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
    </svg>
  );
}

function KeyframeTrack({ track, duration, onAddKeyframe, onUpdateKeyframe, onDeleteKeyframe, selectedKeyframeId, onSelectKeyframe }) {
  const trackRef = useRef(null);

  const handleClick = useCallback(e => {
    if (e.target.closest('.timeline-keyframe')) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(duration, x * duration));
    onAddKeyframe(track.property, time);
  }, [track.property, duration, onAddKeyframe]);

  const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time);

  return (
    <div className="timeline-track">
      <div className="timeline-track-label" title={track.property}>
        <span className="timeline-track-name">{track.label || track.property}</span>
      </div>
      <div className="timeline-track-area" ref={trackRef} onClick={handleClick}>
        <svg width="100%" height="100%" className="timeline-track-svg">
          {sortedKeyframes.length > 1 && (
            <polyline
              points={sortedKeyframes.map(kf => `${(kf.time / duration) * 100}%,50%`).join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1.5"
              opacity="0.4"
            />
          )}
          {sortedKeyframes.map(kf => {
            const x = (kf.time / duration) * 100;
            return (
              <g key={kf.id}>
                <circle
                  cx={`${x}%`}
                  cy="50%"
                  r="5"
                  className={`timeline-keyframe ${selectedKeyframeId === kf.id ? 'selected' : ''}`}
                  onClick={e => { e.stopPropagation(); onSelectKeyframe(kf.id); }}
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function TimelinePanel({
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
      if (kf) setCopiedKeyframe({ ...kf, property: track.property });
    }
  }, [selectedKeyframeId, tracks]);

  const handlePasteKeyframe = useCallback(() => {
    if (copiedKeyframe && selectedElementId) {
      const newKf = {
        ...copiedKeyframe,
        id: `kf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        time: currentTime
      };
      onKeyframeAdd?.(selectedElementId, copiedKeyframe.property, newKf);
    }
  }, [copiedKeyframe, selectedElementId, currentTime, onKeyframeAdd]);

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'Delete' || e.key === 'Backspace') handleDeleteKeyframe();
      if (e.key === ' ') { e.preventDefault(); isPlaying ? onPause?.() : onPlay?.(); }
      if (e.key === 'ArrowLeft') onTimeChange?.(Math.max(0, currentTime - 0.1));
      if (e.key === 'ArrowRight') onTimeChange?.(Math.min(duration, currentTime + 0.1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDeleteKeyframe, isPlaying, onPlay, onPause, currentTime, duration, onTimeChange]);

  const selectedKf = selectedKeyframeId
    ? tracks.flatMap(t => t.keyframes).find(kf => kf.id === selectedKeyframeId)
    : null;

  return (
    <div className="animation-timeline">
      <div className="timeline-transport">
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(0)} title="Go to start (Home)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
          </svg>
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(Math.max(0, currentTime - 1))} title="Step back (-1s)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 19 2 12 11 5 11 19" /><polygon points="22 19 13 12 22 5 22 19" />
          </svg>
        </button>
        <button className={`btn btn-sm ${isPlaying ? 'btn-primary' : 'btn-secondary'}`} onClick={isPlaying ? onPause : onPlay} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(Math.min(duration, currentTime + 1))} title="Step forward (+1s)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 19 22 12 13 5 13 19" /><polygon points="2 19 11 12 2 5 2 19" />
          </svg>
        </button>
        <button className="btn btn-sm btn-secondary" onClick={() => onTimeChange?.(duration)} title="Go to end (End)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
        <span className="timeline-time">{currentTime.toFixed(1)}s / {duration}s</span>
      </div>

      <div className="timeline-ruler-wrap" ref={timelineRef} onClick={handleTimelineClick}>
        <div className="timeline-ruler">
          {Array.from({ length: Math.floor(duration) + 1 }, (_, i) => (
            <div key={i} className="timeline-ruler-mark" style={{ left: `${(i / duration) * 100}%` }}>
              <div className="timeline-ruler-tick" />
              <span className="timeline-ruler-label">{i}s</span>
            </div>
          ))}
        </div>
        <div className="timeline-playhead" style={{ left: `${(currentTime / duration) * 100}%` }}>
          <div className="timeline-playhead-handle" />
        </div>
      </div>

      <div className="timeline-tracks">
        {!selectedElement ? (
          <div className="timeline-empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 8 }}>
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <div>Select an element to view its animation tracks.</div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="timeline-empty">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 8 }}>
              <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            <div>No animation tracks yet. Click a track to add keyframes.</div>
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
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <EasingPreview easing={selectedKf.easing || 'linear'} />
              <select
                className="select"
                value={selectedKf.easing || 'linear'}
                onChange={e => {
                  const track = tracks.find(t => t.keyframes.some(kf => kf.id === selectedKeyframeId));
                  if (track) onKeyframeUpdate?.(selectedElementId, track.property, selectedKeyframeId, { easing: e.target.value });
                }}
                style={{ width: 120, fontSize: '0.75rem' }}
              >
                {EASING_OPTIONS.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <button className="btn btn-sm btn-secondary" onClick={handleCopyKeyframe} title="Copy Keyframe">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button className="btn btn-sm btn-secondary" onClick={handlePasteKeyframe} title="Paste Keyframe" disabled={!copiedKeyframe}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
            </button>
            <button className="btn btn-sm btn-danger" onClick={handleDeleteKeyframe} title="Delete Keyframe (Del)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
