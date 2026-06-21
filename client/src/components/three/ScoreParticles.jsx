import { useEffect, useRef, useCallback } from 'react';

const EVENT_COLORS = {
  '4': ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  '6': ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  'wicket': ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
};

const GRAVITY = 0.06;
const PARTICLE_LIFE = 80;

export default function ScoreParticles({ event = null, x = window.innerWidth / 2, y = window.innerHeight / 2 }) {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animRef = useRef(null);

  const burst = useCallback((bx, by, eventType) => {
    const colors = EVENT_COLORS[eventType] || EVENT_COLORS['4'];
    const count = eventType === '6' ? 60 : eventType === 'wicket' ? 45 : 35;
    const spread = eventType === '6' ? 10 : eventType === 'wicket' ? 7 : 6;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * spread + 2;
      particlesRef.current.push({
        x: bx,
        y: by,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        radius: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: PARTICLE_LIFE,
        maxLife: PARTICLE_LIFE,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
      });
    }
  }, []);

  useEffect(() => {
    if (event) {
      burst(x, y, event);
    }
  }, [event, x, y, burst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += GRAVITY;
        p.vx *= 0.98;
        p.life--;
        p.rotation += p.rotSpeed;

        const alpha = p.life / p.maxLife;
        const scale = 0.5 + alpha * 0.5;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.radius * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const s = p.radius * scale;
          ctx.fillRect(-s, -s / 2, s * 2, s);
        }

        ctx.restore();

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="celebration-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9998,
      }}
    />
  );
}
