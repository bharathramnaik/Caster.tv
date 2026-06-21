/**
 * Sample Data Generator
 * Provides realistic sample data for previewing broadcast templates across all sports.
 */

export const sampleData = {
  cricket: {
    battingTeam: { name: 'India', short: 'IND', primaryColor: '#0066b3', secondaryColor: '#f7c948' },
    bowlingTeam: { name: 'Australia', short: 'AUS', primaryColor: '#00683a', secondaryColor: '#f7c948' },
    striker: { name: 'Virat Kohli', runs: 45, balls: 32, fours: 4, sixes: 2, strikeRate: 140.63 },
    nonStriker: { name: 'Rohit Sharma', runs: 28, balls: 24, fours: 3, sixes: 1, strikeRate: 116.67 },
    bowler: { name: 'Pat Cummins', wickets: 1, runs: 35, overs: 3, balls: 2, economy: 7.0 },
    innings: { runs: 156, wickets: 3, overs: 12, balls: 2, runRate: 12.83 },
    extras: { wides: 4, noBalls: 1, byes: 2, legByes: 3 },
    fallOfWickets: [
      { score: 45, wicketNum: 1, batter: 'Shubman Gill', overStr: '5.3' },
      { score: 89, wicketNum: 2, batter: 'Suryakumar Yadav', overStr: '8.1' }
    ],
    matchInfo: 'T20 World Cup Semi-Final | 2nd Innings',
    target: 198,
    requiredRunRate: 8.78,
    runsNeeded: 42,
    ballsRemaining: 29,
    isChasing: true
  },

  football: {
    homeTeam: { name: 'Manchester United', short: 'MUN', score: 2, primaryColor: '#DA291C' },
    awayTeam: { name: 'Liverpool', short: 'LIV', score: 1, primaryColor: '#C8102E' },
    matchTime: '67:23',
    half: '2nd Half',
    matchHalf: '2ND HALF',
    possession: { home: 54, away: 46 },
    shots: { home: 12, away: 9 },
    shotsOnTarget: { home: 5, away: 3 },
    corners: { home: 6, away: 4 },
    events: [
      { type: 'goal', player: 'Marcus Rashford', minute: 23, team: 'home' },
      { type: 'goal', player: 'Mohamed Salah', minute: 41, team: 'away' },
      { type: 'goal', player: 'Bruno Fernandes', minute: 58, team: 'home' }
    ]
  },

  basketball: {
    homeTeam: { name: 'Lakers', short: 'LAL', score: 98, primaryColor: '#552583', fouls: 18 },
    awayTeam: { name: 'Celtics', short: 'BOS', score: 102, primaryColor: '#007A33', fouls: 15 },
    quarter: 'Q4',
    gameClock: '5:42',
    shotClock: '14',
    period: '4th Quarter',
    teamFouls: { home: 4, away: 3 },
    timeout: { remaining: { home: 2, away: 3 } }
  },

  tennis: {
    player1: { name: 'Novak Djokovic', sets: [6, 4, 7], games: 5, points: 30, serving: true },
    player2: { name: 'Carlos Alcaraz', sets: [4, 6, 6], games: 4, points: 40, serving: false },
    currentSet: 3,
    server: 1,
    matchInfo: 'Wimbledon Final | Set 3'
  },

  common: {
    person: { name: 'John Smith', title: 'Sports Analyst' },
    headline: 'Breaking: Major Transfer Agreement Reached',
    social: { platform: 'twitter', username: '@sportsnews', followers: '1.2M' },
    sponsor: { name: 'Nike', tagline: 'Just Do It' },
    quote: { text: 'This is the greatest match I have ever seen.', attribution: 'John Doe', source: 'ESPN' },
    countdown: { hours: 0, minutes: 23, seconds: 45, label: 'Time to Kickoff' },
    breakingNews: {
      headline: 'BREAKING: Star player signs record-breaking contract extension',
      source: 'ESPN'
    }
  }
};

/**
 * Map sport category to appropriate sample data.
 */
const SPORT_DATA_MAP = {
  cricket: sampleData.cricket,
  football: sampleData.football,
  basketball: sampleData.basketball,
  tennis: sampleData.tennis,
  generic: sampleData.common
};

/**
 * Map template category to most relevant sample data subset.
 */
const CATEGORY_DATA_MAP = {
  scoreboard: null,
  'lower-third': sampleData.common,
  'full-screen': sampleData.common,
  ticker: sampleData.common,
  'player-card': sampleData.cricket,
  default: sampleData.common
};

/**
 * Get sample data appropriate for a given template.
 * @param {Object} template - The template object
 * @returns {Object} Merged sample data for preview
 */
export function getSampleDataForTemplate(template) {
  const sport = template.sport || 'generic';
  const category = template.category || null;

  const baseSportData = SPORT_DATA_MAP[sport] || SPORT_DATA_MAP.generic;
  const categoryData = CATEGORY_DATA_MAP[category] || CATEGORY_DATA_MAP.default;

  return {
    ...sampleData.common,
    ...baseSportData,
    ...categoryData
  };
}

/**
 * Get sample data for a specific sport.
 * @param {string} sport - Sport name (cricket, football, basketball, tennis)
 * @returns {Object} Sport-specific sample data
 */
export function getSampleDataForSport(sport) {
  return {
    ...sampleData.common,
    ...(SPORT_DATA_MAP[sport] || {})
  };
}

/**
 * Flatten nested objects into dot-notation key-value pairs for form generation.
 * @param {Object} obj - Nested object
 * @param {string} prefix - Current path prefix
 * @returns {Object} Flattened key-value map
 */
export function flattenData(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenData(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

/**
 * Set a nested value in an object using dot-notation path.
 * @param {Object} obj - Target object
 * @param {string} path - Dot-notation path
 * @param {*} value - Value to set
 * @returns {Object} Updated object (new copy)
 */
export function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    current[part] = { ...(current[part] || {}) };
    current = current[part];
  }

  current[parts[parts.length - 1]] = value;
  return result;
}

/**
 * Get all available sport types.
 * @returns {string[]}
 */
export function getAvailableSports() {
  return Object.keys(SPORT_DATA_MAP);
}
