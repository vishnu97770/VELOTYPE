import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../apiClient.js'

const SAMPLE_PROMPTS = [
  "the quick brown fox jumps over the lazy dog and continues running through the open field as the warm morning sun rises above the distant hills casting long golden shadows across the dewy grass where birds have begun their cheerful songs to welcome the new day with energy and joy the fox pauses near a crystal stream to drink cool water and watch the ripples spread out in gentle circles before dashing off once more into the dense forest where tall oak trees stand like ancient guardians protecting the secrets of the woodland paths that wind between mossy rocks and fallen branches carpeted with soft green lichen",
  "practice makes perfect and every keystroke you take brings you one step closer to becoming a skilled typist who can work efficiently without looking down at the keyboard even once the goal is to build muscle memory so strong that each finger knows exactly where to go without any conscious thought just as a musician plays notes without reading sheet music your fingers should dance across the keys with natural ease and confidence typing is a fundamental skill in the modern world where communication happens primarily through written text and the ability to type quickly and accurately can make a significant difference in how productive you are each day",
  "consistency is the key to improvement and tracking your mistakes helps you learn from them every session teaches something new about your own typing patterns and where your weaknesses lie the best approach is to focus on accuracy first before trying to increase your speed because a foundation built on precision will support much faster progress in the long run when you rush and make many mistakes you reinforce bad habits that are hard to break later so take your time breathe steadily and let your fingers find the rhythm that works best for you each person has a unique style and the goal is to find your personal flow and refine it through regular practice",
  "typing is a skill that improves with deliberate and focused practice every session teaches you something new about your technique and helps you identify the specific keys or combinations that slow you down the most common trouble spots include numbers and special characters as well as capital letters that require holding down the shift key while pressing another key at the same time this coordination takes time to develop but with patience and repetition it becomes second nature just like riding a bicycle once the skill is learned it is never forgotten and only grows stronger with continued use so keep practicing every single day even if only for a few minutes",
  "the best way to improve at typing is to slow down first and focus entirely on accuracy before chasing speed many beginners make the mistake of rushing through text and frequently looking down at the keyboard or backspacing after every mistake instead try to commit to pressing each key correctly the first time even if you have to go slowly at first this deliberate approach builds stronger muscle memory and leads to greater speed gains over time the keyboard layout was designed so that common letter combinations alternate between hands reducing fatigue and increasing efficiency understanding how your fingers naturally reach each key will help you type with much less effort and far greater speed",
  "artificial intelligence is transforming the way we interact with computers and software every single day from voice assistants that understand natural language to algorithms that predict your next word as you type technology continues to reshape the boundaries of what is possible in human computer interaction the tools available to modern developers and users are extraordinarily powerful and growing more capable with each passing year learning to type efficiently means you can take full advantage of these tools without the bottleneck of slow manual input becoming an obstacle to your creative and analytical work whether you are writing essays or communicating with colleagues across the world",
  "velocity and precision are the twin pillars of expert typing mastery and both must work in harmony as you build speed without sacrificing accuracy your fingers develop an intimate knowledge of the keyboard that allows them to move with confidence and grace even under pressure the journey to becoming a fast typist is not a sprint but a marathon requiring steady incremental progress over weeks and months of consistent practice the rewards however are substantial because typing well opens doors to greater productivity in almost every area of modern life from academic writing to professional communication to creative expression so keep at it and never stop improving your technique",
];

function applyPunctuation(text) {
  const words = text.trim().split(/\s+/);
  if (words.length < 6) return text;
  const out = [];
  let pos = 0;
  while (pos < words.length) {
    const sentLen = 10 + Math.floor(Math.random() * 9);
    const end = Math.min(pos + sentLen, words.length);
    for (let i = pos; i < end; i++) {
      let w = words[i];
      if (i === pos && i > 0) w = w[0].toUpperCase() + w.slice(1);
      const mid = pos + Math.floor(sentLen * 0.55);
      if (i === mid && i < end - 1 && !/[,.]$/.test(w)) w += ',';
      if (i === end - 1) w = w.replace(/[,;]$/, '') + '.';
      out.push(w);
    }
    pos = end;
  }
  return out.join(' ');
}

const _NUM_TOKENS = ['2', '5', '10', '25', '42', '100', '7', '3', '15', '50'];
function applyNumbers(text) {
  const words = text.trim().split(/\s+/);
  if (words.length < 8) return text;
  const result = [...words];
  const count = Math.min(8, Math.floor(words.length / 8));
  const step = Math.floor(words.length / (count + 1));
  for (let i = count; i >= 1; i--) result.splice(i * step, 0, _NUM_TOKENS[(i - 1) % _NUM_TOKENS.length]);
  return result.join(' ');
}

function applyQuotes(text) {
  const words = text.trim().split(/\s+/);
  if (words.length < 10) return text;
  const result = [...words];
  const phraseCount = Math.min(3, Math.floor(words.length / 15));
  const step = Math.floor(words.length / (phraseCount + 1));
  for (let i = phraseCount; i >= 1; i--) {
    const start = i * step;
    const len = 3 + Math.floor(Math.random() * 4);
    const end = Math.min(start + len, result.length);
    result[start] = '"' + result[start];
    result[end - 1] = result[end - 1] + '"';
  }
  return result.join(' ');
}

// ── Daily Goal & Assessment Helpers ──
function _vtToday() { return new Date().toISOString().split('T')[0]; }

function vtGetDailyCount() {
  try {
    const d = JSON.parse(localStorage.getItem('vt_daily') || '{}');
    return d.date === _vtToday() ? (d.count || 0) : 0;
  } catch { return 0; }
}

function vtIncDailyCount() {
  const c = vtGetDailyCount() + 1;
  localStorage.setItem('vt_daily', JSON.stringify({ date: _vtToday(), count: c }));
  const prev = parseInt(localStorage.getItem('vt_sessions_total') || '0', 10);
  localStorage.setItem('vt_sessions_total', String(prev + 1));
  return c;
}

