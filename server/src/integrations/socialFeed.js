/**
 * Social media feed integration with mock data for demo/development.
 * Simulates Twitter, Instagram, and YouTube posts.
 */
import { nanoid } from 'nanoid';

/** Mock author pools per platform */
const MOCK_AUTHORS = {
  twitter: [
    { name: 'SportsDaily', handle: '@SportsDaily' },
    { name: 'CricketInsider', handle: '@CricketInsider' },
    { name: 'FanZone', handle: '@FanZoneLive' },
    { name: 'SportsNews', handle: '@SportsNewsHQ' },
    { name: 'MatchCentre', handle: '@MatchCentre' }
  ],
  instagram: [
    { name: 'Sports Pics', handle: '@sportspics' },
    { name: 'Cricket World', handle: '@cricketworld' },
    { name: 'Game Day', handle: '@gamedayshots' },
    { name: 'Live Sports', handle: '@livesports' },
    { name: 'Score Updates', handle: '@scoreupdates' }
  ],
  youtube: [
    { name: 'Sports Network', handle: '@SportsNetwork' },
    { name: 'Live Commentary', handle: '@LiveCommentary' },
    { name: 'Cricket TV', handle: '@CricketTV' },
    { name: 'Sports Central', handle: '@SportsCentral' },
    { name: 'Match Highlights', handle: '@MatchHighlights' }
  ]
};

/** Mock content templates per platform */
const MOCK_CONTENT = {
  twitter: [
    'What a game! The tension is building in the final overs. #Cricket #LiveSports',
    'Incredible catch at point! The fielding has been top class today.',
    'Six over long-on! The crowd goes wild! What a shot!',
    'Tea break. Fascinating contest so far. Who will dominate the final session?',
    'The bowler is on fire! Three wickets in three overs. Game changer!',
    'Great teamwork out there today. Every player stepping up when needed.',
    'Rain delay! Fans waiting patiently for play to resume.',
    'Post-match presentation coming up. Stay tuned for interviews!',
    'Young talent shining bright today. The future of the sport looks promising.',
    'What a partnership! 100 runs for the 3rd wicket stand.'
  ],
  instagram: [
    'Match day vibes at the stadium. Beautiful conditions for cricket today.',
    'Player of the match delivering under pressure. What a performance!',
    'Behind the scenes: Team warming up before the big game.',
    'The crowd creates an electric atmosphere. Love this energy!',
    'Training session. Hard work pays off on game day.',
    'Celebration time! Great team effort to clinch the victory.',
    'Pitch report: Flat batting surface expected. High scoring game ahead.',
    'Fan moment: Meeting the players after the match.',
    'Dramatic finish! Last ball six to win the match!',
    'Pre-match analysis. Key battles to watch today.'
  ],
  youtube: [
    'LIVE: Full match commentary with expert analysis. Join us!',
    'Highlights: Best moments from today\'s thrilling encounter.',
    'Post-match analysis: Breaking down the key turning points.',
    'Player interview: Exclusive chat with the man of the match.',
    'Full replay: Watch every ball from the exciting finish.',
    'Pre-match show: Team news, pitch report, and predictions.',
    'Tactical breakdown: How the winning team outplayed the opposition.',
    'Fan reactions: The best moments from the stands today.',
    'Press conference: Coach and captain address the media.',
    'Stats zone: records broken and milestones achieved today.'
  ]
};

/** Image placeholder URLs for mock data */
const MOCK_IMAGES = [
  'https://picsum.photos/seed/sport1/600/400',
  'https://picsum.photos/seed/sport2/600/400',
  'https://picsum.photos/seed/sport3/600/400',
  'https://picsum.photos/seed/sport4/600/400',
  'https://picsum.photos/seed/sport5/600/400'
];

/**
 * @class SocialFeed
 * @description Generates mock social media posts for demo purposes.
 */
export class SocialFeed {
  /**
   * @param {object} config
   * @param {'twitter'|'instagram'|'youtube'} [config.platform='twitter']
   * @param {string} [config.keywords] - Filter keywords
   * @param {string} [config.accountId] - Account filter
   */
  constructor(config) {
    this.platform = config.platform || 'twitter';
    this.keywords = config.keywords || '';
    this.accountId = config.accountId || '';
    this.posts = [];
  }

  /**
   * Fetch/generate mock social media posts.
   * @returns {Promise<object[]>} Generated posts
   */
  async fetch() {
    const count = 5 + Math.floor(Math.random() * 6); // 5-10 posts
    const authors = MOCK_AUTHORS[this.platform] || MOCK_AUTHORS.twitter;
    const contents = MOCK_CONTENT[this.platform] || MOCK_CONTENT.twitter;

    this.posts = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const author = authors[Math.floor(Math.random() * authors.length)];
      const content = contents[Math.floor(Math.random() * contents.length)];
      const minutesAgo = Math.floor(Math.random() * 120);

      const post = {
        id: `social_${nanoid(8)}`,
        platform: this.platform,
        author: {
          name: author.name,
          handle: author.handle,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.name)}`
        },
        content: this.keywords
          ? this._injectKeywords(content, this.keywords)
          : content,
        timestamp: new Date(now - minutesAgo * 60000).toISOString(),
        likes: Math.floor(Math.random() * 5000),
        shares: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 200),
        image: this.platform !== 'twitter' && Math.random() > 0.4
          ? MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)]
          : null,
        fetchedAt: new Date().toISOString()
      };

      this.posts.push(post);
    }

    // Sort by timestamp (newest first)
    this.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return this.posts;
  }

  /** @private Inject keywords into content for demo */
  _injectKeywords(content, keywords) {
    const tags = keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (tags.length === 0) return content;
    const tag = tags[Math.floor(Math.random() * tags.length)];
    return `${content} #${tag.replace(/\s+/g, '')}`;
  }

  /**
   * Get all generated posts.
   * @returns {object[]}
   */
  getPosts() {
    return [...this.posts];
  }

  /**
   * Get the latest post.
   * @returns {object|null}
   */
  getLatest() {
    return this.posts.length > 0 ? { ...this.posts[0] } : null;
  }

  /**
   * Search posts by query.
   * @param {string} query
   * @returns {object[]}
   */
  search(query) {
    const q = query.toLowerCase();
    return this.posts.filter(post =>
      (post.content && post.content.toLowerCase().includes(q)) ||
      (post.author.name && post.author.name.toLowerCase().includes(q)) ||
      (post.author.handle && post.author.handle.toLowerCase().includes(q))
    );
  }

  /**
   * Generate a single random post for real-time simulation.
   * @returns {object}
   */
  generateSinglePost() {
    const authors = MOCK_AUTHORS[this.platform] || MOCK_AUTHORS.twitter;
    const contents = MOCK_CONTENT[this.platform] || MOCK_CONTENT.twitter;
    const author = authors[Math.floor(Math.random() * authors.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];

    return {
      id: `social_${nanoid(8)}`,
      platform: this.platform,
      author: {
        name: author.name,
        handle: author.handle,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(author.name)}`
      },
      content,
      timestamp: new Date().toISOString(),
      likes: Math.floor(Math.random() * 100),
      shares: Math.floor(Math.random() * 30),
      comments: Math.floor(Math.random() * 15),
      image: this.platform !== 'twitter' && Math.random() > 0.5
        ? MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)]
        : null,
      fetchedAt: new Date().toISOString()
    };
  }
}
