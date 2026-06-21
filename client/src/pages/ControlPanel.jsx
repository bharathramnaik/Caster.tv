import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

const API = import.meta.env.VITE_API_URL || '';

// ── Ball class helper ────────────────────────────────────────
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

export default function ControlPanel() {
  const { matchId } = useParams();
  const { matchState, connected, error, emit } = useSocket(matchId);
  const [showInningsModal, setShowInningsModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showBowlerModal, setShowBowlerModal] = useState(false);
  const [extraRuns, setExtraRuns] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  // ── Emit helpers ─────────────────────────────────────────
  const sendBall = useCallback((type, runs = 0, extra = {}) => {
    emit('score:update', { matchId, type, runs, ...extra });
  }, [matchId, emit]);

  const undo = () => emit('score:undo', { matchId });

  // ── Derived state ────────────────────────────────────────
  const match = matchState;
  const needsInnings = match && (match.status === 'NOT_STARTED' || match.status === 'INNINGS_BREAK');
  const inn = match?.innings?.[match.currentInnings];
  const striker = inn?.batters?.find(b => b.isStriker && b.status === 'batting');
  const nonStriker = inn?.batters?.find(b => !b.isStriker && b.status === 'batting');
  const bowler = inn ? inn.bowlers[inn.currentBowlerIndex] : null;
  const last6 = inn?.ballLog?.slice(-6) || [];

  // ── Loading states ───────────────────────────────────────
  if (!match) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="anim-fade" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
          <p style={{ color: 'var(--text-400)' }}>
            {error ? `Error: ${error}` : 'Connecting to match...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page container" style={{ paddingTop: 20, paddingBottom: 40, maxWidth: 600, margin: '0 auto' }}>

      {/* ── Top Bar ─────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Link to="/" style={{ fontSize: '0.85rem', color: 'var(--text-500)' }}>← Home</Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={`conn-dot ${connected ? 'on' : 'off'}`} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-500)' }}>{connected ? 'Connected' : 'Offline'}</span>
        </div>
      </div>

      {/* ── Links ───────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <Link to={`/overlay/${matchId}`} target="_blank" className="btn btn-sm btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
          🖥 Overlay
        </Link>
        <Link to={`/score/${matchId}`} target="_blank" className="btn btn-sm btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
          📊 Scoreboard
        </Link>
        <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => {
          navigator.clipboard.writeText(`${window.location.origin}/overlay/${matchId}`);
        }}>
          📋 Copy URL
        </button>
        {match.status === 'NOT_STARTED' && (
          <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(true)}>
            ✏️ Edit
          </button>
        )}
        <a href={`${API}/api/matches/${matchId}/export/csv`} className="btn btn-sm btn-secondary" style={{ flex: 1, textAlign: 'center' }} download>
          📥 CSV
        </a>
      </div>

      {/* ── Score Header ────────────────── */}
      <div className="control-header anim-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {match.tournamentName && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {match.tournamentName}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>
                {inn ? match.teams[inn.battingTeam]?.short : match.teams.a.short}
              </span>
              <span className="control-score-display">
                {inn ? `${inn.runs}/${inn.wickets}` : '0/0'}
              </span>
              <span style={{ color: 'var(--text-400)', fontSize: '1rem' }}>
                ({inn ? `${inn.overs}.${inn.balls}` : '0.0'} ov)
              </span>
            </div>
            <div className="control-meta">
              {match.teams.a.name} vs {match.teams.b.name} · {match.matchType} · {match.maxOvers} overs
            </div>
          </div>
          {match.status === 'LIVE' && <span className="live-dot">LIVE</span>}
          {match.status === 'COMPLETED' && <span className="chip chip-done">Completed</span>}
          {match.status === 'INNINGS_BREAK' && <span className="chip chip-break">Break</span>}
        </div>

        {/* Batters + Bowler */}
        {inn && (
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
            <div>
              {striker && <span style={{ color: 'var(--text-100)', fontWeight: 600 }}>{striker.name} {striker.runs}*({striker.balls})</span>}
              {nonStriker && <span style={{ color: 'var(--text-500)', marginLeft: 12 }}>{nonStriker.name} {nonStriker.runs}({nonStriker.balls})</span>}
            </div>
            {bowler && <span style={{ color: 'var(--text-400)' }}>{bowler.name} {bowler.overs}-{bowler.wickets}-{bowler.runs}</span>}
          </div>
        )}

        {/* Last balls */}
        {last6.length > 0 && (
          <div className="last-ball-strip">
            <span>This over:</span>
            <div className="balls">
              {(inn?.thisOver || []).map((b, i) => (
                <span key={i} className={`ball-pill ${ballClass(b)}`}>{b}</span>
              ))}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>
              Last: {last6.slice(-3).join(' ')}
            </span>
          </div>
        )}
      </div>

      {/* ── Start Innings Button ────────── */}
      {needsInnings && (
        <button
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginBottom: 20 }}
          onClick={() => setShowInningsModal(true)}
        >
          {match.status === 'NOT_STARTED' ? '🏏 Start 1st Innings' : '🏏 Start 2nd Innings'}
        </button>
      )}

      {/* ── Match Completed ─────────────── */}
      {match.status === 'COMPLETED' && match.result && (
        <div className="card" style={{ textAlign: 'center', marginTop: 20, cursor: 'default' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>🏆 {match.result}</div>
        </div>
      )}

      {/* ── Scoring Controls ────────────── */}
      {match.status === 'LIVE' && inn && !inn.isComplete && (
        <>
          {/* Runs */}
          <div className="section-label">Runs</div>
          <div className="scoring-grid">
            {[0, 1, 2, 3].map(r => (
              <button key={r} className="score-btn score-btn-run" onClick={() => sendBall('normal', r)}>
                {r}
              </button>
            ))}
            <button className="score-btn score-btn-four" onClick={() => sendBall('normal', 4)}>4</button>
            <button className="score-btn score-btn-six" onClick={() => sendBall('normal', 6)}>6</button>
            <button className="score-btn score-btn-wicket" onClick={() => setShowWicketModal(true)}>W</button>
            <button className="score-btn score-btn-action" onClick={undo} style={{ fontSize: '1rem' }}>↩ Undo</button>
          </div>

          {/* Extras */}
          <div className="section-label">Extras</div>
          <div className="extras-grid">
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="score-btn score-btn-extra" onClick={() => sendBall('wide', extraRuns)} style={{ fontSize: '0.9rem', flex: 1 }}>
                Wide {extraRuns > 0 ? `+${extraRuns}` : ''}
              </button>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="score-btn score-btn-extra" onClick={() => sendBall('noBall', extraRuns)} style={{ fontSize: '0.9rem', flex: 1 }}>
                No Ball {extraRuns > 0 ? `+${extraRuns}` : ''}
              </button>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="score-btn score-btn-action" onClick={() => sendBall('bye', extraRuns || 1)} style={{ fontSize: '0.9rem', flex: 1 }}>
                Bye ({extraRuns || 1})
              </button>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="score-btn score-btn-action" onClick={() => sendBall('legBye', extraRuns || 1)} style={{ fontSize: '0.9rem', flex: 1 }}>
                Leg Bye ({extraRuns || 1})
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 12px', background: 'var(--bg-700)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-400)', whiteSpace: 'nowrap' }}>Extra runs:</span>
            {[0, 1, 2, 3, 4, 5, 6].map(r => (
              <button key={r}
                onClick={() => setExtraRuns(r)}
                style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  background: extraRuns === r ? 'var(--accent)' : 'var(--bg-600)',
                  color: extraRuns === r ? '#000' : 'var(--text-300)',
                  fontWeight: 700, fontSize: '0.85rem',
                  transition: 'all 0.15s'
                }}
              >{r}</button>
            ))}
          </div>

          {/* Actions */}
          <div className="section-label">Actions</div>
          <div className="actions-grid">
            <button className="score-btn score-btn-action" onClick={() => setShowBowlerModal(true)} style={{ fontSize: '0.85rem' }}>
              🔄 Bowler
            </button>
            <button className="score-btn score-btn-action" onClick={() => {
              if (confirm('End current innings?')) {
                emit('innings:end', { matchId });
              }
            }} style={{ fontSize: '0.85rem' }}>
              ⏹ End Inn.
            </button>
            <button className="score-btn score-btn-action" onClick={undo} style={{ fontSize: '0.85rem' }}>
              ↩ Undo
            </button>
          </div>

          {/* ── Overlay Template Controls ── */}
          <div className="section-label" style={{ marginTop: 12 }}>📺 Overlay Templates</div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            padding: '12px 16px', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-200)', border: '1px solid var(--bg-300)'
          }}>
            {/* Batter cards */}
            <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-400)', borderBottom: '1px solid var(--bg-300)', paddingBottom: 4, marginBottom: 4 }}>
              BATTER CARDS
            </div>
            {inn.batters.map((b, idx) => (
              <button key={b.name} className="btn btn-sm btn-secondary" onClick={() => {
                emit('overlay:command', { matchId, command: 'show-batter', payload: { index: idx } });
              }} style={{ fontSize: '0.82rem', padding: '8px 10px', opacity: b.status === 'batting' ? 1 : 0.6 }}>
                🏏 {b.name} {b.status === 'batting' ? (b.isStriker ? '★' : '') : '(Out)'}
              </button>
            ))}

            {/* Bowler cards */}
            <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-400)', borderBottom: '1px solid var(--bg-300)', paddingBottom: 4, marginBottom: 4, marginTop: 8 }}>
              BOWLER CARDS
            </div>
            {inn.bowlers.map((bw, idx) => (
              <button key={bw.name} className="btn btn-sm btn-secondary" onClick={() => {
                emit('overlay:command', { matchId, command: 'show-bowler', payload: { index: idx } });
              }} style={{ fontSize: '0.82rem', padding: '8px 10px', opacity: idx === inn.currentBowlerIndex ? 1 : 0.7 }}>
                🎳 {bw.name} {idx === inn.currentBowlerIndex ? '●' : ''}
              </button>
            ))}

            {/* Other Templates */}
            <div style={{ gridColumn: 'span 2', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-400)', borderBottom: '1px solid var(--bg-300)', paddingBottom: 4, marginBottom: 4, marginTop: 8 }}>
              BROADCAST TEMPLATES
            </div>
            {/* Over Summary */}
            <button className="btn btn-sm btn-secondary" onClick={() => {
              emit('overlay:command', { matchId, command: 'show-over-summary' });
            }} style={{ fontSize: '0.82rem', padding: '8px 10px' }}>
              📊 Over Summary (Bottom)
            </button>

            {/* Center Scorecard */}
            <button className="btn btn-sm btn-secondary" onClick={() => {
              emit('overlay:command', { matchId, command: 'show-center-scorecard' });
            }} style={{ fontSize: '0.82rem', padding: '8px 10px' }}>
              🖥 Centered Scorecard
            </button>

            {/* Reset to scoreboard */}
            <button className="btn btn-sm btn-primary" onClick={() => {
              emit('overlay:command', { matchId, command: 'dismiss' });
            }} style={{ gridColumn: 'span 2', fontSize: '0.82rem', padding: '8px 10px', marginTop: 4 }}>
              🔁 Reset to Scoreboard
            </button>
          </div>
        </>
      )}


      {/* ── Innings Start Modal ─────────── */}
      {showInningsModal && <InningsModal match={match} emit={emit} onClose={() => setShowInningsModal(false)} />}

      {/* ── Wicket Modal ────────────────── */}
      {showWicketModal && (
        <WicketModal
          matchId={matchId}
          emit={emit}
          onClose={() => setShowWicketModal(false)}
          sendBall={sendBall}
        />
      )}

      {/* ── Bowler Change Modal ─────────── */}
      {showBowlerModal && (
        <BowlerModal matchId={matchId} emit={emit} onClose={() => setShowBowlerModal(false)} />
      )}

      {/* ── Edit Match Modal ────────────── */}
      {showEditModal && (
        <EditMatchModal match={match} emit={emit} onClose={() => setShowEditModal(false)} />
      )}
    </div>
  );
}

