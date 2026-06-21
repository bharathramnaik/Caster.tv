/**
 * Live score ticker for aggregating scores from multiple sports.
 * Generates realistic mock scores for demo/development.
 */
import { nanoid } from 'nanoid';

/** Mock team data per sport */
const TEAMS = {
  cricket: {
    leagues: ['IPL', 'BBL', 'PSL', 'CPL'],
    teams: {
      IPL: [
        'Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bengaluru',
        'Kolkata Knight Riders', 'Delhi Capitals', 'Rajasthan Royals',
        'Sunrisers Hyderabad', 'Punjab Kings', 'Gujarat Titans', 'Lucknow Super Giants'
      ],
      BBL: ['Sydney Sixers', 'Melbourne Stars', 'Perth Scorchers', 'Brisbane Heat', 'Adelaide Strikers'],
      PSL: ['Karachi Kings', 'Lahore Qalandars', 'Islamabad United', 'Peshawar Zalmi', 'Quetta Gladiators'],
      CPL: ['Trinbago Knight Riders', 'Guyana Amazon Warriors', 'Barbados Royals', 'St Lucia Kings']
    }
  },
  football: {
    leagues: ['EPL', 'La Liga', 'Serie A', 'Bundesliga', 'MLS'],
    teams: {
      EPL: ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United', 'Tottenham', 'Newcastle'],
      'La Liga': ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Real Sociedad'],
      'Serie A': ['AC Milan', 'Inter Milan', 'Juventus', 'Napoli', 'Roma'],
      Bundesliga: ['Bayern Munich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen'],
      MLS: ['Inter Miami', 'LA Galaxy', 'Atlanta United', 'Seattle Sounders']
    }
  },
  basketball: {
    leagues: ['NBA', 'EuroLeague'],
    teams: {
      NBA: [
        'Boston Celtics', 'Denver Nuggets', 'LA Lakers', 'Golden State Warriors',
        'Milwaukee Bucks', 'Philadelphia 76ers', 'Phoenix Suns', 'Miami Heat'
      ],
      EuroLeague: ['Real Madrid', 'Barcelona', 'Olympiacos', 'Fenerbahce', 'CSKA Moscow']
    }
  }
};

/**
 * @class ScoreTicker
 * @description Generates and manages mock live scores for multiple sports.
 */
export class ScoreTicker {
  /**
   * @param {object} config
   * @param {string} [config.sport='cricket'] - Primary sport
   * @param {string[]} [config.leagues] - League filters
   * @param {number} [config.refreshInterval=30] - Refresh interval in seconds
   */
  constructor(config) {
    this.sport = config.sport || 'all';
    this.leagues = config.leagues || [];
    this.refreshInterval = config.refreshInterval || 30;
    this.scores = [];
    this.lastFetch = null;
  }

  /**
   * Fetch/generate live scores.
   * @returns {Promise<object[]>} Current scores
   */
  async fetch() {
    const sports = this.sport === 'all'
      ? ['cricket', 'football', 'basketball']
      : [this.sport];

    this.scores = [];

    for (const sport of sports) {
      const sportData = TEAMS[sport];
      if (!sportData) continue;

      for (const [league, teams] of Object.entries(sportData.teams)) {
        if (this.leagues.length > 0 && !this.leagues.includes(league)) continue;

        const matchCount = sport === 'cricket' ? 3 : sport === 'football' ? 4 : 3;
        for (let i = 0; i < matchCount; i++) {
          this.scores.push(this._generateScore(sport, league, teams));
        }
      }
    }

    this.lastFetch = new Date().toISOString();
    return this.scores;
  }

