import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || '';

export default function PointsTable() {
  const [table, setTable] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/points`).then(r => r.json()),
      fetch(`${API}/api/matches`).then(r => r.json())
    ])
      .then(([pts, mts]) => { setTable(pts); setMatches(mts); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const liveMatches = matches.filter(m => m.status === 'LIVE');

  return (
    <div className="page container" style={{ maxWidth: 860, margin: '0 auto', paddingTop: 32, paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-500)' }}>← Home</Link>
        <h1 style={{ marginTop: 8 }}><span className="gradient-text">Points Table</span></h1>
        <p style={{ color: 'var(--text-400)', fontSize: '0.9rem', marginTop: 4 }}>
          Tournament standings · IPL-style ranking
        </p>
      </div>

      {/* ── Points Table ──────────────── */}
      <div className="card card-static anim-fade" style={{ cursor: 'default', padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <table className="stats-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 36, textAlign: 'center' }}>#</th>
              <th>Team</th>
              <th style={{ textAlign: 'center' }}>P</th>
              <th style={{ textAlign: 'center' }}>W</th>
              <th style={{ textAlign: 'center' }}>L</th>
              <th style={{ textAlign: 'center' }}>T</th>
              <th style={{ textAlign: 'center' }}>Pts</th>
              <th style={{ textAlign: 'center' }}>NRR</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => {
              const prim = row.colors?.primary || '#1a237e';
              return (
                <tr key={row.team} style={{ borderLeft: `4px solid ${prim}` }}>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--text-400)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 6, flexShrink: 0,
                        background: `linear-gradient(135deg, ${prim}, ${row.colors?.secondary || prim})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.58rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)'
                      }}>
                        {row.short}
                      </div>
                      <span className="highlight">{row.team}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{row.played}</td>
                  <td style={{ textAlign: 'center', color: 'var(--green)', fontWeight: 600 }}>{row.won}</td>
                  <td style={{ textAlign: 'center', color: row.lost > 0 ? 'var(--red)' : 'var(--text-300)' }}>{row.lost}</td>
                  <td style={{ textAlign: 'center' }}>{row.tied}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: '1.05rem' }}>{row.points}</td>
                  <td style={{ textAlign: 'center', color: row.nrr >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                    {row.nrr > 0 ? '+' : ''}{(row.nrr || 0).toFixed(3)}
                  </td>
                </tr>
              );
            })}
            {table.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 50, color: 'var(--text-500)' }}>
                  {loading ? 'Loading...' : 'No completed matches yet. Points will appear after matches finish.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Live Matches ──────────────── */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div className="section-label" style={{ marginTop: 0 }}>Live Matches</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {liveMatches.map(m => {
              const inn = m.innings[m.currentInnings];
              const bat = inn ? m.teams[inn.battingTeam] : null;
              const tc = bat?.colors?.primary || '#1a237e';
              return (
                <div key={m.matchId} className="card card-static" style={{
                  cursor: 'default', borderLeft: `4px solid ${tc}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--text-100)' }}>
                      {m.teams.a.short} vs {m.teams.b.short}
                    </span>
                    {inn && (
                      <span style={{ marginLeft: 12, color: 'var(--text-300)' }}>
                        {bat?.short} {inn.runs}/{inn.wickets} ({inn.overs}.{inn.balls})
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="live-dot" style={{ fontSize: '0.7rem' }}>LIVE</span>
                    <Link to={`/score/${m.matchId}`} className="btn btn-sm btn-secondary">View</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Results ────────────── */}
      {completedMatches.length > 0 && (
        <div>
          <div className="section-label" style={{ marginTop: 0 }}>Recent Results</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {completedMatches.slice(-10).reverse().map(m => (
              <div key={m.matchId} className="card card-static" style={{
                cursor: 'default',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-100)' }}>
                    {m.teams.a.short} vs {m.teams.b.short}
                  </span>
                  <span style={{ marginLeft: 12, color: 'var(--text-400)', fontSize: '0.88rem' }}>
                    {m.result}
                  </span>
                </div>
                <Link to={`/score/${m.matchId}`} className="btn btn-sm btn-secondary">Scorecard</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
