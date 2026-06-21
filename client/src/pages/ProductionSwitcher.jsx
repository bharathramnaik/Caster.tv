import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import MultiViewer from '../components/MultiViewer';
import TBar from '../components/TBar';
import MacroPanel from '../components/MacroPanel';

const SERVER_URL = import.meta.env.VITE_API_URL || '';

/**
 * ProductionSwitcher - Professional broadcast switcher UI.
 * Implements program/preview workflow with multi-view, transitions, and macros.
 */
export default function ProductionSwitcher() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Switcher state
  const [inputs, setInputs] = useState([]);
  const [programInput, setProgramInput] = useState(null);
  const [previewInput, setPreviewInput] = useState(null);
  const [transitionType, setTransitionType] = useState('cut');
  const [transitionDuration, setTransitionDuration] = useState(1000);
  const [tBarProgress, setTBarProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Macro state
  const [isRecording, setIsRecording] = useState(false);
  const [macros, setMacros] = useState([]);

  // Status
  const [fps] = useState(30);
  const [resolution] = useState('1920x1080');
  const [recordingTime, setRecordingTime] = useState('00:00:00');
  const [streamHealth] = useState('good');

  // Audio meters (simulated)
  const [audioLevels, setAudioLevels] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  // Fetch initial state
  useEffect(() => {
    fetch(`${SERVER_URL}/api/switcher`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setInputs(data.switcher?.inputs || []);
          setProgramInput(data.switcher?.programInput || null);
          setPreviewInput(data.switcher?.previewInput || null);
        }
      })
      .catch(() => {});

    fetch(`${SERVER_URL}/api/switcher/macros`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data)) setMacros(data); })
      .catch(() => {});
  }, []);

  // Socket connection
  useEffect(() => {
    const s = io(SERVER_URL || window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20
    });

    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    s.on('switcher:state', (data) => {
      if (data.type === 'switch' || data.type === 'cut') {
        setProgramInput(data.inputId);
      }
      if (data.type === 'preview') {
        setPreviewInput(data.inputId);
      }
    });

    s.on('switcher:tally', (data) => {
      if (data.program) setProgramInput(data.program);
      if (data.preview) setPreviewInput(data.preview);
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  // Simulated audio meter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioLevels(prev => prev.map(() =>
        Math.random() * 60 + 10
      ));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Recording time updater
  useEffect(() => {
    if (!isRecording) return;
    let seconds = 0;
    const interval = setInterval(() => {
      seconds++;
      const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      setRecordingTime(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleSelectInput = useCallback((inputId, isDirectCut) => {
    if (isDirectCut) {
      // Shift+click = direct program cut
      setProgramInput(inputId);
      socket?.emit('switcher:switch', { inputId, transition: 'cut' });
    } else {
      // Normal click = set preview
      setPreviewInput(inputId);
      socket?.emit('switcher:preview', { inputId });
    }
  }, [socket]);

  const handleCut = useCallback(() => {
    if (previewInput) {
      setProgramInput(previewInput);
      setTBarProgress(100);
      socket?.emit('switcher:switch', { inputId: previewInput, transition: 'cut' });
      setTimeout(() => setTBarProgress(0), 300);
    }
  }, [previewInput, socket]);

  const handleAutoTransition = useCallback(() => {
    if (previewInput && !isTransitioning) {
      setIsTransitioning(true);
      socket?.emit('switcher:transition', { type: transitionType, duration: transitionDuration });
      setTimeout(() => {
        setProgramInput(previewInput);
        setIsTransitioning(false);
        setTBarProgress(0);
      }, transitionDuration);
    }
  }, [previewInput, isTransitioning, transitionType, transitionDuration, socket]);

  const handleTBarChange = useCallback((val) => {
    setTBarProgress(val);
    if (val >= 100 && previewInput) {
      setProgramInput(previewInput);
      socket?.emit('switcher:switch', { inputId: previewInput, transition: 'cut' });
    }
  }, [previewInput, socket]);

  const handleStartRecord = useCallback(() => {
    setIsRecording(true);
    setRecordingTime('00:00:00');
    socket?.emit('switcher:macro-record', { recording: true });
  }, [socket]);

  const handleStopRecord = useCallback(() => {
    setIsRecording(false);
    socket?.emit('switcher:macro-record', { recording: false });
  }, [socket]);

  const handleSaveMacro = useCallback(async (name) => {
    try {
      const res = await fetch(`${SERVER_URL}/api/switcher/macros`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) setMacros(prev => [...prev, data]);
      }
    } catch {}
  }, []);

  const handlePlayMacro = useCallback(async (id) => {
    try {
      await fetch(`${SERVER_URL}/api/switcher/macros/${id}/play`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
    } catch {}
  }, []);

  const handleDeleteMacro = useCallback(async (id) => {
    try {
      await fetch(`${SERVER_URL}/api/switcher/macros/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      });
      setMacros(prev => prev.filter(m => m.id !== id));
    } catch {}
  }, []);

  const getProgramName = () => {
    const input = inputs.find(i => i.id === programInput);
    return input?.name || 'None';
  };

  const getPreviewName = () => {
    const input = inputs.find(i => i.id === previewInput);
    return input?.name || 'None';
  };

  const getMeterColor = (level) => {
    if (level > 80) return 'var(--red)';
    if (level > 60) return 'var(--accent)';
    return 'var(--green)';
  };

  return (
    <div className="switcher-layout">
      {/* Top Bar - PGM/PST Display */}
      <div className="pgm-pst-bar">
        <div className="pgm-pst-program">
          <span className="pgm-pst-label">PGM</span>
          <span className="pgm-pst-value">{getProgramName()}</span>
        </div>

        <div className="pgm-pst-center">
          <select
            className="pgm-pst-transition-select"
            value={transitionType}
            onChange={(e) => setTransitionType(e.target.value)}
          >
            <option value="cut">Cut</option>
            <option value="crossfade">Crossfade</option>
            <option value="slide-left">Slide Left</option>
            <option value="slide-right">Slide Right</option>
            <option value="slide-up">Slide Up</option>
            <option value="slide-down">Slide Down</option>
            <option value="wipe-left">Wipe Left</option>
            <option value="wipe-right">Wipe Right</option>
            <option value="zoom-in">Zoom In</option>
            <option value="zoom-out">Zoom Out</option>
            <option value="blur">Blur</option>
            <option value="flip">Flip</option>
            <option value="rotate">Rotate</option>
          </select>

          <div className="pgm-pst-duration">
            <label>Duration</label>
            <input
              type="range"
              min="0"
              max="5000"
              step="100"
              value={transitionDuration}
              onChange={(e) => setTransitionDuration(Number(e.target.value))}
              className="pgm-pst-duration-slider"
            />
            <span className="pgm-pst-duration-value">{(transitionDuration / 1000).toFixed(1)}s</span>
          </div>
        </div>

        <div className="pgm-pst-preview">
          <span className="pgm-pst-label">PST</span>
          <span className="pgm-pst-value">{getPreviewName()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="switcher-main">
        {/* Multi-View Grid */}
        <div className="switcher-multiview">
          <div className="switcher-section-header">Multi-View</div>
          <MultiViewer
            inputs={inputs}
            programInput={programInput}
            previewInput={previewInput}
            onSelectInput={handleSelectInput}
            layout="4x2"
          />
        </div>

        {/* Right Panel - Controls */}
        <div className="switcher-controls">
          {/* Transition Controls */}
          <div className="transition-controls">
            <div className="switcher-section-header">Transitions</div>

            <div className="transition-buttons">
              <button
                className="transition-btn transition-btn-cut"
                onClick={handleCut}
                disabled={!previewInput || isTransitioning}
              >
                CUT
              </button>
              <button
                className="transition-btn transition-btn-auto"
                onClick={handleAutoTransition}
                disabled={!previewInput || isTransitioning}
              >
                AUTO
              </button>
            </div>

            <div className="t-bar-wrapper">
              <TBar
                progress={tBarProgress}
                onChange={handleTBarChange}
                disabled={!previewInput}
                height={160}
              />
            </div>
          </div>

          {/* Audio Meters */}
          <div className="audio-meters">
            <div className="switcher-section-header">Audio</div>
            <div className="audio-meters-grid">
              {audioLevels.map((level, idx) => (
                <div key={idx} className="audio-meter">
                  <div className="audio-meter-bar">
                    <div
                      className="audio-meter-fill"
                      style={{
                        height: `${level}%`,
                        background: `linear-gradient(to top, var(--green), ${getMeterColor(level)})`
                      }}
                    />
                  </div>
                  <span className="audio-meter-label">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Macros */}
          <MacroPanel
            isRecording={isRecording}
            macros={macros}
            onStartRecord={handleStartRecord}
            onStopRecord={handleStopRecord}
            onSaveMacro={handleSaveMacro}
            onPlayMacro={handlePlayMacro}
            onDeleteMacro={handleDeleteMacro}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="switcher-status">
        <div className="switcher-status-item">
          <span className={`conn-dot ${connected ? 'on' : 'off'}`} />
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="switcher-status-item">
          <span className="switcher-status-label">FPS</span>
          <span className="switcher-status-value">{fps}</span>
        </div>
        <div className="switcher-status-item">
          <span className="switcher-status-label">Resolution</span>
          <span className="switcher-status-value">{resolution}</span>
        </div>
        {isRecording && (
          <div className="switcher-status-item switcher-status-recording">
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--red)', display: 'inline-block',
              animation: 'pulse 1s infinite'
            }} />
            <span className="switcher-status-value" style={{ color: 'var(--red)' }}>
              REC {recordingTime}
            </span>
          </div>
        )}
        <div className="switcher-status-item">
          <span className="switcher-status-label">Stream</span>
          <span className="switcher-status-value" style={{
            color: streamHealth === 'good' ? 'var(--green)' : 'var(--red)'
          }}>
            {streamHealth.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
