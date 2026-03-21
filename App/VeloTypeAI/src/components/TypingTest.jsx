import {useState, useRef, useEffect, useCallback} from 'react'

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

  .tt-page {
    font-family: 'Roboto Mono', monospace;
    background-color: #2c2e31;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #d1d0c5;
  }

  /* ── Top bar ── */
  .tt-topbar {
    width: 100%;
    max-width: 820px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }
  .tt-brand {
    font-size: 20px;
    font-weight: 700;
    color: #e2b714;
    letter-spacing: 1px;
  }
  .tt-brand span {
    color: #646669;
    font-weight: 300;
  }

  /* ── Mode bar ── */
  .tt-modebar {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .tt-mode-btn {
    background: none;
    border: none;
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
    color: #646669;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 6px;
    transition: color 0.15s, background 0.15s;
  }
  .tt-mode-btn:hover { color: #d1d0c5; background: #3e4044; }
  .tt-mode-btn.active { color: #e2b714; background: #3e4044; }
  .tt-mode-sep {
    color: #3e4044;
    font-size: 16px;
    user-select: none;
  }

  /* ── Stats row (live) ── */
  .tt-stats {
    width: 100%;
    max-width: 820px;
    display: flex;
    gap: 32px;
    margin-bottom: 20px;
    min-height: 52px;
    align-items: flex-end;
  }
  .tt-stat {
    display: flex;
    flex-direction: column;
  }
  .tt-stat-label {
    font-size: 11px;
    color: #646669;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }
  .tt-stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #e2b714;
    line-height: 1;
    transition: color 0.2s;
  }
  .tt-stat-value.dim { color: #646669; }

  /* ── Typing area ── */
  .tt-area {
    width: 100%;
    max-width: 820px;
    position: relative;
    cursor: text;
  }

  /* ── Words display ── */
  .tt-words {
    font-size: 22px;
    line-height: 1.75;
    letter-spacing: 0.5px;
    color: #646669;
    user-select: none;
    position: relative;
    overflow: hidden;
    max-height: calc(1.75em * 3);   /* show 3 lines */
  }
  .tt-words-inner {
    transition: transform 0.15s ease;
  }

  /* ── Character states ── */
  .tt-char { position: relative; }
  .tt-char.correct  { color: #d1d0c5; }
  .tt-char.incorrect { color: #ca4754; text-decoration: underline; text-decoration-color: #ca4754; }
  .tt-char.current  { color: #d1d0c5; }
  .tt-char.extra    { color: #ca4754; font-size: 0.9em; }

  /* ── Caret ── */
  .tt-char.current::before {
    content: '';
    position: absolute;
    left: -1px;
    top: 4px;
    bottom: 4px;
    width: 2px;
    background: #e2b714;
    border-radius: 2px;
    animation: blink 1s step-end infinite;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0; }
  }
    
  /* ── Hidden real input ── */
  .tt-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
    top: 0; left: 0;
    pointer-events: none;
  }

  /* ── Click-to-focus hint ── */
  .tt-focus-hint {
    text-align: center;
    margin-top: 18px;
    font-size: 12px;
    color: #3e4044;
    letter-spacing: 1px;
    transition: opacity 0.2s;
  }
  .tt-focus-hint.hidden { opacity: 0; }

  /* ── Progress bar ── */
  .tt-progress-track {
    width: 100%;
    max-width: 820px;
    height: 3px;
    background: #3e4044;
    border-radius: 2px;
    margin-top: 18px;
    overflow: hidden;
  }
  .tt-progress-fill {
    height: 100%;
    background: #e2b714;
    border-radius: 2px;
    transition: width 0.1s linear;
  }

  /* ── Action buttons ── */
  .tt-actions {
    margin-top: 32px;
    display: flex;
    gap: 12px;
    align-items: center;
  }
  .tt-btn {
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
    padding: 10px 22px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    transition: background 0.15s, color 0.15s, transform 0.1s;
    letter-spacing: 0.5px;
  }
  .tt-btn:active { transform: scale(0.97); }
  .tt-btn-primary {
    background: #e2b714;
    color: #2c2e31;
    font-weight: 700;
  }
  .tt-btn-primary:hover { background: #f0cc30; }
  .tt-btn-ghost {
    background: #3e4044;
    color: #646669;
  }
  .tt-btn-ghost:hover { background: #4a4e54; color: #d1d0c5; }

  /* ── Results overlay ── */
  .tt-results {
    width: 100%;
    max-width: 820px;
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
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
  @media (max-width: 600px) {
    .tt-results-grid { grid-template-columns: repeat(2, 1fr); }
  }
  .tt-result-card {
    background: #3e4044;
    border-radius: 10px;
    padding: 18px 20px;
  }
  .tt-result-card-label {
    font-size: 11px;
    color: #646669;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
  }
  .tt-result-card-value {
    font-size: 36px;
    font-weight: 700;
    color: #e2b714;
    line-height: 1;
  }
  .tt-result-card-unit {
    font-size: 12px;
    color: #646669;
    margin-top: 4px;
  }

  /* ── Mistakes list ── */
  .tt-mistakes-title {
    font-size: 12px;
    color: #646669;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
  .tt-mistakes-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 32px;
  }
  .tt-mistake-chip {
    background: #3e4044;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tt-mistake-expected { color: #d1d0c5; }
  .tt-mistake-arrow    { color: #646669; font-size: 10px; }
  .tt-mistake-typed    { color: #ca4754; }
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
    return promptChars.map((char, i) => {
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
            <div className="tt-brand">velo<span>type</span>AI</div>
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
          <div className="tt-brand">velo<span>type</span>AI</div>
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

        {/* Words display */}
        <div className="tt-area" onClick={focusInput}>
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