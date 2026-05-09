import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────
//  Data
// ─────────────────────────────────────────────

const TYPING_DEMOS = [
  'the quick brown fox jumps...',
  'AI detects your mistakes...',
  'personalized paragraphs generated...',
  'type smarter every session...',
];

const FEATURES = [
  {
    icon: '🧠',
    title: 'AI Mistake Detection',
    desc: 'Advanced neural algorithms analyze every keystroke to pinpoint exactly where you struggle most — down to individual characters.',
  },
  {
    icon: '✦',
    title: 'Personalized Content',
    desc: 'Gemini AI generates custom paragraphs targeting your specific weak characters and patterns. No generic drills.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Analytics',
    desc: 'WPM, accuracy, and error rates update live as you type — instant feedback, zero lag, maximum insight.',
  },
  {
    icon: '📈',
    title: 'Speed Tracking',
    desc: 'Charts show your improvement curve across every session. Watch your WPM climb over days and weeks.',
  },
  {
    icon: '🔄',
    title: 'Adaptive Learning',
    desc: 'The more you practice, the smarter the AI gets. It builds a personal mistake profile unique to you.',
  },
  {
    icon: '🎯',
    title: 'Progress Dashboard',
    desc: 'Full dashboard with mistake heatmaps, daily goals, streak tracking, and bi-daily assessments.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Type a Paragraph',
    icon: '⌨',
    desc: 'Start any typing test. Our system watches every keystroke in real time, logging every error and timing every word.',
  },
  {
    num: '02',
    title: 'AI Detects Mistakes',
    icon: '🔍',
    desc: 'The AI identifies your specific weak characters, repeating patterns, and error types — instantly building your profile.',
  },
  {
    num: '03',
    title: 'Custom Content Generated',
    icon: '✦',
    desc: 'Gemini AI crafts a brand-new paragraph targeting exactly your mistakes — forcing deliberate, focused practice.',
  },
];

const KB_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];
const HOT_KEYS = new Set(['A','I','T','H','E','R','S']);

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────