function vtGetGoal() {
  return parseInt(localStorage.getItem('vt_daily_goal') || '10', 10);
}

function vtShouldAssess() {
  if (!localStorage.getItem('access_token')) return false;
  if (localStorage.getItem('vt_assess_dismissed') === _vtToday()) return false;
  const total = parseInt(localStorage.getItem('vt_sessions_total') || '0', 10);
  const last = localStorage.getItem('vt_last_assessment');
  if (!last) return total >= 5;
  return (Date.now() - new Date(last).getTime()) / 86400000 >= 2;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold: #FFD600;
  --gold-light: #FFE033;
  --gold-glow: rgba(255,214,0,0.55);
  --cyan: #FFD600;
  --cyan-light: #FFE033;
  --cyan-glow: rgba(255,214,0,0.45);
  --purple: #a78bfa;
  --purple-glow: rgba(167,139,250,0.4);
  --red: #ca4754;
  --red-glow: rgba(202,71,84,0.5);
  --bg: #0A0A0A;
  --bg2: #111111;
  --bg3: #161616;
  --surface: rgba(255,255,255,0.04);
  --surface2: rgba(255,255,255,0.08);
  --border: rgba(255,255,255,0.07);
  --text: #d1d0c5;
  --sub: #555555;
  --sub2: #333333;
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
    radial-gradient(ellipse 70% 55% at 15% 15%, rgba(255,214,0,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 85% 80%, rgba(255,214,0,0.04) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 50% 110%, rgba(255,214,0,0.03) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 70% 10%, rgba(255,200,0,0.04) 0%, transparent 55%);
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
    linear-gradient(rgba(255, 214, 0, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 214, 0, 0.04) 1px, transparent 1px);
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
  padding: 0 80px;
  color: var(--text);
  perspective: 1200px;
}

.tt-container {
  width: 100%;
  max-width: 1400px;
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
  background: linear-gradient(90deg, transparent, rgba(255,214,0,0.25), transparent);
}


/* ── Brand ── */
.tt-brand {
  font-family: 'Outfit', sans-serif;
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #fff;
  cursor: pointer;
  transition: transform 0.3s ease, filter 0.3s ease;
  filter: drop-shadow(0 0 16px rgba(255,214,0,0.3));
  transform-style: preserve-3d;
}

.tt-brand:hover {
  transform: scale(1.05) translateZ(10px);
  filter: drop-shadow(0 0 28px rgba(255,214,0,0.5)) brightness(1.05);
}

.tt-brand span {
  color: #FFD600;
  text-shadow: 0 0 20px rgba(255,214,0,0.6);
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
  font-size: 15px;
  color: var(--sub);
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 10px;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.tt-mode-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,214,0,0.12), transparent);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: 10px;
}


.tt-mode-btn:hover {
  color: var(--text);
  transform: translateY(-1px) scale(1.02);
}

.tt-mode-btn:hover::before { opacity: 1; }

.tt-mode-btn.active {
  color: #FFD600;
  background: rgba(255, 214, 0, 0.14);
  box-shadow: 0 0 18px rgba(255, 214, 0, 0.3), 0 0 6px rgba(255, 214, 0, 0.15), inset 0 1px 0 rgba(255, 214, 0, 0.25);
  transform: translateY(-1px);
  text-shadow: 0 0 10px rgba(255, 214, 0, 0.6);
}

.tt-mode-btn.active-gold {
  color: var(--gold);
  background: rgba(226, 183, 20, 0.18);
  box-shadow: 0 0 20px rgba(226, 183, 20, 0.35), 0 0 8px rgba(226, 183, 20, 0.2), inset 0 1px 0 rgba(226, 183, 20, 0.3);
  transform: translateY(-1px);
  text-shadow: 0 0 12px rgba(226, 183, 20, 0.6);
}

.tt-mode-btn.active-ai {
  color: var(--purple);
  background: rgba(167, 139, 250, 0.18);
  box-shadow: 0 0 20px rgba(167, 139, 250, 0.35), 0 0 8px rgba(167, 139, 250, 0.2), inset 0 1px 0 rgba(167, 139, 250, 0.3);
  transform: translateY(-1px);
  text-shadow: 0 0 12px rgba(167, 139, 250, 0.6);
}

.tt-ai-btn {
  font-weight: 700;
  letter-spacing: 0.4px;
}

.tt-custom-input {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(226, 183, 20, 0.4);
  border-radius: 8px;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  padding: 5px 10px;
  outline: none;
  width: 110px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.tt-custom-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 8px rgba(226, 183, 20, 0.3);
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
  font-weight: 700 !important;
  padding: 8px 20px !important;
  background: #FFD600 !important;
  color: #0A0A0A !important;
  border-radius: 10px !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  box-shadow: 0 4px 16px rgba(255, 214, 0, 0.35) !important;
  letter-spacing: 0.3px !important;
}

.tt-login-btn:hover {
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 8px 28px rgba(255, 214, 0, 0.55) !important;
  filter: brightness(1.08) !important;
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
  padding: 20px 28px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 16px;
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-style: preserve-3d;
  min-width: 120px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06);
  position: relative;
  overflow: hidden;
}

.tt-stat::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 214, 0, 0.4), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}


.tt-stat:hover {
  transform: translateY(-5px) rotateX(6deg);
  border-color: rgba(255, 214, 0, 0.25);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 28px rgba(255, 214, 0, 0.1);
}

.tt-stat:hover::before { opacity: 1; }


