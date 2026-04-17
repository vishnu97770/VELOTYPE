import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const SAMPLE_PROMPTS = [
  "the quick brown fox jumps over the lazy dog and runs across the open field under the bright morning sun",
  "practice makes perfect and every keystroke you take brings you one step closer to becoming a faster typist",
  "consistency is the key to improvement track your mistakes learn from them and watch your speed increase",
  "typing is a skill that improves with deliberate focused practice every session teaches you something new",
  "the best way to get better at typing is to slow down first and focus on accuracy before chasing speed",
  "artificial intelligence is transforming the way we interact with computers and software every single day",
  "velocity and precision are the twin pillars of expert typing mastery requires both working in harmony",
];

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold: #e2b714;
  --gold-light: #f5cd2f;
  --gold-glow: rgba(226,183,20,0.55);
  --purple: #a78bfa;
  --purple-glow: rgba(167,139,250,0.4);
  --red: #ca4754;
  --red-glow: rgba(202,71,84,0.5);
  --bg: #111214;
  --bg2: #16181c;
  --bg3: #1e2026;
  --surface: rgba(255,255,255,0.055);
  --surface2: rgba(255,255,255,0.1);
  --border: rgba(255,255,255,0.09);
  --text: #d1d0c5;
  --sub: #646669;
  --sub2: #3e4044;
}

/* ── 3D Background ── */
.tt-scene {
  position: fixed;
  inset: 0;
  background: var(--bg);
  overflow: hidden;
  z-index: 0;
}

.tt-scene::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 15% 15%, rgba(226,183,20,0.18) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 80%, rgba(130,80,255,0.16) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 110%, rgba(202,71,84,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 70% 10%, rgba(100,180,255,0.08) 0%, transparent 55%);
  animation: bgPulse 8s ease-in-out infinite alternate;
}

@keyframes bgPulse {
  0% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* Floating 3D particles */
.tt-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.tt-particle {
  position: absolute;
  border-radius: 50%;
  animation: float linear infinite;
  opacity: 0;
}

@keyframes float {
  0% { transform: translateY(110vh) rotate(0deg) scale(0); opacity: 0; }
  5% { opacity: 1; }
  90% { opacity: 0.6; }
  100% { transform: translateY(-10vh) rotate(720deg) scale(1.2); opacity: 0; }
}

/* Grid lines */
.tt-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(226,183,20,0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(226,183,20,0.07) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 18s linear infinite;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

@keyframes gridMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(60px); }
}

/* ── Page Layout ── */
.tt-page {
  font-family: 'JetBrains Mono', monospace;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  padding: 0 60px;
  color: var(--text);
  perspective: 1200px;
}

.tt-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
  gap: 0;
}

/* ── Top Bar ── */
.tt-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28px 0 24px;
  position: relative;
}

.tt-topbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-glow), transparent);
}

/* ── Brand ── */
.tt-brand {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--gold), var(--gold-light), #fff5a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 0 20px var(--gold-glow));
  transform-style: preserve-3d;
}

.tt-brand:hover {
  transform: scale(1.05) translateZ(10px);
  filter: drop-shadow(0 0 30px var(--gold-glow)) brightness(1.1);
}

.tt-brand span {
  background: linear-gradient(135deg, #a78bfa, #7c3aed);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Mode Bar ── */
.tt-modebar {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 6px 8px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08);
}

.tt-mode-btn {
  background: none;
  border: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--sub);
  cursor: pointer;
  padding: 7px 16px;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.tt-mode-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--gold-glow), transparent);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 10px;
}

.tt-mode-btn:hover {
  color: var(--text);
  transform: translateY(-1px) scale(1.02);
}

.tt-mode-btn:hover::before { opacity: 0.3; }