function FeatureCard({ icon, title, desc, index }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 14).toFixed(1)}deg) rotateY(${(x * 14).toFixed(1)}deg) translateZ(10px)`;
    el.style.setProperty('--gx', `${((e.clientX - r.left) / r.width * 100).toFixed(0)}%`);
    el.style.setProperty('--gy', `${((e.clientY - r.top) / r.height * 100).toFixed(0)}%`);
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }, []);

  return (
    <div
      ref={ref}
      className="lp-feat-card lp-reveal"
      style={{ animationDelay: `${index * 90}ms` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="lp-feat-spot" />
      <div className="lp-feat-icon">{icon}</div>
      <h3 className="lp-feat-title">{title}</h3>
      <p className="lp-feat-desc">{desc}</p>
    </div>
  );
}

function DashboardPreview() {
  const bars = [38, 45, 42, 54, 51, 63, 58, 70, 67, 78, 82, 85];
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setAnimated(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="lp-dash-preview">
      {/* Top stat row */}
      <div className="lp-dash-stats">
        {[
          { label: 'WPM',      val: '78',   color: '#FFD600' },
          { label: 'Accuracy', val: '96%',  color: '#FFD600' },
          { label: 'Errors',   val: '3',    color: '#ca4754' },
          { label: 'Streak',   val: '12d',  color: '#a78bfa' },
        ].map((s, i) => (
          <div key={i} className="lp-dash-stat">
            <span className="lp-dash-stat-val" style={{ color: s.color }}>{s.val}</span>
            <span className="lp-dash-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="lp-dash-chart-wrap">
        <div className="lp-dash-chart-label">WPM Progress — last 12 sessions</div>
        <div className="lp-dash-bars">
          {bars.map((h, i) => (
            <div key={i} className="lp-dash-bar-col">
              <div
                className="lp-dash-bar"
                style={{
                  height: animated ? `${h}%` : '0%',
                  transitionDelay: `${i * 60}ms`,
                  background: h >= 75
                    ? 'linear-gradient(180deg,#FFD600,#cc9900)'
                    : 'linear-gradient(180deg,rgba(255,214,0,0.55),rgba(255,214,0,0.2))',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Mistake heatmap chips */}
      <div className="lp-dash-heat-row">
        <span className="lp-dash-heat-label">Mistake heatmap</span>
        <div className="lp-dash-chips">
          {[['t',13,'#ca4754'],['h',8,'#d96a74'],['e',6,'#e08a90'],['r',3,'#ddd'],['s',2,'#aaa'],['i',1,'#888']].map(([ch,n,col],i)=>(
            <div key={i} className="lp-dash-chip" style={{ borderColor: col, color: col }}>
              <span>{ch}</span>
              <span className="lp-dash-chip-n">×{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI suggestion */}
      <div className="lp-dash-ai-tip">
        <span className="lp-dash-ai-icon">✦</span>
        <div>
          <div className="lp-dash-ai-title">AI Suggestion</div>
          <div className="lp-dash-ai-text">
            You consistently miss "t", "h", "e" — a targeted paragraph has been generated. Practice it 3× to build muscle memory.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Main Landing Component
// ─────────────────────────────────────────────

export default function Landing() {
  const heroCanvasRef   = useRef(null);
  const neuralCanvasRef = useRef(null);

  // Typing demo state
  const [typingText, setTypingText]   = useState('');
  const [demoIdx, setDemoIdx]         = useState(0);
  const [charIdx, setCharIdx]         = useState(0);
  const [deleting, setDeleting]       = useState(false);

  // Counter animation
  const [counters, setCounters]         = useState({ wpm: 0, acc: 0, sessions: 0 });
  const [countStarted, setCountStarted] = useState(false);
  const counterRef = useRef(null);

  // ── Particle canvas ──
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const mkParticle = (w, h) => ({
      x:     Math.random() * w,
      y:     Math.random() * h + h,
      size:  Math.random() * 2 + 0.5,
      speed: Math.random() * 0.8 + 0.3,
      drift: (Math.random() - 0.5) * 0.4,
      life:  Math.random() * Math.PI,
    });

    let particles = [];
    const init = () => {
      const { width: w, height: h } = canvas;
      particles = Array.from({ length: 120 }, () => {
        const p = mkParticle(w, h);
        p.y = Math.random() * h; // spread across screen on first init
        return p;
      });
    };

    const resize = () => {
      canvas.width  = canvas.parentElement?.clientWidth  || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      init();
    };

    let raf;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.life += 0.016;
        const alpha = Math.max(0, Math.sin(p.life) * 0.85);
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10 || (p.life > Math.PI && alpha <= 0.01)) {
          Object.assign(p, mkParticle(w, h));
        }
        if (alpha > 0) {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#FFD600';
          ctx.shadowColor = '#FFD600';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      raf = requestAnimationFrame(draw);
    };

    // Defer initial layout by one frame so the hero section has its final size
    const initRaf = requestAnimationFrame(() => {
      resize();
      draw();
    });

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // ── Typing demo ──
  useEffect(() => {
    const target = TYPING_DEMOS[demoIdx];
    const delay  = deleting ? 38 : charIdx === 0 ? 400 : 75;
    const t = setTimeout(() => {
      if (!deleting) {
        if (charIdx < target.length) {
          setTypingText(target.slice(0, charIdx + 1));
          setCharIdx(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), 1600);
        }
      } else {
        if (charIdx > 0) {
          setTypingText(target.slice(0, charIdx - 1));
          setCharIdx(c => c - 1);
        } else {
          setDeleting(false);
          setDemoIdx(i => (i + 1) % TYPING_DEMOS.length);
        }
      }
    }, delay);
    return () => clearTimeout(t);
  }, [charIdx, deleting, demoIdx]);

  // ── Counter animation ──
  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !countStarted) {
        setCountStarted(true);
        const targets = { wpm: 142, acc: 99, sessions: 50000 };
        const dur = 2200;
        const start = Date.now();
        const tick = () => {
          const pct  = Math.min((Date.now() - start) / dur, 1);
          const ease = 1 - Math.pow(1 - pct, 3);
          setCounters({
            wpm:      Math.round(ease * targets.wpm),
            acc:      Math.round(ease * targets.acc),
            sessions: Math.round(ease * targets.sessions),
          });
          if (pct < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [countStarted]);

  // ── Neural-network canvas ──
  useEffect(() => {
    const canvas = neuralCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const LAYERS = [3, 5, 6, 5, 3];
    let nodes = [];

    const buildNodes = () => {
      nodes = [];
      const { width: w, height: h } = canvas;
      LAYERS.forEach((count, li) => {
        const x = ((li + 1) / (LAYERS.length + 1)) * w;
        for (let ni = 0; ni < count; ni++) {
          const y = ((ni + 1) / (count + 1)) * h;
          nodes.push({ x, y, layer: li, phase: Math.random() * Math.PI * 2 });
        }
      });
    };
    buildNodes();

    let raf, t = 0;
    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      t += 0.025;

      // Connections
      const groups = LAYERS.map((_, li) => nodes.filter(n => n.layer === li));
      groups.forEach((layer, li) => {
        if (li >= groups.length - 1) return;
        layer.forEach(from => {
          groups[li + 1].forEach(to => {
            const alpha = 0.06 + 0.12 * Math.abs(Math.sin(t + from.phase));
            ctx.strokeStyle = `rgba(255,214,0,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
          });
        });
      });

      // Nodes
      nodes.forEach(n => {
        const pulse = 0.5 + 0.5 * Math.sin(t + n.phase);
        const r     = 4 + pulse * 3.5;
        const alpha = 0.35 + pulse * 0.65;

        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 4);
        g.addColorStop(0, `rgba(255,214,0,${alpha * 0.4})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,214,0,${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    const handleResize = () => { resize(); buildNodes(); };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', handleResize); };
  }, []);

  // ── Scroll reveal ──
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('lp-in'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ── Mouse-follow glow on hero ──
  const heroRef = useRef(null);
  const onHeroMove = useCallback((e) => {
    if (!heroRef.current) return;
    const r = heroRef.current.getBoundingClientRect();
    heroRef.current.style.setProperty('--hx', `${e.clientX - r.left}px`);
    heroRef.current.style.setProperty('--hy', `${e.clientY - r.top}px`);
  }, []);

  return (
    <>
      <style>{LP_STYLES}</style>

      {/* ── HERO ── */}
      <section className="lp-hero" ref={heroRef} onMouseMove={onHeroMove}>
        <canvas ref={heroCanvasRef} className="lp-hero-canvas" />
        <div className="lp-hero-mouse-glow" />

        <div className="lp-hero-inner">
          <div className="lp-badge">✦ Powered by Gemini AI</div>

          <h1 className="lp-headline">
            Type Smarter<br />with <span className="lp-y">AI</span>
          </h1>

          <p className="lp-hero-sub">
            VelotypeAI analyzes your typing mistakes and generates
            personalized practice paragraphs using AI — so every session
            makes you measurably better.
          </p>

          {/* Typing demo */}
          <div className="lp-typing-wrap">
            <span className="lp-typing-prompt">try&nbsp;</span>
            <span className="lp-typing-text">{typingText}</span>
            <span className="lp-cursor">|</span>
          </div>

          <div className="lp-cta-row">
            <Link to="/type" className="lp-btn-primary">
              Start Typing <span className="lp-arr">→</span>
            </Link>
            <Link to="/dashboard" className="lp-btn-ghost">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* 3D floating keyboard */}
        <div className="lp-kb-stage">
          <div className="lp-kb">
            {KB_ROWS.map((row, ri) => (
              <div key={ri} className="lp-kb-row">
                {row.map((k, ki) => (
                  <div
                    key={ki}
                    className={`lp-key${HOT_KEYS.has(k) ? ' lp-key-hot' : ''}`}
                    style={{ animationDelay: `${(ri * row.length + ki) * 40}ms` }}
                  >
                    {k}
                  </div>
                ))}
              </div>
            ))}
            <div className="lp-kb-row">
              <div className="lp-key lp-key-space" />
            </div>
          </div>
        </div>

        {/* decorative rings */}
        <div className="lp-ring lp-ring-1" />
        <div className="lp-ring lp-ring-2" />
        <div className="lp-ring lp-ring-3" />
      </section>

      {/* ── STAT BAR ── */}
      <div ref={counterRef} className="lp-stat-bar lp-reveal">
        {[
          { val: counters.wpm,                 suf: ' WPM',  label: 'Best recorded speed'       },
          { val: counters.acc,                 suf: '%',     label: 'Average user accuracy'      },
          { val: counters.sessions.toLocaleString(), suf: '+', label: 'Practice sessions served' },
        ].map((s, i) => (
          <div key={i} className="lp-stat-item">
            <div className="lp-stat-val">{s.val}<span className="lp-stat-suf">{s.suf}</span></div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <div className="lp-sec-head lp-reveal">
          <span className="lp-tag">Features</span>
          <h2 className="lp-sec-title">Everything you need to level up</h2>
          <p className="lp-sec-sub">Six powerful tools, one seamless AI-powered platform.</p>
        </div>
        <div className="lp-feat-grid">
          {FEATURES.map((f, i) => <FeatureCard key={i} {...f} index={i} />)}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section lp-hiw-bg">
        <div className="lp-sec-head lp-reveal">
          <span className="lp-tag">How it works</span>
          <h2 className="lp-sec-title">Three steps to mastery</h2>
        </div>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="lp-step lp-reveal" style={{ animationDelay: `${i * 130}ms` }}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-icon">{s.icon}</div>
                <h3 className="lp-step-title">{s.title}</h3>
                <p className="lp-step-desc">{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div className="lp-step-arrow lp-reveal">→</div>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── ANALYTICS PREVIEW ── */}
      <section className="lp-section">
        <div className="lp-sec-head lp-reveal">
          <span className="lp-tag">Analytics</span>
          <h2 className="lp-sec-title">A dashboard that shows your growth</h2>
          <p className="lp-sec-sub">Real data. Real progress. No guessing.</p>
        </div>
        <div className="lp-reveal">
          <DashboardPreview />
        </div>
      </section>

      {/* ── AI SECTION ── */}
      <section className="lp-ai-section">
        <div className="lp-ai-text lp-reveal">
          <span className="lp-tag">AI Engine</span>
          <h2 className="lp-ai-title">
            Powered by<br /><span className="lp-y">adaptive AI</span><br />learning
          </h2>
          <p className="lp-ai-desc">
            Every session feeds the model. It tracks your mistakes, builds a
            personal error profile, and generates paragraphs that force exactly
            the practice you need — nothing generic, nothing wasted.
          </p>
          <ul className="lp-ai-bullets">
            {['Gemini 2.5 Flash AI generation','Character-level mistake analysis','Bi-daily adaptive assessment','Continuous loop — improvement every session'].map((b,i)=>(
              <li key={i}><span className="lp-bullet-dot">✦</span>{b}</li>
            ))}
          </ul>
          <Link to="/type" className="lp-btn-primary" style={{ marginTop: '8px', display: 'inline-flex' }}>
            Experience the AI <span className="lp-arr">→</span>
          </Link>
        </div>
        <div className="lp-neural-wrap lp-reveal">
          <div className="lp-neural-label">Live Neural Model</div>
          <canvas ref={neuralCanvasRef} className="lp-neural-canvas" />
          <div className="lp-neural-glow" />
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta-section lp-reveal">
        <div className="lp-cta-glow" />
        <span className="lp-tag" style={{ justifyContent: 'center', display: 'flex' }}>Get started</span>
        <h2 className="lp-cta-title">Ready to type smarter?</h2>
        <p className="lp-cta-sub">
          No signup required. Start typing immediately and let the AI adapt to you.
        </p>
        <div className="lp-cta-btns">
          <Link to="/type" className="lp-btn-primary lp-btn-lg">
            Start Typing Free <span className="lp-arr">→</span>
          </Link>
          <Link to="/login" className="lp-btn-ghost">
            Create Account
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            Velo<span className="lp-y">Type</span>AI
            <p className="lp-footer-tagline">AI-powered typing improvement platform.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <span className="lp-footer-col-head">Product</span>
              <Link to="/type">Practice</Link>
              <Link to="/dashboard">Dashboard</Link>
            </div>
            <div className="lp-footer-col">
              <span className="lp-footer-col-head">Company</span>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/security">Security</Link>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2026 VelotypeAI — Built with Gemini AI</span>
          <span style={{ color: '#3e4044' }}>Made with ⌨ and ✦</span>
        </div>
      </footer>
    </>
  );
}

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────

const LP_STYLES = `
/* ── Fonts already loaded by index.css ── */

/* ── Scroll reveal ── */
.lp-reveal {
  opacity: 0;
  transform: translateY(36px);
  transition: opacity 0.7s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1);
}
.lp-reveal.lp-in {
  opacity: 1;
  transform: translateY(0);
}

/* ──────────────────────────────────────
   HERO
────────────────────────────────────── */
.lp-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #0A0A0A;
  padding: 80px 24px 200px;
  --hx: 50%;
  --hy: 50%;
}

