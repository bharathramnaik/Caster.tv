/**
 * ResponseGenerator
 * Generates friendly, helpful responses with various formats.
 */

const TEMPLATES = {
  greeting: [
    "Hey there! I'm Spark, your broadcast co-pilot. What can I help you with?",
    "Hi! Spark here. Ready to help with your broadcast!",
    "Hello! I'm Spark. How can I assist you today?"
  ],
  success: [
    "Done! {action} completed successfully.",
    "All set! {action} is done.",
    "{action} completed. You're good to go!"
  ],
  error: [
    "Oops! Something went wrong: {error}",
    "I ran into an issue: {error}",
    "Sorry, I couldn't do that: {error}"
  ],
  unknown: [
    "I'm not sure I understand. Could you rephrase that?",
    "Hmm, I didn't catch that. Can you try again?",
    "I'm not sure what you mean. Type 'help' to see what I can do."
  ],
  thinking: [
    "Let me look into that for you...",
    "Checking on that...",
    "Working on it..."
  ]
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class ResponseGenerator {
  /**
   * Generate a plain text response.
   * @param {string} text
   * @returns {object}
   */
  generateTextResponse(text) {
    return {
      type: 'text',
      content: text,
      timestamp: Date.now()
    };
  }

  /**
   * Generate a card response with title, content, and optional actions.
   * @param {string} title
   * @param {string} content
   * @param {Array<{id: string, label: string, icon?: string}>} [actions]
   * @returns {object}
   */
  generateCardResponse(title, content, actions = []) {
    return {
      type: 'card',
      title,
      content,
      actions,
      timestamp: Date.now()
    };
  }

  /**
   * Generate a step-by-step response.
   * @param {Array<{step: number, title: string, description: string}>} steps
   * @returns {object}
   */
  generateStepResponse(steps) {
    return {
      type: 'step-by-step',
      steps,
      timestamp: Date.now()
    };
  }

  /**
   * Generate a quick actions response.
   * @param {Array<{id: string, label: string, icon?: string}>} actions
   * @returns {object}
   */
  generateQuickActions(actions) {
    return {
      type: 'quick-actions',
      actions,
      timestamp: Date.now()
    };
  }

  /**
   * Generate an error response.
   * @param {string|Error} error
   * @returns {object}
   */
  generateErrorResponse(error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      type: 'error',
      content: pick(TEMPLATES.error).replace('{error}', message),
      timestamp: Date.now()
    };
  }

  /**
   * Generate a success response.
   * @param {string} action
   * @param {object} [result]
   * @returns {object}
   */
  generateSuccessResponse(action, result = null) {
    return {
      type: 'success',
      content: pick(TEMPLATES.success).replace('{action}', action),
      result,
      timestamp: Date.now()
    };
  }

  /**
   * Generate a greeting response.
   * @returns {object}
   */
  generateGreeting() {
    return {
      type: 'text',
      content: pick(TEMPLATES.greeting),
      timestamp: Date.now()
    };
  }

  /**
   * Generate a thinking/processing response.
   * @returns {object}
   */
  generateThinking() {
    return {
      type: 'thinking',
      content: pick(TEMPLATES.thinking),
      timestamp: Date.now()
    };
  }

  /**
   * Generate an unknown intent response.
   * @returns {object}
   */
  generateUnknown() {
    return {
      type: 'text',
      content: pick(TEMPLATES.unknown),
      timestamp: Date.now()
    };
  }

  /**
   * Generate a help response.
   * @param {object} [context]
   * @returns {object}
   */
  generateHelpResponse(context = {}) {
    const sections = [
      {
        title: 'Navigation',
        items: ['Go to dashboard/matches/scenes/templates/streaming/recording/audio/collaboration']
      },
      {
        title: 'Actions',
        items: [
          'Create a match',
          'Start streaming / Stop streaming',
          'Start recording / Stop recording',
          'Switch scene',
          'Create a template',
          'Add a scene'
        ]
      },
      {
        title: 'Queries',
        items: [
          'Show scores / Show matches / Show templates',
          'Show stream health / Show status',
          'List scenes / Get help'
        ]
      },
      {
        title: 'Controls',
        items: [
          'Mute / Unmute audio',
          'Set volume to <level>',
          'Change quality to <preset>'
        ]
      }
    ];

    const content = sections.map(s =>
      `**${s.title}:**\n${s.items.map(i => `• ${i}`).join('\n')}`
    ).join('\n\n');

    return this.generateCardResponse(
      'Spark Help',
      content,
      [
        { id: 'create_match', label: 'Create Match', icon: '🏏' },
        { id: 'start_stream', label: 'Start Stream', icon: '📡' },
        { id: 'start_recording', label: 'Record', icon: '⏺️' }
      ]
    );
  }
}
