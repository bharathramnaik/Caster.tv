/**
 * Cricket Scoring Engine
 * Pure functions — take state in, return new state out. No side effects.
 */

// ── Match Creation ──────────────────────────────────────────────

export function createMatchState({ matchId, teamA, teamB, teamAShort, teamBShort, teamAColors, teamBColors, maxOvers, matchType, venue, tournamentName, tossWinner, tossDecision }) {
  return {
    matchId,
    status: 'NOT_STARTED',
    matchType: matchType || 'T20',
    maxOvers: parseInt(maxOvers) || 20,
    venue: venue || '',
    tournamentName: tournamentName || '',
    tossWinner: tossWinner || null,       // 'a' or 'b'
    tossDecision: tossDecision || null,   // 'bat' or 'bowl'
    teams: {
      a: {
        name: teamA,
        short: teamAShort || (teamA || '').substring(0, 3).toUpperCase(),
        colors: teamAColors || { primary: '#1a237e', secondary: '#ffd700' }
      },
      b: {
        name: teamB,
        short: teamBShort || (teamB || '').substring(0, 3).toUpperCase(),
        colors: teamBColors || { primary: '#b71c1c', secondary: '#ffffff' }
      }
    },
    innings: [],
    currentInnings: -1,
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// ── Innings ─────────────────────────────────────────────────────

export function startInnings(state, { battingTeam, batter1, batter2, bowler }) {
  const s = clone(state);
  const bowlingTeam = battingTeam === 'a' ? 'b' : 'a';
  const target = s.innings.length > 0 ? s.innings[0].runs + 1 : null;

  s.innings.push({
    battingTeam,
    bowlingTeam,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
    batters: [
      makeBatter(batter1, true),
      makeBatter(batter2, false)
    ],
    bowlers: [makeBowler(bowler)],
    currentBowlerIndex: 0,
    fallOfWickets: [],
    ballLog: [],
    thisOver: [],
    target,
    isComplete: false
  });

  s.currentInnings = s.innings.length - 1;
  s.status = 'LIVE';
  s.updatedAt = ts();
  return s;
}

// ── Ball Application ────────────────────────────────────────────

export function applyBall(state, action) {
  const s = clone(state);
  const inn = s.innings[s.currentInnings];
  if (!inn || inn.isComplete) return s;

  const striker = inn.batters.find(b => b.isStriker && b.status === 'batting');
  const bowler = inn.bowlers[inn.currentBowlerIndex];
  if (!striker || !bowler) return s;

  // Initialize missing history arrays dynamically for backwards compatibility
  for (const b of inn.batters) {
    if (!b.ballHistory) b.ballHistory = [];
  }
  for (const b of inn.bowlers) {
    if (!b.ballHistory) b.ballHistory = [];
  }

  const { type, runs = 0 } = action;
  let legal = true;
  let display = '';
  let shouldSwap = false;

  switch (type) {
    case 'normal':
      striker.runs += runs;
      striker.balls++;
      if (runs === 4) striker.fours++;
      if (runs === 6) striker.sixes++;
      bowler.runs += runs;
      inn.runs += runs;
      display = runs === 0 ? '•' : String(runs);
      shouldSwap = runs % 2 === 1;
      break;

    case 'wide':
      inn.extras.wides += 1 + runs;
      inn.runs += 1 + runs;
      bowler.runs += 1 + runs;
      legal = false;
      display = runs > 0 ? `Wd+${runs}` : 'Wd';
      shouldSwap = runs % 2 === 1;
      break;

    case 'noBall':
      inn.extras.noBalls++;
      inn.runs += 1 + runs;
      bowler.runs += 1 + runs;
      if (runs > 0) {
        striker.runs += runs;
        if (runs === 4) striker.fours++;
        if (runs === 6) striker.sixes++;
      }
      striker.balls++;
      legal = false;
      display = runs > 0 ? `Nb+${runs}` : 'Nb';
      shouldSwap = runs % 2 === 1;
      break;

    case 'bye':
      inn.extras.byes += runs;
      inn.runs += runs;
      striker.balls++;
      display = `B${runs}`;
      shouldSwap = runs % 2 === 1;
      break;

    case 'legBye':
      inn.extras.legByes += runs;
      inn.runs += runs;
      striker.balls++;
      display = `Lb${runs}`;
      shouldSwap = runs % 2 === 1;
      break;

    case 'wicket':
      inn.wickets++;
      striker.balls++;
      striker.status = 'out';
      striker.isStriker = false;
      bowler.wickets++;
      inn.fallOfWickets.push({
        wicketNum: inn.wickets,
        score: inn.runs,
        overStr: `${inn.overs}.${inn.balls + 1}`,
        batter: striker.name
      });
      if (action.newBatter) {
        inn.batters.push(makeBatter(action.newBatter, true));
      }
      display = 'W';
      shouldSwap = false;
      break;

    default:
      return s;
  }

  // ── Legal ball → increment ball counts ──
  if (legal) {
    inn.balls++;
    bowler.balls++;
    inn.thisOver.push(display);

    // Over complete?
    if (inn.balls >= 6) {
      inn.overs++;
      inn.balls = 0;
      bowler.overs++;
      // Detect maiden: if bowler conceded 0 total runs in the over, increment maidens
      if (bowler.runs === 0) {
        bowler.maidens++;
      }
      bowler.balls = 0;
      // End-of-over strike swap toggles whatever run-based swap computed
      shouldSwap = !shouldSwap;
      inn.thisOver = [];
    }
  } else {
    inn.thisOver.push(display);
  }

  inn.ballLog.push(display);
  bowler.ballHistory.push(display);
  if (type !== 'wide') { striker.ballHistory.push(display); }
  if (shouldSwap) swapStrike(inn);
  refreshStats(inn, s.maxOvers);

  // ── Check completion ──
  const totalBalls = inn.overs * 6 + inn.balls;
  const maxBalls = s.maxOvers * 6;
  const allOut = inn.wickets >= 10;
  const oversUp = totalBalls >= maxBalls;
  const chased = inn.target != null && inn.runs >= inn.target;

  if (allOut || oversUp || chased) {
    inn.isComplete = true;
    if (s.innings.length >= 2) {
      s.status = 'COMPLETED';
      s.result = calcResult(s);
    } else {
      s.status = 'INNINGS_BREAK';
    }
  }

  s.updatedAt = ts();
  return s;
}

// ── Change Bowler ───────────────────────────────────────────────

export function changeBowler(state, { bowlerName }) {
  const s = clone(state);
  const inn = s.innings[s.currentInnings];
  if (!inn) return s;

  let idx = inn.bowlers.findIndex(b => b.name === bowlerName);
  if (idx === -1) {
    inn.bowlers.push(makeBowler(bowlerName));
    idx = inn.bowlers.length - 1;
  }
  inn.currentBowlerIndex = idx;
  const bowler = inn.bowlers[idx];
  if (bowler && !bowler.ballHistory) bowler.ballHistory = [];
  s.updatedAt = ts();
  return s;
}

// ── End Innings (manual) ─────────────────────────────────────

export function endInnings(state) {
  const s = clone(state);
  const inn = s.innings[s.currentInnings];
  if (!inn || inn.isComplete) return s;

  inn.isComplete = true;
  if (s.innings.length >= 2) {
    s.status = 'COMPLETED';
    s.result = calcResult(s);
  } else {
    s.status = 'INNINGS_BREAK';
  }
  s.updatedAt = ts();
  return s;
}

// ── Update Match Metadata (before innings start) ────────────

export function updateMatchMeta(state, updates) {
  const s = clone(state);
  if (s.status !== 'NOT_STARTED') return s;

  const allowed = ['tournamentName', 'venue', 'matchType', 'maxOvers', 'tossWinner', 'tossDecision'];
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      s[key] = key === 'maxOvers' ? parseInt(updates[key]) || s.maxOvers : updates[key];
    }
  }
  if (updates.teamA) s.teams.a.name = updates.teamA;
  if (updates.teamAShort) s.teams.a.short = updates.teamAShort;
  if (updates.teamAColors) s.teams.a.colors = updates.teamAColors;
  if (updates.teamB) s.teams.b.name = updates.teamB;
  if (updates.teamBShort) s.teams.b.short = updates.teamBShort;
  if (updates.teamBColors) s.teams.b.colors = updates.teamBColors;
  s.updatedAt = ts();
  return s;
}

