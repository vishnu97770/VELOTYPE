import {useState, useRef, useEffect, useCallback} from 'react'

const SAMPLE_PROMPTS = [
  "the quick brown fox jumps over the lazy dog and runs across the open field under the bright morning sun",
  "practice makes perfect and every keystroke you take brings you one step closer to becoming a faster typist",
  "consistency is the key to improvement track your mistakes learn from them and watch your speed increase",
  "typing is a skill that improves with deliberate focused practice every session teaches you something new",
  "the best way to get better at typing is to slow down first and focus on accuracy before chasing speed",
];

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