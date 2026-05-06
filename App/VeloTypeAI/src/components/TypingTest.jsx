import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../apiClient.js'

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
  --cyan: #00f0ff;
  --cyan-light: #33f3ff;
  --cyan-glow: rgba(0,240,255,0.55);
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
  background:
    radial-gradient(ellipse 70% 55% at 15% 15%, rgba(0, 240, 255, 0.18) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 80%, rgba(130, 80, 255, 0.16) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 110%, rgba(202, 71, 84, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 70% 10%, rgba(100, 180, 255, 0.08) 0%, transparent 55%);
  animation: bgPulse 12s ease-in-out infinite alternate;
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
    linear-gradient(rgba(0, 240, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.07) 1px, transparent 1px);
  background-size: 60px 60px;
  animation: gridMove 30s linear infinite;
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
  justify-content: flex-end;
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
  background: linear-gradient(90deg, transparent, var(--cyan-glow), transparent);
}


/* ── Brand ── */
.tt-brand {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--cyan), var(--cyan-light), #fff5a0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 0 20px var(--cyan-glow));
  transform-style: preserve-3d;
}

.tt-brand:hover {
  transform: scale(1.05) translateZ(10px);
  filter: drop-shadow(0 0 30px var(--cyan-glow)) brightness(1.1);
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
  background: linear-gradient(135deg, var(--cyan-glow), transparent);
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
  color: var(--cyan);
  background: rgba(0, 240, 255, 0.18);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.35), 0 0 8px rgba(0, 240, 255, 0.2), inset 0 1px 0 rgba(0, 240, 255, 0.3);
  transform: translateY(-1px);
  text-shadow: 0 0 12px rgba(0, 240, 255, 0.6);
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
  background: linear-gradient(135deg, var(--cyan), #00c0cc) !important;
  color: #1a1b1e !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3) !important;
  letter-spacing: 0.3px !important;
}

.tt-login-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 25px rgba(0, 240, 255, 0.5) !important;
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
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}


.tt-stat:hover {
  transform: translateY(-5px) rotateX(6deg);
  border-color: rgba(0, 240, 255, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 240, 255, 0.15);
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
  color: var(--cyan);
  line-height: 1;
  transition: all 0.3s ease;
  text-shadow: 0 0 24px rgba(0, 240, 255, 0.8), 0 0 48px rgba(0, 240, 255, 0.3);
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
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.8), rgba(200, 150, 255, 0.5), rgba(0, 240, 255, 0.8), transparent);
  filter: blur(1px);
}


/* Mouse-follow spotlight */
.tt-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 50% 40% at var(--mx, 50%) var(--my, 50%), rgba(0, 240, 255, 0.07) 0%, transparent 70%);
  pointer-events: none;
  transition: background 0.15s;
}


.tt-card.focused {
  border-color: rgba(0, 240, 255, 0.25);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.65),
    0 0 60px rgba(0, 240, 255, 0.12),
    0 0 0 1px rgba(0, 240, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
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
  background: var(--cyan);
  border-radius: 2px;
  box-shadow: 0 0 12px var(--cyan-glow), 0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2);
  animation: caretBlink 1s step-end infinite;
}


@keyframes caretBlink {
  0%, 100% { opacity: 1; box-shadow: 0 0 12px var(--cyan-glow), 0 0 30px rgba(0, 240, 255, 0.5); }
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
  background: linear-gradient(90deg, rgba(0, 240, 255, 0.6), var(--cyan), var(--cyan-light));
  border-radius: 4px;
  transition: width 0.15s linear;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.8), 0 0 30px rgba(0, 240, 255, 0.4);
  position: relative;
}


.tt-progress-fill::after {
  content: '';
  position: absolute;
  right: -5px;
  top: -4px;
  width: 11px;
  height: 11px;
  background: var(--cyan-light);
  border-radius: 50%;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.9), 0 0 30px rgba(0, 240, 255, 0.6);
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
  background: linear-gradient(135deg, #00f0ff, var(--cyan), #00c0cc);
  color: #111214;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(0, 240, 255, 0.4), 0 1px 0 rgba(255, 255, 255, 0.15) inset;
  border: 1px solid rgba(0, 240, 255, 0.4);
}