.tt-stat-label {
  font-size: 13px;
  color: var(--sub);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.tt-stat-value {
  font-family: 'Outfit', sans-serif;
  font-size: 38px;
  font-weight: 800;
  color: #FFD600;
  line-height: 1;
  transition: all 0.3s ease;
  text-shadow: 0 0 20px rgba(255, 214, 0, 0.7), 0 0 40px rgba(255, 214, 0, 0.25);
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
  background: linear-gradient(90deg, transparent, rgba(255,214,0,0.6), rgba(255,230,0,0.4), rgba(255,214,0,0.6), transparent);
  filter: blur(1px);
}


/* Mouse-follow spotlight */
.tt-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 50% 40% at var(--mx, 50%) var(--my, 50%), rgba(255, 214, 0, 0.05) 0%, transparent 70%);
  pointer-events: none;
  transition: background 0.15s;
}


.tt-card.focused {
  border-color: rgba(255, 214, 0, 0.2);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.65),
    0 0 50px rgba(255, 214, 0, 0.06),
    0 0 0 1px rgba(255, 214, 0, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}


/* ── Words ── */
.tt-words {
  font-size: 30px;
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
  box-shadow: 0 0 12px var(--cyan-glow), 0 0 30px rgba(255, 214, 0, 0.5), 0 0 60px rgba(255, 214, 0, 0.2);
  animation: caretBlink 1s step-end infinite;
}


@keyframes caretBlink {
  0%, 100% { opacity: 1; box-shadow: 0 0 12px var(--cyan-glow), 0 0 30px rgba(255, 214, 0, 0.5); }
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
  background: linear-gradient(90deg, rgba(255, 214, 0, 0.6), var(--cyan), var(--cyan-light));
  border-radius: 4px;
  transition: width 0.15s linear;
  box-shadow: 0 0 14px rgba(255, 214, 0, 0.8), 0 0 30px rgba(255, 214, 0, 0.4);
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
  box-shadow: 0 0 14px rgba(255, 214, 0, 0.9), 0 0 30px rgba(255, 214, 0, 0.6);
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
  background: linear-gradient(135deg, #FFD600, #e6c000);
  color: #111214;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(255, 214, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.15) inset;
  border: 1px solid rgba(255, 214, 0, 0.4);
}

.tt-btn-primary:hover {
  transform: translateY(-3px) scale(1.04);
  box-shadow: 0 10px 40px rgba(255, 214, 0, 0.6), 0 0 20px rgba(255, 214, 0, 0.3);
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
  border-color: rgba(255, 214, 0, 0.3);
  transform: translateY(-3px) scale(1.02);
  background: rgba(255, 214, 0, 0.06);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 214, 0, 0.1);
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
  border-color: rgba(255, 214, 0, 0.2);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(255, 214, 0, 0.1);
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
  background: rgba(255, 214, 0, 0.1);
  border: 1px solid rgba(255, 214, 0, 0.2);
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
.tt-rep-btn:hover { border-color: var(--cyan); background: rgba(255,214,0,0.08); }
.tt-rep-btn.active { background: var(--cyan); color: #111; font-weight: 700; border-color: var(--cyan); }

/* ── AI Fix Modal ── */
.tt-modal.tt-modal-ai::before {
  background: linear-gradient(90deg, var(--purple), var(--cyan));
}
.tt-ai-word-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}
.tt-ai-word-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  padding: 14px 8px;
  border-radius: 12px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.tt-ai-word-btn:hover { border-color: var(--purple); background: rgba(167,139,250,0.08); }
.tt-ai-word-btn.active { background: rgba(167,139,250,0.22); border-color: var(--purple); color: var(--purple); }
.tt-ai-mistake-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 20px;
  max-height: 90px;
  overflow-y: auto;
}
.tt-ai-mistake-char {
  background: rgba(202,71,84,0.12);
  border: 1px solid rgba(202,71,84,0.3);
  border-radius: 6px;
  padding: 3px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--red);
}

/* ── Improvement Card ── */
.tt-improvement-card {
  background: linear-gradient(135deg, rgba(255, 214, 0, 0.1), rgba(167, 139, 250, 0.1));
  border: 1px solid rgba(255, 214, 0, 0.2);
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
  background: rgba(255,214,0,0.08);
}
.tt-assess-count { font-size: 24px; font-weight: 800; color: var(--cyan); }
.tt-assess-label { font-size: 12px; color: var(--sub); }

/* ── Daily Goal Widget ── */
.tt-daily-widget {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  user-select: none;
}
.tt-daily-widget:hover { border-color: var(--border); }
.tt-daily-label { font-size: 10px; color: var(--sub); letter-spacing: 0.5px; white-space: nowrap; }
.tt-daily-bar-track { width: 60px; height: 3px; background: var(--bg3); border-radius: 2px; overflow: hidden; }
.tt-daily-bar-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease, background 0.3s; }

/* ── Goal Editor Dropdown ── */
.tt-goal-dropdown {
  position: fixed;
  top: 60px;
  right: 20px;
  z-index: 300;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.6);
}
.tt-goal-title { color: var(--text); font-size: 13px; font-weight: 600; }
.tt-goal-sub { color: var(--sub); font-size: 11px; }
.tt-goal-presets { display: flex; gap: 6px; flex-wrap: wrap; }
.tt-goal-preset-btn {
  padding: 5px 11px; border-radius: 6px; border: 1px solid var(--border);
  background: transparent; color: var(--sub); cursor: pointer; font-size: 12px;
  transition: all 0.2s; font-family: inherit;
}
.tt-goal-preset-btn.active {
  border-color: var(--gold); background: rgba(226,183,20,0.15); color: var(--gold);
}
.tt-goal-preset-btn:hover { border-color: var(--sub); color: var(--text); }
.tt-goal-input {
  background: var(--bg3); border: 1px solid var(--border); border-radius: 6px;
  padding: 6px 10px; color: var(--text); font-size: 12px; font-family: inherit;
  width: 100%;
}
.tt-goal-input:focus { outline: none; border-color: var(--gold); }
.tt-goal-set-btn {
  padding: 8px; border-radius: 6px;
  background: rgba(226,183,20,0.18); border: 1px solid rgba(226,183,20,0.4);
  color: var(--gold); cursor: pointer; font-size: 12px; font-family: inherit;
  transition: background 0.2s;
}
.tt-goal-set-btn:hover { background: rgba(226,183,20,0.28); }