.lp-hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.lp-hero-mouse-glow {
  position: absolute;
  width: 700px;
  height: 700px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  top: 0;
  left: 0;
  transform: translate(calc(var(--hx) - 350px), calc(var(--hy) - 350px));
  background: radial-gradient(circle, rgba(255,214,0,0.06) 0%, transparent 70%);
  transition: transform 0.1s linear;
}

.lp-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 780px;
  gap: 24px;
}

/* Badge */
.lp-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255,214,0,0.35);
  background: rgba(255,214,0,0.07);
  color: #FFD600;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  animation: lp-badge-pulse 3s ease infinite;
}
@keyframes lp-badge-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,214,0,0); }
  50%      { box-shadow: 0 0 18px 4px rgba(255,214,0,0.18); }
}

/* Headline */
.lp-headline {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(3rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -2px;
  color: #fff;
  margin: 0;
}
.lp-y { color: #FFD600; text-shadow: 0 0 40px rgba(255,214,0,0.6), 0 0 80px rgba(255,214,0,0.25); }

.lp-hero-sub {
  font-size: clamp(14px, 2vw, 18px);
  color: #7a7a7a;
  line-height: 1.7;
  max-width: 580px;
  margin: 0;
}

/* Typing demo */
.lp-typing-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,214,0,0.18);
  border-radius: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  min-width: 320px;
  justify-content: flex-start;
}
.lp-typing-prompt { color: #3a3a3a; }
.lp-typing-text { color: #FFD600; }
.lp-cursor {
  color: #FFD600;
  font-weight: 300;
  animation: lp-blink 1s step-end infinite;
  margin-left: 1px;
}
@keyframes lp-blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* CTA buttons */
.lp-cta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
}
.lp-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  border-radius: 10px;
  background: #FFD600;
  color: #0A0A0A;
  font-weight: 800;
  font-size: 15px;
  font-family: 'Outfit', sans-serif;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(.22,1,.36,1);
  box-shadow: 0 6px 28px rgba(255,214,0,0.35), 0 0 0 0 rgba(255,214,0,0);
  position: relative;
  overflow: hidden;
}
.lp-btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.2s;
}
.lp-btn-primary:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 40px rgba(255,214,0,0.5), 0 0 0 4px rgba(255,214,0,0.12);
  color: #0A0A0A;
}
.lp-btn-primary:hover::before { opacity: 1; }
.lp-btn-primary:active { transform: translateY(-1px); }
.lp-btn-lg { padding: 18px 40px; font-size: 17px; }
.lp-arr { transition: transform 0.2s; }
.lp-btn-primary:hover .lp-arr { transform: translateX(4px); }

