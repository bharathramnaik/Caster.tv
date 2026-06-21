import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const API = import.meta.env.VITE_API_URL || '';

const features = [
  { icon: '⚡', title: 'Real-Time Updates', desc: 'Ball-by-ball scoring synced instantly to your overlay via WebSockets. Zero lag.' },
  { icon: '🎬', title: 'OBS Integration', desc: 'Add our transparent overlay URL as a Browser Source in OBS. Professional broadcast quality.' },
  { icon: '📱', title: 'Mobile Scorer', desc: 'Score from your phone with large, touch-friendly buttons. No typing required.' },
  { icon: '🏏', title: 'Cricket First', desc: 'IPL-quality scorebug with batters, bowler, run rate, this over, and target chase.' },
  { icon: '🔄', title: 'Undo Support', desc: 'Made a mistake? Instantly undo the last ball. Full action history preserved.' },
  { icon: '🌐', title: 'Share Live Score', desc: 'Public scoreboard URL anyone can open — no YouTube needed to follow the match.' }
];

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    fetch(`${API}/api/matches`)
      .then(r => r.json())
      .then(data => {
        setMatches(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page">
      {/* ── Hero ──────────────────────── */}
      <section className="hero">
        <div className="container hero-content anim-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'absolute', top: 20, left: 24, right: 24, zIndex: 2 }}>
            <div className="hero-badge">🏏 Live Sports Overlay Platform</div>
            <button onClick={toggle} className="btn btn-sm btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
          <h1>
            <span className="gradient-text">Professional Scoreboards</span>
            <br />for Local Sports Streams
          </h1>
          <p>
            Create stunning, real-time scoreboards for YouTube live streams.
            IPL-quality overlays for your local cricket tournaments — no expensive broadcast software needed.
          </p>
          <div className="hero-actions">
            <Link to="/match/new" className="btn btn-primary btn-lg">
              Create Match →
            </Link>
            <Link to="/teams" className="btn btn-secondary btn-lg">
              🏏 Teams
            </Link>
            <Link to="/points" className="btn btn-secondary btn-lg">
              📊 Points Table
            </Link>
          </div>
        </div>
      </section>

      {/* ── Match Center ───────────────── */}
      <section className="container" style={{ padding: '20px 24px 60px 24px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>
          🏏 <span className="gradient-text">Match Center</span>
        </h2>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-400)' }}>Loading matches...</p>
        ) : matches.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface)' }}>
            <p style={{ color: 'var(--text-400)', margin: 0 }}>No matches created yet. Click "Create Match" to start a new one!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
            {matches.map(m => {
              const inn = m.innings?.[m.currentInnings];
              const scoreText = inn ? `${m.teams[inn.battingTeam]?.short} ${inn.runs}/${inn.wickets} (${inn.overs}.${inn.balls} ov)` : '0/0 (0.0 ov)';
              return (
                <div key={m.matchId} className="feature-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase' }}>
                      {m.tournamentName || 'Friendly Match'}
                    </span>
                    <span className={`chip ${m.status === 'LIVE' ? 'chip-live' : m.status === 'COMPLETED' ? 'chip-done' : 'chip-break'}`}>
                      {m.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0' }}>
                    <span>{m.teams.a.name} vs {m.teams.b.name}</span>
                  </div>

                  {m.status !== 'NOT_STARTED' && (
                    <div style={{ background: 'var(--bg-700)', padding: '10px 14px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-400)' }}>Current Score:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-100)' }}>{scoreText}</span>
                    </div>
                  )}

                  {m.status === 'COMPLETED' && m.result && (
                    <div style={{ color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600, textAlign: 'center', marginTop: 4 }}>
                      🏆 {m.result}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 8 }}>
                    {m.status !== 'COMPLETED' ? (
                      <Link to={`/control/${m.matchId}`} className="btn btn-primary btn-sm" style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                        🏏 Resume Scoring
                      </Link>
                    ) : (
                      <Link to={`/score/${m.matchId}`} className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                        📊 View Scorecard
                      </Link>
                    )}
                    <Link to={`/overlay/${m.matchId}`} target="_blank" className="btn btn-secondary btn-sm" style={{ flex: 1, textAlign: 'center', padding: '8px 0' }}>
                      🖥 Stream Overlay
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Features ──────────────────── */}
      <section className="features container" id="features">
        <h2 style={{ textAlign: 'center' }}>
          Everything you need for a <span className="gradient-text">professional broadcast</span>
        </h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="feature-card anim-slide"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ──────────────── */}
      <section className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 40 }}>How It Works</h2>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { step: '01', label: 'Create Match', desc: 'Set up teams, overs, and match type' },
            { step: '02', label: 'Score Live', desc: 'Tap buttons ball-by-ball from any device' },
            { step: '03', label: 'Add to OBS', desc: 'Paste overlay URL as Browser Source' },
            { step: '04', label: 'Go Live', desc: 'Professional scoreboard on your YouTube stream' }
          ].map((s, i) => (
            <div
              key={s.step}
              className="anim-slide"
              style={{
                animationDelay: `${i * 120}ms`,
                flex: '1 1 200px', maxWidth: 240, textAlign: 'center'
              }}
            >
              <div style={{
                width: 56, height: 56, margin: '0 auto 16px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-dim)',
                border: '1.5px solid rgba(247,201,72,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800,
                fontSize: '1.1rem', color: 'var(--accent)'
              }}>{s.step}</div>
              <h4 style={{ marginBottom: 6 }}>{s.label}</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-400)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ────────────────────── */}
      <footer style={{
        textAlign: 'center', padding: '40px 24px',
        borderTop: '1px solid var(--glass-border)',
        color: 'var(--text-500)', fontSize: '0.85rem'
      }}>
        SportsCaster · Built for local sports · 2026
      </footer>
    </div>
  );
}
