import { useState, useEffect, useCallback } from 'react';

const API = 'http://localhost:3001/api';

export default function AudioMixer() {
  const [channels, setChannels] = useState([]);
  const [masterVolume, setMasterVolume] = useState(75);
  const [levels, setLevels] = useState([]);
  const [error, setError] = useState(null);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch(`${API}/audio/channels`);
      if (res.ok) setChannels(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchMaster = useCallback(async () => {
    try {
      const res = await fetch(`${API}/audio/master`);
      if (res.ok) {
        const data = await res.json();
        setMasterVolume(data.volume);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchLevels = useCallback(async () => {
    try {
      const res = await fetch(`${API}/audio/levels`);
      if (res.ok) setLevels((await res.json()).levels || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchMaster();
    fetchLevels();
    const interval = setInterval(fetchLevels, 100);
    return () => clearInterval(interval);
  }, [fetchChannels, fetchMaster, fetchLevels]);

  const addChannel = async () => {
    setError(null);
    try {
      const res = await fetch(`${API}/audio/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `Channel ${channels.length + 1}` }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error);
        return;
      }
      fetchChannels();
    } catch { setError('Failed to add channel'); }
  };

  const removeChannel = async (id) => {
    try {
      await fetch(`${API}/audio/channels/${id}`, { method: 'DELETE' });
      fetchChannels();
    } catch { /* ignore */ }
  };

  const updateVolume = async (id, level) => {
    try {
      await fetch(`${API}/audio/channels/${id}/volume`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
      fetchChannels();
    } catch { /* ignore */ }
  };

  const toggleMute = async (id, currentMute) => {
    try {
      await fetch(`${API}/audio/channels/${id}/mute`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mute: !currentMute }),
      });
      fetchChannels();
    } catch { /* ignore */ }
  };

  const toggleSolo = async (id, currentSolo) => {
    try {
      await fetch(`${API}/audio/channels/${id}/solo`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ solo: !currentSolo }),
      });
      fetchChannels();
    } catch { /* ignore */ }
  };

  const updatePan = async (id, pan) => {
    try {
      await fetch(`${API}/audio/channels/${id}/pan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pan }),
      });
      fetchChannels();
    } catch { /* ignore */ }
  };

  const updateMaster = async (level) => {
    setMasterVolume(level);
    try {
      await fetch(`${API}/audio/master`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
    } catch { /* ignore */ }
  };

  return (
    <div className="audio-mixer">
      <div className="audio-mixer-header">
        <h3>Audio Mixer</h3>
        <button className="btn btn-sm btn-secondary" onClick={addChannel} disabled={channels.length >= 8}>
          + Add Channel
        </button>
      </div>

      <div className="audio-mixer-channels">
        {channels.map((ch, idx) => (
          <div key={ch.id} className={`channel-strip ${ch.mute ? 'muted' : ''} ${ch.solo ? 'soloed' : ''}`}>
            <div className="channel-header">
              <span className="channel-name">{ch.name}</span>
              <button className="channel-remove-btn" onClick={() => removeChannel(ch.id)} title="Remove">&times;</button>
            </div>

            <div className="level-meter">
              <div
                className="level-meter-fill"
                style={{ height: `${levels[idx] || 0}%` }}
              />
            </div>

            <div className="volume-slider-wrap">
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="100"
                value={ch.volume}
                onChange={(e) => updateVolume(ch.id, parseInt(e.target.value))}
              />
              <span className="volume-value">{ch.volume}</span>
            </div>

            <div className="channel-controls">
              <button
                className={`mute-btn ${ch.mute ? 'active' : ''}`}
                onClick={() => toggleMute(ch.id, ch.mute)}
              >
                M
              </button>
              <button
                className={`solo-btn ${ch.solo ? 'active' : ''}`}
                onClick={() => toggleSolo(ch.id, ch.solo)}
              >
                S
              </button>
            </div>

            <div className="pan-control">
              <label className="pan-label">Pan</label>
              <input
                type="range"
                className="pan-slider"
                min="-100"
                max="100"
                value={ch.pan}
                onChange={(e) => updatePan(ch.id, parseInt(e.target.value))}
              />
              <span className="pan-value">{ch.pan}</span>
            </div>
          </div>
        ))}

        {channels.length === 0 && (
          <div className="audio-mixer-empty">
            <p>No audio channels. Click "Add Channel" to start.</p>
          </div>
        )}
      </div>

      <div className="master-volume">
        <label className="label">Master Volume</label>
        <div className="master-volume-controls">
          <input
            type="range"
            className="volume-slider"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => updateMaster(parseInt(e.target.value))}
          />
          <span className="volume-value">{masterVolume}</span>
        </div>
      </div>

      {error && <div className="recording-error">{error}</div>}
    </div>
  );
}