.tt-btn-primary:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 10px 40px rgba(0, 240, 255, 0.6), 0 0 20px rgba(0, 240, 255, 0.3);
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
  color: var(--cyan);
  border-color: rgba(0, 240, 255, 0.3);
  transform: translateY(-3px) scale(1.02);
  background: rgba(0, 240, 255, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(0, 240, 255, 0.1);
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
  background: linear-gradient(90deg, transparent, var(--cyan-glow), transparent);
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
  border-color: rgba(0, 240, 255, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 240, 255, 0.1);
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
  background: linear-gradient(135deg, var(--cyan), var(--cyan-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  filter: drop-shadow(0 0 10px var(--cyan-glow));
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
  background: rgba(0, 240, 255, 0.1);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  color: var(--cyan);
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
  background: rgba(0,240,255,0.15);
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
  color: var(--cyan);
  background: rgba(0,240,255,0.1);
  border: 1px solid rgba(0,240,255,0.2);
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
  text-shadow: 0 0 20px var(--cyan-glow);
}

/* ── Daily Task Modal ── */
.tt-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tt-modal {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.8);
  position: relative;
  overflow: hidden;
}
.tt-modal::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--purple));
}
.tt-modal-title {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.tt-modal-sub {
  color: var(--sub);
  font-size: 13px;
  margin-bottom: 24px;
}
.tt-rep-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}
.tt-rep-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  padding: 12px;
  border-radius: 12px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tt-rep-btn:hover { border-color: var(--cyan); background: rgba(0,240,255,0.05); }
.tt-rep-btn.active { background: var(--cyan); color: #111; font-weight: 700; border-color: var(--cyan); }

/* ── Improvement Card ── */
.tt-improvement-card {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(167, 139, 250, 0.1));
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  padding: 24px;
  margin-top: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.tt-imp-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tt-imp-label { font-size: 11px; color: var(--sub); text-transform: uppercase; letter-spacing: 1px; }
.tt-imp-value { font-size: 28px; font-weight: 800; font-family: 'Outfit', sans-serif; color: var(--cyan); }
.tt-imp-diff { font-size: 14px; font-weight: 700; color: #10b981; }

/* ── Assessment Choice ── */
.tt-assessment-screen {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}
.tt-assess-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 24px;
}
.tt-assess-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tt-assess-btn:hover {
  transform: translateY(-5px);
  border-color: var(--cyan);
  background: rgba(0,240,255,0.05);
}
.tt-assess-count { font-size: 24px; font-weight: 800; color: var(--cyan); }
.tt-assess-label { font-size: 12px; color: var(--sub); }
`;

const PARTICLES_COUNT = 20;

function pickPrompt() {
  return SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
}

function computeWPM(charsTyped, elapsedSeconds) {
  if (elapsedSeconds < 1) return 0;
  return Math.round((charsTyped / 5) / (elapsedSeconds / 60));
}

function getPerformanceLabel(wpm) {
  if (wpm < 30) return 'Beginner';
  if (wpm < 60) return 'Intermediate';
  if (wpm < 90) return 'Advanced';
  if (wpm < 120) return 'Expert';
  return 'Legendary';
}

function computeAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function buildSessionMistakes(promptChars, typedChars) {
  const mistakes = [];
  const total = Math.max(promptChars.length, typedChars.length);

  for (let i = 0; i < total; i++) {
    const expected = promptChars[i];
    const typed = typedChars[i];

    if (expected === typed) continue;

    let errorType = 'substitution';
    if (expected == null) errorType = 'insertion';
    else if (typed == null) errorType = 'omission';

    mistakes.push({
      word_expected: expected ?? '',
      word_typed: typed ?? '',
      error_type: errorType,
      position: i,
    });
  }

  return mistakes;
}


const Particles = React.memo(() => {
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 6 + 2}px`,
      height: `${Math.random() * 6 + 2}px`,
      background: Math.random() > 0.5 ? 'var(--cyan)' : 'var(--purple)',
      duration: `${Math.random() * 15 + 10}s`,
      delay: `${Math.random() * 10}s`,
      opacity: Math.random() * 0.5 + 0.2,
    }));
  }, []);

  return (
    <div className="tt-particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="tt-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.width,
            height: p.height,
            background: p.background,
            animationDuration: p.duration,
            animationDelay: p.delay,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
});

