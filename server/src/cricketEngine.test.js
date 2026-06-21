import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createMatchState, startInnings, applyBall, changeBowler, endInnings, updateMatchMeta } from './cricketEngine.js';

describe('cricketEngine', () => {

  describe('createMatchState', () => {
    it('creates a valid match state', () => {
      const match = createMatchState({
        matchId: 'test1', teamA: 'India', teamB: 'Australia',
        maxOvers: 20, matchType: 'T20'
      });
      assert.equal(match.matchId, 'test1');
      assert.equal(match.status, 'NOT_STARTED');
      assert.equal(match.maxOvers, 20);
      assert.equal(match.teams.a.name, 'India');
      assert.equal(match.teams.b.name, 'Australia');
      assert.deepEqual(match.innings, []);
    });
  });

  describe('startInnings', () => {
    it('starts first innings correctly', () => {
      const match = createMatchState({
        matchId: 'test1', teamA: 'India', teamB: 'Australia', maxOvers: 20
      });
      const updated = startInnings(match, {
        battingTeam: 'a', batter1: 'Kohli', batter2: 'Rohit', bowler: 'Starc'
      });
      assert.equal(updated.status, 'LIVE');
      assert.equal(updated.innings.length, 1);
      assert.equal(updated.innings[0].battingTeam, 'a');
      assert.equal(updated.innings[0].batters.length, 2);
      assert.equal(updated.innings[0].bowlers.length, 1);
      assert.equal(updated.innings[0].target, null);
    });

    it('sets target for second innings', () => {
      let match = createMatchState({
        matchId: 'test1', teamA: 'India', teamB: 'Australia', maxOvers: 2
      });
      match = startInnings(match, {
        battingTeam: 'a', batter1: 'Kohli', batter2: 'Rohit', bowler: 'Starc'
      });
      // Score 16 runs in first over (6 legal balls)
      match = applyBall(match, { type: 'normal', runs: 4 });
      match = applyBall(match, { type: 'normal', runs: 6 });
      match = applyBall(match, { type: 'normal', runs: 2 });
      match = applyBall(match, { type: 'normal', runs: 1 });
      match = applyBall(match, { type: 'normal', runs: 0 });
      match = applyBall(match, { type: 'normal', runs: 3 });
      // Over complete, innings not yet (2 overs match)
      assert.equal(match.innings[0].overs, 1);
      assert.equal(match.innings[0].isComplete, false);

      // Second over
      for (let i = 0; i < 6; i++) match = applyBall(match, { type: 'normal', runs: 1 });
      assert.equal(match.innings[0].isComplete, true);
      assert.equal(match.innings[0].runs, 22);

      match = startInnings(match, {
        battingTeam: 'b', batter1: 'Smith', batter2: 'Warner', bowler: 'Bumrah'
      });
      assert.equal(match.innings[1].target, 23);
    });
  });

  describe('applyBall - normal runs', () => {
    it('scores 0 (dot ball)', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'normal', runs: 0 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 0);
      assert.equal(inn.balls, 1);
      assert.equal(inn.ballLog[0], '•');
    });

    it('scores 4 runs', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'normal', runs: 4 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 4);
      assert.equal(inn.batters[0].fours, 1);
      assert.equal(inn.ballLog[0], '4');
    });

    it('scores 6 runs', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'normal', runs: 6 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 6);
      assert.equal(inn.batters[0].sixes, 1);
      assert.equal(inn.ballLog[0], '6');
    });

    it('swaps strike on odd runs', () => {
      const match = makeLiveMatch();
      const strikerBefore = match.innings[0].batters.find(b => b.isStriker);
      const updated = applyBall(match, { type: 'normal', runs: 1 });
      const strikerAfter = updated.innings[0].batters.find(b => b.isStriker);
      assert.notEqual(strikerBefore.name, strikerAfter.name);
    });
  });

  describe('applyBall - extras', () => {
    it('scores a wide', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'wide', runs: 0 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 1);
      assert.equal(inn.extras.wides, 1);
      assert.equal(inn.balls, 0); // wide is not a legal ball
    });

    it('scores a wide with extra runs', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'wide', runs: 2 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 3);
      assert.equal(inn.extras.wides, 3);
    });

    it('scores a no-ball', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'noBall', runs: 0 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 1);
      assert.equal(inn.extras.noBalls, 1);
    });

    it('scores a no-ball with runs off bat', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'noBall', runs: 4 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 5);
      assert.equal(inn.batters[0].runs, 4);
      assert.equal(inn.batters[0].fours, 1);
    });

    it('scores byes', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'bye', runs: 2 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 2);
      assert.equal(inn.extras.byes, 2);
    });

    it('scores leg byes', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, { type: 'legBye', runs: 1 });
      const inn = updated.innings[0];
      assert.equal(inn.runs, 1);
      assert.equal(inn.extras.legByes, 1);
    });
  });

  describe('applyBall - wickets', () => {
    it('takes a wicket', () => {
      const match = makeLiveMatch();
      const updated = applyBall(match, {
        type: 'wicket', newBatter: 'Pant'
      });
      const inn = updated.innings[0];
      assert.equal(inn.wickets, 1);
      // Kohli (striker) is out, Rohit (non-striker) becomes striker, Pant is new non-striker
      assert.equal(inn.batters.length, 3);
      assert.equal(inn.batters[2].name, 'Pant');
      assert.equal(inn.batters[2].isStriker, true);
      assert.equal(inn.batters[1].name, 'Rohit');
      assert.equal(inn.batters[1].isStriker, false);
      assert.equal(inn.fallOfWickets.length, 1);
      assert.equal(inn.fallOfWickets[0].batter, 'Kohli');
    });
  });

  describe('over completion', () => {
    it('completes an over after 6 legal balls', () => {
      let match = makeLiveMatch();
      for (let i = 0; i < 6; i++) {
        match = applyBall(match, { type: 'normal', runs: 1 });
      }
      assert.equal(match.innings[0].overs, 1);
      assert.equal(match.innings[0].balls, 0);
      assert.equal(match.innings[0].thisOver.length, 0);
    });

    it('does not count wides/no-balls toward over', () => {
      let match = makeLiveMatch();
      match = applyBall(match, { type: 'wide', runs: 0 });
      match = applyBall(match, { type: 'noBall', runs: 0 });
      assert.equal(match.innings[0].balls, 0);
      assert.equal(match.innings[0].thisOver.length, 2);
    });
  });

  describe('maiden overs', () => {
    it('increments maidens when 0 runs conceded in an over', () => {
      let match = makeLiveMatch();
      for (let i = 0; i < 6; i++) {
        match = applyBall(match, { type: 'normal', runs: 0 });
      }
      assert.equal(match.innings[0].bowlers[0].maidens, 1);
    });

    it('does not count maiden when runs scored off bat', () => {
      let match = makeLiveMatch();
      match = applyBall(match, { type: 'normal', runs: 1 });
      for (let i = 0; i < 5; i++) {
        match = applyBall(match, { type: 'normal', runs: 0 });
      }
      assert.equal(match.innings[0].bowlers[0].maidens, 0);
    });

    it('does not count maiden when extras conceded', () => {
      let match = makeLiveMatch();
      match = applyBall(match, { type: 'wide', runs: 0 });
      for (let i = 0; i < 5; i++) {
        match = applyBall(match, { type: 'normal', runs: 0 });
      }
      assert.equal(match.innings[0].bowlers[0].maidens, 0);
    });
  });

  describe('innings completion', () => {
    it('completes innings when all out', () => {
      let match = makeLiveMatch();
      for (let i = 0; i < 10; i++) {
        match = applyBall(match, { type: 'wicket', newBatter: `Batter${i + 3}` });
      }
      assert.equal(match.innings[0].isComplete, true);
      assert.equal(match.status, 'INNINGS_BREAK');
    });

    it('completes match when target chased in 2nd innings', () => {
      let match = makeTwoInningsMatch();
      // 2nd innings, target is 15
      for (let i = 0; i < 3; i++) match = applyBall(match, { type: 'normal', runs: 5 });
      assert.equal(match.status, 'COMPLETED');
      assert.ok(match.result.includes('won by'));
    });
  });

  describe('endInnings', () => {
    it('ends innings manually', () => {
      let match = makeLiveMatch();
      match = applyBall(match, { type: 'normal', runs: 2 });
      const updated = endInnings(match);
      assert.equal(updated.innings[0].isComplete, true);
      assert.equal(updated.status, 'INNINGS_BREAK');
    });
  });

  describe('updateMatchMeta', () => {
    it('updates match metadata before innings start', () => {
      const match = createMatchState({
        matchId: 'test1', teamA: 'India', teamB: 'Australia', maxOvers: 20
      });
      const updated = updateMatchMeta(match, {
        tournamentName: 'IPL 2026', venue: 'Mumbai', maxOvers: 10
      });
      assert.equal(updated.tournamentName, 'IPL 2026');
      assert.equal(updated.venue, 'Mumbai');
      assert.equal(updated.maxOvers, 10);
    });

    it('does not allow updates after innings start', () => {
      let match = makeLiveMatch();
      const updated = updateMatchMeta(match, { tournamentName: 'Changed' });
      assert.notEqual(updated.tournamentName, 'Changed');
    });
  });

  describe('changeBowler', () => {
    it('changes to existing bowler', () => {
      const match = makeLiveMatch();
      const updated = changeBowler(match, { bowlerName: 'Bumrah' });
      assert.equal(updated.innings[0].bowlers[1].name, 'Bumrah');
      assert.equal(updated.innings[0].currentBowlerIndex, 1);
    });

    it('creates new bowler if not found', () => {
      const match = makeLiveMatch();
      const updated = changeBowler(match, { bowlerName: 'Siraj' });
      assert.equal(updated.innings[0].bowlers.length, 2);
      assert.equal(updated.innings[0].bowlers[1].name, 'Siraj');
    });
  });
});

// ── Test helpers ─────────────────────────────────────────────
function makeLiveMatch() {
  let match = createMatchState({
    matchId: 'test', teamA: 'India', teamB: 'Australia', maxOvers: 20
  });
  return startInnings(match, {
    battingTeam: 'a', batter1: 'Kohli', batter2: 'Rohit', bowler: 'Starc'
  });
}

function makeTwoInningsMatch() {
  let match = createMatchState({
    matchId: 'test', teamA: 'India', teamB: 'Australia', maxOvers: 2
  });
  match = startInnings(match, {
    battingTeam: 'a', batter1: 'Kohli', batter2: 'Rohit', bowler: 'Starc'
  });
  for (let i = 0; i < 6; i++) match = applyBall(match, { type: 'normal', runs: 2 });
  match = startInnings(match, {
    battingTeam: 'b', batter1: 'Smith', batter2: 'Warner', bowler: 'Bumrah'
  });
  return match;
}
