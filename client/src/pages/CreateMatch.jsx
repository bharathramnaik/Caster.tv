import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

const MATCH_TYPES = [
  { value: 'T10', label: 'T10', overs: 10 },
  { value: 'T20', label: 'T20', overs: 20 },
  { value: 'ODI', label: 'ODI', overs: 50 },
  { value: 'Custom', label: 'Custom', overs: null }
];

export default function CreateMatch() {
  const navigate = useNavigate();
  const [registeredTeams, setRegisteredTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tournamentName: '',
    teamA: '', teamAShort: '', teamAColors: { primary: '#1a237e', secondary: '#ffd700' },
    teamB: '', teamBShort: '', teamBColors: { primary: '#b71c1c', secondary: '#ffffff' },
    matchType: 'T20',
    maxOvers: 20,
    venue: '',
    tossWinner: '',
    tossDecision: 'bat'
  });

  useEffect(() => {
    fetch(`${API}/api/teams`).then(r => r.json()).then(setRegisteredTeams).catch(() => {});
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const selectTeam = (side, team) => {
    if (side === 'A') {
      setForm(f => ({
        ...f,
        teamA: team.name,
        teamAShort: team.short,
        teamAColors: { primary: team.primaryColor, secondary: team.secondaryColor }
      }));
    } else {
      setForm(f => ({
        ...f,
        teamB: team.name,
        teamBShort: team.short,
        teamBColors: { primary: team.primaryColor, secondary: team.secondaryColor }
      }));
    }
  };

  const handleTypeChange = (type) => {
    const mt = MATCH_TYPES.find(m => m.value === type);
    set('matchType', type);
    if (mt?.overs) set('maxOvers', mt.overs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.teamA.trim() || !form.teamB.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/matches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const match = await res.json();
      navigate(`/control/${match.matchId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const teamChips = (side) => {
    const selected = side === 'A' ? form.teamA : form.teamB;
    if (registeredTeams.length === 0) return null;
    return (
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {registeredTeams.map(t => (
          <button key={t.teamId} type="button"
            onClick={() => selectTeam(side, t)}
            className={`btn btn-sm ${selected === t.name ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <span style={{
              width: 12, height: 12, borderRadius: 3, display: 'inline-block',
              background: t.primaryColor, marginRight: 6, flexShrink: 0
            }} />
            {t.short || t.name.substring(0, 3).toUpperCase()}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="anim-slide" style={{ width: '100%', maxWidth: 560 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-500)' }}>← Back to Home</Link>
          <h1 style={{ fontSize: '2.2rem', marginTop: 12 }}>
            <span className="gradient-text">Create Match</span>
          </h1>
          {registeredTeams.length === 0 && (
            <p style={{ color: 'var(--text-500)', fontSize: '0.85rem', marginTop: 8 }}>
              💡 <Link to="/teams">Register teams</Link> first for auto-filled colors
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card card-static" style={{ cursor: 'default' }}>
          {/* Tournament */}
          <div className="field">
            <label className="label">Tournament Name</label>
            <input className="input" placeholder="e.g. Local Premier League"
              value={form.tournamentName} onChange={e => set('tournamentName', e.target.value)} />
          </div>

          {/* Team A */}
          <div className="field">
            <label className="label">Team A *</label>
            {teamChips('A')}
            <input className="input" placeholder="Team name" value={form.teamA}
              onChange={e => set('teamA', e.target.value)} required />
            {form.teamA && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: `linear-gradient(135deg, ${form.teamAColors.primary}, ${form.teamAColors.secondary})`,
                  display: 'inline-block', flexShrink: 0
                }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>
                  {form.teamAShort || form.teamA.substring(0, 3).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Team B */}
          <div className="field">
            <label className="label">Team B *</label>
            {teamChips('B')}
            <input className="input" placeholder="Team name" value={form.teamB}
              onChange={e => set('teamB', e.target.value)} required />
            {form.teamB && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: `linear-gradient(135deg, ${form.teamBColors.primary}, ${form.teamBColors.secondary})`,
                  display: 'inline-block', flexShrink: 0
                }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-500)' }}>
                  {form.teamBShort || form.teamB.substring(0, 3).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Match Type */}
          <div className="field">
            <label className="label">Match Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {MATCH_TYPES.map(mt => (
                <button key={mt.value} type="button"
                  className={`btn btn-sm ${form.matchType === mt.value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handleTypeChange(mt.value)} style={{ flex: 1 }}>
                  {mt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overs */}
          <div className="field">
            <label className="label">Overs</label>
            <input className="input" type="number" min="1" max="50" value={form.maxOvers}
              onChange={e => set('maxOvers', parseInt(e.target.value) || 20)}
              disabled={form.matchType !== 'Custom'} />
          </div>

          {/* Venue */}
          <div className="field">
            <label className="label">Venue</label>
            <input className="input" placeholder="e.g. City Ground" value={form.venue}
              onChange={e => set('venue', e.target.value)} />
          </div>

          {/* Toss */}
          {form.teamA && form.teamB && (
            <>
              <div className="field">
                <label className="label">Toss Won By</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['A', 'B'].map(side => {
                    const name = side === 'A' ? form.teamA : form.teamB;
                    const val = side.toLowerCase();
                    return (
                      <button key={val} type="button"
                        className={`btn btn-sm ${form.tossWinner === val ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => set('tossWinner', val)}
                        style={{ flex: 1 }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>
              {form.tossWinner && (
                <div className="field">
                  <label className="label">Elected to</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['bat', 'bowl'].map(d => (
                      <button key={d} type="button"
                        className={`btn btn-sm ${form.tossDecision === d ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => set('tossDecision', d)}
                        style={{ flex: 1, textTransform: 'capitalize' }}
                      >
                        {d === 'bat' ? '🏏 Bat' : '🎳 Bowl'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}
            disabled={loading || !form.teamA.trim() || !form.teamB.trim()}>
            {loading ? 'Creating...' : 'Create Match →'}
          </button>
        </form>
      </div>
    </div>
  );
}
