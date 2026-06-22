import { nanoid } from 'nanoid';

const SPORT_KEYWORDS = {
  cricket: ['cricket', 'ipl', 'bbl', 'odi', 't20', 'test match', 'bowler', 'batter', 'batsman', 'wicket', 'overs', 'innings', 'run rate', 'scoreboard'],
  football: ['football', 'soccer', 'goal', 'penalty', 'offside', 'premier league', 'la liga', 'champions league', 'match'],
  basketball: ['basketball', 'nba', 'quarter', 'dunk', 'three pointer', 'free throw', 'rebounds', 'assists'],
  tennis: ['tennis', 'grand slam', 'set', 'match point', 'ace', 'break point', 'wimbledon', 'us open', 'australian open'],
  general: ['sports', 'broadcast', 'live', 'stream', 'overlay']
};

const TYPE_KEYWORDS = {
  scoreboard: ['scoreboard', 'score bug', 'scorebug', 'scores', 'score', 'runs', 'wickets', 'points', 'result', 'match'],
  'lower-third': ['lower third', 'lower-third', 'name band', 'nameplate', 'player intro', 'introduction', 'interview', 'presenter', 'commentary', 'toss'],
  timer: ['timer', 'clock', 'countdown', 'time', 'session', 'break', 'timeout', 'drinks'],
  stats: ['stats', 'statistics', 'comparison', 'partnership', 'run rate', 'target', 'extras', 'powerplay', 'fall of wickets', 'figures'],
  ticker: ['ticker', 'scrolling', 'news', 'updates', 'breaking', 'headline', 'sponsor', 'social', 'schedule'],
  'player-card': ['player card', 'player profile', 'batter card', 'bowler card', 'batsman', 'card', 'profile']
};

const TEAM_COLORS = {
  india: { primary: '#1a5e1f', secondary: '#E3B23C' },
  australia: { primary: '#1a3c5e', secondary: '#60a5fa' },
  england: { primary: '#1e3a5f', secondary: '#ef4444' },
  pakistan: { primary: '#14532d', secondary: '#22c55e' },
  southafrica: { primary: '#065f46', secondary: '#10b981' },
  westindies: { primary: '#7c2d12', secondary: '#f97316' },
  newzealand: { primary: '#1e293b', secondary: '#94a3b8' },
  srilanka: { primary: '#1e3a8a', secondary: '#3b82f6' },
  bangladesh: { primary: '#166534', secondary: '#86efac' },
  afghanistan: { primary: '#1e3a5f', secondary: '#60a5fa' },
  mumbai: { primary: '#0078d4', secondary: '#ffd700' },
  chennai: { primary: '#f9ce1d', secondary: '#0081e9' },
  kolkata: { primary: '#3a22c4', secondary: '#f5f5f5' },
  delhi: { primary: '#ef4444', secondary: '#1e40af' },
  kxip: { primary: '#dc2626', secondary: '#e2e8f0' },
  rajasthan: { primary: '#ec4899', secondary: '#2563eb' },
  rcb: { primary: '#dc2626', secondary: '#fbbf24' },
  srh: { primary: '#f97316', secondary: '#1e293b' },
  manchesterunited: { primary: '#da291c', secondary: '#fbe122' },
  liverpool: { primary: '#c8102e', secondary: '#ffffff' },
  chelsea: { primary: '#034694', secondary: '#ffffff' },
  arsenal: { primary: '#ef0107', secondary: '#ffffff' },
  lakers: { primary: '#552583', secondary: '#FDB927' },
  celtics: { primary: '#007A33', secondary: '#BA9653' },
  warriors: { primary: '#1D428A', secondary: '#FFC72C' },
  bull: { primary: '#CE1141', secondary: '#000000' },
  djokovic: { primary: '#1e3a5f', secondary: '#60a5fa' },
  nadal: { primary: '#dc2626', secondary: '#fbbf24' },
  federer: { primary: '#1e293b', secondary: '#60a5fa' }
};

const CANVAS_SIZES = {
  scoreboard: { width: 1920, height: 150 },
  'lower-third': { width: 1920, height: 120 },
  timer: { width: 400, height: 80 },
  stats: { width: 600, height: 300 },
  ticker: { width: 1920, height: 50 },
  'player-card': { width: 1920, height: 150 }
};