// ── Helpers ─────────────────────────────────────────────────────

function makeBatter(name, isStriker) {
  return {
    name, runs: 0, balls: 0, fours: 0, sixes: 0,
    strikeRate: '0.0', isStriker, status: 'batting',
    ballHistory: []
  };
}

function makeBowler(name) {
  return {
    name, overs: 0, balls: 0, maidens: 0,
    runs: 0, wickets: 0, economy: '0.0',
    ballHistory: []  // stores each ball display string for overlay
  };
}

function swapStrike(inn) {
  for (const b of inn.batters) {
    if (b.status === 'batting') b.isStriker = !b.isStriker;
  }
}

function refreshStats(inn, maxOvers) {
  for (const b of inn.batters) {
    b.strikeRate = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
  }
  for (const b of inn.bowlers) {
    const tb = b.overs * 6 + b.balls;
    b.economy = tb > 0 ? ((b.runs / tb) * 6).toFixed(1) : '0.0';
  }
  const tb = inn.overs * 6 + inn.balls;
  inn.runRate = tb > 0 ? ((inn.runs / tb) * 6).toFixed(2) : '0.00';

  if (inn.target != null) {
    inn.runsNeeded = Math.max(0, inn.target - inn.runs);
    const ballsLeft = maxOvers * 6 - tb;
    inn.ballsRemaining = ballsLeft;
    inn.requiredRate = ballsLeft > 0 ? ((inn.runsNeeded / ballsLeft) * 6).toFixed(2) : '0.00';
  }
}

function calcResult(state) {
  const first = state.innings[0];
  const second = state.innings[1];
  if (!second) return null;

  const teamBatFirst = state.teams[first.battingTeam].name;
  const teamBatSecond = state.teams[second.battingTeam].name;

  if (second.runs >= first.runs + 1) {
    const w = 10 - second.wickets;
    return `${teamBatSecond} won by ${w} wicket${w !== 1 ? 's' : ''}`;
  }
  if (second.isComplete && first.runs > second.runs) {
    const r = first.runs - second.runs;
    return `${teamBatFirst} won by ${r} run${r !== 1 ? 's' : ''}`;
  }
  if (second.isComplete && first.runs === second.runs) {
    return 'Match Tied';
  }
  return null;
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function ts() { return new Date().toISOString(); }
