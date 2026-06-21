import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

function ballClass(b) {
  if (b === 'W') return 'bp-wicket';
  if (b === '4') return 'bp-four';
  if (b === '6') return 'bp-six';
  if (b === '•') return 'bp-dot';
  if (b.startsWith('Wd')) return 'bp-wide';
  if (b.startsWith('Nb')) return 'bp-noball';
  if (b.startsWith('B') || b.startsWith('Lb')) return 'bp-bye';
  return 'bp-run';
}

function ballPopClass(b) {
  if (b === '4') return 'ipl-ball-four';
  if (b === '6') return 'ipl-ball-six';
  if (b === 'W') return 'ipl-ball-wicket';
  return '';
}

export default function Scoreboard() {
  const { matchId } = useParams();
  const { matchState, connected } = useSocket(matchId);
  const [activeTab, setActiveTab] = useState('scorecard');
  const scoreRef = useRef(null);
  const prevScore = useRef(null);

  useEffect(() => {
    if (!matchState) return;
    const inn = matchState.innings?.[matchState.currentInnings];
    if (!inn) return;
    const key = `${inn.runs}/${inn.wickets}`;
    if (prevScore.current && prevScore.current !== key && scoreRef.current) {
      scoreRef.current.classList.remove('ipl-score-flash');
      void scoreRef.current.offsetWidth;
      scoreRef.current.classList.add('ipl-score-flash');
    }
    prevScore.current = key;
  }, [matchState]);

  if (!matchState) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="ipl-loader anim-fade">
          <div className="ipl-loader-spinner" />
          <p style={{ color: 'var(--text-400)', marginTop: 16 }}>Loading match...</p>
        </div>
      </div>
    );
  }

  const match = matchState;
  const inn = match.innings[match.currentInnings];
  const batting = inn ? match.teams[inn.battingTeam] : null;
  const bowling = inn ? match.teams[inn.bowlingTeam] : null;
  const batColors = batting?.colors || { primary: '#1a237e', secondary: '#ffd700' };
  const bowlColors = bowling?.colors || { primary: '#b71c1c', secondary: '#ffffff' };

  return (
    <div className="page scoreboard-page" style={{ background: 'var(--bg-900)' }}>
      {/* Top nav */}
      <div className="ipl-topbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px' }}>
          <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-500)' }}>← Home</Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`conn-dot ${connected ? 'on' : 'off'}`} />
            {match.status === 'LIVE' && <span className="live-dot">LIVE</span>}
            {match.status === 'COMPLETED' && <span className="chip chip-done">Completed</span>}
            {match.status === 'NOT_STARTED' && <span className="chip chip-break">Not Started</span>}
          </div>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {/* IPL-Style Score Hero */}
        <div className="ipl-hero anim-fade" style={{ marginTop: 24 }}>
          {/* Tournament banner */}
          {match.tournamentName && (
            <div className="ipl-tournament-banner">
              {match.tournamentName}
            </div>
          )}

          {/* Scoreboard */}
          <div className="ipl-scoreboard">
            {/* Team A */}
            <div className="ipl-team-section" style={{ '--team-color': batColors.primary }}>
              <div className="ipl-team-logo" style={{ background: batColors.primary }}>
                <span>{batting?.short || match.teams.a.short}</span>
              </div>
              <div className="ipl-team-info">
                <div className="ipl-team-name">{batting?.name || match.teams.a.name}</div>
                <div className="ipl-team-sub">Batting</div>
              </div>
            </div>

            {/* Score center */}
            <div className="ipl-score-center">
              {inn ? (
                <>
                  <div className="ipl-score-main" ref={scoreRef}>
                    <span className="ipl-score-runs">{inn.runs}</span>
                    <span className="ipl-score-sep">/</span>
                    <span className="ipl-score-wkts">{inn.wickets}</span>
                  </div>
                  <div className="ipl-score-overs">
                    ({inn.overs}.{inn.balls} ov)
                  </div>
                  <div className="ipl-score-rates">
                    <span>CRR {inn.runRate || '0.00'}</span>
                    {inn.requiredRate && <span>RRR {inn.requiredRate}</span>}
                  </div>
                </>
              ) : (
                <div className="ipl-score-pending">vs</div>
              )}
            </div>

            {/* Team B */}
            <div className="ipl-team-section ipl-team-section-right" style={{ '--team-color': bowlColors.primary }}>
              <div className="ipl-team-info" style={{ textAlign: 'right' }}>
                <div className="ipl-team-name">{bowling?.name || match.teams.b.name}</div>
                <div className="ipl-team-sub">Bowling</div>
              </div>
              <div className="ipl-team-logo" style={{ background: bowlColors.primary }}>
                <span>{bowling?.short || match.teams.b.short}</span>
              </div>
            </div>
          </div>

          {/* Target chase bar */}
          {inn?.target != null && inn.runsNeeded > 0 && (
            <div className="ipl-chase-bar anim-slide">
              <div className="ipl-chase-text">
                Need <strong>{inn.runsNeeded}</strong> from <strong>{inn.ballsRemaining}</strong> balls
              </div>
              <div className="ipl-chase-progress">
                <div
                  className="ipl-chase-fill"
                  style={{
                    width: `${Math.min(100, (inn.runs / inn.target) * 100)}%`,
                    background: `linear-gradient(90deg, ${batColors.primary}, ${batColors.secondary})`
                  }}
                />
              </div>
            </div>
          )}

          {/* Result */}
          {match.status === 'COMPLETED' && match.result && (
            <div className="ipl-result-banner anim-slide">
              🏆 {match.result}
            </div>
          )}

          {/* Venue */}
          {match.venue && (
            <div className="ipl-venue">📍 {match.venue}</div>
          )}
        </div>

        {/* Tab navigation */}
        <div className="ipl-tabs anim-slide">
          {[
            { id: 'scorecard', label: 'Scorecard' },
            { id: 'batting', label: 'Batting' },
            { id: 'bowling', label: 'Bowling' },
            { id: 'fow', label: 'Fall of Wickets' },
            { id: 'balls', label: 'Ball by Ball' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`ipl-tab ${activeTab === tab.id ? 'ipl-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="ipl-tab-content anim-slide">
          {activeTab === 'scorecard' && (
            <ScorecardTab match={match} inn={inn} batColors={batColors} bowlColors={bowlColors} />
          )}
          {activeTab === 'batting' && (
            <BattingTab inn={inn} batColors={batColors} />
          )}
          {activeTab === 'bowling' && (
            <BowlingTab inn={inn} bowlColors={bowlColors} />
          )}
          {activeTab === 'fow' && (
            <FowTab inn={inn} />
          )}
          {activeTab === 'balls' && (
            <BallsTab inn={inn} />
          )}
        </div>

        {/* Previous innings */}
        {match.innings.length > 1 && match.currentInnings === 1 && (
          <div className="ipl-prev-innings anim-slide">
            <div className="ipl-prev-header">1st Innings Summary</div>
            <div className="ipl-prev-score">
              <span style={{ color: match.teams[match.innings[0].battingTeam]?.colors?.primary || 'var(--accent)' }}>
                {match.teams[match.innings[0].battingTeam].name}
              </span>
              <span className="ipl-prev-val">
                {match.innings[0].runs}/{match.innings[0].wickets}
              </span>
              <span className="ipl-prev-ov">
                ({match.innings[0].overs}.{match.innings[0].balls} ov)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Scorecard Tab (combined view) ───────────────────────────
function ScorecardTab({ match, inn, batColors, bowlColors }) {
  if (!inn) return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-400)' }}>No innings data</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* This Over */}
      {inn.thisOver?.length > 0 && (
        <div className="ipl-section">
          <div className="ipl-section-title" style={{ '--accent-line': batColors.primary }}>This Over</div>
          <div className="ipl-this-over">
            {inn.thisOver.map((b, i) => (
              <span key={i} className={`ball-pill ${ballClass(b)} ${ballPopClass(b)}`}>{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* Batting */}
      <div className="ipl-section">
        <div className="ipl-section-title" style={{ '--accent-line': batColors.primary }}>Batting</div>
        <div className="ipl-table-wrap">
          <table className="ipl-table">
            <thead>
              <tr>
                <th className="ipl-th-name">Batter</th>
                <th className="ipl-th-num">R</th>
                <th className="ipl-th-num">B</th>
                <th className="ipl-th-num">4s</th>
                <th className="ipl-th-num">6s</th>
                <th className="ipl-th-num">SR</th>
              </tr>
            </thead>
            <tbody>
              {inn.batters.map((b, i) => (
                <tr key={i} className={`ipl-tr ${b.status === 'out' ? 'ipl-tr-out' : ''} ${b.isStriker && b.status === 'batting' ? 'ipl-tr-striker' : ''}`}>
                  <td className="ipl-td-name">
                    {b.name}
                    {b.isStriker && b.status === 'batting' && <span className="ipl-striker-badge">★</span>}
                    {b.status === 'out' && <span className="ipl-out-badge">OUT</span>}
                  </td>
                  <td className="ipl-td-num ipl-td-highlight">{b.runs}</td>
                  <td className="ipl-td-num">{b.balls}</td>
                  <td className="ipl-td-num">{b.fours}</td>
                  <td className="ipl-td-num">{b.sixes}</td>
                  <td className="ipl-td-num">{b.strikeRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bowling */}
      <div className="ipl-section">
        <div className="ipl-section-title" style={{ '--accent-line': bowlColors.primary }}>Bowling</div>
        <div className="ipl-table-wrap">
          <table className="ipl-table">
            <thead>
              <tr>
                <th className="ipl-th-name">Bowler</th>
                <th className="ipl-th-num">O</th>
                <th className="ipl-th-num">M</th>
                <th className="ipl-th-num">R</th>
                <th className="ipl-th-num">W</th>
                <th className="ipl-th-num">Econ</th>
              </tr>
            </thead>
            <tbody>
              {inn.bowlers.map((b, i) => (
                <tr key={i} className={`ipl-tr ${i === inn.currentBowlerIndex ? 'ipl-tr-striker' : ''}`}>
                  <td className="ipl-td-name">
                    {b.name}
                    {i === inn.currentBowlerIndex && <span className="ipl-current-badge">●</span>}
                  </td>
                  <td className="ipl-td-num">{b.overs}.{b.balls}</td>
                  <td className="ipl-td-num">{b.maidens}</td>
                  <td className="ipl-td-num">{b.runs}</td>
                  <td className="ipl-td-num ipl-td-highlight">{b.wickets}</td>
                  <td className="ipl-td-num">{b.economy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extras */}
      <div className="ipl-section">
        <div className="ipl-section-title">Extras</div>
        <div className="ipl-extras-row">
          <span className="ipl-extra">Wides: <strong>{inn.extras.wides}</strong></span>
          <span className="ipl-extra">No Balls: <strong>{inn.extras.noBalls}</strong></span>
          <span className="ipl-extra">Byes: <strong>{inn.extras.byes}</strong></span>
          <span className="ipl-extra">Leg Byes: <strong>{inn.extras.legByes}</strong></span>
        </div>
      </div>
    </div>
  );
}

// ── Batting Tab ─────────────────────────────────────────────
function BattingTab({ inn, batColors }) {
  if (!inn) return null;
  return (
    <div className="ipl-section">
      <div className="ipl-section-title" style={{ '--accent-line': batColors.primary }}>Batting</div>
      <div className="ipl-table-wrap">
        <table className="ipl-table">
          <thead>
            <tr>
              <th className="ipl-th-name">Batter</th>
              <th className="ipl-th-num">R</th>
              <th className="ipl-th-num">B</th>
              <th className="ipl-th-num">4s</th>
              <th className="ipl-th-num">6s</th>
              <th className="ipl-th-num">SR</th>
            </tr>
          </thead>
          <tbody>
            {inn.batters.map((b, i) => (
              <tr key={i} className={`ipl-tr ${b.status === 'out' ? 'ipl-tr-out' : ''} ${b.isStriker && b.status === 'batting' ? 'ipl-tr-striker' : ''}`}>
                <td className="ipl-td-name">
                  {b.name}
                  {b.isStriker && b.status === 'batting' && <span className="ipl-striker-badge">★</span>}
                  {b.status === 'out' && <span className="ipl-out-badge">OUT</span>}
                </td>
                <td className="ipl-td-num ipl-td-highlight">{b.runs}</td>
                <td className="ipl-td-num">{b.balls}</td>
                <td className="ipl-td-num">{b.fours}</td>
                <td className="ipl-td-num">{b.sixes}</td>
                <td className="ipl-td-num">{b.strikeRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Bowling Tab ─────────────────────────────────────────────
function BowlingTab({ inn, bowlColors }) {
  if (!inn) return null;
  return (
    <div className="ipl-section">
      <div className="ipl-section-title" style={{ '--accent-line': bowlColors.primary }}>Bowling</div>
      <div className="ipl-table-wrap">
        <table className="ipl-table">
          <thead>
            <tr>
              <th className="ipl-th-name">Bowler</th>
              <th className="ipl-th-num">O</th>
              <th className="ipl-th-num">M</th>
              <th className="ipl-th-num">R</th>
              <th className="ipl-th-num">W</th>
              <th className="ipl-th-num">Econ</th>
            </tr>
          </thead>
          <tbody>
            {inn.bowlers.map((b, i) => (
              <tr key={i} className={`ipl-tr ${i === inn.currentBowlerIndex ? 'ipl-tr-striker' : ''}`}>
                <td className="ipl-td-name">
                  {b.name}
                  {i === inn.currentBowlerIndex && <span className="ipl-current-badge">●</span>}
                </td>
                <td className="ipl-td-num">{b.overs}.{b.balls}</td>
                <td className="ipl-td-num">{b.maidens}</td>
                <td className="ipl-td-num">{b.runs}</td>
                <td className="ipl-td-num ipl-td-highlight">{b.wickets}</td>
                <td className="ipl-td-num">{b.economy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Fall of Wickets Tab ─────────────────────────────────────
function FowTab({ inn }) {
  if (!inn || inn.fallOfWickets.length === 0) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-400)' }}>No wickets fallen yet</div>;
  }
  return (
    <div className="ipl-section">
      <div className="ipl-section-title">Fall of Wickets</div>
      <div className="ipl-fow-grid">
        {inn.fallOfWickets.map((fw, i) => (
          <div key={i} className="ipl-fow-card anim-slide" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="ipl-fow-num">#{fw.wicketNum}</div>
            <div className="ipl-fow-score">{fw.score}/{fw.wicketNum}</div>
            <div className="ipl-fow-over">({fw.overStr} ov)</div>
            <div className="ipl-fow-batter">{fw.batter}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Ball by Ball Tab ────────────────────────────────────────
function BallsTab({ inn }) {
  if (!inn || inn.ballLog.length === 0) {
    return <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-400)' }}>No balls bowled yet</div>;
  }

  // Group balls by over
  const overs = [];
  let currentOver = [];
  let legalCount = 0;
  for (const ball of inn.ballLog) {
    currentOver.push(ball);
    if (!ball.startsWith('Wd') && !ball.startsWith('Nb')) legalCount++;
    if (legalCount >= 6) {
      overs.push({ num: overs.length + 1, balls: [...currentOver] });
      currentOver = [];
      legalCount = 0;
    }
  }
  if (currentOver.length > 0) {
    overs.push({ num: overs.length + 1, balls: [...currentOver], current: true });
  }

  return (
    <div className="ipl-section">
      <div className="ipl-section-title">Ball by Ball</div>
      <div className="ipl-balls-grid">
        {overs.map((ov, i) => (
          <div key={i} className={`ipl-over-row anim-slide`} style={{ animationDelay: `${i * 40}ms` }}>
            <div className="ipl-over-num">Over {ov.num}</div>
            <div className="ipl-over-balls">
              {ov.balls.map((b, j) => (
                <span key={j} className={`ball-pill ${ballClass(b)} ${ballPopClass(b)}`} style={{ animationDelay: `${j * 50}ms` }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