.lp-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 30px;
  border-radius: 10px;
  background: rgba(255,255,255,0.04);
  color: #d1d0c5;
  font-weight: 600;
  font-size: 15px;
  font-family: 'Outfit', sans-serif;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  transition: all 0.22s;
  backdrop-filter: blur(8px);
}
.lp-btn-ghost:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
  color: #fff;
  transform: translateY(-2px);
}

/* 3D Keyboard */
.lp-kb-stage {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  perspective: 600px;
  animation: lp-kb-float 4s ease-in-out infinite;
}
@keyframes lp-kb-float {
  0%,100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(-12px); }
}
.lp-kb {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 14px 18px 18px;
  background: rgba(20,20,20,0.9);
  border: 1px solid rgba(255,214,0,0.18);
  border-radius: 14px;
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.04),
    0 30px 60px rgba(0,0,0,0.8),
    0 0 50px rgba(255,214,0,0.08);
  transform: rotateX(30deg) rotateZ(-1deg);
  backdrop-filter: blur(20px);
}
.lp-kb-row {
  display: flex;
  gap: 5px;
  justify-content: center;
}
.lp-key {
  width: 34px;
  height: 32px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-bottom: 3px solid rgba(0,0,0,0.4);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #5a5a5a;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.2s;
  animation: lp-key-idle 3s ease-in-out infinite;
}
@keyframes lp-key-idle {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-1px); }
}
.lp-key-hot {
  background: rgba(255,214,0,0.1);
  border-color: rgba(255,214,0,0.4);
  border-bottom-color: rgba(255,180,0,0.5);
  color: #FFD600;
  box-shadow: 0 0 10px rgba(255,214,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1);
  animation: lp-key-pulse 2s ease-in-out infinite;
}
@keyframes lp-key-pulse {
  0%,100% { box-shadow: 0 0 6px rgba(255,214,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1); }
  50%      { box-shadow: 0 0 18px rgba(255,214,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15); }
}
.lp-key-space {
  width: 180px;
  background: rgba(255,255,255,0.04);
}

