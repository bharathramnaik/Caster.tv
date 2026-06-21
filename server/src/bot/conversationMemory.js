/**
 * ConversationMemory
 * Per-user conversation history and topic tracking.
 */

export class ConversationMemory {
  constructor() {
    /** @type {Map<string, { messages: Array, lastInteraction: number, topicCounts: object }>} */
    this.histories = new Map();
    this.MAX_MESSAGES = 50;
  }

  /**
   * Add a message to user's conversation log.
   * @param {string} userId
   * @param {'user'|'bot'|'system'} role
   * @param {string} content
   */
  addMessage(userId, role, content) {
    if (!this.histories.has(userId)) {
      this.histories.set(userId, { messages: [], lastInteraction: Date.now(), topicCounts: {} });
    }

    const history = this.histories.get(userId);
    history.messages.push({
      role,
      content,
      timestamp: Date.now()
    });

    // Trim to max messages
    if (history.messages.length > this.MAX_MESSAGES) {
      history.messages = history.messages.slice(-this.MAX_MESSAGES);
    }

    history.lastInteraction = Date.now();
  }

  /**
   * Get conversation history for a user.
   * @param {string} userId
   * @param {number} [limit=20]
   * @returns {Array}
   */
  getHistory(userId, limit = 20) {
    const history = this.histories.get(userId);
    if (!history) return [];
    return history.messages.slice(-limit);
  }

  /**
   * Get detected topics for a user.
   * @param {string} userId
   * @returns {object}
   */
  getTopics(userId) {
    const history = this.histories.get(userId);
    return history ? { ...history.topicCounts } : {};
  }

  /**
   * Track a topic from a classified intent.
   * @param {string} userId
   * @param {string} topic
   */
  trackTopic(userId, topic) {
    if (!this.histories.has(userId)) {
      this.histories.set(userId, { messages: [], lastInteraction: Date.now(), topicCounts: {} });
    }
    const history = this.histories.get(userId);
    history.topicCounts[topic] = (history.topicCounts[topic] || 0) + 1;
  }

  /**
   * Detect if user is repeating a request.
   * @param {string} userId
   * @param {string} intent
   * @returns {boolean}
   */
  isRepeatedRequest(userId, intent) {
    const history = this.histories.get(userId);
    if (!history) return false;

    const recentIntents = history.messages
      .filter(m => m.role === 'user')
      .slice(-5)
      .map(m => m.content.toLowerCase());

    // Simple check: if the same intent phrase appears 3+ times in last 5 messages
    const intentLower = intent.toLowerCase();
    return recentIntents.filter(c => c.includes(intentLower)).length >= 3;
  }

  /**
   * Clear conversation history for a user.
   * @param {string} userId
   */
  clearHistory(userId) {
    this.histories.delete(userId);
  }

  /**
   * Get the last user message.
   * @param {string} userId
   * @returns {string|null}
   */
  getLastUserMessage(userId) {
    const history = this.histories.get(userId);
    if (!history) return null;

    for (let i = history.messages.length - 1; i >= 0; i--) {
      if (history.messages[i].role === 'user') {
        return history.messages[i].content;
      }
    }
    return null;
  }
}
