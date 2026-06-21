# Cricket Template Data Bindings

This document describes all available data bindings for cricket broadcast graphics templates.

## Common Bindings (All Templates)

| Binding | Type | Description |
|---------|------|-------------|
| `match.id` | string | Unique match identifier |
| `match.info` | string | Match info (e.g., "India vs Australia - 3rd ODI - Melbourne") |
| `match.result` | string | Match result text (e.g., "India won by 42 runs") |

---

## Scoreboard Template (`cricket-scoreboard`)

### Batting Team

| Binding | Type | Description |
|---------|------|-------------|
| `battingTeam.name` | string | Full team name |
| `battingTeam.short` | string | Short team name (3-4 letters) |
| `battingTeam.primaryColor` | string | Team primary color (hex) |
| `battingTeam.secondaryColor` | string | Team secondary color (hex) |

### Bowling Team

| Binding | Type | Description |
|---------|------|-------------|
| `bowlingTeam.name` | string | Full team name |
| `bowlingTeam.short` | string | Short team name (3-4 letters) |
| `bowlingTeam.primaryColor` | string | Team primary color (hex) |

### Innings

| Binding | Type | Description |
|---------|------|-------------|
| `innings.runs` | number | Current runs scored |
| `innings.wickets` | number | Current wickets fallen |
| `innings.overs` | number | Completed overs |
| `innings.balls` | number | Balls in current over (0-5) |
| `innings.runRate` | number | Current run rate |
| `innings.target` | number | Target score (only when chasing) |
| `innings.runsNeeded` | number | Runs needed to win |
| `innings.ballsRemaining` | number | Balls remaining in innings |
| `innings.requiredRunRate` | number | Required run rate to win |
| `isChasing` | boolean | Whether batting team is chasing |

### Striker

| Binding | Type | Description |
|---------|------|-------------|
| `striker.name` | string | Batter name |
| `striker.runs` | number | Runs scored |
| `striker.balls` | number | Balls faced |
| `striker.fours` | number | Fours hit |
| `striker.sixes` | number | Sixes hit |
| `striker.strikeRate` | number | Strike rate |

### Non-Striker

| Binding | Type | Description |
|---------|------|-------------|
| `nonStriker.name` | string | Batter name |
| `nonStriker.runs` | number | Runs scored |
| `nonStriker.balls` | number | Balls faced |

### Bowler

| Binding | Type | Description |
|---------|------|-------------|
| `bowler.name` | string | Bowler name |
| `bowler.wickets` | number | Wickets taken |
| `bowler.runs` | number | Runs conceded |
| `bowler.overs` | number | Overs bowled |
| `bowler.balls` | number | Balls in current over |
| `bowler.economy` | number | Economy rate |

---

## Player Card Template (`cricket-player-card`)

### Player

| Binding | Type | Description |
|---------|------|-------------|
| `player.name` | string | Player full name |
| `player.role` | string | Player role ("Batter", "Bowler", "All-Rounder", "Wicketkeeper") |
| `player.photo` | string | URL to player photo |
| `player.jerseyNumber` | number | Jersey number |
| `player.team.name` | string | Team name |
| `player.team.primaryColor` | string | Team primary color |
| `player.team.secondaryColor` | string | Team secondary color |

### Stats (Context-dependent)

#### For Batters

| Stat | Label | Value |
|------|-------|-------|
| `stats.stat1` | "Runs" | e.g., "78" |
| `stats.stat2` | "Balls" | e.g., "56" |
| `stats.stat3` | "4s" | e.g., "8" |
| `stats.stat4` | "6s" | e.g., "3" |

#### For Bowlers

| Stat | Label | Value |
|------|-------|-------|
| `stats.stat1` | "Wickets" | e.g., "3" |
| `stats.stat2` | "Overs" | e.g., "10" |
| `stats.stat3` | "Runs" | e.g., "45" |
| `stats.stat4` | "Economy" | e.g., "4.50" |

### Ball-by-Ball History (This Over)

| Binding | Type | Description |
|---------|------|-------------|
| `ballByBall[0]` | object | First ball of over |
| `ballByBall[0].color` | string | Circle background color |
| `ballByBall[0].display` | string | Display text (e.g., "4", "W", "0") |
| `ballByBall[1]` - `ballByBall[5]` | object | Subsequent balls |

#### Ball Color Mapping

| Result | Color | Display |
|--------|-------|---------|
| Dot ball | `#333333` | "0" |
| 1 run | `#2196F3` | "1" |
| 2 runs | `#4CAF50` | "2" |
| 3 runs | `#9C27B0` | "3" |
| Four | `#E3B23C` | "4" |
| Six | `#FF5722` | "6" |
| Wicket | `#F44336` | "W" |
| Wide | `#FF9800` | "Wd" |
| No ball | `#FF5722` | "Nb" |
| Bye | `#607D8B` | "B" |
| Leg bye | `#607D8B` | "Lb" |

---

## Match Summary Template (`cricket-match-summary`)

### Teams

