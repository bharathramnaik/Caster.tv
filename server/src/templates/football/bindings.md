# Football Graphics Template Data Bindings

## Score Bug (`football-scorebug`)

| Binding | Type | Description |
|---------|------|-------------|
| `homeTeam.logo` | string | Home team logo URL or path |
| `homeTeam.name` | string | Home team display name |
| `homeTeam.score` | number | Home team current score |
| `awayTeam.logo` | string | Away team logo URL or path |
| `awayTeam.name` | string | Away team display name |
| `awayTeam.score` | number | Away team current score |
| `matchTime` | string | Current match time (e.g., "45:00") |
| `matchHalf` | string | Current half (e.g., "1ST HALF", "2ND HALF") |

---

## Player Profile (`football-player-profile`)

| Binding | Type | Description |
|---------|------|-------------|
| `player.photo` | string | Player headshot URL or path |
| `player.name` | string | Player full name |
| `player.position` | string | Playing position (e.g., "Striker", "Midfielder") |
| `player.jerseyNumber` | number | Squad number |
| `team.color` | string | Team primary color (hex) |
| `player.stats.goals` | number | Total goals scored |
| `player.stats.assists` | number | Total assists |
| `player.stats.appearances` | number | Total appearances |
| `player.stats.rating` | string | Average match rating |
| `player.stats.yellowCards` | number | Yellow cards received |
| `player.stats.redCards` | number | Red cards received |

---

## Match Statistics (`football-match-stats`)

| Binding | Type | Description |
|---------|------|-------------|
| `homeTeam.name` | string | Home team display name |
| `awayTeam.name` | string | Away team display name |
| `stats.possession.home` | string | Home possession percentage |
| `stats.possession.away` | string | Away possession percentage |
| `stats.possession.homeBar` | number | Home possession bar width (0-100) |
| `stats.possession.awayBar` | number | Away possession bar width (0-100) |
| `stats.shotsOnTarget.home` | number | Home shots on target |
| `stats.shotsOnTarget.away` | number | Away shots on target |
| `stats.shotsOffTarget.home` | number | Home shots off target |
| `stats.shotsOffTarget.away` | number | Away shots off target |
| `stats.corners.home` | number | Home corner kicks |
| `stats.corners.away` | number | Away corner kicks |
| `stats.fouls.home` | number | Home fouls committed |
| `stats.fouls.away` | number | Away fouls committed |
| `stats.yellowCards.home` | number | Home yellow cards |
| `stats.yellowCards.away` | number | Away yellow cards |
| `stats.redCards.home` | number | Home red cards |
| `stats.redCards.away` | number | Away red cards |
| `stats.offsides.home` | number | Home offside calls |
| `stats.offsides.away` | number | Away offside calls |

---

## Team Lineup (`football-lineup`)

| Binding | Type | Description |
|---------|------|-------------|
| `team.name` | string | Team display name |
| `team.formation` | string | Formation string (e.g., "4-4-2", "4-3-3") |
| `team.lineup[0]` | string | Goalkeeper (format: "#1 J. Smith") |
| `team.lineup[1-10]` | string | Outfield players in formation order |
| `team.substitutes[0-6]` | string | Substitute players |
| `team.manager` | string | Team manager/coach name |

### Formation Position Mapping

The lineup elements are positioned for a 4-4-2 formation by default. The `team.lineup` array is mapped as follows:

- `[0]` → Goalkeeper
- `[1-4]` → Defenders (left to right)
- `[5-8]` → Midfielders (left to right)
- `[9-10]` → Forwards (left to right)

---

## Goal Event (`football-goal-event`)

| Binding | Type | Description |
|---------|------|-------------|
| `event.scorer.name` | string | Goal scorer's full name |
| `event.scorer.team` | string | Scorer's team name |
| `event.time` | string | Time of goal (e.g., "78'") |
| `event.goalNumber` | string | Ordinal goal number (e.g., "1st Goal", "2nd Goal") |
| `event.assist.name` | string | Assist provider's name (optional) |
| `matchScore` | string | Updated score display (e.g., "2 - 1") |

---

## Substitution (`football-substitution`)

| Binding | Type | Description |
|---------|------|-------------|
| `event.subNumber` | string | Substitution number (e.g., "1/3", "2/3") |
| `event.playerOff.name` | string | Player being substituted off |
| `event.playerOff.jerseyNumber` | number | Off player's squad number |
| `event.playerOff.position` | string | Off player's position |
| `event.playerOn.name` | string | Player coming on |
| `event.playerOn.jerseyNumber` | number | On player's squad number |
| `event.playerOn.position` | string | On player's position |
| `event.time` | string | Time of substitution (e.g., "62'") |
| `event.team` | string | Team making the substitution |

---

## Example Data Object

```json
{
  "homeTeam": {
    "name": "Manchester United",
    "logo": "/assets/logos/man-utd.png",
    "score": 2
  },
  "awayTeam": {
    "name": "Liverpool",
    "logo": "/assets/logos/liverpool.png",
    "score": 1
  },
  "matchTime": "78:22",
  "matchHalf": "2ND HALF",
  "player": {
    "name": "Marcus Rashford",
    "position": "Forward",
    "jerseyNumber": 10,
    "photo": "/assets/players/rashford.png",
    "stats": {
      "goals": 12,
      "assists": 5,
      "appearances": 28,
      "rating": "7.2",
      "yellowCards": 3,
      "redCards": 0
    }
  },
  "team": {
    "name": "Manchester United",
    "color": "#DA291C",
    "formation": "4-2-3-1",
    "manager": "Erik ten Hag",
    "lineup": [
      "#1 D. de Gea",
      "#29 A. Wan-Bissaka",
      "#19 R. Varane",
      "#5 H. Maguire",
      "#23 L. Shaw",
      "#39 S. McTominay",
      "#14 C. Eriksen",
      "#25 J. Sancho",
      "#8 Bruno Fernandes",
      "#10 M. Rashford",
      "#7 Cristiano Ronaldo"
    ],
    "substitutes": [
      "#22 T. Heaton",
      "#36 M. Dalot",
      "#4 V. Lindelof",
      "#6 L. Martinez",
      "#17 F. Fred",
      "#36 A. Elanga",
      "#18 C. Eriksen"
    ]
  },
  "event": {
    "scorer": {
      "name": "Marcus Rashford",
      "team": "Manchester United"
    },
    "assist": {
      "name": "Bruno Fernandes"
    },
    "time": "78'",
    "goalNumber": "2nd Goal",
    "subNumber": "1/3",
    "playerOff": {
      "name": "Cristiano Ronaldo",
      "jerseyNumber": 7,
      "position": "Forward"
    },
    "playerOn": {
      "name": "Anthony Martial",
      "jerseyNumber": 9,
      "position": "Forward"
    }
  },
  "matchScore": "2 - 1",
  "stats": {
    "possession": {
      "home": "58%",
      "away": "42%",
      "homeBar": 58,
      "awayBar": 42
    },
    "shotsOnTarget": { "home": 7, "away": 4 },
    "shotsOffTarget": { "home": 5, "away": 3 },
    "corners": { "home": 8, "away": 4 },
    "fouls": { "home": 12, "away": 15 },
    "yellowCards": { "home": 2, "away": 3 },
    "redCards": { "home": 0, "away": 0 },
    "offsides": { "home": 1, "away": 2 }
  }
}
```