export default function TypingTest() {

  const navigator = useNavigate();

  const [prompt, setPrompt] = useState(pickPrompt);
  const [promptMeta, setPromptMeta] = useState({
    difficulty: 'medium',
    aiGenerated: false,
    source: 'sample',
  });
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptMessage, setPromptMessage] = useState('');
  const [typed, setTyped] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [focused, setFocused] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // ── New Practice Task States ──
  const [activeTask, setActiveTask] = useState(null);
  const [showDailyTaskModal, setShowDailyTaskModal] = useState(false);
  const [dailyTaskReps, setDailyTaskReps] = useState(5);
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);
  const [assessmentChoice, setAssessmentChoice] = useState(null); // '75' | '100' | '150'
  const [initialSessionStats, setInitialSessionStats] = useState(null);
  const [showImprovement, setShowImprovement] = useState(false);
  const [lastSessionId, setLastSessionId] = useState(null);
  const [liveMistakes, setLiveMistakes] = useState([]); // Tracks every wrong keypress

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const startedAt = useRef(null);
  const cardRef = useRef(null);
  const comboTimer = useRef(null);
  const submittedSessionRef = useRef(false);
  const wordsRef = useRef(null);
  const innerRef = useRef(null);

  const promptChars = prompt.split('');
  const typedChars = typed.split('');

  const correctCount = typedChars.filter((c, i) => c === promptChars[i]).length;
  const wpm = computeWPM(correctCount, elapsed);
  const accuracy = computeAccuracy(correctCount, typedChars.length);
  const progress = Math.min((typed.length / prompt.length) * 100, 100);
  const timeLeft = Math.max(timeLimit - elapsed, 0);

  const mistakes = [];
  typedChars.forEach((c, i) => {
    if (c !== promptChars[i]) mistakes.push({ expected: promptChars[i] ?? '—', typed: c });
  });

  // Keep a ref to activeTask so loadPrompt never goes stale without re-creating itself
  const activeTaskRef = useRef(activeTask);
  useEffect(() => { activeTaskRef.current = activeTask; }, [activeTask]);

  const loadPrompt = useCallback(async (isAssessment = false, wordCount = 50) => {
    const token = localStorage.getItem('access_token');

    // ── No token: use a local sample immediately ──
    if (!token) {
      setPrompt(pickPrompt());
      setPromptMeta({ difficulty: 'medium', aiGenerated: false, source: 'sample' });
      setPromptMessage('');
      return;
    }

    const currentTask = activeTaskRef.current;

    // ── Active repetition task still in progress ──
    if (currentTask && currentTask.completed_count < currentTask.repetition_count && !isAssessment) {
      setPrompt(currentTask.content);
      setPromptMeta({
        difficulty:   currentTask.difficulty,
        aiGenerated:  Boolean(currentTask.ai_generated),
        source:       'practice',
        task_id:      currentTask.task_id,
        prompt_id:    currentTask.task_id,
      });
      setPromptMessage(`Repetition ${currentTask.completed_count + 1} of ${currentTask.repetition_count}`);
      return;
    }

    // ── Fetch from backend ──
    setPromptLoading(true);
    setPromptMessage('');

    try {
      let task;

      if (isAssessment) {
        // Build mistake words from the live ref (typed into the input at finish time)
        const currentTypedChars = inputRef.current?.value?.split('') ?? [];
        const currentPromptChars = (activeTaskRef.current?.content ?? '').split('');
        const mistakeChars = [];
        currentTypedChars.forEach((c, i) => {
          if (c !== currentPromptChars[i] && currentPromptChars[i]) {
            mistakeChars.push(currentPromptChars[i]);
          }
        });

        task = await apiClient('/practice/daily-task', {
          method: 'POST',
          body: JSON.stringify({
            focus_words:          mistakeChars.length > 0 ? mistakeChars : ['focus', 'accuracy', 'precision'],
            repetition_count:     1,
            difficulty:           'hard',
            is_assessment:        true,
            word_count:           wordCount,
            original_session_id:  currentTask?.original_session_id ?? null,
          }),
        });
      } else {
        task = await apiClient('/practice/next', { method: 'GET' });
      }

      setPrompt(task.content);
      setPromptMeta({
        difficulty:  task.difficulty,
        aiGenerated: Boolean(task.ai_generated),
        source:      'practice',
        task_id:     task.task_id,
        prompt_id:   task.task_id,
      });

      if (task.repetition_count > 1) {
        setPromptMessage(`Repetition ${(task.completed_count ?? 0) + 1} of ${task.repetition_count}`);
        setActiveTask(task);
      } else {
        setActiveTask(null);
      }

    } catch (err) {
      console.error('[loadPrompt] error:', err.message);
      // Always fall back gracefully
      setPrompt(pickPrompt());
      setPromptMeta({ difficulty: 'medium', aiGenerated: false, source: 'sample' });
      if (err.message?.includes('No pending practice')) {
        setPromptMessage('Finish a test first — we\'ll generate a personalised paragraph based on your mistakes.');
      } else {
        setPromptMessage('');
      }
    } finally {
      setPromptLoading(false);
    }
  // stable: no deps that change on every keystroke
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    void loadPrompt();
    // Only run on mount
  }, []);

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
      const expectedChar = promptChars[newTypedLen - 1];
      if (newChar === expectedChar) {
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
        // Live mistake detection: record the character user struggled with
        if (expectedChar) {
          setLiveMistakes(prev => [...prev, { expected: expectedChar, typed: newChar }]);
        }
      }
    }
    setTyped(value);
  }, [finished, started, typed, promptChars]);

  const reset = useCallback((newPrompt = null) => {
    clearInterval(timerRef.current);
    setTyped('');
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setCombo(0);
    setShowCombo(false);
    setPromptMessage('');
    submittedSessionRef.current = false;
    setLiveMistakes([]);

    // Reset practice modes if starting a normal test
    if (!newPrompt) {
      setIsAssessmentMode(false);
      setAssessmentChoice(null);
      setShowImprovement(false);
    }

    if (typeof newPrompt === 'string' && newPrompt.length > 0) {
      setPrompt(newPrompt);
    } else {
      void loadPrompt();
    }

    setTimeout(() => inputRef.current?.focus(), 50);
  }, [loadPrompt]);

  const focusInput = () => inputRef.current?.focus();

  // Scroll caret into view
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


  useEffect(() => {
    if (!finished || submittedSessionRef.current) return;

    submittedSessionRef.current = true;

    if (!localStorage.getItem('access_token')) return;

    const submitSession = async () => {
      try {
        const res = await apiClient('/sessions', {
          method: 'POST',
          body: JSON.stringify({
            prompt_id: promptMeta.prompt_id,
            task_id: promptMeta.task_id,
            prompt_content: prompt,
            prompt_difficulty: promptMeta.difficulty,
            wpm,
            accuracy,
            duration_seconds: elapsed,
            keystrokes_total: typed.length,
            raw_typed_text: typed,
            mistakes: buildSessionMistakes(promptChars, typedChars),
          }),
        });

        setLastSessionId(res.session_id);

        if (activeTask) {
          // Update active task progress locally
          setActiveTask(prev => ({
            ...prev,
            completed_count: prev.completed_count + 1
          }));
        }

        if (isAssessmentMode) {
          setShowImprovement(true);
        }
      } catch (err) {
        console.error('Failed to save typing session:', err);
      }
    };

    void submitSession();
  }, [accuracy, elapsed, finished, prompt, promptChars, promptMeta.difficulty, promptMeta.task_id, typed, typedChars, wpm, activeTask, isAssessmentMode]);


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
                <span className="tt-mode-sep" style={{ margin: '0 8px', color: 'var(--cyan)', fontSize: '12px' }}>
                  {promptMeta.aiGenerated ? 'gemini prompt' : 'local prompt'}
                </span>
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
                {mistakes.length > 0 && !isAssessmentMode && (
                  <button className="tt-btn tt-btn-ghost" style={{ borderColor: 'var(--cyan)' }} onClick={() => setShowDailyTaskModal(true)}>
                    Add to Daily Task
                  </button>
                )}
                {!localStorage.getItem('access_token') && (
                  <button className="tt-btn tt-btn-ghost" onClick={() => navigator('/login')}>
                    Sign In
                  </button>
                )}
              </div>

              {showImprovement && initialSessionStats && (
                <div className="tt-improvement-card">
                  <div className="tt-imp-stat">
                    <span className="tt-imp-label">Improvement</span>
                    <span className="tt-imp-value">+{Math.max(0, wpm - initialSessionStats.wpm)} WPM</span>
                  </div>
                  <div className="tt-imp-stat">
                    <span className="tt-imp-label">Accuracy</span>
                    <span className="tt-imp-diff">
                      {accuracy > initialSessionStats.accuracy ? '↑' : '↓'} 
                      {Math.abs(accuracy - initialSessionStats.accuracy)}%
                    </span>
                  </div>
                  <div className="tt-imp-stat" style={{ textAlign: 'right' }}>
                    <span className="tt-imp-label">Practice complete</span>
                    <span style={{ color: 'var(--cyan)', fontSize: '12px' }}>Great progress!</span>
                  </div>
                </div>
              )}

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

        {/* Daily Task Modal */}
        {showDailyTaskModal && (
          <div className="tt-modal-overlay" onClick={() => setShowDailyTaskModal(false)}>
            <div className="tt-modal" onClick={e => e.stopPropagation()}>
              <h2 className="tt-modal-title">Add to Daily Tasks</h2>
              <p className="tt-modal-sub">How many times would you like to practice this paragraph to master these words?</p>
              
              <div className="tt-rep-grid">
                {[2, 5, 10].map(num => (
                  <button 
                    key={num} 
                    className={`tt-rep-btn ${dailyTaskReps === num ? 'active' : ''}`}
                    onClick={() => setDailyTaskReps(num)}
                  >
                    {num}x
                  </button>
                ))}
              </div>

              <div className="tt-actions" style={{ marginTop: '0' }}>
                 <button className="tt-btn tt-btn-primary" style={{ width: '100%' }} onClick={async () => {
                   try {
                     const finalMistakeWords = mistakes.map(m => m.expected).filter(w => w !== '—');
                     const liveMistakeWords = liveMistakes.map(m => m.expected).filter(w => w !== '—');
                     const allMistakeWords = [...finalMistakeWords, ...liveMistakeWords];

                     const task = await apiClient('/practice/daily-task', {
                       method: 'POST',
                       body: JSON.stringify({
                         focus_words: allMistakeWords.length > 0 ? allMistakeWords : ['focus', 'accuracy', 'precision'],
                         repetition_count: dailyTaskReps,
                         difficulty: promptMeta.difficulty,
                         original_session_id: lastSessionId
                       })
                     });
                     setInitialSessionStats({ wpm, accuracy });
                     setActiveTask(task);
                     setShowDailyTaskModal(false);
                     reset(task.content);
                   } catch (err) {
                     console.error('Failed to create daily task:', err);
                   }
                }}>
                  Start Practice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assessment Length Selection */}
        {activeTask && activeTask.completed_count >= activeTask.repetition_count && !isAssessmentMode && (
          <div className="tt-modal-overlay">
            <div className="tt-modal" style={{ maxWidth: '600px' }}>
              <h2 className="tt-modal-title">Practice Complete!</h2>
              <p className="tt-modal-sub">You've finished your repetitions. Now, let's see how much you've improved with a final assessment.</p>
              
              <p style={{ fontSize: '12px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Choose assessment length:
              </p>
              <div className="tt-assess-grid">
                {[75, 100, 150].map(count => (
                  <button key={count} className="tt-assess-btn" onClick={() => {
                    setIsAssessmentMode(true);
                    setAssessmentChoice(count);
                    loadPrompt(true, count);
                    setFinished(false);
                    setTyped('');
                    setElapsed(0);
                    setStarted(false);
                  }}>
                    <span className="tt-assess-count">{count}</span>
                    <span className="tt-assess-label">words</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
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
              <span className="tt-mode-sep" style={{ color: 'var(--cyan)', fontSize: '12px' }}>
                {promptLoading ? 'loading…' : promptMeta.aiGenerated ? 'gemini' : 'local'}
              </span>
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
            {promptMessage || 'click or press any key to focus'}
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