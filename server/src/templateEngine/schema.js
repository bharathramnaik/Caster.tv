/**
 * Template JSON Schema Definition
 * Defines the structure for broadcast graphic templates.
 */

export const TEMPLATE_CATEGORIES = [
  'lower-third',
  'full-screen',
  'ticker',
  'scoreboard',
  'player-card'
];

export const ELEMENT_TYPES = ['text', 'image', 'shape', 'score', 'timer', 'ticker'];

export const templateSchema = {
  type: 'object',
  required: ['id', 'name', 'version', 'elements'],
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    version: { type: 'string' },
    category: { type: 'string', enum: TEMPLATE_CATEGORIES },
    sport: { type: 'string' },
    canvas: {
      type: 'object',
      properties: {
        width: { type: 'number', default: 1920 },
        height: { type: 'number', default: 1080 },
        background: { type: 'string' }
      }
    },
    elements: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'position'],
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ELEMENT_TYPES },
          position: {
            type: 'object',
            required: ['x', 'y', 'width', 'height'],
            properties: {
              x: { type: 'number' },
              y: { type: 'number' },
              width: { type: 'number' },
              height: { type: 'number' },
              zIndex: { type: 'number', default: 0 }
            }
          },
          style: { type: 'object' },
          animation: { type: 'object' },
          binding: { type: 'string' },
          condition: { type: 'string' },
          content: { type: 'string' },
          src: { type: 'string' }
        }
      }
    },
    animations: {
      type: 'object',
      properties: {
        enter: { type: 'object' },
        exit: { type: 'object' },
        states: { type: 'object' }
      }
    }
  }
};
