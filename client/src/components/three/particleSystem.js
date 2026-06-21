const DEFAULT_CONFIG = {
  count: 30,
  colors: ['#f7c948', '#3b82f6', '#22c55e', '#ef4444'],
  speed: 3,
  gravity: 0.05,
  fade: true,
  spread: Math.PI * 2,
  size: { min: 2, max: 6 },
  life: 60,
  shape: 'circle',
};

export class ParticleEmitter {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.animFrame = null;
  }

  emit(x, y, config = {}) {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    for (let i = 0; i < cfg.count; i++) {
      const angle = (Math.random() - 0.5) * cfg.spread + Math.PI * 1.5;
      const speed = Math.random() * cfg.speed + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * (cfg.size.max - cfg.size.min) + cfg.size.min,
        color: cfg.colors[Math.floor(Math.random() * cfg.colors.length)],
        life: cfg.life,
        maxLife: cfg.life,
        gravity: cfg.gravity,
        fade: cfg.fade,
        shape: cfg.shape,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
      });
    }
  }

  burst(x, y, count = 50, colors = null) {
    const cfg = {
      count,
      colors: colors || DEFAULT_CONFIG.colors,
      speed: 5,
      gravity: 0.04,
      spread: Math.PI * 2,
      size: { min: 2, max: 8 },
      life: 80,
    };
    this.emit(x, y, cfg);
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.life--;
      p.rotation += p.rotSpeed;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (const p of this.particles) {
      const alpha = p.fade ? p.life / p.maxLife : 1;
      const scale = 0.5 + alpha * 0.5;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'rect') {
        const s = p.radius * scale;
        ctx.fillRect(-s, -s / 2, s * 2, s);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.radius * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  tick() {
    this.update();
    this.render();
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      this.tick();
      this.animFrame = requestAnimationFrame(loop);
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
  }

  clear() {
    this.particles = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  destroy() {
    this.stop();
    this.clear();
  }
}

export default ParticleEmitter;
