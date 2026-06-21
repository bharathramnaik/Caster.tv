import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';

/**
 * WASP3D Cricket Live Graphics Package — 1920×1080
 *
 * Layout: [Team Logo + Batters] | [Score Center] | [Bowler + Balls] | [Team Logo]
 */

/* ── Ball indicator color class ───────────────── */
function bc(b) {
  if (b === 'W') return 'sb-bh-w';
  if (b === '4') return 'sb-bh-4';
  if (b === '6') return 'sb-bh-6';
  if (b === '•') return 'sb-bh-dot';
  if (b.startsWith('Wd')) return 'sb-bh-wd';
  if (b.startsWith('Nb')) return 'sb-bh-nb';
  if (b.startsWith('B') || b.startsWith('Lb')) return 'sb-bh-bye';
  return 'sb-bh-run';
}

export default function Overlay() {
  const { matchId } = useParams();
  const { matchState, overlayCommand, clearOverlayCommand } = useSocket(matchId);

  const [template, setTemplate] = useState('scoreboard');
  const [milestoneType, setMilestoneType] = useState(null);
  const [cardPayload, setCardPayload] = useState(null);
  const milestoneTimer = useRef(null);
  const prevScore = useRef(null);
  const scoreRef = useRef(null);

  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / 1920, h / 1080);
      setScale(s);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    const root = document.getElementById('root');
    if (root) {
      root.style.background = 'transparent';
      root.style.padding = '0';
      root.style.margin = '0';
    }
    return () => {
      document.documentElement.style.background = '';
      document.body.style.background = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
      if (root) {
        root.style.background = '';
        root.style.padding = '';
        root.style.margin = '';
      }
    };
  }, []);

  useEffect(() => {
    if (!overlayCommand) return;
    const { command, payload } = overlayCommand;

    switch (command) {
      case 'milestone':
        setMilestoneType(payload.type);
        setTemplate('milestone');
        if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
        milestoneTimer.current = setTimeout(() => {
          setTemplate('scoreboard');
          setMilestoneType(null);
        }, 3000);
        break;
      case 'show-batter':
        setTemplate('batter');
        setCardPayload(payload);
        break;
      case 'show-bowler':
        setTemplate('bowler');
        setCardPayload(payload);
        break;
      case 'show-over-summary':
        setTemplate('overSummary');
        break;
      case 'show-center-scorecard':
        setTemplate('centerScorecard');
        break;
      case 'dismiss':
      case 'scoreboard':
        setTemplate('scoreboard');
        setCardPayload(null);
        break;
      default:
        break;
    }
    clearOverlayCommand();
  }, [overlayCommand, clearOverlayCommand]);

  useEffect(() => {
    if (!matchState) return;
    const inn = matchState.innings?.[matchState.currentInnings];
    if (!inn) return;
    const key = `${inn.runs}/${inn.wickets}`;
    if (prevScore.current && prevScore.current !== key && scoreRef.current) {
      scoreRef.current.classList.remove('sb-score-flash');
      void scoreRef.current.offsetWidth;
      scoreRef.current.classList.add('sb-score-flash');
    }
    prevScore.current = key;
  }, [matchState]);

  useEffect(() => () => {
    if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
  }, []);

  if (!matchState) return null;

  const match = matchState;
  const inn = match.innings[match.currentInnings];

  if (match.status === 'NOT_STARTED' || !inn) {
    return (
      <div className="sb-viewport">
        <div className="ov-root" style={{ transform: `scale(${scale})` }}>
          <PreMatchCard match={match} />
        </div>
      </div>
    );
  }

  const battingTeam = match.teams[inn.battingTeam];
  const bowlingTeam = match.teams[inn.bowlingTeam];
  const batColor = battingTeam.colors || { primary: '#1a5e1f', secondary: '#E3B23C' };
  const bowlColor = bowlingTeam.colors || { primary: '#1a3c5e', secondary: '#E3B23C' };

  return (
    <div className="sb-viewport">
      <div className="ov-root" style={{ transform: `scale(${scale})` }}>
        {/* Chase info */}
        {(template === 'scoreboard' || template === 'centerScorecard') && inn.target != null && inn.runsNeeded > 0 && (
          <div className="sb-chase">
            Need {inn.runsNeeded} from {inn.ballsRemaining} balls · RR {inn.requiredRate || '0.00'}
          </div>
        )}
        {(template === 'scoreboard' || template === 'centerScorecard') && match.status === 'COMPLETED' && match.result && (
          <div className="sb-chase">{match.result}</div>
        )}

        {/* Template Router */}
        {(template === 'scoreboard' || template === 'centerScorecard') && (
          <MainScoreboard match={match} inn={inn} battingTeam={battingTeam} bowlingTeam={bowlingTeam}
            batColor={batColor} bowlColor={bowlColor} scoreRef={scoreRef} />
        )}
        {template === 'milestone' && milestoneType && (
          <MilestoneFlash type={milestoneType} batColor={batColor} bowlColor={bowlColor}
            battingTeam={battingTeam} bowlingTeam={bowlingTeam} inn={inn} />
        )}
        {template === 'batter' && (
          <BatterCard match={match} inn={inn} payload={cardPayload}
            batColor={batColor} bowlColor={bowlColor} battingTeam={battingTeam} />
        )}
        {template === 'bowler' && (
          <BowlerCard match={match} inn={inn} payload={cardPayload}
            batColor={batColor} bowlColor={bowlColor} bowlingTeam={bowlingTeam} />
        )}
        {template === 'overSummary' && (
          <OverSummary match={match} inn={inn}
            batColor={batColor} bowlColor={bowlColor} battingTeam={battingTeam} bowlingTeam={bowlingTeam} />
        )}
        {template === 'centerScorecard' && (
          <CenterScorecard match={match} inn={inn}
            batColor={batColor} bowlColor={bowlColor} battingTeam={battingTeam} bowlingTeam={bowlingTeam} />
        )}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN SCOREBOARD — WASP3D Cricket Live Graphics Package
   [Team Logo + Batters] | [Score Center] | [Bowler + Balls] | [Team Logo]
   ═══════════════════════════════════════════════════════════════════ */
function MainScoreboard({ match, inn, battingTeam, bowlingTeam, batColor, bowlColor, scoreRef }) {
  const striker = inn.batters.find(b => b.isStriker && b.status === 'batting');
  const nonStriker = inn.batters.find(b => !b.isStriker && b.status === 'batting');
  const bowler = inn.bowlers[inn.currentBowlerIndex];
  const totalBalls = inn.overs * 6 + inn.balls;
  const ppBalls = 36;
  const ppOvers = Math.floor(Math.min(totalBalls, ppBalls) / 6);
  const bowlerBalls = bowler?.ballHistory || [];

  return (
    <div className="sb-strip sb-animate-in">
      {/* LEFT — Batting team logo + batters */}
      <div className="sb-left" style={{ background: batColor.primary }}>
        <div className="sb-left-logo">
          <div className="sb-logo-ring" style={{ borderColor: batColor.secondary || '#E3B23C' }}>
            <span className="sb-logo-text">{battingTeam.short}</span>
          </div>
        </div>
        <div className="sb-left-divider" />
        <div className="sb-left-batters">
          {striker && (
            <div className="sb-batter-row">
              <span className="sb-bat-indicator">🏏</span>
              <span className="sb-bat-name">{striker.name}</span>
              <span className="sb-bat-runs">{striker.runs}</span>
              <span className="sb-bat-balls">{striker.balls}</span>
            </div>
          )}
          {nonStriker && (
            <div className="sb-batter-row sb-batter-dim">
              <span className="sb-bat-indicator"></span>
              <span className="sb-bat-name">{nonStriker.name}</span>
              <span className="sb-bat-runs">{nonStriker.runs}</span>
              <span className="sb-bat-balls">{nonStriker.balls}</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER — Score */}
      <div className="sb-center">
        <div className="sb-center-top">
          <span className="sb-center-teams">{battingTeam.short} Vs {bowlingTeam.short}</span>
        </div>
        <div className="sb-center-score-row">
          <div className="sb-center-score" ref={scoreRef}>
            <span className="sb-center-runs">{inn.runs}</span>
            <span className="sb-center-sep">-</span>
            <span className="sb-center-wkts">{inn.wickets}</span>
          </div>
          {totalBalls <= ppBalls && (
            <div className="sb-center-pp">P{ppOvers + 1}</div>
          )}
          <div className="sb-center-overs">{inn.overs}.{inn.balls} OVER</div>
        </div>
        <div className="sb-center-bottom">
          <span className="sb-center-toss">
            {match.tossWinner ? `${match.teams[match.tossWinner].short} WON THE TOSS AND CHOSE TO ${match.tossDecision === 'bat' ? 'BAT' : 'BOWL'}` : 'TOSS PENDING'}
          </span>
        </div>
      </div>

      {/* RIGHT — Bowler + balls */}
      <div className="sb-right">
        {bowler && (
          <>
            <div className="sb-right-bowler">
              <div className="sb-bowler-row">
                <span className="sb-bowler-name">{bowler.name}</span>
              </div>
              <div className="sb-bowler-row">
                <span className="sb-bowler-figs">{bowler.wickets}-{bowler.runs}</span>
                <span className="sb-bowler-ov">{bowler.overs}.{bowler.balls}</span>
              </div>
            </div>
            <div className="sb-right-balls">
              {bowlerBalls.length > 0 && bowlerBalls.map((b, i) => (
                <span key={i} className={`sb-ball ${bc(b)}`}>{b}</span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAR RIGHT — Bowling team logo */}
      <div className="sb-far-right" style={{ background: bowlColor.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: bowlColor.secondary || '#E3B23C' }}>
          <span className="sb-logo-text">{bowlingTeam.short}</span>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MILESTONE FLASH (FOUR / SIX / WICKET)
   ═══════════════════════════════════════════════════════════════════ */
function MilestoneFlash({ type, batColor, bowlColor, battingTeam, bowlingTeam, inn }) {
  const config = {
    FOUR: {
      text: 'FOUR', emoji: '🏏',
      bg: 'linear-gradient(135deg, #065f46 0%, #059669 40%, #10b981 100%)',
      glow: '#34d399', textColor: '#ecfdf5',
    },
    SIX: {
      text: 'SIX', emoji: '🔥',
      bg: 'linear-gradient(135deg, #92400e 0%, #d97706 40%, #f59e0b 100%)',
      glow: '#fbbf24', textColor: '#fffbeb',
    },
    WICKET: {
      text: 'WICKET', emoji: '💥',
      bg: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 40%, #ef4444 100%)',
      glow: '#f87171', textColor: '#fef2f2',
    },
  };
  const c = config[type] || config.FOUR;

  return (
    <div className="sb-strip sb-milestone" style={{ background: c.bg }}>
      <div className="sb-ms-team" style={{ background: batColor.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: c.glow }}>
          <span className="sb-logo-text">{battingTeam.short}</span>
        </div>
      </div>
      <div className="sb-ms-center">
        <span className="sb-ms-emoji">{c.emoji}</span>
        <span className="sb-ms-text" style={{ color: c.textColor, textShadow: `0 0 40px ${c.glow}, 0 0 80px ${c.glow}44` }}>
          {c.text}!
        </span>
        <span className="sb-ms-emoji">{c.emoji}</span>
      </div>
      <div className="sb-ms-score" style={{ background: bowlColor.primary }}>
        <span className="sb-ms-score-val">{inn.runs}-{inn.wickets}</span>
        <span className="sb-ms-score-ov">({inn.overs}.{inn.balls} ov)</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   BATTER CARD
   ═══════════════════════════════════════════════════════════════════ */
function BatterCard({ match, inn, payload, batColor, bowlColor, battingTeam }) {
  const batter = payload?.index != null
    ? inn.batters[payload.index]
    : inn.batters.find(b => b.isStriker && b.status === 'batting');
  if (!batter) return null;
  const balls = batter.ballHistory || [];

  return (
    <div className="sb-strip sb-card sb-animate-in">
      <div className="sb-card-team" style={{ background: batColor.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: '#E3B23C' }}>
          <span className="sb-logo-text">{battingTeam.short}</span>
        </div>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-name" style={{ background: `linear-gradient(135deg, ${batColor.primary} 0%, ${batColor.primary}cc 100%)` }}>
        <span className="sb-card-label">BATTER</span>
        <span className="sb-card-player">{batter.name}</span>
        <span className="sb-card-status">{batter.status === 'batting' ? (batter.isStriker ? 'On Strike' : 'Non-Striker') : 'OUT'}</span>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-stats" style={{ background: `linear-gradient(135deg, ${batColor.primary}bb 0%, #101010 100%)` }}>
        <div className="sb-card-stat"><span className="sb-card-stat-val sb-gold">{batter.runs}</span><span className="sb-card-stat-lbl">Runs</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{batter.balls}</span><span className="sb-card-stat-lbl">Balls</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{batter.fours}</span><span className="sb-card-stat-lbl">4s</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{batter.sixes}</span><span className="sb-card-stat-lbl">6s</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{batter.strikeRate}</span><span className="sb-card-stat-lbl">SR</span></div>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-history" style={{ background: '#0a0a0a' }}>
        <span className="sb-card-hist-label">Ball History</span>
        <div className="sb-card-balls">
          {balls.length > 0 ? balls.map((b, i) => (
            <span key={i} className={`sb-ball ${bc(b)}`}>{b}</span>
          )) : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No balls faced</span>}
        </div>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-ctx" style={{ background: bowlColor.primary }}>
        <span className="sb-card-ctx-score">{inn.runs}-{inn.wickets}</span>
        <span className="sb-card-ctx-ov">{inn.overs}.{inn.balls} ov</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   BOWLER CARD
   ═══════════════════════════════════════════════════════════════════ */
function BowlerCard({ match, inn, payload, batColor, bowlColor, bowlingTeam }) {
  const bowler = payload?.index != null
    ? inn.bowlers[payload.index]
    : inn.bowlers[inn.currentBowlerIndex];
  if (!bowler) return null;
  const balls = bowler.ballHistory || [];

  return (
    <div className="sb-strip sb-card sb-animate-in">
      <div className="sb-card-team" style={{ background: bowlColor.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: '#E3B23C' }}>
          <span className="sb-logo-text">{bowlingTeam.short}</span>
        </div>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-name" style={{ background: `linear-gradient(135deg, ${bowlColor.primary} 0%, ${bowlColor.primary}cc 100%)` }}>
        <span className="sb-card-label">BOWLER</span>
        <span className="sb-card-player">{bowler.name}</span>
        <span className="sb-card-status">{inn.currentBowlerIndex === (payload?.index ?? inn.currentBowlerIndex) ? 'Current' : 'Previous'}</span>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-stats" style={{ background: `linear-gradient(135deg, ${bowlColor.primary}bb 0%, #101010 100%)` }}>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{bowler.overs}.{bowler.balls}</span><span className="sb-card-stat-lbl">Overs</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{bowler.maidens}</span><span className="sb-card-stat-lbl">Maiden</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val sb-gold">{bowler.runs}</span><span className="sb-card-stat-lbl">Runs</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val" style={{ color: '#ef4444' }}>{bowler.wickets}</span><span className="sb-card-stat-lbl">Wkts</span></div>
        <div className="sb-card-stat"><span className="sb-card-stat-val">{bowler.economy}</span><span className="sb-card-stat-lbl">Econ</span></div>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-history" style={{ background: '#0a0a0a' }}>
        <span className="sb-card-hist-label">Spell</span>
        <div className="sb-card-balls">
          {balls.length > 0 ? balls.map((b, i) => (
            <span key={i} className={`sb-ball ${bc(b)}`}>{b}</span>
          )) : <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>No balls bowled</span>}
        </div>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-ctx" style={{ background: batColor.primary }}>
        <span className="sb-card-ctx-score">{inn.runs}-{inn.wickets}</span>
        <span className="sb-card-ctx-ov">{inn.overs}.{inn.balls} ov</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   OVER SUMMARY
   ═══════════════════════════════════════════════════════════════════ */
function OverSummary({ match, inn, batColor, bowlColor, battingTeam, bowlingTeam }) {
  const overs = [];
  let overBalls = [];
  let overRuns = 0;
  let legalCount = 0;

  for (const ball of inn.ballLog) {
    overBalls.push(ball);
    if (ball === '•') { /* 0 */ }
    else if (ball === 'W') { /* 0 */ }
    else if (ball.startsWith('Wd')) { overRuns += 1 + (parseInt(ball.replace('Wd+', '')) || 0); }
    else if (ball.startsWith('Nb')) { overRuns += 1 + (parseInt(ball.replace('Nb+', '')) || 0); }
    else if (ball.startsWith('B')) { overRuns += parseInt(ball.replace('B', '')) || 0; }
    else if (ball.startsWith('Lb')) { overRuns += parseInt(ball.replace('Lb', '')) || 0; }
    else { overRuns += parseInt(ball) || 0; }

    const isLegal = !ball.startsWith('Wd') && !ball.startsWith('Nb');
    if (isLegal) legalCount++;

    if (legalCount >= 6) {
      overs.push({ num: overs.length + 1, balls: [...overBalls], runs: overRuns });
      overBalls = [];
      overRuns = 0;
      legalCount = 0;
    }
  }
  if (overBalls.length > 0) {
    overs.push({ num: overs.length + 1, balls: [...overBalls], runs: overRuns, current: true });
  }
  const displayOvers = overs.slice(-6);

  return (
    <div className="sb-strip sb-over-summary sb-animate-in">
      <div className="sb-card-team" style={{ background: batColor.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: '#E3B23C' }}>
          <span className="sb-logo-text">{battingTeam.short}</span>
        </div>
        <span className="sb-card-team-score">{inn.runs}-{inn.wickets}</span>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-os-header" style={{ background: `linear-gradient(135deg, ${batColor.primary} 0%, ${batColor.primary}cc 100%)` }}>
        <span className="sb-os-title">OVER SUMMARY</span>
        <span className="sb-os-sub">{inn.overs}.{inn.balls} Overs · RR {inn.runRate}</span>
      </div>
      <div className="sb-card-divider" />
      <div className="sb-os-grid">
        {displayOvers.map((ov, idx) => (
          <div key={idx} className={`sb-os-over ${ov.current ? 'sb-os-current' : ''}`}>
            <span className="sb-os-over-num">Ov {ov.num}</span>
            <div className="sb-os-over-balls">
              {ov.balls.map((b, i) => (
                <span key={i} className={`sb-ball-sm ${bc(b)}`}>{b}</span>
              ))}
            </div>
            <span className="sb-os-over-runs">{ov.runs} runs</span>
          </div>
        ))}
      </div>
      <div className="sb-card-divider" />
      <div className="sb-card-team" style={{ background: bowlColor.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: '#E3B23C' }}>
          <span className="sb-logo-text">{bowlingTeam.short}</span>
        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   CENTER SCORECARD
   ═══════════════════════════════════════════════════════════════════ */
function CenterScorecard({ match, inn, batColor, bowlColor, battingTeam, bowlingTeam }) {
  const batters = inn.batters || [];
  const bowlers = inn.bowlers || [];
  const targetText = inn.target != null ? `Target: ${inn.target}` : '';
  const rr = inn.runRate || '0.00';
  const reqRr = inn.requiredRate || null;

  return (
    <div className="sc-center-overlay">
      <div className="sc-card anim-slide" style={{ borderTop: `6px solid ${batColor.primary}`, borderBottom: `6px solid ${bowlColor.primary}` }}>
        <div className="sc-header">
          <div className="sc-header-left">
            <span className="sc-tournament">{match.tournamentName || 'SportsCaster Live'}</span>
            <span className="sc-teams-vs">{match.teams.a.name} vs {match.teams.b.name}</span>
          </div>
          <div className="sc-header-right" style={{ background: batColor.primary }}>
            <span className="sc-header-score">{battingTeam.short} {inn.runs}/{inn.wickets}</span>
            <span className="sc-header-overs">({inn.overs}.{inn.balls} Overs)</span>
          </div>
        </div>
        <div className="sc-infobar">
          <span>RUN RATE: {rr}</span>
          {targetText && <span>{targetText}</span>}
          {reqRr && <span>REQ. RUN RATE: {reqRr}</span>}
          {inn.runsNeeded > 0 && <span>NEED {inn.runsNeeded} RUNS FROM {inn.ballsRemaining} BALLS</span>}
        </div>
        <div className="sc-columns">
          <div className="sc-col sc-bat-col">
            <h3 className="sc-col-title" style={{ color: batColor.primary }}>BATTING</h3>
            <table className="sc-table">
              <thead><tr><th>Batter</th><th>Status</th><th className="num">R</th><th className="num">B</th><th className="num">4s</th><th className="num">6s</th><th className="num">SR</th></tr></thead>
              <tbody>
                {batters.map((b, i) => (
                  <tr key={i} className={b.status === 'batting' ? 'active-row' : ''}>
                    <td className="player-name">{b.name} {b.status === 'batting' ? '★' : ''}</td>
                    <td className="player-status">{b.status === 'batting' ? 'not out' : 'out'}</td>
                    <td className="num highlight">{b.runs}</td>
                    <td className="num">{b.balls}</td>
                    <td className="num">{b.fours}</td>
                    <td className="num">{b.sixes}</td>
                    <td className="num">{b.strikeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sc-col sc-bowl-col">
            <h3 className="sc-col-title" style={{ color: bowlColor.primary }}>BOWLING</h3>
            <table className="sc-table">
              <thead><tr><th>Bowler</th><th className="num">O</th><th className="num">M</th><th className="num">R</th><th className="num">W</th><th className="num">Econ</th></tr></thead>
              <tbody>
                {bowlers.map((b, i) => (
                  <tr key={i} className={i === inn.currentBowlerIndex ? 'active-row' : ''}>
                    <td className="player-name">{b.name} {i === inn.currentBowlerIndex ? '●' : ''}</td>
                    <td className="num">{b.overs}.{b.balls}</td>
                    <td className="num">{b.maidens}</td>
                    <td className="num highlight">{b.runs}</td>
                    <td className="num highlight-wkt" style={{ color: '#ef4444' }}>{b.wickets}</td>
                    <td className="num">{b.economy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {match.result && <div className="sc-footer-result">{match.result}</div>}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   PRE-MATCH CARD
   ═══════════════════════════════════════════════════════════════════ */
function PreMatchCard({ match }) {
  const tossTeam = match.tossWinner ? match.teams[match.tossWinner] : null;
  const tossDecision = match.tossDecision ? (match.tossDecision === 'bat' ? 'bat' : 'bowl') : '';
  const tossText = tossTeam ? `${tossTeam.short} won toss, elected to ${tossDecision}` : 'Toss Pending';
  const colorA = match.teams.a.colors || { primary: '#1a237e', secondary: '#ffd700' };
  const colorB = match.teams.b.colors || { primary: '#b71c1c', secondary: '#ffffff' };

  return (
    <div className="sb-strip sb-animate-in" style={{ background: 'linear-gradient(135deg, #101216 0%, #1c1f26 100%)' }}>
      <div className="sb-left" style={{ background: colorA.primary }}>
        <div className="sb-left-logo">
          <div className="sb-logo-ring" style={{ borderColor: '#E3B23C' }}>
            <span className="sb-logo-text">{match.teams.a.short}</span>
          </div>
        </div>
      </div>
      <div className="sb-center" style={{ flex: 1 }}>
        <div className="sb-center-top">
          <span className="sb-center-teams" style={{ fontSize: 18 }}>{match.teams.a.short} vs {match.teams.b.short}</span>
        </div>
        <div className="sb-center-bottom">
          <span className="sb-center-toss">{tossText}</span>
        </div>
      </div>
      <div className="sb-far-right" style={{ background: colorB.primary }}>
        <div className="sb-logo-ring" style={{ borderColor: '#E3B23C' }}>
          <span className="sb-logo-text">{match.teams.b.short}</span>
        </div>
      </div>
    </div>
  );
}