// ── Innings Start Modal Component ────────────────────────────
function InningsModal({ match, emit, onClose }) {
  const isSecond = match.innings.length > 0;
  const defaultBattingTeam = isSecond
    ? (match.innings[0].bowlingTeam)
    : 'a';

  const [battingTeam, setBattingTeam] = useState(defaultBattingTeam);
  const [batter1, setBatter1] = useState('');
  const [batter2, setBatter2] = useState('');
  const [bowler, setBowler] = useState('');

  const start = () => {
    if (!batter1.trim() || !batter2.trim() || !bowler.trim()) return;
    emit('innings:start', {
      matchId: match.matchId,
      battingTeam,
      batter1: batter1.trim(),
      batter2: batter2.trim(),
      bowler: bowler.trim()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>{isSecond ? '2nd Innings' : '1st Innings'}</h2>

        <div className="field">
          <label className="label">Batting Team</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['a', 'b'].map(t => (
              <button
                key={t}
                type="button"
                className={`btn btn-sm ${battingTeam === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setBattingTeam(t)}
                style={{ flex: 1 }}
              >
                {match.teams[t].name}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label">Striker</label>
          <input className="input" placeholder="Batter 1 name" value={batter1} onChange={e => setBatter1(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label className="label">Non-Striker</label>
          <input className="input" placeholder="Batter 2 name" value={batter2} onChange={e => setBatter2(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Opening Bowler</label>
          <input className="input" placeholder="Bowler name" value={bowler} onChange={e => setBowler(e.target.value)} />
        </div>

        {isSecond && match.innings[0] && (
          <div style={{
            padding: '10px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-dim)', marginBottom: 16,
            fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 600
          }}>
            Target: {match.innings[0].runs + 1} runs
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={start}
            disabled={!batter1.trim() || !batter2.trim() || !bowler.trim()}
          >
            Start Innings
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Wicket Modal Component ───────────────────────────────────
function WicketModal({ matchId, emit, onClose, sendBall }) {
  const [newBatter, setNewBatter] = useState('');

  const confirm = () => {
    sendBall('wicket', 0, { newBatter: newBatter.trim() || undefined });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 style={{ color: 'var(--red)' }}>🏏 Wicket!</h2>
        <div className="field" style={{ marginTop: 20 }}>
          <label className="label">New Batter (leave empty if last wicket)</label>
          <input className="input" placeholder="New batter name" value={newBatter} onChange={e => setNewBatter(e.target.value)} autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={confirm}>Confirm Wicket</button>
        </div>
      </div>
    </div>
  );
}

// ── Bowler Change Modal ──────────────────────────────────────
function BowlerModal({ matchId, emit, onClose }) {
  const [name, setName] = useState('');

  const confirm = () => {
    if (!name.trim()) return;
    emit('bowler:change', { matchId, bowlerName: name.trim() });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>🔄 Change Bowler</h2>
        <div className="field" style={{ marginTop: 20 }}>
          <label className="label">Bowler Name</label>
          <input className="input" placeholder="Bowler name" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirm} disabled={!name.trim()}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Match Modal ────────────────────────────────────────
function EditMatchModal({ match, emit, onClose }) {
  const [form, setForm] = useState({
    tournamentName: match.tournamentName || '',
    venue: match.venue || '',
    matchType: match.matchType || 'T20',
    maxOvers: match.maxOvers || 20,
    tossWinner: match.tossWinner || '',
    tossDecision: match.tossDecision || 'bat'
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const save = () => {
    emit('match:update', { matchId: match.matchId, updates: form });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2>✏️ Edit Match</h2>
        <div className="field" style={{ marginTop: 20 }}>
          <label className="label">Tournament Name</label>
          <input className="input" value={form.tournamentName} onChange={e => set('tournamentName', e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Venue</label>
          <input className="input" value={form.venue} onChange={e => set('venue', e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Match Type</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['T10', 'T20', 'ODI', 'Custom'].map(t => (
              <button key={t} type="button"
                className={`btn btn-sm ${form.matchType === t ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { set('matchType', t); if (t !== 'Custom') set('maxOvers', t === 'T10' ? 10 : t === 'T20' ? 20 : 50); }}
                style={{ flex: 1 }}>{t}</button>
            ))}
          </div>
        </div>
        {form.matchType === 'Custom' && (
          <div className="field">
            <label className="label">Overs</label>
            <input className="input" type="number" min="1" max="50" value={form.maxOvers}
              onChange={e => set('maxOvers', parseInt(e.target.value) || 20)} />
          </div>
        )}
        <div className="field">
          <label className="label">Toss Winner</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['', 'a', 'b'].map(v => (
              <button key={v} type="button"
                className={`btn btn-sm ${form.tossWinner === v ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => set('tossWinner', v)}
                style={{ flex: 1 }}>
                {v === '' ? 'None' : match.teams[v].short}
              </button>
            ))}
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
                  style={{ flex: 1, textTransform: 'capitalize' }}>
                  {d === 'bat' ? '🏏 Bat' : '🎳 Bowl'}
                </button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={save}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