/* Decorative rings */
.lp-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,214,0,0.06);
  pointer-events: none;
  animation: lp-ring-expand 6s ease-out infinite;
}
.lp-ring-1 { width: 600px; height: 600px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 0s; }
.lp-ring-2 { width: 900px; height: 900px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 2s; }
.lp-ring-3 { width: 1200px; height: 1200px; top: 50%; left: 50%; transform: translate(-50%,-50%); animation-delay: 4s; }
@keyframes lp-ring-expand {
  0%   { opacity: 0.5; transform: translate(-50%,-50%) scale(0.85); }
  100% { opacity: 0;   transform: translate(-50%,-50%) scale(1.1); }
}

/* ──────────────────────────────────────
   STAT BAR
────────────────────────────────────── */
.lp-stat-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0;
  background: #111;
  border-top: 1px solid rgba(255,214,0,0.12);
  border-bottom: 1px solid rgba(255,214,0,0.12);
  padding: 40px 24px;
  flex-wrap: wrap;
}
.lp-stat-item {
  flex: 1;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0 40px;
  position: relative;
}
.lp-stat-item + .lp-stat-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  width: 1px;
  background: rgba(255,214,0,0.12);
}
.lp-stat-val {
  font-family: 'Outfit', sans-serif;
  font-size: 3.2rem;
  font-weight: 900;
  color: #FFD600;
  line-height: 1;
  text-shadow: 0 0 30px rgba(255,214,0,0.4);
}
.lp-stat-suf { font-size: 1.6rem; font-weight: 700; }
.lp-stat-label { font-size: 12px; color: #555; text-transform: uppercase; letter-spacing: 1px; }

/* ──────────────────────────────────────
   SHARED SECTION SHELL
────────────────────────────────────── */
.lp-section {
  padding: 100px 24px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}
.lp-sec-head {
  text-align: center;
  margin-bottom: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.lp-tag {
  display: inline-block;
  padding: 5px 14px;
  border-radius: 100px;
  background: rgba(255,214,0,0.08);
  border: 1px solid rgba(255,214,0,0.25);
  color: #FFD600;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.lp-sec-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.5px;
}
.lp-sec-sub {
  color: #555;
  font-size: 16px;
  max-width: 500px;
  line-height: 1.6;
  margin: 0;
}

/* ──────────────────────────────────────
   FEATURES
────────────────────────────────────── */
.lp-feat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
  gap: 20px;
}
.lp-feat-card {
  position: relative;
  padding: 36px 32px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 18px;
  cursor: default;
  transition: transform 0.25s cubic-bezier(.22,1,.36,1), border-color 0.3s, box-shadow 0.3s;
  transform-style: preserve-3d;
  overflow: hidden;
  --gx: 50%;
  --gy: 50%;
}
.lp-feat-card:hover {
  border-color: rgba(255,214,0,0.25);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,214,0,0.07);
}
.lp-feat-spot {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--gx) var(--gy), rgba(255,214,0,0.07) 0%, transparent 65%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.lp-feat-card:hover .lp-feat-spot { opacity: 1; }
.lp-feat-icon {
  font-size: 2.2rem;
  margin-bottom: 16px;
  display: block;
  filter: drop-shadow(0 0 10px rgba(255,214,0,0.35));
}
.lp-feat-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
  margin: 0 0 10px;
}
.lp-feat-desc {
  color: #555;
  font-size: 14px;
  line-height: 1.65;
  margin: 0;
}

