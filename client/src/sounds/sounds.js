export const sounds = {
  click: { type: 'sine', frequency: 800, duration: 0.05 },
  success: { type: 'sine', notes: [523, 659, 784], duration: 0.3 },
  error: { type: 'square', notes: [400, 300], duration: 0.3 },
  notification: { type: 'sine', notes: [880, 1100], duration: 0.2 },
  score: { type: 'sine', notes: [523, 659, 784, 1047], duration: 0.5 },
  wicket: { type: 'sawtooth', notes: [400, 300, 200], duration: 0.5 },
  transition: { type: 'sine', frequency: 600, duration: 0.2, sweep: 1200 },
  start: { type: 'sine', notes: [262, 330, 392, 523], duration: 0.6 },
  stop: { type: 'sine', notes: [523, 392, 330, 262], duration: 0.6 }
};
