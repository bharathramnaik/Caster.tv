import { useState, useEffect, useCallback, useRef } from 'react';

const API = 'http://localhost:3001/api';

export default function AudioVisualizer() {
  const [view, setView] = useState('spectrum');
  const [spectrum, setSpectrum] = useState({ bands: [] });
  const [waveform, setWaveform] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(0);
  const animRef = useRef(null);
  const canvasRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      if (view === 'spectrum') {
        const res = await fetch(`${API}/audio/visualizer?channel=${selectedChannel}&type=spectrum`);
        if (res.ok) setSpectrum(await res.json());
      } else {
        const res = await fetch(`${API}/audio/visualizer?channel=${selectedChannel}&type=waveform`);
        if (res.ok) setWaveform((await res.json()).waveform || []);
      }
    } catch { /* ignore */ }
  }, [view, selectedChannel]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 33);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      if (view === 'spectrum') {
        const bands = spectrum.bands || [];
        const barWidth = (W / Math.max(bands.length, 1)) - 2;
        bands.forEach((val, i) => {
          const barH = (val / 100) * H;
          const x = i * (barWidth + 2);
          const ratio = val / 100;
          const r = Math.round(34 + ratio * 200);
          const g = Math.round(197 - ratio * 100);
          const b = Math.round(94 - ratio * 50);
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(x, H - barH, barWidth, barH);
        });
      } else {
        const samples = waveform;
        if (samples.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = '#f7c948';
          ctx.lineWidth = 2;
          const step = W / (samples.length - 1);
          samples.forEach((val, i) => {
            const x = i * step;
            const y = H / 2 - (val / 100) * (H / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [view, spectrum, waveform]);

  return (
    <div className="audio-visualizer">
      <div className="audio-visualizer-header">
        <h3>Audio Visualizer</h3>
        <div className="visualizer-controls">
          <button
            className={`btn btn-sm ${view === 'spectrum' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('spectrum')}
          >
            Spectrum
          </button>
          <button
            className={`btn btn-sm ${view === 'waveform' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('waveform')}
          >
            Waveform
          </button>
        </div>
      </div>

      <div className="visualizer-channel-select">
        <label className="label">Channel</label>
        <select
          className="select"
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(parseInt(e.target.value))}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <option key={i} value={i}>Channel {i + 1}</option>
          ))}
        </select>
      </div>

      <div className="visualizer-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={640}
          height={200}
          className="visualizer-canvas"
        />
      </div>

      {view === 'spectrum' && spectrum.bands && (
        <div className="spectrum-info">
          <span>Low: {spectrum.low || 0}</span>
          <span>Mid: {spectrum.mid || 0}</span>
          <span>High: {spectrum.high || 0}</span>
        </div>
      )}
    </div>
  );
}