.tt-mode-btn.active {
  color: var(--gold);
  background: rgba(226,183,20,0.18);
  box-shadow: 0 0 20px rgba(226,183,20,0.35), 0 0 8px rgba(226,183,20,0.2), inset 0 1px 0 rgba(226,183,20,0.3);
  transform: translateY(-1px);
  text-shadow: 0 0 12px rgba(226,183,20,0.6);
}

.tt-mode-sep {
  color: var(--sub2);
  font-size: 14px;
  margin: 0 4px;
  user-select: none;
}

.tt-login-btn {
  font-family: 'Outfit', sans-serif !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  padding: 8px 20px !important;
  background: linear-gradient(135deg, var(--gold), #f5a623) !important;
  color: #1a1b1e !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  box-shadow: 0 4px 15px rgba(226,183,20,0.3) !important;
  letter-spacing: 0.3px !important;
}

.tt-login-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 25px rgba(226,183,20,0.5) !important;
  filter: brightness(1.1) !important;
}

/* ── Stats ── */
.tt-stats {
  display: flex;
  gap: 24px;
  padding: 28px 0 24px;
  min-height: 80px;
  align-items: center;
}

.tt-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 22px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
  min-width: 96px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}

.tt-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(226,183,20,0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.tt-stat:hover {
  transform: translateY(-5px) rotateX(6deg);
  border-color: rgba(226,183,20,0.3);
  box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(226,183,20,0.15);
}

.tt-stat:hover::before { opacity: 1; }

.tt-stat-label {
  font-size: 10px;
  color: var(--sub);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.tt-stat-value {
  font-family: 'Outfit', sans-serif;
  font-size: 30px;
  font-weight: 800;
  color: var(--gold);
  line-height: 1;
  transition: all 0.3s ease;
  text-shadow: 0 0 24px rgba(226,183,20,0.8), 0 0 48px rgba(226,183,20,0.3);
  letter-spacing: -0.5px;
}

.tt-stat-value.dim {
  color: var(--sub2);
  text-shadow: none;
  font-weight: 700;
}

.tt-stat-value.danger {
  color: var(--red);
  text-shadow: 0 0 20px var(--red-glow);
  animation: dangerPulse 0.5s ease-in-out infinite alternate;
}

@keyframes dangerPulse {
  0% { opacity: 0.8; }
  100% { opacity: 1; }
}

.tt-stat-spacer {
  margin-left: auto;
}

/* ── Typing Card ── */
.tt-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 24px;
  padding: 40px 44px;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  box-shadow:
    0 24px 80px rgba(0,0,0,0.6),
    0 0 0 1px rgba(255,255,255,0.04),
    inset 0 1px 0 rgba(255,255,255,0.1),
    inset 0 -1px 0 rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
  transform-style: preserve-3d;
}

/* Top shimmer line */
.tt-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(226,183,20,0.8), rgba(200,150,255,0.5), rgba(226,183,20,0.8), transparent);
  filter: blur(1px);
}

/* Mouse-follow spotlight */
.tt-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 50% 40% at var(--mx, 50%) var(--my, 50%), rgba(226,183,20,0.07) 0%, transparent 70%);
  pointer-events: none;
  transition: background 0.15s;
}

.tt-card.focused {
  border-color: rgba(226,183,20,0.25);
  box-shadow:
    0 24px 80px rgba(0,0,0,0.65),
    0 0 60px rgba(226,183,20,0.12),
    0 0 0 1px rgba(226,183,20,0.18),
    inset 0 1px 0 rgba(255,255,255,0.12);
}

/* ── Words ── */
.tt-words {
  font-size: 26px;
  line-height: 2.2;
  letter-spacing: 0.5px;
  color: var(--sub);
  user-select: none;
  position: relative;
  overflow: hidden;
  max-height: calc(2.2em * 3);
  mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 75%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 8%, black 75%, transparent 100%);
}

