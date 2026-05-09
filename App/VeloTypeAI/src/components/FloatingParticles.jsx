import { useEffect, useRef } from 'react';
import './floatingParticles.css';

function rnd(min, max) { return Math.random() * (max - min) + min; }

const TYPES = ['spark', 'small', 'medium', 'large'];

function spawnParticle(W, H, fromBottom = false) {
  const roll = Math.random();
  let type, size, speed, maxAlpha, glowBlur;

  if (roll < 0.18) {
    type = 'spark'; size = rnd(0.5, 1.5); speed = rnd(1.2, 2.8);
    maxAlpha = rnd(0.7, 1); glowBlur = rnd(4, 8);
  } else if (roll < 0.58) {
    type = 'small'; size = rnd(1.5, 3.5); speed = rnd(0.3, 0.75);
    maxAlpha = rnd(0.25, 0.55); glowBlur = rnd(8, 16);
  } else if (roll < 0.82) {
    type = 'medium'; size = rnd(3.5, 7); speed = rnd(0.12, 0.38);
    maxAlpha = rnd(0.08, 0.22); glowBlur = rnd(18, 30);
  } else {
    type = 'large'; size = rnd(7, 12); speed = rnd(0.06, 0.2);
    maxAlpha = rnd(0.03, 0.1); glowBlur = rnd(30, 50);
  }

  const lifeMax = rnd(3, 7) * Math.PI;

  return {
    x: rnd(0, W),
    y: fromBottom ? H + rnd(5, 30) : rnd(-20, H),
    size,
    speed,
    maxAlpha,
    glowBlur,
    type,
    life: fromBottom ? 0 : rnd(0, lifeMax),
    lifeMax,
    drift: (Math.random() - 0.5) * 0.25,
    oscFreq: rnd(0.008, 0.025),
    oscAmp: rnd(0.6, 2.2),
    phase: rnd(0, Math.PI * 2),
    // velocity for mouse interaction
    vx: 0,
    vy: 0,
  };
}

export default function FloatingParticles() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  const stateRef  = useRef({ W: 0, H: 0, particles: [], raf: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const S   = stateRef.current;

    const resize = () => {
      S.W = canvas.width  = window.innerWidth;
      S.H = canvas.height = window.innerHeight;
    };

    const init = () => {
      const COUNT = Math.min(80, Math.max(40, Math.floor(S.W / 28)));
      S.particles = Array.from({ length: COUNT }, () => spawnParticle(S.W, S.H, false));
    };

    const MOUSE_R  = 130;
    const FRICTION = 0.88;

    const draw = () => {
      const { W, H, particles } = S;
      ctx.clearRect(0, 0, W, H);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += 0.011;

        // Bell-curve alpha over lifetime
        const pct   = p.life / p.lifeMax;
        const alpha = p.maxAlpha * Math.max(0, Math.sin(pct * Math.PI));

        // Upward drift + sine oscillation
        p.y -= p.speed + p.vy;
        p.x += p.drift + Math.sin(p.life * p.oscFreq + p.phase) * p.oscAmp * 0.012 + p.vx;

        // Mouse repulsion
        const dx   = p.x - mx;
        const dy   = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_R && dist > 0.5) {
          const force = (1 - dist / MOUSE_R) * 0.012;
          p.vx += (dx / dist) * force * 6;
          p.vy += (dy / dist) * force * 6;
        }
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Respawn when dead or off top
        if (p.y < -p.size * 2 || p.life >= p.lifeMax) {
          particles[i] = spawnParticle(W, H, true);
          continue;
        }

        if (alpha < 0.005) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor  = '#FFD600';
        ctx.shadowBlur   = p.glowBlur;
        ctx.fillStyle    = '#FFD600';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      S.raf = requestAnimationFrame(draw);
    };

    const onMouseMove  = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = ()  => { mouseRef.current = { x: -9999, y: -9999 }; };

    requestAnimationFrame(() => {
      resize();
      init();
      draw();
    });

    window.addEventListener('resize', () => { resize(); });
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(S.raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fp-canvas" />;
}