function extractSport(text) {
  const lower = text.toLowerCase();
  for (const [sport, keywords] of Object.entries(SPORT_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return sport;
    }
  }
  return 'generic';
}

function extractType(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    scores[type] = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[type]++;
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? sorted[0][0] : 'scoreboard';
}

function extractTeams(text) {
  const lower = text.toLowerCase();
  const teams = [];
  const teamPatterns = [
    /\b(india|ind)\b/i, /\b(australia|aus)\b/i, /\b(england|eng)\b/i,
    /\b(pakistan|pak)\b/i, /\b(south africa|sa)\b/i, /\b(west indies|wi)\b/i,
    /\b(new zealand|nz)\b/i, /\b(sri lanka|sl)\b/i, /\b(bangladesh|ban)\b/i,
    /\b(afghanistan|afg)\b/i, /\b(mumbai|mi)\b/i, /\b(chennai|csk)\b/i,
    /\b(kolkata|kkr)\b/i, /\b(delhi|dc)\b/i, /\b(rajasthan|rr)\b/i,
    /\b(rcb)\b/i, /\b(srh)\b/i, /\b(kxip|pbks)\b/i,
    /\b(man utd|manchester united)\b/i, /\b(liverpool|lfc)\b/i,
    /\b(chelsea)\b/i, /\b(arsenal)\b/i,
    /\b(lakers|lal)\b/i, /\b(celtics|bos)\b/i, /\b(warriors)\b/i, /\b(bulls)\b/i,
    /\b(djokovic)\b/i, /\b(nadal)\b/i, /\b(federer)\b/i
  ];

  const nameMap = {
    'india': 'India', 'ind': 'India',
    'australia': 'Australia', 'aus': 'Australia',
    'england': 'England', 'eng': 'England',
    'pakistan': 'Pakistan', 'pak': 'Pakistan',
    'south africa': 'South Africa', 'sa': 'South Africa',
    'west indies': 'West Indies', 'wi': 'West Indies',
    'new zealand': 'New Zealand', 'nz': 'New Zealand',
    'sri lanka': 'Sri Lanka', 'sl': 'Sri Lanka',
    'bangladesh': 'Bangladesh', 'ban': 'Bangladesh',
    'afghanistan': 'Afghanistan', 'afg': 'Afghanistan',
    'mumbai': 'Mumbai Indians', 'mi': 'Mumbai Indians',
    'chennai': 'Chennai Super Kings', 'csk': 'Chennai Super Kings',
    'kolkata': 'Kolkata Knight Riders', 'kkr': 'Kolkata Knight Riders',
    'delhi': 'Delhi Capitals', 'dc': 'Delhi Capitals',
    'rajasthan': 'Rajasthan Royals', 'rr': 'Rajasthan Royals',
    'rcb': 'Royal Challengers Bangalore',
    'srh': 'Sunrisers Hyderabad',
    'kxip': 'Kings XI Punjab', 'pbks': 'Punjab Kings',
    'man utd': 'Manchester United', 'manchester united': 'Manchester United',
    'liverpool': 'Liverpool', 'lfc': 'Liverpool',
    'chelsea': 'Chelsea', 'arsenal': 'Arsenal',
    'lakers': 'LA Lakers', 'lal': 'LA Lakers',
    'celtics': 'Boston Celtics', 'bos': 'Boston Celtics',
    'warriors': 'Golden State Warriors',
    'bulls': 'Chicago Bulls',
    'djokovic': 'Novak Djokovic', 'nadal': 'Rafael Nadal', 'federer': 'Roger Federer'
  };

  const abbrMap = {
    'India': 'IND', 'Australia': 'AUS', 'England': 'ENG',
    'Pakistan': 'PAK', 'South Africa': 'SA', 'West Indies': 'WI',
    'New Zealand': 'NZ', 'Sri Lanka': 'SL', 'Bangladesh': 'BAN',
    'Afghanistan': 'AFG', 'Mumbai Indians': 'MI',
    'Chennai Super Kings': 'CSK', 'Kolkata Knight Riders': 'KKR',
    'Delhi Capitals': 'DC', 'Rajasthan Royals': 'RR',
    'Royal Challengers Bangalore': 'RCB', 'Sunrisers Hyderabad': 'SRH',
    'Kings XI Punjab': 'KXIP', 'Punjab Kings': 'PBKS',
    'Manchester United': 'MU', 'Liverpool': 'LIV',
    'Chelsea': 'CHE', 'Arsenal': 'ARS',
    'LA Lakers': 'LAL', 'Boston Celtics': 'BOS',
    'Golden State Warriors': 'GSW', 'Chicago Bulls': 'CHI',
    'Novak Djokovic': 'ND', 'Rafael Nadal': 'RN', 'Roger Federer': 'RF'
  };

  for (const pattern of teamPatterns) {
    const match = lower.match(pattern);
    if (match) {
      const fullName = nameMap[match[1].toLowerCase()] || match[1];
      if (!teams.find(t => t.name === fullName)) {
        teams.push({
          name: fullName,
          short: abbrMap[fullName] || fullName.substring(0, 3).toUpperCase(),
          colors: TEAM_COLORS[match[1].toLowerCase()] || { primary: '#1e293b', secondary: '#94a3b8' }
        });
      }
    }
  }

  return teams.slice(0, 2);
}