.tt-words-inner {
  transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* ── Characters ── */
.tt-char { position: relative; transition: color 0.05s; }
.tt-char.correct { color: var(--text); }
.tt-char.incorrect {
  color: var(--red);
  position: relative;
}
.tt-char.incorrect::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--red);
  border-radius: 1px;
  box-shadow: 0 0 6px var(--red-glow);
}
.tt-char.current { color: var(--text); }
.tt-char.extra { color: var(--red); font-size: 0.9em; }

/* ── Animated Caret ── */
.tt-char.current::before {
  content: '';
  position: absolute;
  left: -2px;
  top: 5px;
  bottom: 5px;
  width: 2px;
  background: var(--gold);
  border-radius: 2px;
  box-shadow: 0 0 12px var(--gold-glow), 0 0 30px rgba(226,183,20,0.5), 0 0 60px rgba(226,183,20,0.2);
  animation: caretBlink 1s step-end infinite;
}

@keyframes caretBlink {
  0%, 100% { opacity: 1; box-shadow: 0 0 12px var(--gold-glow), 0 0 30px rgba(226,183,20,0.5); }
  50% { opacity: 0; box-shadow: none; }
}

/* ── Hidden Input ── */
.tt-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* ── Progress ── */
.tt-progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.06);
  border-radius: 4px;
  margin-top: 28px;
  overflow: visible;
  position: relative;
}

.tt-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(226,183,20,0.6), var(--gold), var(--gold-light));
  border-radius: 4px;
  transition: width 0.15s linear;
  box-shadow: 0 0 14px rgba(226,183,20,0.8), 0 0 30px rgba(226,183,20,0.4);
  position: relative;
}

.tt-progress-fill::after {
  content: '';
  position: absolute;
  right: -5px;
  top: -4px;
  width: 11px;
  height: 11px;
  background: var(--gold-light);
  border-radius: 50%;
  box-shadow: 0 0 14px rgba(226,183,20,0.9), 0 0 30px rgba(226,183,20,0.6);
}

/* ── Focus Hint ── */
.tt-focus-hint {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: var(--sub2);
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.tt-focus-hint::before,
.tt-focus-hint::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--sub2));
  max-width: 80px;
}
.tt-focus-hint::after {
  background: linear-gradient(270deg, transparent, var(--sub2));
}

.tt-focus-hint.hidden {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Actions ── */
.tt-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.tt-btn {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 10px 22px;
  border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
}

.tt-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  opacity: 0;
  transition: opacity 0.2s;
}

.tt-btn:hover::before { opacity: 1; }
.tt-btn:active { transform: scale(0.96) !important; }

.tt-btn-primary {
  background: linear-gradient(135deg, #f5c518, var(--gold), #e09800);
  color: #111214;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(226,183,20,0.4), 0 1px 0 rgba(255,255,255,0.15) inset;
  border: 1px solid rgba(226,183,20,0.4);
}
.tt-btn-primary:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 10px 40px rgba(226,183,20,0.6), 0 0 20px rgba(226,183,20,0.3);
  filter: brightness(1.08);
}

.tt-btn-ghost {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.1);
  color: var(--sub);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.tt-btn-ghost:hover {
  color: var(--gold);
  border-color: rgba(226,183,20,0.3);
  transform: translateY(-3px) scale(1.02);
  background: rgba(226,183,20,0.06);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 15px rgba(226,183,20,0.1);
}

/* ── RESULTS SCREEN ── */
.tt-results {
  animation: resultsEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes resultsEnter {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95) rotateX(-5deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0);
  }
}

.tt-results-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 32px;
}

.tt-results-title {
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--sub);
  letter-spacing: 3px;
  text-transform: uppercase;
}

.tt-results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

@media (max-width: 768px) {
  .tt-results-grid { grid-template-columns: repeat(2, 1fr); }
}

.tt-result-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px 24px;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: cardEnter 0.5s ease backwards;
  transform-style: preserve-3d;
  position: relative;
  overflow: hidden;
}

.tt-result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-glow), transparent);
}