/* ──────────────────────────────────────
   HOW IT WORKS
────────────────────────────────────── */
.lp-hiw-bg {
  background: linear-gradient(180deg, #0A0A0A 0%, #0e0e0e 100%);
  max-width: 100%;
  border-top: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.lp-hiw-bg .lp-sec-head { max-width: 1200px; margin-left: auto; margin-right: auto; }
.lp-steps {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  max-width: 1100px;
  margin: 0 auto;
  flex-wrap: wrap;
}
.lp-step {
  flex: 1;
  min-width: 240px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 0 24px;
}
.lp-step-num {
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 800;
  color: rgba(255,214,0,0.4);
  letter-spacing: 2px;
  text-transform: uppercase;
}
.lp-step-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 1px solid rgba(255,214,0,0.2);
  background: rgba(255,214,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  box-shadow: 0 0 30px rgba(255,214,0,0.08);
  transition: box-shadow 0.3s;
}
.lp-step:hover .lp-step-icon {
  box-shadow: 0 0 40px rgba(255,214,0,0.22);
  border-color: rgba(255,214,0,0.4);
}
.lp-step-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
}
.lp-step-desc {
  color: #555;
  font-size: 14px;
  line-height: 1.65;
  margin: 0;
}
.lp-step-arrow {
  font-size: 1.6rem;
  color: rgba(255,214,0,0.25);
  padding: 0 8px;
  margin-top: 56px;
  flex-shrink: 0;
  animation: lp-arr-pulse 2s ease-in-out infinite;
}
@keyframes lp-arr-pulse {
  0%,100% { color: rgba(255,214,0,0.2); transform: translateX(0); }
  50%      { color: rgba(255,214,0,0.55); transform: translateX(4px); }
}

/* ──────────────────────────────────────
   DASHBOARD PREVIEW
────────────────────────────────────── */
.lp-dash-preview {
  max-width: 860px;
  margin: 0 auto;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,214,0,0.05);
}
.lp-dash-stats {
  display: flex;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.lp-dash-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 28px 16px;
  border-right: 1px solid rgba(255,255,255,0.05);
}
.lp-dash-stat:last-child { border-right: none; }
.lp-dash-stat-val {
  font-family: 'Outfit', sans-serif;
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}
.lp-dash-stat-label { font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 1px; }
.lp-dash-chart-wrap {
  padding: 24px 28px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.lp-dash-chart-label { font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
.lp-dash-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 90px;
}
.lp-dash-bar-col { flex: 1; display: flex; align-items: flex-end; height: 100%; }
.lp-dash-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 1s cubic-bezier(.22,1,.36,1);
}
.lp-dash-heat-row {
  padding: 16px 28px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.lp-dash-heat-label { font-size: 11px; color: #444; text-transform: uppercase; letter-spacing: 1px; }
.lp-dash-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.lp-dash-chip {
  padding: 5px 11px;
  border-radius: 6px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  display: flex;
  gap: 6px;
  align-items: center;
  background: rgba(255,255,255,0.02);
}
.lp-dash-chip-n { font-size: 10px; opacity: 0.7; }
.lp-dash-ai-tip {
  display: flex;
  gap: 16px;
  padding: 20px 28px;
  align-items: flex-start;
  background: rgba(255,214,0,0.03);
}
.lp-dash-ai-icon { color: #FFD600; font-size: 1.2rem; flex-shrink: 0; padding-top: 2px; }
.lp-dash-ai-title { font-size: 12px; font-weight: 700; color: #FFD600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
.lp-dash-ai-text { font-size: 13px; color: #555; line-height: 1.6; }

/* ──────────────────────────────────────
   AI SECTION
────────────────────────────────────── */
.lp-ai-section {
  display: flex;
  align-items: center;
  gap: 80px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 100px 24px;
  flex-wrap: wrap;
}
.lp-ai-text {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.lp-ai-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.12;
  letter-spacing: -0.5px;
  margin: 0;
}
.lp-ai-desc {
  color: #555;
  font-size: 15px;
  line-height: 1.7;
  margin: 0;
  max-width: 420px;
}
.lp-ai-bullets {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.lp-ai-bullets li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #888;
}
.lp-bullet-dot { color: #FFD600; font-size: 12px; flex-shrink: 0; }
.lp-neural-wrap {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
  height: 360px;
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255,214,0,0.1);
  background: rgba(10,10,10,0.9);
}
.lp-neural-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
.lp-neural-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, rgba(255,214,0,0.05) 0%, transparent 70%);
  pointer-events: none;
}
.lp-neural-label {
  position: absolute;
  top: 16px;
  left: 16px;
  font-size: 10px;
  color: rgba(255,214,0,0.4);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  z-index: 2;
}

/* ──────────────────────────────────────
   CTA SECTION
────────────────────────────────────── */
.lp-cta-section {
  position: relative;
  text-align: center;
  padding: 120px 24px;
  border-top: 1px solid rgba(255,255,255,0.04);
  overflow: hidden;
}
.lp-cta-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,214,0,0.09) 0%, transparent 65%);
  pointer-events: none;
  animation: lp-cta-pulse 4s ease-in-out infinite;
}
@keyframes lp-cta-pulse {
  0%,100% { transform: translate(-50%,-50%) scale(0.9); opacity: 0.6; }
  50%      { transform: translate(-50%,-50%) scale(1.1); opacity: 1; }
}
.lp-cta-title {
  font-family: 'Outfit', sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 900;
  color: #fff;
  margin: 16px 0 16px;
  position: relative;
  z-index: 1;
}
.lp-cta-sub {
  color: #555;
  font-size: 16px;
  margin: 0 0 40px;
  position: relative;
  z-index: 1;
}
.lp-cta-btns {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

/* ──────────────────────────────────────
   FOOTER
────────────────────────────────────── */
.lp-footer {
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 60px 24px 32px;
  background: #0A0A0A;
}
.lp-footer-top {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 40px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}
.lp-footer-brand {
  font-family: 'Outfit', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.5px;
}
.lp-footer-tagline {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #3a3a3a;
  margin: 8px 0 0;
  font-weight: 400;
}
.lp-footer-links {
  display: flex;
  gap: 60px;
  flex-wrap: wrap;
}
.lp-footer-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.lp-footer-col-head {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #3a3a3a;
  margin-bottom: 4px;
}
.lp-footer-col a {
  color: #555;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}
.lp-footer-col a:hover { color: #FFD600; }
.lp-footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid rgba(255,255,255,0.04);
  font-size: 12px;
  color: #3a3a3a;
  flex-wrap: wrap;
  gap: 8px;
}

/* ──────────────────────────────────────
   RESPONSIVE
────────────────────────────────────── */
@media (max-width: 768px) {
  .lp-hero { padding: 60px 20px 260px; }
  .lp-headline { letter-spacing: -1px; }
  .lp-kb-stage { bottom: -20px; transform: translateX(-50%) scale(0.72); }
  .lp-stat-item { min-width: 140px; padding: 0 20px; }
  .lp-stat-val { font-size: 2.2rem; }
  .lp-section { padding: 70px 20px; }
  .lp-feat-grid { grid-template-columns: 1fr; }
  .lp-steps { flex-direction: column; align-items: center; }
  .lp-step-arrow { transform: rotate(90deg); margin-top: 0; }
  .lp-ai-section { flex-direction: column; gap: 40px; }
  .lp-neural-wrap { width: 100%; max-width: 100%; height: 260px; }
  .lp-dash-stats { flex-wrap: wrap; }
  .lp-dash-stat { min-width: 50%; }
  .lp-footer-top { flex-direction: column; }
}

@media (max-width: 480px) {
  .lp-cta-row { flex-direction: column; align-items: center; }
  .lp-btn-primary, .lp-btn-ghost { width: 100%; justify-content: center; }
  .lp-typing-wrap { min-width: unset; width: 100%; }
  .lp-kb-stage { transform: translateX(-50%) scale(0.6); }
}
`;
