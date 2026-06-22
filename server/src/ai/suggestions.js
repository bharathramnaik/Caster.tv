import { getAllPresets, getPresetById } from './presets.js';
import { parseDescription } from './templateGenerator.js';

const SPORT_TEMPLATES = {
  cricket: {
    't20': ['scoreboard', 'lower-third', 'ticker', 'player-card', 'stats'],
    'odi': ['scoreboard', 'lower-third', 'ticker', 'stats', 'timer'],
    'test': ['scoreboard', 'lower-third', 'stats', 'timer'],
    general: ['scoreboard', 'lower-third', 'ticker', 'player-card', 'stats', 'timer']
  },
  football: {
    'premier league': ['scoreboard', 'lower-third', 'ticker', 'player-card'],
    'la liga': ['scoreboard', 'lower-third', 'ticker', 'player-card'],
    general: ['scoreboard', 'lower-third', 'ticker', 'player-card', 'stats']
  },
  basketball: {
    'nba': ['scoreboard', 'lower-third', 'ticker', 'player-card', 'stats'],
    general: ['scoreboard', 'lower-third', 'ticker', 'player-card', 'stats']
  },
  tennis: {
    'grand slam': ['scoreboard', 'lower-third', 'ticker', 'player-card'],
    general: ['scoreboard', 'lower-third', 'ticker', 'player-card']
  },
  generic: {
    general: ['scoreboard', 'lower-third', 'ticker', 'player-card', 'stats']
  }
};

const DESCRIPTION_COMPLETIONS = [
  'cricket scoreboard for India vs Australia',
  'cricket scoreboard for MI vs CSK with blue and yellow colors',
  'football scorebug for Manchester United vs Liverpool',
  'basketball scorebug for Lakers vs Celtics',
  'cricket lower third for player introduction',
  'cricket ticker with breaking news',
  'cricket match timer for innings break',
  'cricket partnership stats panel',
  'cricket batter card with detailed stats',
  'tennis player card for Djokovic',
  'football goal event lower third',
  'basketball player stats card',
  'cricket powerplay stats panel',
  'cricket run rate tracker',
  'cricket target tracker for chasing team',
  'cricket fall of wickets panel',
  'cricket extras summary',
  'cricket commentary lower third',
  'cricket super over announcement',
  'cricket milestone celebration lower third',
  'cricket boundary tracker',
  'cricket drinks break timer',
  'cricket strategic timeout',
  'cricket breaking news ticker',
  'cricket score ticker',
  'cricket sponsor ticker',
  'cricket social media ticker',
  'cricket detailed scoreboard with batters and bowler',
  'cricket gold themed scoreboard',
  'cricket world cup style scoreboard'
];

const SUGGESTION_RULES = {
  scoreboard: [
    'Add team logos or flags for visual identity',
    'Include run rate and required run rate',
    'Add this over display with ball-by-ball colors',
    'Consider adding target/chase info for second innings',
    'Add match status panel (toss, venue, tournament)'
  ],
  'lower-third': [
    'Add player stats (runs, balls, strike rate)',
    'Include team logo or jersey color accent',
    'Add live indicator badge',
    'Consider animation for enter/exit transitions'
  ],
  timer: [
    'Add session or break type label',
    'Include countdown indicator',
    'Consider color coding (green for active, red for warning)'
  ],
  stats: [
    'Add visual comparison bars between teams',
    'Include sparkline or mini charts',
    'Consider split-screen layout for head-to-head'
  ],
  ticker: [
    'Add breaking/live badge for urgency',
    'Consider gradient background for visual appeal',
    'Include icon or emoji for event type'
  ],
  'player-card': [
    'Add player photo placeholder area',
    'Include career stats comparison',
    'Add team color accent bar',
    'Consider adding form/recent performance'
  ]
};

export function getSuggestions(currentTemplate, context = {}) {
  const suggestions = [];
  const sport = context.sport || currentTemplate?.sport || 'cricket';
  const type = context.type || currentTemplate?.category || 'scoreboard';

  const rules = SUGGESTION_RULES[type] || [];
  for (const rule of rules) {
    suggestions.push({ type: 'improvement', text: rule });
  }

  const presets = getAllPresets({ sport });
  const related = presets.filter(p => p.type === type).slice(0, 3);
  for (const preset of related) {
    if (preset.id !== currentTemplate?.id) {
      suggestions.push({ type: 'related', text: `Try "${preset.name}" preset`, presetId: preset.id });
    }
  }

  const otherTypes = Object.keys(SUGGESTION_RULES).filter(t => t !== type);
  for (const t of otherTypes.slice(0, 2)) {
    const presetsOfType = presets.filter(p => p.type === t).slice(0, 1);
    for (const preset of presetsOfType) {
      suggestions.push({ type: 'complement', text: `Add a ${t} overlay`, presetId: preset.id });
    }
  }

  return suggestions;
}

export function getRecommendedTemplates(sport, matchType) {
  const sportConfig = SPORT_TEMPLATES[sport] || SPORT_TEMPLATES.generic;
  const types = sportConfig[matchType] || sportConfig.general || sportConfig.general;

  const recommendations = [];
  for (const type of types) {
    const presets = getAllPresets({ sport, type });
    if (presets.length > 0) {
      recommendations.push({
        type,
        templates: presets.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          description: p.description
        }))
      });
    }
  }

  return recommendations;
}

export function autoComplete(partialDescription) {
  if (!partialDescription || partialDescription.length < 2) {
    return DESCRIPTION_COMPLETIONS.slice(0, 5);
  }

  const lower = partialDescription.toLowerCase();
  const scored = DESCRIPTION_COMPLETIONS.map(completion => {
    const lowerCompletion = completion.toLowerCase();
    let score = 0;
    if (lowerCompletion.startsWith(lower)) score += 100;
    if (lowerCompletion.includes(lower)) score += 50;

    const words = lower.split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && lowerCompletion.includes(word)) score += 10;
    }
    return { completion, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(s => s.completion);
}