.tt-result-card:nth-child(1) { animation-delay: 0.1s; }
.tt-result-card:nth-child(2) { animation-delay: 0.2s; }
.tt-result-card:nth-child(3) { animation-delay: 0.3s; }
.tt-result-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes cardEnter {
  from { opacity: 0; transform: translateY(20px) rotateX(-10deg); }
  to { opacity: 1; transform: translateY(0) rotateX(0); }
}

.tt-result-card:hover {
  transform: translateY(-6px) rotateX(5deg) rotateY(2deg);
  border-color: rgba(226,183,20,0.2);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(226,183,20,0.1);
}

.tt-result-card-label {
  font-size: 10px;
  color: var(--sub);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.tt-result-card-value {
  font-size: 42px;
  font-weight: 800;
  font-family: 'Outfit', sans-serif;
  background: linear-gradient(135deg, var(--gold), var(--gold-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  filter: drop-shadow(0 0 10px var(--gold-glow));
}

.tt-result-card-unit {
  font-size: 11px;
  color: var(--sub);
  margin-top: 2px;
}

/* Performance Badge */
.tt-perf-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(226,183,20,0.1);
  border: 1px solid rgba(226,183,20,0.2);
  border-radius: 20px;
  font-size: 12px;
  color: var(--gold);
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 600;
  animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.6s backwards;
}

@keyframes badgePop {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

/* ── Mistakes ── */
.tt-mistakes-section {
  margin-bottom: 24px;
}

.tt-mistakes-title {
  font-size: 11px;
  color: var(--sub);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.tt-mistakes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tt-mistake-chip {
  background: rgba(202,71,84,0.1);
  border: 1px solid rgba(202,71,84,0.2);
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 13px;
  display: flex;
  gap: 8px;
  align-items: center;
  transition: all 0.2s ease;
}
.tt-mistake-chip:hover {
  background: rgba(202,71,84,0.2);
  transform: translateY(-2px);
}
.tt-mistake-expected { color: var(--text); }
.tt-mistake-arrow { color: var(--sub2); }
.tt-mistake-typed { color: var(--red); }

/* ── Keyboard hint row ── */
.tt-shortcut-row {
  display: flex;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

.tt-shortcut {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--sub2);
  letter-spacing: 0.5px;
}

.tt-key {
  background: var(--surface);
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  border-radius: 5px;
  padding: 2px 7px;
  font-size: 11px;
  color: var(--sub);
  font-family: 'JetBrains Mono', monospace;
  vertical-align: middle;
}

/* ── Ripple on keystroke ── */
.tt-ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(226,183,20,0.15);
  transform: scale(0);
  animation: ripple 0.6s ease-out forwards;
  pointer-events: none;
}

@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}

/* ── Combo counter ── */
.tt-combo {
  position: fixed;
  top: 50%;
  right: 40px;
  transform: translateY(-50%);
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: var(--gold);
  background: rgba(226,183,20,0.1);
  border: 1px solid rgba(226,183,20,0.2);
  border-radius: 12px;
  padding: 10px 16px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.tt-combo.visible { opacity: 1; }
.tt-combo-num {
  display: block;
  font-size: 28px;
  line-height: 1;
  text-shadow: 0 0 20px var(--gold-glow);
}
`;

const PARTICLES_COUNT = 20;

function pickPrompt() {
  return SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
}

function computeWPM(charsTyped, elapsedSeconds) {
  if (elapsedSeconds < 1) return 0;
  return Math.round((charsTyped / 5) / (elapsedSeconds / 60));
}

function computeAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function getPerformanceLabel(wpm) {
  if (wpm >= 120) return '⚡ Lightning';
  if (wpm >= 90) return '🔥 Expert';
  if (wpm >= 60) return '🚀 Fast';
  if (wpm >= 40) return '✨ Good';
  if (wpm >= 20) return '📈 Improving';
  return '🌱 Beginner';
}

// Animated particle background
function Particles() {
  return (
    <div className="tt-particles">
      {Array.from({ length: PARTICLES_COUNT }).map((_, i) => {
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const delay = Math.random() * 15;
        const duration = Math.random() * 15 + 10;
        const gold = Math.random() > 0.5;
        return (
          <div
            key={i}
            className="tt-particle"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              background: gold
                ? `rgba(226,183,20,${Math.random() * 0.5 + 0.3})`
                : `rgba(200,150,255,${Math.random() * 0.4 + 0.2})`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              boxShadow: gold
                ? `0 0 ${size * 3}px rgba(226,183,20,0.6)`
                : `0 0 ${size * 3}px rgba(200,150,255,0.5)`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function TypingTest() {
  const navigator = useNavigate();

  const [prompt, setPrompt]       = useState(pickPrompt);
  const [typed, setTyped]         = useState('');
  const [started, setStarted]     = useState(false);
  const [finished, setFinished]   = useState(false);
  const [elapsed, setElapsed]     = useState(0);
  const [focused, setFocused]     = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [combo, setCombo]         = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [mousePos, setMousePos]   = useState({ x: 50, y: 50 });

  const inputRef  = useRef(null);
  const timerRef  = useRef(null);
  const startedAt = useRef(null);
  const cardRef   = useRef(null);
  const comboTimer = useRef(null);

  const promptChars = prompt.split('');
  const typedChars  = typed.split('');

  const correctCount = typedChars.filter((c, i) => c === promptChars[i]).length;
  const wpm       = computeWPM(correctCount, elapsed);
  const accuracy  = computeAccuracy(correctCount, typedChars.length);
  const progress  = Math.min((typed.length / prompt.length) * 100, 100);
  const timeLeft  = Math.max(timeLimit - elapsed, 0);

  const mistakes = [];
  typedChars.forEach((c, i) => {
    if (c !== promptChars[i]) mistakes.push({ expected: promptChars[i] ?? '—', typed: c });
  });

  // Card mouse move for 3D tilt + gradient spot
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
    cardRef.current.style.setProperty('--mx', `${x}%`);
    cardRef.current.style.setProperty('--my', `${y}%`);
  }, []);

  // Timer
  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startedAt.current) / 1000);
        setElapsed(secs);
        if (secs >= timeLimit) {
          clearInterval(timerRef.current);
          setFinished(true);
        }
      }, 200);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished, timeLimit]);

  // Finish on complete
  useEffect(() => {
    if (typed.length >= prompt.length && started) {
      clearInterval(timerRef.current);
      setFinished(true);
    }
  }, [typed, prompt, started]);

  // Input handler with combo system
  const handleInput = useCallback((e) => {
    if (finished) return;
    const value = e.target.value;
    if (!started && value.length > 0) {
      setStarted(true);
      startedAt.current = Date.now();
    }
    // Track combo (consecutive correct chars)
    const newTypedLen = value.length;
    const prevTypedLen = typed.length;
    if (newTypedLen > prevTypedLen) {
      const newChar = value[newTypedLen - 1];
      if (newChar === promptChars[newTypedLen - 1]) {
        setCombo(c => {
          const newCombo = c + 1;
          if (newCombo >= 10) {
            setShowCombo(true);
            clearTimeout(comboTimer.current);
            comboTimer.current = setTimeout(() => setShowCombo(false), 1500);
          }
          return newCombo;
        });
      } else {
        setCombo(0);
        setShowCombo(false);
      }
    }
    setTyped(value);
  }, [finished, started, typed, promptChars]);

  const reset = useCallback((newPrompt = null) => {
    clearInterval(timerRef.current);
    setPrompt(newPrompt || pickPrompt());
    setTyped('');
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setCombo(0);
    setShowCombo(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const focusInput = () => inputRef.current?.focus();

  // Scroll caret into view
  const wordsRef = useRef(null);
  const innerRef = useRef(null);
  useEffect(() => {
    if (!wordsRef.current || !innerRef.current) return;
    const currentChar = wordsRef.current.querySelector('.tt-char.current');
    if (!currentChar) return;
    const charTop = currentChar.offsetTop;
    const lineH = parseFloat(getComputedStyle(innerRef.current).fontSize) * 2.2;
    const targetLine = Math.floor(charTop / lineH);
    if (targetLine >= 2) {
      innerRef.current.style.transform = `translateY(-${(targetLine - 1) * lineH}px)`;
    } else {
      innerRef.current.style.transform = 'translateY(0)';
    }
  }, [typed]);

  const renderChars = () => promptChars.map((char, i) => {
    let cls = 'tt-char';
    if (i < typed.length) cls += typed[i] === char ? ' correct' : ' incorrect';
    else if (i === typed.length) cls += ' current';
    return <span key={i} className={cls}>{char}</span>;
  });

  // ── RESULTS ──
  if (finished) {
    const uniqueMistakes = [];
    const seen = new Set();
    mistakes.forEach((m) => {
      const key = `${m.expected}-${m.typed}`;
      if (!seen.has(key)) { seen.add(key); uniqueMistakes.push(m); }
    });

    return (
      <>
        <style>{styles}</style>
        <div className="tt-scene">
          <div className="tt-grid" />
          <Particles />
        </div>

        <div className="tt-page">
          <div className="tt-container">
            {/* Top Bar */}
            <div className="tt-topbar">
              <div className="tt-brand" onClick={() => reset()}>Velo<span>Type</span>AI</div>
              <div className="tt-modebar">
                <span className="tt-mode-sep" style={{ margin: '0 8px', color: 'var(--sub)', fontSize: '12px' }}>results</span>
              </div>
            </div>

            {/* Results */}
            <div className="tt-results">
              <div className="tt-results-header">
                <p className="tt-results-title">Test Complete</p>
                <div className="tt-perf-badge">{getPerformanceLabel(wpm)}</div>
              </div>

              <div className="tt-results-grid">
                {[
                  { label: 'WPM', value: wpm, unit: 'words per minute' },
                  { label: 'ACC', value: `${accuracy}%`, unit: 'accuracy' },
                  { label: 'TIME', value: `${elapsed}s`, unit: 'elapsed' },
                  { label: 'ERRORS', value: mistakes.length, unit: 'keystrokes' },
                ].map((card) => (
                  <div key={card.label} className="tt-result-card">
                    <div className="tt-result-card-label">{card.label}</div>
                    <div className="tt-result-card-value">{card.value}</div>
                    <div className="tt-result-card-unit">{card.unit}</div>
                  </div>
                ))}
              </div>

              {uniqueMistakes.length > 0 && (
                <div className="tt-mistakes-section">
                  <p className="tt-mistakes-title">Mistakes</p>
                  <div className="tt-mistakes-list">
                    {uniqueMistakes.map((m, i) => (
                      <div key={i} className="tt-mistake-chip">
                        <span className="tt-mistake-expected">"{m.expected}"</span>
                        <span className="tt-mistake-arrow">→</span>
                        <span className="tt-mistake-typed">"{m.typed}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="tt-actions">
                <button className="tt-btn tt-btn-primary" onClick={() => reset()}>
                  Next Test →
                </button>
                <button className="tt-btn tt-btn-ghost" onClick={() => reset(prompt)}>
                  Retry
                </button>
                <button className="tt-btn tt-btn-ghost" onClick={() => navigator('/login')}>
                  Sign In
                </button>
              </div>

              <div className="tt-shortcut-row">
                <div className="tt-shortcut">
                  <span className="tt-key">tab</span>
                  <span>+</span>
                  <span className="tt-key">enter</span>
                  <span style={{ color: 'var(--sub2)' }}>new test</span>
                </div>
                <div className="tt-shortcut">
                  <span className="tt-key">esc</span>
                  <span style={{ color: 'var(--sub2)' }}>retry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {/* 3D Scene Background */}
      <div className="tt-scene">
        <div className="tt-grid" />
        <Particles />
      </div>

      {/* Combo counter */}
      <div className={`tt-combo ${showCombo && combo >= 10 ? 'visible' : ''}`}>
        <span className="tt-combo-num">×{combo}</span>
        combo!
      </div>

      <div className="tt-page" onClick={focusInput}>
        <div className="tt-container">

          {/* Top Bar */}
          <div className="tt-topbar">
            <div className="tt-brand">Velo<span>Type</span>AI</div>
            <div className="tt-modebar">
              {[
                { label: '15s', val: 15 },
                { label: '30s', val: 30 },
                { label: '60s', val: 60 },
              ].map(({ label, val }) => (
                <button
                  key={val}
                  className={`tt-mode-btn ${timeLimit === val ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); reset(); setTimeLimit(val); }}
                >
                  {label}
                </button>
              ))}
              <span className="tt-mode-sep">|</span>
              <button className="tt-mode-btn" onClick={(e) => { e.stopPropagation(); reset(); }} title="New prompt">
                ↺
              </button>
              <button className="tt-login-btn" onClick={() => navigator('/login')} style={{ marginLeft: '4px' }}>
                Sign In
              </button>
            </div>
          </div>

          {/* Live Stats */}
          <div className="tt-stats">
            <div className="tt-stat">
              <span className="tt-stat-label">WPM</span>
              <span className={`tt-stat-value ${!started ? 'dim' : ''}`}>
                {started ? wpm : '—'}
              </span>
            </div>
            <div className="tt-stat">
              <span className="tt-stat-label">ACC</span>
              <span className={`tt-stat-value ${!started ? 'dim' : ''}`}>
                {started ? `${accuracy}%` : '—'}
              </span>
            </div>
            <div className="tt-stat">
              <span className="tt-stat-label">ERRORS</span>
              <span className={`tt-stat-value ${!started ? 'dim' : mistakes.length > 0 ? '' : ''}`}
                style={{ color: !started ? undefined : mistakes.length > 5 ? 'var(--red)' : undefined }}>
                {started ? mistakes.length : '—'}
              </span>
            </div>
            <div className="tt-stat tt-stat-spacer">
              <span className="tt-stat-label">TIME</span>
              <span className={`tt-stat-value ${!started ? 'dim' : timeLeft <= 10 ? 'danger' : ''}`}>
                {started ? timeLeft : timeLimit}
              </span>
            </div>
          </div>

          {/* Typing Card */}
          <div
            ref={cardRef}
            className={`tt-card ${focused ? 'focused' : ''}`}
            onMouseMove={handleMouseMove}
            onClick={focusInput}
          >
            <div className="tt-words" ref={wordsRef}>
              <div className="tt-words-inner" ref={innerRef}>
                {renderChars()}
              </div>
            </div>

            <input
              ref={inputRef}
              className="tt-input"
              value={typed}
              onChange={handleInput}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
            />

            <div className="tt-progress-track">
              <div className="tt-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Focus hint */}
          <p className={`tt-focus-hint ${focused ? 'hidden' : ''}`}>
            click or press any key to focus
          </p>

          {/* Actions */}
          <div className="tt-actions">
            <button className="tt-btn tt-btn-ghost" onClick={(e) => { e.stopPropagation(); reset(); }}>
              ↺ Restart
            </button>
          </div>

          {/* Shortcuts */}
          <div className="tt-shortcut-row">
            <div className="tt-shortcut">
              <span className="tt-key">tab</span>
              <span>+</span>
              <span className="tt-key">enter</span>
              <span style={{ color: 'var(--sub2)' }}>restart test</span>
            </div>
            <div className="tt-shortcut">
              <span className="tt-key">esc</span>
              <span style={{ color: 'var(--sub2)' }}>command line</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}