| Binding | Type | Description |
|---------|------|-------------|
| `team1.name` | string | First team name |
| `team1.short` | string | Short team name |
| `team1.score` | string | Full score (e.g., "287/6") |
| `team1.overs` | string | Overs played (e.g., "50.0 overs") |
| `team1.primaryColor` | string | Team primary color |
| `team1.fallOfWickets` | string | Fall of wickets text |
| `team2.name` | string | Second team name |
| `team2.short` | string | Short team name |
| `team2.score` | string | Full score |
| `team2.overs` | string | Overs played |
| `team2.primaryColor` | string | Team primary color |
| `team2.fallOfWickets` | string | Fall of wickets text |

### Performers

| Binding | Type | Description |
|---------|------|-------------|
| `performers.topBatter.name` | string | Highest scorer name |
| `performers.topBatter.score` | string | Score display (e.g., "112 (98)") |
| `performers.topBowler.name` | string | Best bowler name |
| `performers.topBowler.figures` | string | Bowling figures (e.g., "4/32") |
| `performers.manOfTheMatch.name` | string | Man of the match name |
| `performers.manOfTheMatch.performance` | string | Performance summary |
| `performers.bestBattingStrikeRate.name` | string | Best strike rate batter |
| `performers.bestBattingStrikeRate.strikeRate` | string | Strike rate value |

---

## Ball-by-Ball Overlay Template (`cricket-ball-by-ball`)

### Current Ball

| Binding | Type | Description |
|---------|------|-------------|
| `currentBall.display` | string | Ball result display ("0", "1", "2", "3", "4", "6", "W") |
| `currentBall.color` | string | Circle background color (hex) |
| `currentBall.colorGlow` | string | Glow effect color (hex) |
| `currentBall.highlightColor` | string | Highlight text color |
| `currentBall.description` | string | Ball description (e.g., "FOUR!", "WICKET!") |

### This Over

| Binding | Type | Description |
|---------|------|-------------|
| `thisOver[0]` - `thisOver[5]` | object | Ball data (same structure as currentBall) |
| `thisOver[0].color` | string | Ball circle color |
| `thisOver[0].display` | string | Ball result display |
| `thisOverTotal` | number | Total runs this over |
| `thisOverBalls` | number | Balls bowled this over |

### Rates

| Binding | Type | Description |
|---------|------|-------------|
| `innings.runRate` | number | Current run rate |
| `innings.requiredRunRate` | number | Required run rate (when chasing) |
| `requiredRateColor` | string | Color for required rate (green/yellow/red) |

---

## Partnership Template (`cricket-partnership`)

### Partnership

| Binding | Type | Description |
|---------|------|-------------|
| `partnership.runs` | number | Partnership runs |
| `partnership.balls` | number | Partnership balls faced |
| `partnership.runRate` | number | Partnership run rate |
| `partnership.milestone` | string | Milestone text (e.g., "50-run partnership!" or empty) |
| `partnership.barWidth` | string | Progress bar width (CSS, e.g., "60%") |

### Batter 1 (Striker)

| Binding | Type | Description |
|---------|------|-------------|
| `batter1.name` | string | Batter name |
| `batter1.runs` | number | Runs scored |
| `batter1.balls` | number | Balls faced |
| `batter1.contribution` | number | Percentage of partnership |
| `batter1.team.primaryColor` | string | Team primary color |

### Batter 2 (Non-Striker)

| Binding | Type | Description |
|---------|------|-------------|
| `batter2.name` | string | Batter name |
| `batter2.runs` | number | Runs scored |
| `batter2.balls` | number | Balls faced |
| `batter2.team.primaryColor` | string | Team primary color |

---

## Example Data Object

```json
{
  "match": {
    "id": "match-2024-001",
    "info": "India vs Australia - 3rd ODI - Melbourne Cricket Ground",
    "result": "India won by 42 runs"
  },
  "battingTeam": {
    "name": "India",
    "short": "IND",
    "primaryColor": "#0078D7",
    "secondaryColor": "#FF9933"
  },
  "bowlingTeam": {
    "name": "Australia",
    "short": "AUS",
    "primaryColor": "#FFCD00"
  },
  "innings": {
    "runs": 187,
    "wickets": 3,
    "overs": 32,
    "balls": 4,
    "runRate": 5.84,
    "target": 288,
    "runsNeeded": 101,
    "ballsRemaining": 104,
    "requiredRunRate": 5.83,
    "isChasing": true
  },
  "striker": {
    "name": "Virat Kohli",
    "runs": 78,
    "balls": 56,
    "fours": 8,
    "sixes": 3,
    "strikeRate": 139.29
  },
  "nonStriker": {
    "name": "Shubman Gill",
    "runs": 45,
    "balls": 52
  },
  "bowler": {
    "name": "Pat Cummins",
    "wickets": 1,
    "runs": 38,
    "overs": 6,
    "balls": 4,
    "economy": 5.65
  }
}
```

---

## Animation Presets

| Template | Enter | Exit | Duration |
|----------|-------|------|----------|
| Scoreboard | `slide-in-bottom` | `slide-out-bottom` | 0.5s |
| Player Card | `scale-in-fade` | `scale-out-fade` | 0.8s |
| Match Summary | `scale-in-fade` | `scale-out-fade` | 1.0s |
| Ball by Ball | `pop-in` | `pop-out` | 0.3s |
| Partnership | `slide-in-right` | `slide-out-right` | 0.5s |
