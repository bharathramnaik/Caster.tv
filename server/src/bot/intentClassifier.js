/**
 * IntentClassifier
 * Pattern-based intent recognition for natural language commands.
 */

const INTENTS = [
  // Navigation
  {
    name: 'go_to_page',
    patterns: [
      /\b(?:go\s+to|open|show|navigate\s+to|take\s+me\s+to|switch\s+to)\b.*\b(dashboard|matches?|switcher|scenes?|templates?|streaming|recording|audio|data|collaboration|exports?|projects?|settings?)\b/i,
      /\b(?:where|page)\b.*\b(is|for)\b.*(score|match|template|scene|stream|record)/i
    ],
    requiredEntities: ['page'],
    optionalEntities: [],
    examples: ['Go to matches', 'Open the switcher', 'Take me to streaming']
  },
  {
    name: 'open_section',
    patterns: [
      /\b(?:open|show|expand|reveal)\b.*\b(settings?|menu|panel|sidebar|overlay)\b/i
    ],
    requiredEntities: ['section'],
    optionalEntities: [],
    examples: ['Open settings', 'Show the menu']
  },
  {
    name: 'show_overlay',
    patterns: [
      /\b(?:show|display|overlay|put\s+up)\b.*\b(overlay|graphic|lower\s*third|ticker|scorebug|bug)\b/i
    ],
    requiredEntities: ['overlayType'],
    optionalEntities: [],
    examples: ['Show the scoreboard overlay', 'Display lower third']
  },
  {
    name: 'show_scoreboard',
    patterns: [
      /\b(?:show|display|put\s+up|toggle)\b.*\b(scoreboard|score\s*board|score\s*bug|bug)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Show scoreboard', 'Toggle score bug']
  },

  // Action
  {
    name: 'create_match',
    patterns: [
      /\b(?:create|new|start|make|set\s+up)\b.*\b(match|game|fixture|contest)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['teamA', 'teamB', 'matchType', 'venue'],
    examples: ['Create a new match', 'Start a T20 game', 'Set up a match between India and Australia']
  },
  {
    name: 'create_template',
    patterns: [
      /\b(?:create|new|make|build|design)\b.*\b(template|overlay|graphic|lower\s*third|ticker)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['templateType', 'category'],
    examples: ['Create a new template', 'Make a lower third graphic', 'Build a scoreboard template']
  },
  {
    name: 'start_stream',
    patterns: [
      /\b(?:start|begin|go\s+live|go\s+on)\b.*\b(stream|streaming|broadcast|live)\b/i,
      /\b(?:go|start)\b.*\b-live\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['outputType', 'url'],
    examples: ['Start streaming', 'Go live', 'Start RTMP stream']
  },
  {
    name: 'start_recording',
    patterns: [
      /\b(?:start|begin|enable|turn\s+on)\b.*\b(record|recording)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['format', 'quality'],
    examples: ['Start recording', 'Begin recording in MP4', 'Record at high quality']
  },
  {
    name: 'switch_scene',
    patterns: [
      /\b(?:switch|change|swap|transition\s+to)\b.*\b(scene|input|source|camera)\b/i,
      /\b(?:go\s+to|show)\b.*\b(scene|input|camera)\s*(\d+|\w+)/i
    ],
    requiredEntities: [],
    optionalEntities: ['sceneId', 'sceneName', 'transitionType'],
    examples: ['Switch to scene 2', 'Change scene to cameras', 'Transition to overlay']
  },
  {
    name: 'add_scene',
    patterns: [
      /\b(?:create|add|new|make)\b.*\b(scene)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['sceneName'],
    examples: ['Add a new scene', 'Create scene for replay']
  },
  {
    name: 'edit_template',
    patterns: [
      /\b(?:edit|modify|update|change)\b.*\b(template|overlay|graphic)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['templateId', 'templateName'],
    examples: ['Edit the scoreboard template', 'Modify the lower third']
  },
  {
    name: 'export_overlay',
    patterns: [
      /\b(?:export|save|download)\b.*\b(overlay|scene|template|graphic)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['format'],
    examples: ['Export overlay for OBS', 'Download scene as HTML']
  },

  // Query
  {
    name: 'get_status',
    patterns: [
      /\b(?:what|show|get|check|tell\s+me)\b.*\b(status|state|condition|health)\b/i,
      /\bhow\s+(?:is|are)\b.*\b(stream|recording|match|broadcast)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['target'],
    examples: ['What is the stream status?', 'How is the recording?', 'Check stream health']
  },
  {
    name: 'get_scores',
    patterns: [
      /\b(?:what|show|get|tell|give)\b.*\b(scores?|scoreboard|score\s*board|runs|wickets)\b/i,
      /\b(?:live|current)\s+scores?\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['matchId'],
    examples: ['Show scores', 'What are the current scores?', 'Get live scores']
  },
  {
    name: 'get_matches',
    patterns: [
      /\b(?:show|list|get|what|give)\b.*\b(matches?|games?|fixtures?)\b/i,
      /\b(?:all|my)\s+matches?\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Show matches', 'List all games', 'What matches do I have?']
  },
  {
    name: 'get_templates',
    patterns: [
      /\b(?:show|list|get|what|give)\b.*\b(templates?|overlays?|graphics?)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['category'],
    examples: ['Show templates', 'List all overlays', 'What templates are available?']
  },
  {
    name: 'list_scenes',
    patterns: [
      /\b(?:show|list|get|what|give)\b.*\b(scenes?)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Show scenes', 'List all scenes', 'What scenes do I have?']
  },
  {
    name: 'show_help',
    patterns: [
      /\b(?:help|guide|how\s+do\s+I|how\s+to|what\s+can\s+you)\b/i,
      /\b(?:what\s+can|what\s+do|capabilities|features)\b/i,
      /\bhello\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['topic'],
    examples: ['Help', 'How do I create a match?', 'What can you do?', 'Hello']
  },

  // Control
  {
    name: 'toggle_mute',
    patterns: [
      /\b(?:toggle|mute|unmute|turn\s+(?:on|off))\b.*\b(mute|audio|sound|mic|microphone)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['channel'],
    examples: ['Mute the audio', 'Toggle mute', 'Unmute microphone']
  },
  {
    name: 'set_volume',
    patterns: [
      /\b(?:set|change|adjust|increase|decrease|lower|raise)\b.*\b(volume|level|gain)\b/i,
      /\bvolume\s+(?:to\s+)?(\d+)/i
    ],
    requiredEntities: [],
    optionalEntities: ['level', 'channel'],
    examples: ['Set volume to 80', 'Increase volume', 'Lower the audio level']
  },
  {
    name: 'change_quality',
    patterns: [
      /\b(?:change|set|switch)\b.*\b(quality|resolution|bitrate|preset)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['quality'],
    examples: ['Change quality to 1080p', 'Set quality preset to high']
  },
  {
    name: 'toggle_theme',
    patterns: [
      /\b(?:toggle|switch|change)\b.*\b(theme|dark\s*mode|light\s*mode|appearance)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['theme'],
    examples: ['Toggle dark mode', 'Switch to light theme']
  },

  // Collaboration
  {
    name: 'invite_user',
    patterns: [
      /\b(?:invite|add|bring)\b.*\b(user|person|someone|member|collaborator)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['userId', 'email', 'role'],
    examples: ['Invite a user', 'Add a collaborator', 'Bring someone into the project']
  },
  {
    name: 'share_template',
    patterns: [
      /\b(?:share|send|publish)\b.*\b(template|scene|overlay)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['templateId'],
    examples: ['Share this template', 'Publish the overlay']
  },
  {
    name: 'show_activity',
    patterns: [
      /\b(?:show|what|see)\b.*\b(activity|activity\s*log|history|who)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Show activity', 'Who is online?', 'What happened recently?']
  },

  // Streaming
  {
    name: 'start_rtmp',
    patterns: [
      /\b(?:start|begin)\b.*\b(rtmp|rtmp\s*stream)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['url', 'key'],
    examples: ['Start RTMP stream', 'Begin RTMP broadcast']
  },
  {
    name: 'stop_stream',
    patterns: [
      /\b(?:stop|end|kill|terminate|disconnect)\b.*\b(stream|streaming|broadcast|live)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Stop streaming', 'End the broadcast', 'Kill the stream']
  },
  {
    name: 'show_health',
    patterns: [
      /\b(?:show|check|get|what\s+is)\b.*\b(health|bitrate|fps|latency|dropped)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Show stream health', 'Check bitrate', 'What is the latency?']
  },
  {
    name: 'change_bitrate',
    patterns: [
      /\b(?:change|set|adjust|increase|decrease)\b.*\b(bitrate|bit\s*rate)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['bitrate'],
    examples: ['Change bitrate to 6000', 'Increase bitrate', 'Set bitrate higher']
  },

  // Recording
  {
    name: 'stop_record',
    patterns: [
      /\b(?:stop|end|finish|halt)\b.*\b(record|recording)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Stop recording', 'End the recording']
  },
  {
    name: 'pause_record',
    patterns: [
      /\b(?:pause|suspend|hold)\b.*\b(record|recording)\b/i
    ],
    requiredEntities: [],
    optionalEntities: [],
    examples: ['Pause recording', 'Suspend the recording']
  },
  {
    name: 'schedule_record',
    patterns: [
      /\b(?:schedule|plan|book|timer)\b.*\b(record|recording)\b/i
    ],
    requiredEntities: [],
    optionalEntities: ['time', 'date'],
    examples: ['Schedule a recording', 'Book recording for tomorrow']
  }
];

export class IntentClassifier {
  constructor() {
    this.intents = new Map();
    for (const intent of INTENTS) {
      this.intents.set(intent.name, { ...intent });
    }
  }

  /**
   * Classify a user message into an intent.
   * @param {string} message
   * @returns {{ intent: string, confidence: number, entities: object }}
   */
  classify(message) {
    const lowerMsg = message.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;

    for (const [name, intent] of this.intents) {
      let matched = false;
      let patternScore = 0;

      for (const pattern of intent.patterns) {
        if (pattern.test(message)) {
          matched = true;
          patternScore = Math.max(patternScore, 1.0);
        }
      }

      if (matched) {
        const entityScore = this._scoreEntities(lowerMsg, intent);
        const score = patternScore * 0.7 + entityScore * 0.3;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            intent: name,
            confidence: Math.min(score, 1.0),
            entities: this.extractEntities(message, intent)
          };
        }
      }
    }

    if (bestMatch) return bestMatch;

    return {
      intent: 'show_help',
      confidence: 0.3,
      entities: {}
    };
  }

  /**
   * Get an intent definition by name.
   * @param {string} name
   * @returns {object|null}
   */
  getIntent(name) {
    return this.intents.get(name) || null;
  }

  /**
   * Add a new pattern to an existing intent.
   * @param {string} intentName
   * @param {RegExp} pattern
   */
  addPattern(intentName, pattern) {
    const intent = this.intents.get(intentName);
    if (intent) {
      intent.patterns.push(pattern);
    }
  }

  /**
   * Extract entities from a message for a given intent.
   * @param {string} message
   * @param {object} intent
   * @returns {object}
   */
  extractEntities(message, intent) {
    const entities = {};
    const lowerMsg = message.toLowerCase();

    // Page entity
    const pageMatch = lowerMsg.match(/\b(dashboard|matches?|switcher|scenes?|templates?|streaming|recording|audio|data|collaboration|exports?|projects?|settings?)\b/);
    if (pageMatch) {
      const pageMap = {
        dashboard: 'dashboard', match: 'matches', matches: 'matches',
        switcher: 'switcher', scene: 'scenes', scenes: 'scenes',
        template: 'templates', templates: 'templates', streaming: 'streaming',
        recording: 'recording', audio: 'audio', data: 'data',
        collaboration: 'collaboration', export: 'exports', exports: 'exports',
        project: 'projects', projects: 'projects', settings: 'settings'
      };
      entities.page = pageMap[pageMatch[1]] || pageMatch[1];
    }

    // Transition type
    const transMatch = lowerMsg.match(/\b(cut|fade|dissolve|wipe|slide|push|zoom)\b/);
    if (transMatch) entities.transitionType = transMatch[1];

    // Volume level
    const volMatch = lowerMsg.match(/volume\s+(?:to\s+)?(\d+)/);
    if (volMatch) entities.level = parseInt(volMatch[1], 10);

    // Quality
    const qualMatch = lowerMsg.match(/\b(low|medium|high|720p|1080p|4k|ultra)\b/);
    if (qualMatch) entities.quality = qualMatch[1];

    // Format
    const fmtMatch = lowerMsg.match(/\b(mp4|mkv|avi|mov|webm|html|obs|ndi|json)\b/);
    if (fmtMatch) entities.format = fmtMatch[1];

    // Number for scene
    const numMatch = lowerMsg.match(/\b(scene|input|camera|source)\s*(\d+)/);
    if (numMatch) entities.sceneNumber = parseInt(numMatch[2], 10);

    // Mute/unmute
    if (/\b(mute|unmute)\b/.test(lowerMsg)) {
      entities.muteAction = lowerMsg.includes('unmute') ? 'unmute' : 'mute';
    }

    // Increase/decrease
    if (/\b(increase|raise|up|higher)\b/.test(lowerMsg)) entities.direction = 'up';
    if (/\b(decrease|lower|down|less)\b/.test(lowerMsg)) entities.direction = 'down';

    return entities;
  }

  _scoreEntities(message, intent) {
    const required = intent.requiredEntities || [];
    let score = 0.5;

    for (const entity of required) {
      if (entity === 'page' && /\b(dashboard|matches?|switcher|scenes?|templates?|streaming|recording|audio|data|collaboration|exports?|projects?)\b/.test(message)) {
        score += 0.3;
      } else if (entity === 'section' && /\b(settings?|menu|panel|sidebar|overlay)\b/.test(message)) {
        score += 0.3;
      } else if (entity === 'overlayType' && /\b(overlay|graphic|lower\s*third|ticker|scorebug|bug)\b/.test(message)) {
        score += 0.3;
      }
    }

    return Math.min(score, 1.0);
  }
}
