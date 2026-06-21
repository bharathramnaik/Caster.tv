import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const COLOR_PRESETS = [
  { name: 'Royal Blue & Gold',  primary: '#1a237e', secondary: '#ffd700' },
  { name: 'Crimson Red',        primary: '#b71c1c', secondary: '#ffd700' },
  { name: 'Mumbai Blue',        primary: '#004ba0', secondary: '#d4af37' },
  { name: 'Purple Storm',       primary: '#4a148c', secondary: '#e040fb' },
  { name: 'Orange Fire',        primary: '#e65100', secondary: '#ffab40' },
  { name: 'Forest Green',       primary: '#1b5e20', secondary: '#69f0ae' },
  { name: 'Sky Blue',           primary: '#0277bd', secondary: '#ffffff' },
  { name: 'Hot Pink',           primary: '#880e4f', secondary: '#f48fb1' },
  { name: 'Teal',               primary: '#00695c', secondary: '#80cbc4' },
  { name: 'Charcoal',           primary: '#263238', secondary: '#78909c' },
];

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', short: '', primaryColor: '#1a237e', secondaryColor: '#ffd700' });

  useEffect(() => {
    fetch(`${API}/api/teams`).then(r => r.json()).then(setTeams).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const res = await fetch(`${API}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const team = await res.json();
    setTeams(prev => [...prev, team]);
    setForm({ name: '', short: '', primaryColor: '#1a237e', secondaryColor: '#ffd700' });
    setShowForm(false);
  };

  const deleteTeam = async (teamId) => {
    if (!confirm('Delete this team?')) return;
    await fetch(`${API}/api/teams/${teamId}`, { method: 'DELETE' });
    setTeams(prev => prev.filter(t => t.teamId !== teamId));
  };

  return (
    <div className="page container" style={{ maxWidth: 860, margin: '0 auto', paddingTop: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-500)' }}>← Home</Link>
          <h1 style={{ marginTop: 8 }}><span className="gradient-text">Teams</span></h1>
          <p style={{ color: 'var(--text-400)', fontSize: '0.9rem', marginTop: 4 }}>
            Register teams with theme colors for dynamic scoreboards
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Register Team'}
        </button>
      </div>

      {/* ── Add Team Form ─────────────── */}
      {showForm && (
        <form onSubmit={handleSubmit} className="card card-static anim-slide" style={{ cursor: 'default', marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="label">Team Name *</label>
              <input className="input" placeholder="e.g. Chennai Super Kings" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required autoFocus />
            </div>
            <div className="field">
              <label className="label">Short Name (3-4 chars)</label>
              <input className="input" placeholder="e.g. CSK" maxLength={4} value={form.short}
                onChange={e => setForm(f => ({ ...f, short: e.target.value.toUpperCase() }))} />
            </div>
          </div>

          {/* Color presets */}
          <div className="field">
            <label className="label">Color Preset</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {COLOR_PRESETS.map(p => (
                <button key={p.name} type="button"
                  title={p.name}
                  onClick={() => setForm(f => ({ ...f, primaryColor: p.primary, secondaryColor: p.secondary }))}
                  style={{
                    width: 38, height: 38,
                    border: form.primaryColor === p.primary && form.secondaryColor === p.secondary
                      ? '3px solid #fff' : '2px solid var(--glass-border)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    background: `linear-gradient(135deg, ${p.primary}, ${p.secondary})`
                  }} />
              ))}
            </div>
          </div>

          {/* Color pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="field">
              <label className="label">Primary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.primaryColor}
                  onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
                  style={{ width: 48, height: 40, border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: 0 }} />
                <input className="input" value={form.primaryColor}
                  onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
            </div>
            <div className="field">
              <label className="label">Secondary Color</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.secondaryColor}
                  onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))}
                  style={{ width: 48, height: 40, border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: 0 }} />
                <input className="input" value={form.secondaryColor}
                  onChange={e => setForm(f => ({ ...f, secondaryColor: e.target.value }))} style={{ fontFamily: 'var(--font-mono)' }} />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="field">
            <label className="label">Scorebug Preview</label>
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              <div style={{
                padding: '3px 14px', background: 'linear-gradient(90deg, #f7c948, #e5b800)',
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#0a0a0a',
                fontFamily: 'var(--font-display)', letterSpacing: '0.05em'
              }}>
                TOURNAMENT NAME
              </div>
              <div style={{
                display: 'flex', alignItems: 'center',
                background: `linear-gradient(135deg, ${form.primaryColor}f0, ${form.primaryColor}c0)`,
                minHeight: 44
              }}>
                <div style={{
                  padding: '0 14px', alignSelf: 'stretch', display: 'flex', alignItems: 'center',
                  background: form.primaryColor, borderRight: `3px solid ${form.secondaryColor}`,
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#fff'
                }}>
                  {form.short || (form.name || 'TEM').substring(0, 3).toUpperCase()}
                </div>
                <span style={{ padding: '0 10px', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.6rem', color: '#fff' }}>
                  145/4
                </span>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)' }}>(16.3)</span>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>CRR 8.79</span>
              </div>
              <div style={{
                padding: '4px 14px', background: 'rgba(8,12,24,0.88)',
                borderTop: `1px solid ${form.secondaryColor}30`,
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-display)'
              }}>
                R. Kumar 48*(32) &nbsp;&nbsp;&nbsp; A. Singh 12(9)
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={!form.name.trim()}>
            Register Team
          </button>
        </form>
      )}

      {/* ── Teams Grid ────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
        {teams.map(t => (
          <div key={t.teamId} className="card" style={{
            cursor: 'default', position: 'relative',
            borderLeft: `4px solid ${t.primaryColor || '#1a237e'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-sm)', flexShrink: 0,
                background: `linear-gradient(135deg, ${t.primaryColor || '#1a237e'}, ${t.secondaryColor || '#ffd700'})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', color: '#fff'
              }}>
                {t.short}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-100)', fontSize: '1rem' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>{t.short}</div>
              </div>
            </div>
            <button onClick={() => deleteTeam(t.teamId)} title="Delete team"
              style={{
                position: 'absolute', top: 10, right: 10,
                background: 'none', border: 'none', color: 'var(--text-500)',
                cursor: 'pointer', fontSize: '0.85rem', padding: 4
              }}>✕</button>
          </div>
        ))}
        {teams.length === 0 && !showForm && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--text-500)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏏</div>
            No teams registered yet. Click <strong>"Register Team"</strong> to get started.
          </div>
        )}
      </div>
    </div>
  );
}
