import {useState, useRef, useEffect, useCallback} from 'react'
import {useNavigate} from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const SAMPLE_PROMPTS = [
  "the quick brown fox jumps over the lazy dog and runs across the open field under the bright morning sun",
  "practice makes perfect and every keystroke you take brings you one step closer to becoming a faster typist",
  "consistency is the key to improvement track your mistakes learn from them and watch your speed increase",
  "typing is a skill that improves with deliberate focused practice every session teaches you something new",
  "the best way to get better at typing is to slow down first and focus on accuracy before chasing speed",
];


const styles = `
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Page ── */
.tt-page {
  font-family: 'Roboto Mono', monospace;
  background-color: transparent;

  min-height: 100vh;
  width: 100vw;

  display: flex;
  flex-direction: column;

  padding: 40px 60px;
  color: #d1d0c5;
}

/* ── Container (NEW) ── */
.tt-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}

/* ── Top bar ── */
.tt-topbar {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 50px;
}

.tt-brand {
  display: none; /* Handled by Navbar now */
}

/* ── Mode bar ── */
.tt-modebar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tt-mode-btn {
  background: #242526;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 0 rgba(0,0,0,0.3);
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  color: #646669;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: transform 0.1s, box-shadow 0.1s, color 0.15s, background 0.15s;
}

.tt-mode-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 rgba(0,0,0,0.3);
}

.tt-mode-btn:hover {
  color: #d1d0c5;
  background: #3e4044;
}

.tt-mode-btn.active {
  color: var(--theme-main);
  background: rgba(0, 240, 255, 0.1);
  border-color: var(--theme-main);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}

.tt-mode-sep {
  color: #3e4044;
  font-size: 16px;
  user-select: none;
}

/* ── Stats ── */
.tt-stats {
  width: 100%;
  display: flex;
  gap: 50px;
  margin-bottom: 30px;
  min-height: 52px;
  align-items: flex-end;
}

.tt-stat {
  display: flex;
  flex-direction: column;
  background: rgba(36, 37, 38, 0.6);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px;
  padding: 12px 20px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  min-width: 100px;
  align-items: center;
}

.tt-stat-label {
  font-size: 11px;
  color: #646669;
  letter-spacing: 1px;
  margin-bottom: 2px;
}

.tt-stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--theme-main);
  text-shadow: var(--theme-glow);
  line-height: 1;
}

.tt-stat-value.dim {
  color: #646669;
}

/* ── Typing Area ── */
.tt-area-container {
  width: 100%;
  position: relative;
  background: rgba(36, 37, 38, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  margin-top: 20px;
  /* Glowing bottom border effect */
  border-bottom: 2px solid rgba(0, 240, 255, 0.2);
  transition: border-bottom-color 0.3s, box-shadow 0.3s;
}

.tt-area-container:focus-within {
  border-bottom-color: var(--theme-main);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05), var(--theme-glow);
}

.tt-area {
  width: 100%;
  position: relative;
  cursor: text;
}

/* ── Words ── */
.tt-words {
  font-size: 28px;
  line-height: 2;
  letter-spacing: 0.6px;

  color: #646669;
  user-select: none;

  position: relative;
  overflow: hidden;

  max-height: calc(2em * 3);
}

.tt-words-inner {
  transition: transform 0.15s ease;
}

/* ── Character states ── */
.tt-char { position: relative; }

.tt-char.correct  { color: #d1d0c5; }

.tt-char.incorrect {
  color: #ca4754;
  text-decoration: underline;
  text-decoration-color: #ca4754;
}

.tt-char.current  { color: #d1d0c5; }

.tt-char.extra {
  color: #ca4754;
  font-size: 0.9em;
}

/* ── Caret ── */
.tt-char.current::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--theme-main);
  border-radius: 2px;
  box-shadow: var(--theme-glow);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ── Hidden input ── */
.tt-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  top: 0;
  left: 0;
  pointer-events: none;
}

/* ── Focus hint ── */
.tt-focus-hint {
  text-align: center;
  margin-top: 18px;
  font-size: 12px;
  color: #3e4044;
  letter-spacing: 1px;
  transition: opacity 0.2s;
}

.tt-focus-hint.hidden {
  opacity: 0;
}

/* ── Progress bar ── */
.tt-progress-track {
  width: 100%;
  height: 3px;
  background: #3e4044;
  border-radius: 2px;
  margin-top: 18px;
  overflow: hidden;
}

.tt-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--theme-secondary), var(--theme-main));
  border-radius: 2px;
  box-shadow: var(--theme-glow);
  transition: width 0.1s linear;
}

/* ── Buttons ── */
.tt-actions {
  margin-top: 32px;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.tt-btn {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  padding: 10px 22px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s, background 0.15s, color 0.15s;
  box-shadow: 0 4px 0 rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2);
}

.tt-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0px 0 rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
}

.tt-btn-primary {
  background: var(--theme-main);
  color: #0b0f19;
  font-weight: 700;
  border-color: rgba(0, 240, 255, 0.5);
  box-shadow: 0 4px 0 rgba(0, 150, 160, 0.5), 0 5px 10px rgba(0,0,0,0.2);
}

.tt-btn-primary:active {
  box-shadow: 0 0px 0 rgba(0, 150, 160, 0.5), 0 1px 2px rgba(0,0,0,0.2);
}

.tt-btn-primary:hover {
  background: #33f3ff;
  box-shadow: 0 4px 0 rgba(0, 150, 160, 0.5), var(--theme-glow);
}

.tt-btn-ghost {
  background: #3e4044;
  color: #646669;
}

.tt-btn-ghost:hover {
  background: #4a4e54;
  color: #d1d0c5;
}

/* ── Results ── */
.tt-results {
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tt-results-title {
  font-size: 13px;
  color: #646669;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 28px;
}

.tt-results-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 36px;
}

@media (max-width: 768px) {
  .tt-results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tt-result-card {
  background: #3e4044;
  border-radius: 10px;
  padding: 18px 20px;
}

.tt-result-card-label {
  font-size: 11px;
  color: #646669;
}

.tt-result-card-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--theme-main);
  text-shadow: var(--theme-glow);
}

.tt-result-card-unit {
  font-size: 12px;
  color: #646669;
}

/* ── Mistakes ── */
.tt-mistakes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tt-mistake-chip {
  background: #3e4044;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 13px;
  display: flex;
  gap: 6px;
}

.tt-mistake-typed {
  color: #ca4754;
}
`;

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