function extractColors(text) {
  const lower = text.toLowerCase();
  const colorMap = {
    blue: '#3b82f6', red: '#ef4444', green: '#22c55e', yellow: '#fbbf24',
    orange: '#f97316', purple: '#8b5cf6', pink: '#ec4899', white: '#ffffff',
    black: '#000000', gold: '#E3B23C', navy: '#1e3a5f', sky: '#0ea5e9',
    maroon: '#991b1b', teal: '#06b6d4', lime: '#84cc16', indigo: '#6366f1'
  };
  const colors = [];
  for (const [name, hex] of Object.entries(colorMap)) {
    if (lower.includes(name)) colors.push(hex);
  }
  return colors;
}

function generateScoreboardTemplate(sport, teams, colors) {
  const teamA = teams[0] || { name: 'TEAM A', short: 'TMA', colors: { primary: '#fbbf24', secondary: '#1e293b' } };
  const teamB = teams[1] || { name: 'TEAM B', short: 'TMB', colors: { primary: '#60a5fa', secondary: '#1e293b' } };
  const primaryColor = colors[0] || teamA.colors.primary;
  const secondaryColor = colors[1] || teamB.colors.primary;
  const h = CANVAS_SIZES.scoreboard.height;

  return {
    id: `generated_${nanoid(8)}`,
    name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Scoreboard - ${teamA.short} vs ${teamB.short}`,
    category: 'scoreboard',
    sport,
    canvas: { ...CANVAS_SIZES.scoreboard },
    elements: [
      { id: 'bg', type: 'shape', position: { x: 0, y: 0, width: 1920, height: h }, style: { backgroundColor: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'accent', type: 'shape', position: { x: 0, y: h - 4, width: 1920, height: 4 }, style: { backgroundColor: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})` }, content: '' },
      { id: 'teamA-flag', type: 'shape', position: { x: 20, y: 15, width: 50, height: 120 }, style: { backgroundColor: primaryColor, borderRadius: 10 }, content: '' },
      { id: 'teamA-abbr', type: 'text', position: { x: 20, y: 45, width: 50, height: 50 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: teamA.short },
      { id: 'teamA-name', type: 'text', position: { x: 90, y: 15, width: 350, height: 35 }, style: { color: primaryColor, fontSize: 20, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 2 }, content: teamA.name },
      { id: 'teamA-score', type: 'text', position: { x: 90, y: 45, width: 300, height: 70 }, style: { color: '#ffffff', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 15px rgba(0,0,0,0.5)' }, content: '0/0' },
      { id: 'teamA-overs', type: 'text', position: { x: 90, y: 115, width: 200, height: 25 }, style: { color: '#64748b', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: '(0.0 ov)' },
      { id: 'divider1', type: 'shape', position: { x: 500, y: 20, width: 2, height: 110 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'vs', type: 'text', position: { x: 600, y: 25, width: 720, height: 100 }, style: { color: '#475569', fontSize: 48, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center', letterSpacing: 4 }, content: 'VS' },
      { id: 'divider2', type: 'shape', position: { x: 1420, y: 20, width: 2, height: 110 }, style: { backgroundColor: '#334155', borderRadius: 1 }, content: '' },
      { id: 'teamB-flag', type: 'shape', position: { x: 1850, y: 15, width: 50, height: 120 }, style: { backgroundColor: secondaryColor, borderRadius: 10 }, content: '' },
      { id: 'teamB-abbr', type: 'text', position: { x: 1850, y: 45, width: 50, height: 50 }, style: { color: '#ffffff', fontSize: 22, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: teamB.short },
      { id: 'teamB-name', type: 'text', position: { x: 1100, y: 15, width: 350, height: 35 }, style: { color: secondaryColor, fontSize: 20, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'right' }, content: teamB.name },
      { id: 'teamB-score', type: 'text', position: { x: 1100, y: 45, width: 350, height: 70 }, style: { color: '#ffffff', fontSize: 64, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 4px 15px rgba(0,0,0,0.5)', textAlign: 'right' }, content: '0/0' },
      { id: 'teamB-status', type: 'text', position: { x: 1100, y: 115, width: 350, height: 25 }, style: { color: '#64748b', fontSize: 14, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1, textAlign: 'right' }, content: 'Yet to bat' }
    ]
  };
}

function generateLowerThirdTemplate(sport, teams, colors, text) {
  const teamA = teams[0] || { name: 'TEAM A', colors: { primary: '#E3B23C' } };
  const primaryColor = colors[0] || teamA.colors.primary;
  const h = CANVAS_SIZES['lower-third'].height;
  const isPlayer = text.toLowerCase().includes('player') || text.toLowerCase().includes('batsman') || text.toLowerCase().includes('bowler');

  return {
    id: `generated_${nanoid(8)}`,
    name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Lower Third`,
    category: 'lower-third',
    sport,
    canvas: { width: 1920, height: h },
    elements: [
      { id: 'bg', type: 'shape', position: { x: 0, y: 0, width: 1920, height: h }, style: { backgroundColor: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}88 100%)`, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'accent-bar', type: 'shape', position: { x: 0, y: 0, width: 8, height: h }, style: { backgroundColor: '#ffffff' }, content: '' },
      { id: 'role-label', type: 'text', position: { x: 40, y: 15, width: 400, height: 25 }, style: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 4 }, content: isPlayer ? 'PLAYER' : 'PRESENTER' },
      { id: 'player-name', type: 'text', position: { x: 40, y: 40, width: 600, height: 50 }, style: { color: '#ffffff', fontSize: 40, fontWeight: '900', fontFamily: 'Teko', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }, content: 'PLAYER NAME' },
      { id: 'player-info', type: 'text', position: { x: 40, y: 85, width: 400, height: 25 }, style: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500', fontFamily: 'Outfit', letterSpacing: 1 }, content: `${teamA.name} · ${sport.charAt(0).toUpperCase() + sport.slice(1)}` }
    ]
  };
}

function generateTimerTemplate(sport) {
  return {
    id: `generated_${nanoid(8)}`,
    name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Timer`,
    category: 'timer',
    sport,
    canvas: { width: 400, height: 80 },
    elements: [
      { id: 'bg', type: 'shape', position: { x: 0, y: 0, width: 400, height: 80 }, style: { backgroundColor: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }, content: '' },
      { id: 'timer-label', type: 'text', position: { x: 15, y: 8, width: 150, height: 25 }, style: { color: '#94a3b8', fontSize: 11, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2 }, content: 'MATCH TIME' },
      { id: 'timer-value', type: 'text', position: { x: 15, y: 30, width: 200, height: 45 }, style: { color: '#22c55e', fontSize: 36, fontWeight: '900', fontFamily: 'Teko' }, content: '00:00:00' },
      { id: 'session', type: 'text', position: { x: 250, y: 15, width: 130, height: 50 }, style: { color: '#64748b', fontSize: 14, fontWeight: '600', fontFamily: 'Outfit', textAlign: 'right' }, content: 'Session 1' }
    ]
  };
}

function generateStatsTemplate(sport) {
  return {
    id: `generated_${nanoid(8)}`,
    name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Stats Panel`,
    category: 'stats',
    sport,
    canvas: { width: 600, height: 300 },
    elements: [
      { id: 'bg', type: 'shape', position: { x: 0, y: 0, width: 600, height: 300 }, style: { backgroundColor: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }, content: '' },
      { id: 'header', type: 'shape', position: { x: 0, y: 0, width: 600, height: 50 }, style: { backgroundColor: 'linear-gradient(135deg, #1e3a5f 0%, #0f2744 100%)', borderRadius: '16px 16px 0 0' }, content: '' },
      { id: 'title', type: 'text', position: { x: 20, y: 12, width: 300, height: 30 }, style: { color: '#E3B23C', fontSize: 16, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'STATISTICS' },
      { id: 'stat1-label', type: 'text', position: { x: 350, y: 60, width: 100, height: 25 }, style: { color: '#94a3b8', fontSize: 11, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'METRIC' },
      { id: 'stat1-a', type: 'text', position: { x: 50, y: 60, width: 200, height: 35 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '900', fontFamily: 'Teko', textAlign: 'right' }, content: '0' },
      { id: 'stat1-b', type: 'text', position: { x: 460, y: 60, width: 200, height: 35 }, style: { color: '#ffffff', fontSize: 28, fontWeight: '900', fontFamily: 'Teko' }, content: '0' }
    ]
  };
}

function generateTickerTemplate(sport) {
  return {
    id: `generated_${nanoid(8)}`,
    name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Ticker`,
    category: 'ticker',
    sport,
    canvas: { width: 1920, height: 50 },
    elements: [
      { id: 'bg', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 50 }, style: { backgroundColor: 'rgba(0,0,0,0.9)' }, content: '' },
      { id: 'accent', type: 'shape', position: { x: 0, y: 46, width: 1920, height: 4 }, style: { backgroundColor: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)' }, content: '' },
      { id: 'ticker-text', type: 'text', position: { x: 90, y: 10, width: 1800, height: 30 }, style: { color: '#ffffff', fontSize: 18, fontWeight: '600', fontFamily: 'Outfit' }, content: 'Ticker text goes here' }
    ]
  };
}

function generatePlayerCardTemplate(sport, teams) {
  const teamA = teams[0] || { name: 'TEAM A', colors: { primary: '#1a5e1f' } };
  return {
    id: `generated_${nanoid(8)}`,
    name: `${sport.charAt(0).toUpperCase() + sport.slice(1)} Player Card`,
    category: 'player-card',
    sport,
    canvas: { width: 1920, height: 150 },
    elements: [
      { id: 'bg', type: 'shape', position: { x: 0, y: 0, width: 1920, height: 150 }, style: { backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }, content: '' },
      { id: 'team-bg', type: 'shape', position: { x: 0, y: 0, width: 280, height: 150 }, style: { backgroundColor: teamA.colors.primary, borderRadius: '0 16px 16px 0' }, content: '' },
      { id: 'role', type: 'text', position: { x: 145, y: 30, width: 120, height: 25 }, style: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700', fontFamily: 'Outfit', letterSpacing: 3 }, content: 'PLAYER' },
      { id: 'player-name', type: 'text', position: { x: 145, y: 55, width: 120, height: 50 }, style: { color: '#ffffff', fontSize: 32, fontWeight: '900', fontFamily: 'Teko' }, content: 'NAME' },
      { id: 'stat-label', type: 'text', position: { x: 320, y: 20, width: 160, height: 25 }, style: { color: '#E3B23C', fontSize: 12, fontWeight: '600', fontFamily: 'Outfit', letterSpacing: 2, textAlign: 'center' }, content: 'STATS' },
      { id: 'stat-value', type: 'text', position: { x: 320, y: 40, width: 160, height: 70 }, style: { color: '#ffffff', fontSize: 56, fontWeight: '900', fontFamily: 'Teko', textAlign: 'center' }, content: '0' }
    ]
  };
}

export function generateTemplate(description) {
  const sport = extractSport(description);
  const type = extractType(description);
  const teams = extractTeams(description);
  const colors = extractColors(description);

  let template;
  switch (type) {
    case 'scoreboard': template = generateScoreboardTemplate(sport, teams, colors); break;
    case 'lower-third': template = generateLowerThirdTemplate(sport, teams, colors, description); break;
    case 'timer': template = generateTimerTemplate(sport); break;
    case 'stats': template = generateStatsTemplate(sport); break;
    case 'ticker': template = generateTickerTemplate(sport); break;
    case 'player-card': template = generatePlayerCardTemplate(sport, teams); break;
    default: template = generateScoreboardTemplate(sport, teams, colors);
  }

  return {
    template,
    metadata: {
      sport,
      type,
      teams: teams.map(t => t.name),
      colors,
      description
    }
  };
}

export function parseDescription(text) {
  return {
    sport: extractSport(text),
    type: extractType(text),
    teams: extractTeams(text),
    colors: extractColors(text)
  };
}
