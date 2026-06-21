/**
 * Persistent store with match, team, and undo support.
 * Data is saved to a JSON file so it survives server restarts.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ── Load from disk ────────────────────────────────────────────
let data = { matches: {}, teams: {} };
try {
  if (existsSync(DATA_FILE)) {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    data = JSON.parse(raw);
    console.log(`📂 Loaded ${Object.keys(data.matches).length} matches, ${Object.keys(data.teams).length} teams from disk`);
  }
} catch (e) {
  console.warn('⚠ Failed to load store from disk, starting fresh:', e.message);
}

const matches = new Map(Object.entries(data.matches || {}));
const teams = new Map(Object.entries(data.teams || {}));
const undoStacks = new Map(); // Undo stacks are NOT persisted (too large)

// ── Persist to disk (debounced) ───────────────────────────────
let saveTimer = null;
function persist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      const out = {
        matches: Object.fromEntries(matches),
        teams: Object.fromEntries(teams)
      };
      writeFileSync(DATA_FILE, JSON.stringify(out, null, 2), 'utf-8');
    } catch (e) {
      console.error('⚠ Failed to persist store:', e.message);
    }
  }, 500); // debounce 500ms
}

export const store = {
  // ── Matches ──────────────────────────────────────────────
  createMatch(match) {
    matches.set(match.matchId, match);
    undoStacks.set(match.matchId, []);
    persist();
    return match;
  },
  getMatch(matchId) { return matches.get(matchId) || null; },
  updateMatch(matchId, state) {
    matches.set(matchId, { ...state });
    persist();
    return state;
  },
  getAllMatches() { return Array.from(matches.values()); },
  deleteMatch(matchId) {
    matches.delete(matchId);
    undoStacks.delete(matchId);
    persist();
  },

  // ── Undo ─────────────────────────────────────────────────
  pushUndo(matchId, state) {
    const stack = undoStacks.get(matchId) || [];
    stack.push(JSON.stringify(state));
    if (stack.length > 100) stack.shift();
    undoStacks.set(matchId, stack);
  },
  popUndo(matchId) {
    const stack = undoStacks.get(matchId) || [];
    if (stack.length === 0) return null;
    return JSON.parse(stack.pop());
  },

  // ── Teams ────────────────────────────────────────────────
  registerTeam(team) {
    teams.set(team.teamId, team);
    persist();
    return team;
  },
  getTeam(teamId) { return teams.get(teamId) || null; },
  getAllTeams() { return Array.from(teams.values()); },
  updateTeam(teamId, data) {
    const t = teams.get(teamId);
    if (!t) return null;
    const updated = { ...t, ...data, teamId };
    teams.set(teamId, updated);
    persist();
    return updated;
  },
  deleteTeam(teamId) {
    teams.delete(teamId);
    persist();
  },

  // ── Points Table (calculated from completed matches) ────
  getPointsTable() {
    const tbl = {};

    for (const match of matches.values()) {
      if (match.status !== 'COMPLETED') continue;

      const tA = match.teams.a;
      const tB = match.teams.b;

      // Initialise rows
      for (const t of [tA, tB]) {
        if (!tbl[t.name]) {
          tbl[t.name] = {
            team: t.name, short: t.short, colors: t.colors || null,
            played: 0, won: 0, lost: 0, tied: 0, nr: 0,
            points: 0, nrr: 0,
            runsFor: 0, oversFor: 0, runsAgainst: 0, oversAgainst: 0
          };
        }
      }

      const first = match.innings[0];
      const second = match.innings[1];
      if (!first || !second) continue;

      const firstTeam = match.teams[first.battingTeam].name;
      const secondTeam = match.teams[second.battingTeam].name;

      // Overs as decimal for NRR
      const firstOv = first.overs + first.balls / 6;
      const secondOv = second.overs + second.balls / 6;

      // Accumulate for NRR
      tbl[firstTeam].runsFor += first.runs;
      tbl[firstTeam].oversFor += firstOv;
      tbl[firstTeam].runsAgainst += second.runs;
      tbl[firstTeam].oversAgainst += secondOv;

      tbl[secondTeam].runsFor += second.runs;
      tbl[secondTeam].oversFor += secondOv;
      tbl[secondTeam].runsAgainst += first.runs;
      tbl[secondTeam].oversAgainst += firstOv;

      if (match.result?.includes('Tied')) {
        tbl[firstTeam].played++; tbl[secondTeam].played++;
        tbl[firstTeam].tied++; tbl[secondTeam].tied++;
        tbl[firstTeam].points += 1; tbl[secondTeam].points += 1;
      } else if (second.runs > first.runs) {
        tbl[secondTeam].played++; tbl[secondTeam].won++; tbl[secondTeam].points += 2;
        tbl[firstTeam].played++; tbl[firstTeam].lost++;
      } else {
        tbl[firstTeam].played++; tbl[firstTeam].won++; tbl[firstTeam].points += 2;
        tbl[secondTeam].played++; tbl[secondTeam].lost++;
      }
    }

    // Calculate NRR
    for (const row of Object.values(tbl)) {
      const forRate = row.oversFor > 0 ? row.runsFor / row.oversFor : 0;
      const againstRate = row.oversAgainst > 0 ? row.runsAgainst / row.oversAgainst : 0;
      row.nrr = forRate - againstRate;
    }

    return Object.values(tbl).sort((a, b) => b.points - a.points || b.nrr - a.nrr);
  }
};