/* ── Assessment Banner ── */
.tt-assessment-banner {
  background: linear-gradient(135deg, rgba(226,183,20,0.1), rgba(226,183,20,0.04));
  border: 1px solid rgba(226,183,20,0.28);
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.tt-assessment-banner-text {
  flex: 1; min-width: 200px; color: var(--gold); font-size: 13px; line-height: 1.5;
}
.tt-assess-take-btn {
  padding: 8px 16px; border-radius: 8px; border: 1px solid var(--gold);
  background: rgba(226,183,20,0.18); color: var(--gold); font-size: 12px;
  cursor: pointer; font-family: inherit; transition: background 0.2s; white-space: nowrap;
}
.tt-assess-take-btn:hover { background: rgba(226,183,20,0.3); }
.tt-assess-skip-btn {
  padding: 8px 14px; border-radius: 8px; border: 1px solid var(--sub2);
  background: transparent; color: var(--sub); font-size: 12px;
  cursor: pointer; font-family: inherit; transition: background 0.2s; white-space: nowrap;
}
.tt-assess-skip-btn:hover { background: rgba(255,255,255,0.04); }

/* ── Goal Met Celebration ── */
@keyframes goalPop {
  0% { transform: scale(0.8); opacity: 0; }
  60% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
.tt-goal-met {
  animation: goalPop 0.4s ease forwards;
  color: var(--gold) !important;
}

/* ── Guest Signup Prompt ── */
.tt-signup-overlay {
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(16px);
}
.tt-signup-modal {
  background: #111;
  border: 1px solid rgba(255,214,0,0.2);
  border-radius: 24px;
  padding: 36px 32px 28px;
  width: 100%;
  max-width: 420px;
  position: relative;
  overflow: hidden;
  text-align: center;
  box-shadow: 0 32px 80px rgba(0,0,0,0.9), 0 0 60px rgba(255,214,0,0.06);
  animation: signupSlide 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes signupSlide {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.tt-signup-modal::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #FFD600, transparent);
}
.tt-signup-close {
  position: absolute;
  top: 14px; right: 14px;
  background: none;
  border: none;
  color: #555;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 8px;
  transition: color 0.2s;
}
.tt-signup-close:hover { color: #fff; }
.tt-signup-icon {
  font-size: 28px;
  color: #FFD600;
  margin-bottom: 12px;
  text-shadow: 0 0 20px rgba(255,214,0,0.6);
}
.tt-signup-title {
  font-family: 'Outfit', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}
.tt-signup-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
}
.tt-signup-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: rgba(255,214,0,0.06);
  border: 1px solid rgba(255,214,0,0.12);
  border-radius: 14px;
  padding: 16px 24px;
  margin-bottom: 18px;
}
.tt-signup-stat { text-align: center; }
.tt-signup-stat-val {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #FFD600;
  line-height: 1;
  text-shadow: 0 0 20px rgba(255,214,0,0.5);
}
.tt-signup-stat-label {
  display: block;
  font-size: 11px;
  color: #555;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
}
.tt-signup-stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.08);
}
.tt-signup-benefits {
  text-align: left;
  margin-bottom: 22px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.tt-signup-benefit {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #888;
}
.tt-signup-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}
.tt-signup-cta {
  background: #FFD600;
  color: #0A0A0A;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(255,214,0,0.35);
}
.tt-signup-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(255,214,0,0.5);
}
.tt-signup-secondary {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px 20px;
  font-family: 'Outfit', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #d1d0c5;
  cursor: pointer;
  transition: all 0.2s;
}
.tt-signup-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
.tt-signup-skip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}
.tt-signup-skip:hover { color: #555; }
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
      background: Math.random() > 0.6 ? 'var(--gold)' : 'rgba(255,214,0,0.5)',
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
  const [modeType, setModeType] = useState('time');   // 'time' | 'words'
  const [wordLimit, setWordLimit] = useState(50);
  const [withPunctuation, setWithPunctuation] = useState(false);
  const [withNumbers, setWithNumbers] = useState(false);
  const [withQuotes, setWithQuotes] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showCustomTimeInput, setShowCustomTimeInput] = useState(false);
  const [showCustomWordInput, setShowCustomWordInput] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [aiWordCount, setAiWordCount] = useState(50);
  const [showAiFixModal, setShowAiFixModal] = useState(false);
  const [aiFixWordCount, setAiFixWordCount] = useState(50);
  const [aiFixGenerating, setAiFixGenerating] = useState(false);
  const [aiFixError, setAiFixError] = useState('');

  // ── Daily Goal ──
  const [dailyCount, setDailyCount] = useState(() => vtGetDailyCount());
  const [dailyGoal, setDailyGoal] = useState(() => vtGetGoal());
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [goalEditorVal, setGoalEditorVal] = useState('');
  const [goalJustMet, setGoalJustMet] = useState(false);

  // ── Assessment Reminder ──
  const [showAssessmentBanner, setShowAssessmentBanner] = useState(false);

  // ── Guest signup prompt (shown after first completed test for non-logged-in users) ──
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

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
  const wordsTyped = typed.trim() ? typed.trim().split(/\s+/).length : 0;
  const totalWords = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  const mistakes = [];
  typedChars.forEach((c, i) => {
    if (c !== promptChars[i]) mistakes.push({ expected: promptChars[i] ?? '—', typed: c });
  });

  // Keep a ref to activeTask so loadPrompt never goes stale without re-creating itself
  const activeTaskRef = useRef(activeTask);
  useEffect(() => { activeTaskRef.current = activeTask; }, [activeTask]);

  // Tracks the last task_id that was submitted — passed as skip_task_id to /practice/next
  // so we never get the same task back due to a DB-update race condition.
  const lastCompletedTaskIdRef = useRef(null);

  // Refs for mode/content settings so loadPrompt (stable callback) can read current values
  const modeTypeRef = useRef('time');
  const wordLimitRef = useRef(50);
  const withPunctuationRef = useRef(false);
  const withNumbersRef = useRef(false);
  const withQuotesRef = useRef(false);
  const customTopicRef = useRef('');
  const aiModeRef = useRef(false);
  const aiWordCountRef = useRef(50);

  const loadPrompt = useCallback(async (isAssessment = false, wordCount = 50) => {
    const applyModifiers = (raw) => {
      let t = raw;
      if (withQuotesRef.current) t = applyQuotes(t);
      if (withNumbersRef.current) t = applyNumbers(t);
      if (withPunctuationRef.current) t = applyPunctuation(t);
      if (modeTypeRef.current === 'words') {
        const wds = t.trim().split(/\s+/);
        t = wds.slice(0, wordLimitRef.current).join(' ');
      }
      return t;
    };

    const token = localStorage.getItem('access_token');

    // ── AI mode OFF, or no token: always use local samples ──
    if (!aiModeRef.current || !token) {
      setPrompt(applyModifiers(pickPrompt()));
      setPromptMeta({ difficulty: 'medium', aiGenerated: false, source: 'sample' });
      setPromptMessage(aiModeRef.current && !token ? 'Sign in to use AI mode' : '');
      return;
    }

    // ── AI mode ON ──
    const currentTask = activeTaskRef.current;

    if (currentTask && currentTask.completed_count < currentTask.repetition_count && !isAssessment) {
      setPrompt(applyModifiers(currentTask.content));
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

    setPromptLoading(true);
    setPromptMessage('');

    try {
      let task;
      const aiWC = modeTypeRef.current === 'words' ? wordLimitRef.current : aiWordCountRef.current;

      if (isAssessment) {
        const currentTypedChars = inputRef.current?.value?.split('') ?? [];
        const currentPromptChars = (activeTaskRef.current?.content ?? '').split('');
        const mistakeChars = [];
        currentTypedChars.forEach((c, i) => {
          if (c !== currentPromptChars[i] && currentPromptChars[i]) mistakeChars.push(currentPromptChars[i]);
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
        const skipId = lastCompletedTaskIdRef.current;
        lastCompletedTaskIdRef.current = null;
        const params = new URLSearchParams();
        if (skipId) params.set('skip_task_id', skipId);
        params.set('word_count', String(aiWC));
        if (withPunctuationRef.current) params.set('with_punctuation', 'true');
        if (withNumbersRef.current) params.set('with_numbers', 'true');
        if (withQuotesRef.current) params.set('with_quotes', 'true');
        if (customTopicRef.current) params.set('custom_topic', customTopicRef.current);
        const qs = params.toString();
        task = await apiClient(`/practice/next?${qs}`, { method: 'GET' });
      }

      setPrompt(applyModifiers(task.content));
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
      setPrompt(applyModifiers(pickPrompt()));
      setPromptMeta({ difficulty: 'medium', aiGenerated: false, source: 'sample' });
      setPromptMessage(
        err.message?.includes('No pending practice')
          ? 'Complete a test first — AI will generate a paragraph based on your mistakes.'
          : ''
      );
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
        if (timeLimit > 0 && secs >= timeLimit) {
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

    if (!localStorage.getItem('access_token')) {
      setShowSignupPrompt(true);
      return;
    }

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

        // Track daily goal progress
        const newCount = vtIncDailyCount();
        setDailyCount(newCount);
        if (newCount === vtGetGoal()) setGoalJustMet(true);
        if (vtShouldAssess()) setShowAssessmentBanner(true);

        // Record which task was just completed so loadPrompt can skip it
        // if the DB update hasn't landed by the time /practice/next is called.
        if (promptMeta.task_id) {
          lastCompletedTaskIdRef.current = promptMeta.task_id;
        }

        if (activeTask) {
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
                <span className="tt-mode-sep" style={{ margin: '0 8px', color: 'var(--gold)', fontSize: '12px' }}>
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
                {aiMode && mistakes.length > 0 && localStorage.getItem('access_token') ? (
                  <>
                    <button
                      className="tt-btn tt-btn-primary"
                      style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.35), rgba(167,139,250,0.15))', borderColor: 'var(--purple)', color: 'var(--purple)' }}
                      onClick={() => { setAiFixWordCount(aiWordCount); setShowAiFixModal(true); }}
                    >✦ Fix with AI</button>
                    <button className="tt-btn tt-btn-ghost" onClick={() => reset()}>Skip →</button>
                  </>
                ) : (
                  <button className="tt-btn tt-btn-primary" onClick={() => reset()}>Next Test →</button>
                )}
                <button className="tt-btn tt-btn-ghost" onClick={() => reset(prompt)}>Retry</button>
                {mistakes.length > 0 && !isAssessmentMode && (
                  <button className="tt-btn tt-btn-ghost" style={{ borderColor: 'var(--gold)' }} onClick={() => setShowDailyTaskModal(true)}>
                    Add to Daily Task
                  </button>
                )}
                {!localStorage.getItem('access_token') && (
                  <button className="tt-btn tt-btn-ghost" onClick={() => navigator('/login')}>Sign In</button>
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
                    <span style={{ color: 'var(--gold)', fontSize: '12px' }}>Great progress!</span>
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

              {/* Bi-daily assessment reminder */}
              {showAssessmentBanner && !isAssessmentMode && (
                <div className="tt-assessment-banner">
                  <span className="tt-assessment-banner-text">
                    🎯 Time for your bi-daily assessment! Two days of practice tracked — see how much you've improved.
                  </span>
                  <button
                    className="tt-assess-take-btn"
                    onClick={() => {
                      localStorage.setItem('vt_last_assessment', new Date().toISOString());
                      setShowAssessmentBanner(false);
                      setIsAssessmentMode(true);
                      setAssessmentChoice(100);
                      loadPrompt(true, 100);
                      setFinished(false);
                      setTyped('');
                      setElapsed(0);
                      setStarted(false);
                      submittedSessionRef.current = false;
                      setTimeout(() => inputRef.current?.focus(), 100);
                    }}
                  >Take Assessment →</button>
                  <button
                    className="tt-assess-skip-btn"
                    onClick={() => {
                      localStorage.setItem('vt_assess_dismissed', _vtToday());
                      setShowAssessmentBanner(false);
                    }}
                  >Later</button>
                </div>
              )}

              {/* Daily goal met celebration */}
              {goalJustMet && (
                <div style={{
                  textAlign: 'center', padding: '14px', marginTop: '12px',
                  background: 'linear-gradient(135deg, rgba(226,183,20,0.12), rgba(226,183,20,0.04))',
                  border: '1px solid rgba(226,183,20,0.3)', borderRadius: '10px',
                  color: 'var(--gold)', fontSize: '13px', animation: 'goalPop 0.4s ease',
                }}>
                  🏆 Daily goal reached! You completed {dailyCount} sessions today.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Guest Signup Prompt */}
        {showSignupPrompt && (
          <div className="tt-modal-overlay tt-signup-overlay" onClick={() => setShowSignupPrompt(false)}>
            <div className="tt-signup-modal" onClick={e => e.stopPropagation()}>
              <button className="tt-signup-close" onClick={() => setShowSignupPrompt(false)}>✕</button>

              <div className="tt-signup-icon">✦</div>
              <h2 className="tt-signup-title">Nice typing!</h2>
              <p className="tt-signup-sub">
                Create a free account to unlock AI-powered improvement, track every session, and watch your progress over time.
              </p>

              {/* Mini stats preview */}
              <div className="tt-signup-stats">
                <div className="tt-signup-stat">
                  <span className="tt-signup-stat-val">{wpm}</span>
                  <span className="tt-signup-stat-label">WPM</span>
                </div>
                <div className="tt-signup-stat-divider" />
                <div className="tt-signup-stat">
                  <span className="tt-signup-stat-val">{accuracy}%</span>
                  <span className="tt-signup-stat-label">Accuracy</span>
                </div>
              </div>

              <div className="tt-signup-benefits">
                <div className="tt-signup-benefit">✓ AI paragraphs targeting your weak spots</div>
                <div className="tt-signup-benefit">✓ Progress dashboard & WPM history</div>
                <div className="tt-signup-benefit">✓ Daily goals & bi-daily assessments</div>
              </div>

              <div className="tt-signup-actions">
                <button className="tt-signup-cta" onClick={() => navigator('/login?tab=register')}>
                  Create Free Account →
                </button>
                <button className="tt-signup-secondary" onClick={() => { setShowSignupPrompt(false); navigator('/login'); }}>
                  Sign In
                </button>
              </div>

              <p className="tt-signup-skip" onClick={() => setShowSignupPrompt(false)}>Continue as guest</p>
            </div>
          </div>
        )}

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
                     // Must update promptMeta before reset() so task_id is included in the
                     // first repetition's session submission (completed_count depends on it).
                     setPromptMeta({
                       difficulty:  task.difficulty,
                       aiGenerated: Boolean(task.ai_generated),
                       source:      'practice',
                       task_id:     task.task_id,
                       prompt_id:   task.task_id,
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

        {/* ── AI Fix Modal ── */}
        {showAiFixModal && (
          <div
            className="tt-modal-overlay"
            onClick={() => { if (!aiFixGenerating) { setShowAiFixModal(false); setAiFixError(''); } }}
          >
            <div className="tt-modal tt-modal-ai" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
              <h2 className="tt-modal-title" style={{ color: 'var(--purple)' }}>✦ AI Fix Paragraph</h2>
              <p className="tt-modal-sub">
                {mistakes.length} mistake{mistakes.length !== 1 ? 's' : ''} detected — Gemini will craft a paragraph targeting exactly these characters so you can drill them.
              </p>

              {/* Mistake character chips */}
              <div className="tt-ai-mistake-chips">
                {[...new Set(
                  [...mistakes.map(m => m.expected), ...liveMistakes.map(m => m.expected)]
                    .filter(c => c && c !== '—' && c.trim())
                )].map((char, i) => (
                  <span key={i} className="tt-ai-mistake-char">"{char}"</span>
                ))}
              </div>

              {/* Word count picker */}
              <p style={{ fontSize: '11px', color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                How long should the paragraph be?
              </p>
              <div className="tt-ai-word-grid">
                {[25, 50, 75, 100].map(w => (
                  <button
                    key={w}
                    className={`tt-ai-word-btn ${aiFixWordCount === w ? 'active' : ''}`}
                    onClick={() => { if (!aiFixGenerating) setAiFixWordCount(w); }}
                  >
                    <span>{w}</span>
                    <span style={{ fontSize: '10px', opacity: 0.65 }}>words</span>
                  </button>
                ))}
              </div>

              {/* Generating hint */}
              {aiFixGenerating && (
                <p style={{ fontSize: '12px', color: 'var(--purple)', marginBottom: '12px', textAlign: 'center' }}>
                  Asking Gemini… this takes 10–20 seconds, please wait.
                </p>
              )}

              {/* Error display */}
              {aiFixError && (
                <p style={{ fontSize: '13px', color: 'var(--red)', marginBottom: '12px', lineHeight: 1.5 }}>
                  ⚠ {aiFixError}
                </p>
              )}

              <div className="tt-actions" style={{ marginTop: 0 }}>
                <button
                  className="tt-btn tt-btn-primary"
                  style={{
                    flex: 1,
                    opacity: aiFixGenerating ? 0.6 : 1,
                    background: 'linear-gradient(135deg, rgba(167,139,250,0.4), rgba(167,139,250,0.2))',
                    borderColor: 'var(--purple)',
                    color: 'var(--purple)',
                  }}
                  disabled={aiFixGenerating}
                  onClick={async () => {
                    setAiFixError('');
                    setAiFixGenerating(true);

                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 35000);

                    try {
                      const mistakeChars = [...new Set(
                        [...mistakes.map(m => m.expected), ...liveMistakes.map(m => m.expected)]
                          .filter(c => c && c !== '—' && c.trim())
                      )];

                      const task = await apiClient('/practice/daily-task', {
                        method: 'POST',
                        signal: controller.signal,
                        body: JSON.stringify({
                          focus_words: mistakeChars.length > 0 ? mistakeChars : ['focus', 'accuracy', 'precision'],
                          repetition_count: 1,
                          difficulty: 'medium',
                          word_count: aiFixWordCount,
                          original_session_id: lastSessionId,
                        }),
                      });

                      clearTimeout(timeoutId);
                      setPromptMeta({
                        difficulty:  task.difficulty,
                        aiGenerated: Boolean(task.ai_generated),
                        source:      'practice',
                        task_id:     task.task_id,
                        prompt_id:   task.task_id,
                      });
                      setActiveTask(task);
                      setShowAiFixModal(false);
                      setAiFixError('');
                      reset(task.content);
                    } catch (err) {
                      clearTimeout(timeoutId);
                      console.error('[AI Fix]', err);
                      if (err.name === 'AbortError') {
                        setAiFixError('Request timed out (35 s). Check that the backend is running on port 8000 and try again.');
                      } else {
                        setAiFixError(err.message || 'Failed to generate paragraph. Make sure the backend is running and you are signed in.');
                      }
                    } finally {
                      setAiFixGenerating(false);
                    }
                  }}
                >
                  {aiFixGenerating ? '⏳ Asking Gemini…' : '✦ Generate Paragraph'}
                </button>
                <button
                  className="tt-btn tt-btn-ghost"
                  disabled={aiFixGenerating}
                  onClick={() => { if (!aiFixGenerating) { setShowAiFixModal(false); setAiFixError(''); reset(); } }}
                >
                  Skip
                </button>
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
              {/* Mode type: time | words */}
              <button
                className={`tt-mode-btn ${modeType === 'time' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); if (modeType !== 'time') { modeTypeRef.current = 'time'; setModeType('time'); setTimeLimit(60); reset(); } }}
              >time</button>
              <button
                className={`tt-mode-btn ${modeType === 'words' ? 'active' : ''}`}
                onClick={(e) => { e.stopPropagation(); if (modeType !== 'words') { modeTypeRef.current = 'words'; setModeType('words'); setTimeLimit(0); reset(); } }}
              >words</button>

              <span className="tt-mode-sep">|</span>

              {/* Time options OR word count options */}
              {modeType === 'time' ? (<>
                {[{ label: '15s', val: 15 }, { label: '30s', val: 30 }, { label: '60s', val: 60 }, { label: '∞', val: 0 }].map(({ label, val }) => (
                  <button
                    key={val}
                    className={`tt-mode-btn ${timeLimit === val ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setShowCustomTimeInput(false); reset(); setTimeLimit(val); }}
                  >{label}</button>
                ))}
                <button
                  className={`tt-mode-btn ${![15, 30, 60, 0].includes(timeLimit) ? 'active' : ''}`}
                  title="Custom duration"
                  onClick={(e) => { e.stopPropagation(); setShowCustomTimeInput(v => !v); }}
                >{![15, 30, 60, 0].includes(timeLimit) ? `${timeLimit}s` : 'custom'}</button>
                {showCustomTimeInput && (
                  <input
                    className="tt-custom-input"
                    style={{ width: '70px' }}
                    type="number"
                    min="5"
                    max="600"
                    placeholder="sec"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) { setTimeLimit(val); setShowCustomTimeInput(false); reset(); }
                      } else if (e.key === 'Escape') { setShowCustomTimeInput(false); }
                    }}
                  />
                )}
              </>) : (<>
                {[25, 50, 75, 100].map((w) => (
                  <button
                    key={w}
                    className={`tt-mode-btn ${wordLimit === w ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setShowCustomWordInput(false); wordLimitRef.current = w; setWordLimit(w); reset(); }}
                  >{w}</button>
                ))}
                <button
                  className={`tt-mode-btn ${![25, 50, 75, 100].includes(wordLimit) ? 'active' : ''}`}
                  title="Custom word count"
                  onClick={(e) => { e.stopPropagation(); setShowCustomWordInput(v => !v); }}
                >{![25, 50, 75, 100].includes(wordLimit) ? `${wordLimit}w` : 'custom'}</button>
                {showCustomWordInput && (
                  <input
                    className="tt-custom-input"
                    style={{ width: '70px' }}
                    type="number"
                    min="10"
                    max="500"
                    placeholder="words"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) { wordLimitRef.current = val; setWordLimit(val); setShowCustomWordInput(false); reset(); }
                      } else if (e.key === 'Escape') { setShowCustomWordInput(false); }
                    }}
                  />
                )}
              </>)}

              <span className="tt-mode-sep">|</span>

              {/* Content toggles */}
              <button
                className={`tt-mode-btn ${withPunctuation ? 'active-gold' : ''}`}
                title="Include punctuation"
                onClick={(e) => { e.stopPropagation(); const v = !withPunctuation; withPunctuationRef.current = v; setWithPunctuation(v); reset(); }}
              >punct</button>
              <button
                className={`tt-mode-btn ${withNumbers ? 'active-gold' : ''}`}
                title="Include numbers"
                onClick={(e) => { e.stopPropagation(); const v = !withNumbers; withNumbersRef.current = v; setWithNumbers(v); reset(); }}
              >numbers</button>
              <button
                className={`tt-mode-btn ${withQuotes ? 'active-gold' : ''}`}
                title="Emphasise common chord-like word combinations"
                onClick={(e) => { e.stopPropagation(); const v = !withQuotes; withQuotesRef.current = v; setWithQuotes(v); reset(); }}
              >quotes</button>
              <button
                className={`tt-mode-btn ${customTopic ? 'active-gold' : ''}`}
                title="Set a custom topic for AI-generated paragraphs"
                onClick={(e) => { e.stopPropagation(); setShowCustomInput(v => !v); }}
              >custom</button>

              {showCustomInput && (
                <input
                  className="tt-custom-input"
                  placeholder="topic…"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.stopPropagation();
                      customTopicRef.current = e.target.value;
                      setShowCustomInput(false);
                      reset();
                    } else if (e.key === 'Escape') {
                      setShowCustomInput(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              )}

              <span className="tt-mode-sep">|</span>

              {/* AI Mode toggle */}
              <button
                className={`tt-mode-btn tt-ai-btn ${aiMode ? 'active-ai' : ''}`}
                title={aiMode ? 'AI mode ON — paragraphs generated from your mistakes' : 'AI mode OFF — standard prompts'}
                onClick={(e) => {
                  e.stopPropagation();
                  const v = !aiMode;
                  aiModeRef.current = v;
                  setAiMode(v);
                  reset();
                }}
              >✦ AI</button>

              {/* AI word count — only visible when AI mode is ON */}
              {aiMode && [25, 50, 100].map((w) => (
                <button
                  key={w}
                  className={`tt-mode-btn ${aiWordCount === w ? 'active-ai' : ''}`}
                  title={`AI generates ${w}-word paragraphs`}
                  onClick={(e) => {
                    e.stopPropagation();
                    aiWordCountRef.current = w;
                    setAiWordCount(w);
                  }}
                >{w}w</button>
              ))}

              <span className="tt-mode-sep">|</span>
              <button className="tt-mode-btn" onClick={(e) => { e.stopPropagation(); reset(); }} title="New prompt">↺</button>
              <span className="tt-mode-sep" style={{ color: aiMode ? 'var(--purple)' : 'var(--gold)', fontSize: '12px' }}>
                {promptLoading ? 'loading…' : aiMode ? (promptMeta.aiGenerated ? 'gemini' : 'ai') : 'local'}
              </span>

              {/* Daily goal pill */}
              {localStorage.getItem('access_token') && (
                <>
                  <span className="tt-mode-sep">|</span>
                  <div
                    className="tt-daily-widget"
                    title="Daily goal — click to edit"
                    onClick={(e) => { e.stopPropagation(); setGoalEditorVal(String(dailyGoal)); setShowGoalEditor(v => !v); }}
                  >
                    <span className={`tt-daily-label ${goalJustMet ? 'tt-goal-met' : ''}`}>
                      {dailyCount}/{dailyGoal} today
                    </span>
                    <div className="tt-daily-bar-track">
                      <div
                        className="tt-daily-bar-fill"
                        style={{
                          width: `${Math.min(100, (dailyCount / dailyGoal) * 100)}%`,
                          background: dailyCount >= dailyGoal ? 'var(--gold)' : 'var(--gold)',
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
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
              <span className="tt-stat-label">{modeType === 'words' ? 'WORDS' : 'TIME'}</span>
              <span className={`tt-stat-value ${!started ? 'dim' : (modeType === 'time' && timeLimit > 0 && timeLeft <= 10) ? 'danger' : ''}`}>
                {modeType === 'words'
                  ? (started ? `${wordsTyped}/${totalWords}` : `0/${totalWords || wordLimit}`)
                  : (started ? (timeLimit > 0 ? timeLeft : elapsed) : (timeLimit > 0 ? timeLimit : '∞'))
                }
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

      {/* Goal editor dropdown */}
      {showGoalEditor && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 400 }}
          onClick={() => setShowGoalEditor(false)}
        >
          <div
            className="tt-goal-dropdown"
            onClick={e => e.stopPropagation()}
          >
            <p className="tt-goal-title">Daily Goal</p>
            <p className="tt-goal-sub">Sessions to complete each day</p>
            <div className="tt-goal-presets">
              {[5, 10, 20, 30].map(g => (
                <button
                  key={g}
                  className={`tt-goal-preset-btn ${dailyGoal === g ? 'active' : ''}`}
                  onClick={() => {
                    localStorage.setItem('vt_daily_goal', String(g));
                    setDailyGoal(g);
                    setGoalEditorVal(String(g));
                  }}
                >{g}</button>
              ))}
            </div>
            <input
              className="tt-goal-input"
              type="number"
              min="1"
              max="100"
              placeholder="Custom number…"
              value={goalEditorVal}
              onChange={e => setGoalEditorVal(e.target.value)}
              onKeyDown={e => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  const val = parseInt(goalEditorVal, 10);
                  if (val > 0) { localStorage.setItem('vt_daily_goal', String(val)); setDailyGoal(val); setShowGoalEditor(false); }
                }
              }}
            />
            <button
              className="tt-goal-set-btn"
              onClick={() => {
                const val = parseInt(goalEditorVal, 10);
                if (val > 0) { localStorage.setItem('vt_daily_goal', String(val)); setDailyGoal(val); }
                setShowGoalEditor(false);
              }}
            >Set Goal</button>
          </div>
        </div>
      )}
    </>
  );
}