// ── Component ─────────────────────────────────────────────────────────────────

export default function TypingTest() {

  const navigator = useNavigate();
  const { user, logout, isLoggedIn } = useAuth();

  const [prompt, setPrompt]           = useState(pickPrompt);
  const [typed, setTyped]             = useState("");
  const [started, setStarted]         = useState(false);
  const [finished, setFinished]       = useState(false);
  const [elapsed, setElapsed]         = useState(0);      // seconds
  const [focused, setFocused]         = useState(false);
  const [timeLimit, setTimeLimit]     = useState(60);     // seconds

  const inputRef   = useRef(null);
  const timerRef   = useRef(null);
  const startedAt  = useRef(null);

  // ── Derived state ──
  const words        = prompt.split(" ");
  const typedChars   = typed.split("");
  const promptChars  = prompt.split("");

  const correctCount = typedChars.filter((c, i) => c === promptChars[i]).length;
  const wpm          = computeWPM(correctCount, elapsed);
  const accuracy     = computeAccuracy(correctCount, typedChars.length);
  const progress     = Math.min((typed.length / prompt.length) * 100, 100);
  const timeLeft     = Math.max(timeLimit - elapsed, 0);

  // Collect mistakes for results screen
  const mistakes = [];
  typedChars.forEach((c, i) => {
    if (c !== promptChars[i]) {
      mistakes.push({ expected: promptChars[i] ?? "—", typed: c });
    }
  });

  // ── Timer ──
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

  // Finish when prompt complete
  useEffect(() => {
    if (typed.length >= prompt.length && started) {
      clearInterval(timerRef.current);
      setFinished(true);
    }
  }, [typed, prompt, started]);

  // ── Keystroke handler ──
  const handleInput = useCallback((e) => {
    if (finished) return;
    const value = e.target.value;

    if (!started && value.length > 0) {
      setStarted(true);
      startedAt.current = Date.now();
    }
    setTyped(value);
  }, [finished, started]);

  // ── Reset ──
  const reset = useCallback((newPrompt = null) => {
    clearInterval(timerRef.current);
    setPrompt(newPrompt || pickPrompt());
    setTyped("");
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // ── Focus area on click ──
  const focusInput = () => inputRef.current?.focus();

  // ── Render character with correct state ──
  const renderChars = () => {
    const chars = promptChars.map((char, i) => {
      let cls = "tt-char";
      if (i < typed.length) {
        cls += typed[i] === char ? " correct" : " incorrect";
      } else if (i === typed.length) {
        cls += " current";
      }
      return (
        <span key={i} className={cls}>
          {char}
        </span>
      );
    });

    // Mock AI Prediction Ghost Text
    if (started && !finished && typed.length > 5 && typed.length < promptChars.length - 10) {
      // Find the next 3 words to "predict"
      const remainingText = prompt.slice(typed.length);
      const nextWords = remainingText.split(' ').slice(0, 3).join(' ');
      if (nextWords) {
        chars.push(
          <span key="ai-prediction" style={{ color: 'rgba(0, 240, 255, 0.4)', pointerEvents: 'none' }}>
            {nextWords} <span style={{fontSize: '10px', verticalAlign: 'super', color: 'rgba(138, 43, 226, 0.8)'}}>✦ AI</span>
          </span>
        );
      }
    }

    return chars;
  };

  // ── Results screen ──
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
        <div className="tt-page">
          <div className="tt-topbar">
            <div className="tt-brand">Velo<span>Type</span>AI</div>
          </div>

          <div className="tt-results">
            <p className="tt-results-title">results</p>

            <div className="tt-results-grid">
              <div className="tt-result-card">
                <div className="tt-result-card-label">WPM</div>
                <div className="tt-result-card-value">{wpm}</div>
                <div className="tt-result-card-unit">words per minute</div>
              </div>
              <div className="tt-result-card">
                <div className="tt-result-card-label">ACC</div>
                <div className="tt-result-card-value">{accuracy}%</div>
                <div className="tt-result-card-unit">accuracy</div>
              </div>
              <div className="tt-result-card">
                <div className="tt-result-card-label">TIME</div>
                <div className="tt-result-card-value">{elapsed}s</div>
                <div className="tt-result-card-unit">elapsed</div>
              </div>
              <div className="tt-result-card">
                <div className="tt-result-card-label">ERRORS</div>
                <div className="tt-result-card-value">{mistakes.length}</div>
                <div className="tt-result-card-unit">keystrokes</div>
              </div>
            </div>

            {uniqueMistakes.length > 0 && (
              <>
                <p className="tt-mistakes-title">mistakes</p>
                <div className="tt-mistakes-list">
                  {uniqueMistakes.map((m, i) => (
                    <div key={i} className="tt-mistake-chip">
                      <span className="tt-mistake-expected">{m.expected}</span>
                      <span className="tt-mistake-arrow">→</span>
                      <span className="tt-mistake-typed">{m.typed}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="tt-actions">
              <button className="tt-btn tt-btn-primary" onClick={() => reset()}>
                next test
              </button>
              <button className="tt-btn tt-btn-ghost" onClick={() => reset(prompt)}>
                retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Typing screen ──
  return (
    <>
      <style>{styles}</style>
      <div className="tt-page" onClick={focusInput}>

        {/* Top bar */}
        <div className="tt-topbar">
          <div className="tt-brand">Velo<span>Type</span>AI</div>
          <div className="tt-modebar">
            {[15, 30, 60].map((t) => (
              <button
                key={t}
                className={`tt-mode-btn ${timeLimit === t ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); reset(); setTimeLimit(t); }}
              >
                {t}s
              </button>
            ))}
            <span className="tt-mode-sep">|</span>
            <button
              className="tt-mode-btn"
              onClick={(e) => { e.stopPropagation(); reset(); }}
              title="New prompt"
            >
              ↺
            </button>
            {isLoggedIn ? (
              <>
                <span style={{ color: 'var(--theme-main)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="0.9em" width="0.9em" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
                  {user?.username}
                </span>
              </>
            ) : null}
          </div>
        </div>

        {/* Live stats */}
        <div className="tt-stats">
          <div className="tt-stat">
            <span className="tt-stat-label">WPM</span>
            <span className={`tt-stat-value ${!started ? "dim" : ""}`}>
              {started ? wpm : "—"}
            </span>
          </div>
          <div className="tt-stat">
            <span className="tt-stat-label">ACC</span>
            <span className={`tt-stat-value ${!started ? "dim" : ""}`}>
              {started ? `${accuracy}%` : "—"}
            </span>
          </div>
          <div className="tt-stat" style={{ marginLeft: "auto" }}>
            <span className="tt-stat-label">TIME</span>
            <span className={`tt-stat-value ${timeLeft <= 10 && started ? "" : "dim"}`}
              style={{ color: timeLeft <= 10 && started ? "#ca4754" : undefined }}
            >
              {started ? timeLeft : timeLimit}
            </span>
          </div>
        </div>

        {/* Words display inside a 3D container */}
        <div className="tt-area-container" onClick={focusInput}>
          <div className="tt-area">
            <div className="tt-words">
              <div className="tt-words-inner">
                {renderChars()}
              </div>
            </div>

            {/* Hidden real input that captures keystrokes */}
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
          </div>
        </div>

        {/* Progress bar */}
        <div className="tt-progress-track">
          <div className="tt-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Focus hint */}
        <p className={`tt-focus-hint ${focused ? "hidden" : ""}`}>
          click or press any key to focus
        </p>

        {/* Action buttons */}
        <div className="tt-actions">
          <button className="tt-btn tt-btn-ghost" onClick={(e) => { e.stopPropagation(); reset(); }}>
            restart
          </button>
        </div>

      </div>
    </>
  );
}