  /**
   * Generate a single mock score.
   * @private
   * @param {string} sport
   * @param {string} league
   * @param {string[]} teams
   * @returns {object}
   */
  _generateScore(sport, league, teams) {
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const homeTeam = shuffled[0];
    const awayTeam = shuffled[1];
    const now = Date.now();
    const minutesAgo = Math.floor(Math.random() * 180);

    const statuses = ['live', 'live', 'live', 'upcoming', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    if (sport === 'cricket') {
      return this._cricketScore(homeTeam, awayTeam, league, status, now - minutesAgo * 60000);
    }
    if (sport === 'football') {
      return this._footballScore(homeTeam, awayTeam, league, status, now - minutesAgo * 60000);
    }
    return this._basketballScore(homeTeam, awayTeam, league, status, now - minutesAgo * 60000);
  }

  /** @private Generate cricket score */
  _cricketScore(home, away, league, status, startTime) {
    const overs = Math.floor(Math.random() * 20) + 1;
    const balls = Math.floor(Math.random() * 6);
    const wickets = Math.floor(Math.random() * 10);
    const runs = status === 'upcoming' ? 0 : Math.floor(Math.random() * 200) + 50;
    const periods = ['1st Innings', '2nd Innings'];
    const period = Math.random() > 0.5 ? periods[0] : periods[1];

    let statusText;
    if (status === 'upcoming') statusText = 'Upcoming';
    else if (status === 'completed') statusText = 'Completed';
    else statusText = `Live - ${period}`;

    return {
      id: `score_${nanoid(8)}`,
      sport: 'cricket',
      league,
      homeTeam: { name: home, short: this._abbreviate(home) },
      awayTeam: { name: away, short: this._abbreviate(away) },
      score: `${runs}/${wickets} (${overs}.${balls} ov)`,
      scoreHome: `${runs}/${wickets}`,
      scoreAway: status === 'completed' ? `${Math.floor(Math.random() * 200) + 40}/${Math.floor(Math.random() * 10)}` : '',
      status,
      statusText,
      period,
      time: status === 'live' ? `${overs}.${balls} overs` : '',
      startTime: new Date(startTime).toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  /** @private Generate football score */
  _footballScore(home, away, league, status, startTime) {
    const homeGoals = Math.floor(Math.random() * 5);
    const awayGoals = Math.floor(Math.random() * 4);
    const minutes = Math.floor(Math.random() * 90) + 1;

    let statusText;
    if (status === 'upcoming') statusText = 'Upcoming';
    else if (status === 'completed') statusText = 'Full Time';
    else statusText = `${minutes}'`;

    return {
      id: `score_${nanoid(8)}`,
      sport: 'football',
      league,
      homeTeam: { name: home, short: this._abbreviate(home) },
      awayTeam: { name: away, short: this._abbreviate(away) },
      score: `${homeGoals} - ${awayGoals}`,
      scoreHome: String(homeGoals),
      scoreAway: String(awayGoals),
      status,
      statusText,
      period: status === 'live' ? '2nd Half' : '',
      time: status === 'live' ? `${minutes}'` : '',
      startTime: new Date(startTime).toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  /** @private Generate basketball score */
  _basketballScore(home, away, league, status, startTime) {
    const homePoints = Math.floor(Math.random() * 120) + 70;
    const awayPoints = Math.floor(Math.random() * 115) + 65;
    const quarter = Math.floor(Math.random() * 4) + 1;

    let statusText;
    if (status === 'upcoming') statusText = 'Upcoming';
    else if (status === 'completed') statusText = 'Final';
    else statusText = `Q${quarter}`;

    return {
      id: `score_${nanoid(8)}`,
      sport: 'basketball',
      league,
      homeTeam: { name: home, short: this._abbreviate(home) },
      awayTeam: { name: away, short: this._abbreviate(away) },
      score: `${homePoints} - ${awayPoints}`,
      scoreHome: String(homePoints),
      scoreAway: String(awayPoints),
      status,
      statusText,
      period: `Q${quarter}`,
      time: '',
      startTime: new Date(startTime).toISOString(),
      lastUpdated: new Date().toISOString()
    };
  }

  /** @private Create short team abbreviation */
  _abbreviate(name) {
    return name.split(' ').map(w => w[0]).join('').substring(0, 4).toUpperCase();
  }

  /**
   * Get all current scores.
   * @returns {object[]}
   */
  getScores() {
    return [...this.scores];
  }

  /**
   * Get scores filtered by league.
   * @param {string} league
   * @returns {object[]}
   */
  getByLeague(league) {
    return this.scores.filter(s => s.league === league);
  }

  /**
   * Get scores for a specific team.
   * @param {string} team
   * @returns {object[]}
   */
  getByTeam(team) {
    const q = team.toLowerCase();
    return this.scores.filter(s =>
      s.homeTeam.name.toLowerCase().includes(q) ||
      s.awayTeam.name.toLowerCase().includes(q) ||
      s.homeTeam.short.toLowerCase().includes(q) ||
      s.awayTeam.short.toLowerCase().includes(q)
    );
  }

  /**
   * Get scores by sport.
   * @param {string} sport
   * @returns {object[]}
   */
  getBySport(sport) {
    return this.scores.filter(s => s.sport === sport);
  }
}
