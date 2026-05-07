# VeloTypeAI — Complete Project Documentation
> Prepared for viva / technical interview. Read once, know everything.

---

## 1. What is VeloTypeAI?

VeloTypeAI is a **full-stack, AI-powered adaptive typing assistant**. It tracks your typing performance, detects which characters/words you make the most mistakes on, and uses Google's **Gemini AI** to generate personalised practice paragraphs that target exactly your weak spots. After completing practice repetitions, it gives you an assessment and shows how much you improved.

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React (Vite) | Fast SPA with component-based UI |
| Styling | Vanilla CSS (in-JS `<style>` tag) | Full control, glassmorphism, dark theme |
| Routing | React Router DOM | Client-side navigation |
| Auth State | React Context API | Global token/user state |
| HTTP Client | Custom `apiClient.js` (fetch) | Adds Bearer token to every request |
| Backend | FastAPI (Python) | Async, fast, auto-generates OpenAPI docs |
| ORM | SQLModel | Combines SQLAlchemy + Pydantic in one model |
| Database | SQLite (dev) / PostgreSQL (prod) | SQLite for local, PG on Render |
| Auth | JWT (python-jose) + bcrypt | Access token (15 min) + Refresh token (7 days) |
| AI | Google Gemini 2.5 Flash | Generates adaptive practice paragraphs |
| Rate Limiting | SlowAPI | 100 requests/minute per IP |
| Environment | python-dotenv | Loads `.env` secrets |

---

## 3. Project Folder Structure

```
VELOTYPE/
├── backend/                  ← FastAPI server
│   ├── main.py               ← App entry point, middleware, router registration
│   ├── database.py           ← SQLAlchemy engine + session factory
│   ├── models.py             ← All SQLModel table definitions + Pydantic schemas
│   ├── typing_analysis.py    ← Core algorithm (merge sort + finger map)
│   ├── .env                  ← GOOGLE_API_KEY and secrets (not committed)
│   └── routers/
│       ├── auth.py           ← Register, Login, Refresh, /me
│       ├── sessions.py       ← POST session + save mistakes + trigger analysis
│       ├── patterns.py       ← Mistake pattern analysis (upsert logic)
│       ├── practice.py       ← AI paragraph generation + daily task endpoints
│       └── analytics.py      ← Progress stats + mistake heatmap
│
└── App/VeloTypeAI/           ← React frontend (Vite)
    ├── src/
    │   ├── main.jsx          ← React DOM root, wraps with AuthProvider + Router
    │   ├── App.jsx           ← Route definitions
    │   ├── apiClient.js      ← Centralised fetch wrapper
    │   ├── context/
    │   │   └── AuthContext.jsx  ← Login/logout/register/token management
    │   └── components/
    │       ├── TypingTest.jsx   ← Main typing engine (2000+ lines)
    │       ├── Landing.jsx      ← Home page
    │       ├── Dashboard.jsx    ← User progress charts
    │       ├── login.jsx        ← Login/Register form
    │       └── Navbar.jsx       ← Top navigation
    └── .env                  ← VITE_API_URL=http://localhost:8000/api/v1
```

---

## 4. Database Schema (models.py)

### 4.1 `users` table
```python
class User(UserBase, table=True):
    user_id:       UUID     # primary key, auto-generated with uuid4()
    username:      str      # unique, indexed, max 50 chars
    email:         str      # unique, indexed, max 255 chars
    password_hash: str      # bcrypt hash, never stored in plain text
    created_at:    datetime # UTC timestamp
    updated_at:    datetime # UTC timestamp
```
**Relationships:** one user → many sessions, mistakes, patterns, practice tasks.

### 4.2 `prompts` table
Stores reusable typing paragraphs with difficulty levels (easy/medium/hard).

### 4.3 `typing_sessions` table
```python
class TypingSession(table=True):
    session_id:       UUID     # PK
    user_id:          UUID     # FK → users
    prompt_id:        UUID?    # FK → prompts (nullable for AI tasks)
    task_id:          UUID?    # FK → practice_tasks (nullable)
    wpm:              float    # Words per minute
    accuracy:         float    # 0.0 to 100.0
    duration_seconds: int      # How long the session lasted
    keystrokes_total: int      # Total keys pressed
    raw_typed_text:   str?     # Full text the user typed
    created_at:       datetime
```

### 4.4 `mistakes` table
Each row = one character-level mistake in one session.
```python
class Mistake(table=True):
    mistake_id:    UUID
    session_id:    UUID   # FK → typing_sessions
    user_id:       UUID   # FK → users (denormalized for fast queries)
    word_expected: str    # The character that should have been typed
    word_typed:    str    # What the user actually typed
    error_type:    str    # "substitution" | "omission" | "insertion"
    position:      int    # Index in the prompt string
```

### 4.5 `mistake_patterns` table
Aggregated view of which characters a user consistently gets wrong.
```python
class MistakePattern(table=True):
    pattern_id:   UUID
    user_id:      UUID    # FK → users
    word:         str     # The problematic character/word
    mistake_count: int    # How many times total across all sessions
    is_active:    bool    # True if count >= 3 (PATTERN_THRESHOLD)
    last_seen_at: datetime
    # UNIQUE constraint on (user_id, word) — one row per user per char
```

### 4.6 `practice_tasks` table
AI-generated paragraphs tailored to user's weak spots.
```python
class PracticeTask(table=True):
    task_id:             UUID
    user_id:             UUID
    content:             str       # The full paragraph text
    focus_words:         List[str] # JSON array of targeted characters
    difficulty:          str       # easy | medium | hard
    ai_generated:        bool      # True if Gemini wrote it, False if rule-based
    repetition_count:    int       # How many times user must repeat it
    completed_count:     int       # How many times user has completed it
    is_assessment:       bool      # True if this is a post-practice test
    original_session_id: UUID?     # Links back to the session that caused this task
    created_at:          datetime
```

---

## 5. Core Algorithm — `typing_analysis.py`

This is the **custom data structures & algorithms** component of the project.

### 5.1 FINGER_MAP
```python
FINGER_MAP = {
    "left-pinky":  ["q", "a", "z"],
    "left-ring":   ["w", "s", "x"],
    "left-middle": ["e", "d", "c"],
    "left-index":  ["r", "f", "v", "t", "g", "b"],
    "thumb":       [" "],
    "right-index": ["y", "h", "n", "u", "j", "m"],
    "right-middle":["i", "k", ","],
    "right-ring":  ["o", "l", "."],
    "right-pinky": ["p", ";", "/"],
}
```
Maps each keyboard key to the finger that types it. Used to expand weak characters to the whole finger group.

### 5.2 `build_wrong_char_map(practice_text, user_text)`
- Uses `zip_longest` to pair each character of the target and typed text
- If they differ, increments a `Counter` for the expected character
- Returns `Dict[str, int]` — e.g., `{"t": 4, "p": 2, "e": 1}`

### 5.3 `build_wrong_char_array(wrong_char_map)`
Converts the dict to a list of single-key dicts for the sort algorithm:
```python
[{"t": 4}, {"p": 2}, {"e": 1}]
```

### 5.4 `merge_sort_wrong_chars(array)` — Custom Merge Sort
**This is a key algorithm.** It sorts the wrong-character array by frequency (highest first) using a hand-written merge sort, NOT Python's built-in sort.

```
Algorithm:
1. Base case: if len <= 1, return as-is
2. Split array at midpoint
3. Recursively sort left and right halves
4. Merge: compare frequencies, pick the larger one first
5. Append any remaining elements
Time Complexity: O(n log n)
Space Complexity: O(n)
```

### 5.5 `top_wrong_chars(wrong_char_map, top_k=5)`
- Calls `build_wrong_char_array` → `merge_sort_wrong_chars`
- Slices top K results
- Returns a list of character strings: `["t", "p", "e"]`

### 5.6 `expand_chars_by_finger(top_chars)`
- For each weak character, finds which finger group it belongs to
- Adds ALL characters in that finger group to the practice list
- Uses a `seen` set to avoid duplicates
- **Why?** If you're bad at "t", you're probably also weak on "g", "b", "r", "f" since they share the left-index finger

### 5.7 `analyze_typing_session(practice_text, user_text, top_k=5)`
Master function that chains all of the above:
```python
return {
    "wrong_char_map": {char: count, ...},
    "top_chars": ["t", "p"],           # worst offenders
    "focus_chars": ["t","g","b","r","f","v","p",";","/","o","l","."]  # full finger groups
}
```

---

## 6. Backend API Endpoints (FastAPI)

Base URL: `http://localhost:8000/api/v1`
Swagger docs: `http://localhost:8000/api/v1/docs`

### Auth (`/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create new user, checks username+email uniqueness |
| POST | `/auth/login` | Returns JWT access token, sets httpOnly refresh cookie |
| POST | `/auth/refresh` | Reads cookie, issues new access token |
| GET | `/auth/me` | Returns current user profile (requires Bearer token) |

### Sessions (`/sessions`)
| Method | Path | Description |
|---|---|---|
| POST | `/sessions` | Submit a completed typing session with mistakes |
| GET | `/sessions` | List all sessions (paginated) |
| GET | `/sessions/{id}` | Get one session with its mistakes |

**POST /sessions flow:**
1. Save `TypingSession` row
2. Save each `Mistake` row (linked to session + user)
3. Call `analyse_and_update_patterns()` — updates mistake frequency table
4. If `task_id` provided, increment `PracticeTask.completed_count`
5. Return session + mistakes

### Patterns (`/patterns`)
| Method | Path | Description |
|---|---|---|
| GET | `/patterns` | Get all active mistake patterns for the user |
| GET | `/patterns/{id}` | Get one pattern by ID |

**`analyse_and_update_patterns()` internal logic:**
1. Fetch ALL mistakes for the user across all sessions
2. Build frequency map with `Counter(word_expected for mistake in mistakes)`
3. Upsert into `mistake_patterns` (update if exists, create if not)
4. `is_active = True` if `count >= 3` (PATTERN_THRESHOLD)

### Practice (`/practice`)
| Method | Path | Description |
|---|---|---|
| POST | `/practice/generate` | Generate task from user's active patterns |
| POST | `/practice/daily-task` | Create task from custom focus_words list |
| GET | `/practice/next` | Get next recommended practice task |
| GET | `/practice/history` | List all past practice tasks |

**`generate_ai_paragraph()` function:**
1. Check if any API key is set (Anthropic → OpenAI → Google)
2. Build a `Counter` of `focus_words` to find high-frequency characters
3. Construct a prompt telling AI to write ~N words including those characters
4. If high-priority chars exist (appeared multiple times), add CRITICAL instruction to repeat them
5. Call Gemini 2.5 Flash via HTTP (`/v1beta/models/gemini-2.5-flash:generateContent`)
6. Strip newlines, return `(content, ai_generated=True)`
7. On any failure, fall back to `generate_rule_based()` which concatenates sentences containing the focus words

### Analytics (`/analytics`)
| Method | Path | Description |
|---|---|---|
| GET | `/analytics/progress` | WPM/accuracy trends, best WPM, total time |
| GET | `/analytics/heatmap` | Most frequently mistyped words/chars |

---

## 7. Authentication Flow

### JWT Strategy
- **Access Token**: 15-minute lifespan, sent as `Authorization: Bearer <token>` header
- **Refresh Token**: 7-day lifespan, stored in `httpOnly` cookie (not accessible via JS, prevents XSS)

### Password Security
```python
# Hashing: bcrypt with auto-generated salt
bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt())

# Verification: constant-time comparison (prevents timing attacks)
bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
```

### Token Decode (every protected request)
```python
payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
user_id = payload.get("sub")  # "sub" = subject claim
```
If expired or tampered → `JWTError` → 401 Unauthorized

### `get_current_user` Dependency
FastAPI's `Depends()` system calls this before every protected endpoint:
```python
def get_current_user(token = Depends(oauth2_scheme), session = Depends(get_session)):
    token_data = decode_token(token)
    user = session.exec(select(User).where(User.user_id == token_data.user_id)).first()
    return user
```

---

## 8. Frontend Architecture

### 8.1 `apiClient.js`
```javascript
const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: "include",  // needed for httpOnly refresh token cookie
    ...options,
  });
  if (!res.ok) { const error = await res.json(); throw new Error(error.detail); }
  return res.json();
};
```
Every API call in the app uses this — it auto-attaches the JWT token.

### 8.2 `AuthContext.jsx`
A React Context that provides `{ user, token, loading, login, logout, register, isLoggedIn }` to the whole app.

- On mount: reads `access_token` from `localStorage`, calls `/auth/me` to verify it's still valid
- `login()`: POSTs form-encoded credentials (FastAPI OAuth2 expects `application/x-www-form-urlencoded`)
- `_saveSession()`: stores token in `localStorage` + updates React state
- Uses `AbortController` with 30-second timeout to handle cold-start server delays

### 8.3 `App.jsx`
Defines React Router routes:
- `/` → Landing page
- `/type` → TypingTest (main feature)
- `/dashboard` → User analytics
- `/login` → Login/Register form

---

## 9. TypingTest.jsx — The Core Component

This is the largest file (~1700+ lines). It handles the entire typing experience.

### 9.1 Key State Variables
```javascript
const [prompt, setPrompt]           // The paragraph text to type
const [typed, setTyped]             // What the user has typed so far
const [started, setStarted]         // Has the user started typing?
const [finished, setFinished]       // Has the test ended?
const [elapsed, setElapsed]         // Seconds elapsed
const [timeLimit, setTimeLimit]     // 15 | 30 | 60 seconds
const [combo, setCombo]             // Consecutive correct keystrokes
const [activeTask, setActiveTask]   // Current practice task object
const [liveMistakes, setLiveMistakes] // Every wrong keypress (even if corrected)
const [isAssessmentMode, ...]       // Are we in post-practice assessment mode?
const [showImprovement, ...]        // Should we show the before/after card?
const [initialSessionStats, ...]    // WPM/accuracy before practice started
```

### 9.2 Derived Values (computed every render)
```javascript
const promptChars = prompt.split('');
const typedChars  = typed.split('');
const correctCount = typedChars.filter((c, i) => c === promptChars[i]).length;
const wpm      = Math.round((correctCount / 5) / (elapsed / 60));  // 5 chars = 1 word
const accuracy = Math.round((correctCount / typedChars.length) * 100);
const progress = (typed.length / prompt.length) * 100;
const timeLeft = Math.max(timeLimit - elapsed, 0);
const mistakes = typedChars
  .map((c, i) => c !== promptChars[i] ? { expected: promptChars[i], typed: c } : null)
  .filter(Boolean);
```

### 9.3 `loadPrompt()` — Paragraph Fetching
This is the most critical function. It uses a `useRef` pattern to avoid stale closures:
```javascript
const activeTaskRef = useRef(activeTask);
useEffect(() => { activeTaskRef.current = activeTask; }, [activeTask]);

const loadPrompt = useCallback(async (isAssessment=false, wordCount=50) => {
  // 1. No token → show local SAMPLE_PROMPTS array (no API call)
  // 2. Active task still has reps left → show same task content
  // 3. Call GET /practice/next (fetches personalized task from backend)
  // 4. On error → fall back to local sample, show friendly message
}, []); // empty dep array = stable function, no re-creation on each keystroke
```

### 9.4 `handleInput()` — Live Typing Detection
```javascript
const handleInput = (e) => {
  if (finished) return;
  const value = e.target.value;

  // Start timer on first keypress
  if (!started && value.length > 0) { setStarted(true); startedAt.current = Date.now(); }

  // Detect new character typed (not backspace)
  if (value.length > typed.length) {
    const newChar = value[value.length - 1];
    const expectedChar = promptChars[value.length - 1];

    if (newChar === expectedChar) {
      setCombo(c => c + 1); // increment combo streak
    } else {
      setCombo(0);
      // LIVE MISTAKE TRACKING: record even if user backspaces and fixes it
      setLiveMistakes(prev => [...prev, { expected: expectedChar, typed: newChar }]);
    }
  }
  setTyped(value);
};
```

### 9.5 Timer (useEffect)
```javascript
useEffect(() => {
  if (started && !finished) {
    timerRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - startedAt.current) / 1000);
      setElapsed(secs);
      if (secs >= timeLimit) { clearInterval(timerRef.current); setFinished(true); }
    }, 200); // polls every 200ms for smooth updates
  }
  return () => clearInterval(timerRef.current); // cleanup on unmount
}, [started, finished, timeLimit]);
```

### 9.6 Session Submission (after `finished` = true)
```javascript
useEffect(() => {
  if (!finished || submittedSessionRef.current) return;
  submittedSessionRef.current = true; // prevents double-submit

  const submitSession = async () => {
    const res = await apiClient('/sessions', {
      method: 'POST',
      body: JSON.stringify({
        prompt_id, task_id, wpm, accuracy,
        duration_seconds: elapsed,
        keystrokes_total: typed.length,
        raw_typed_text: typed,
        mistakes: buildSessionMistakes(promptChars, typedChars),
      }),
    });
    setLastSessionId(res.session_id);
    if (activeTask) {
      setActiveTask(prev => ({ ...prev, completed_count: prev.completed_count + 1 }));
    }
  };
  void submitSession();
}, [finished, ...]);
```

### 9.7 `buildSessionMistakes()` — Final Mistake Detection
```javascript
function buildSessionMistakes(promptChars, typedChars) {
  const total = Math.max(promptChars.length, typedChars.length);
  const mistakes = [];
  for (let i = 0; i < total; i++) {
    const expected = promptChars[i];
    const typed    = typedChars[i];
    if (expected === typed) continue;

    let errorType = 'substitution'; // wrong char typed
    if (expected == null) errorType = 'insertion';  // extra char typed
    else if (typed == null) errorType = 'omission';  // char skipped

    mistakes.push({ word_expected: expected ?? '', word_typed: typed ?? '', error_type: errorType, position: i });
  }
  return mistakes;
}
```

### 9.8 Particles Component
```javascript
const Particles = React.memo(() => {
  const particles = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      duration: `${Math.random() * 15 + 10}s`, // 10-25 second float cycle
      ...
    }));
  }, []); // Generated ONCE on mount, never regenerated — prevents flickering
  ...
});
```
`React.memo` + `useMemo([])` = particles are created once and never change.

---

## 10. The Full Adaptive Learning Loop

```
User types paragraph
        │
        ▼
Every wrong keypress → liveMistakes[] (live tracking)
        │
        ▼
Test ends → buildSessionMistakes() compares final state
        │
        ▼
POST /sessions → backend saves mistakes → analyse_and_update_patterns()
        │
        ▼
mistake_patterns table updated (Counter per character, threshold = 3)
        │
        ▼
User clicks "Add to Daily Task"
        │
liveMistakes + finalMistakes combined → POST /practice/daily-task
        │ focus_words = ["t","t","t","p","p","e"] (with frequency)
        ▼
generate_ai_paragraph():
  - Counter(focus_words) → {"t":3, "p":2, "e":1}
  - high_priority = ["t", "p"] (count > 1)
  - Gemini prompt: "CRITICAL: repeat 't' and 'p' multiple times"
  - Gemini 2.5 Flash API call
  - Returns custom paragraph
        │
        ▼
User practices N repetitions (completed_count tracked per session submit)
        │
        ▼
Assessment mode: user picks 75/100/150 word test
  → loadPrompt(isAssessment=true, wordCount=100)
  → new POST /practice/daily-task with is_assessment=true
        │
        ▼
User completes assessment → showImprovement card
  → compares initialSessionStats (WPM/accuracy before) vs current
  → shows "+12 WPM" / "+5% accuracy" improvement
```

---

## 11. AI Integration — Gemini 2.5 Flash

### API Call Structure
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
     ?key={GOOGLE_API_KEY}
```

### Request Body
```json
{
  "contents": [{ "parts": [{ "text": "Generate a paragraph of ~50 words including: t, p, e. CRITICAL: repeat 't' and 'p' multiple times." }] }],
  "generationConfig": { "maxOutputTokens": 512, "temperature": 0.7 }
}
```

### Response Parsing
```python
content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
content = content.replace('\n', ' ').strip()  # clean up any markdown
```

### Fallback Chain
1. Try **Anthropic** (Claude) if `ANTHROPIC_API_KEY` set
2. Try **OpenAI** (GPT-3.5) if `OPENAI_API_KEY` set
3. Try **Google Gemini** if `GOOGLE_API_KEY` set
4. Fall back to **rule-based** generator (string concatenation)

---

## 12. Database Engine Setup (`database.py`)

```python
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    # check_same_thread=False needed because FastAPI uses multiple threads
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
    # pool_pre_ping: test connection before use (drops stale ones)
    # pool_size: 10 persistent connections kept open
    # max_overflow: 20 extra connections allowed under peak load
```

Sessions are yielded as generators:
```python
def get_session() -> Generator:
    with Session(engine) as session:
        yield session
    # auto-commits/closes when request ends
```

---

## 13. CORS Configuration

```python
allowed_origins = ["http://localhost:5173", "http://localhost:4173", ...] + prod_origins
app.add_middleware(CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,   # REQUIRED for httpOnly cookie (refresh token)
    allow_methods=["*"],
    allow_headers=["*"],
)
```
**Why not wildcard `*` origins with credentials?** Browsers block `credentials: include` with `Access-Control-Allow-Origin: *`. You must explicitly list allowed origins.

---

## 14. WPM Formula

```
WPM = (correct_characters / 5) / (elapsed_seconds / 60)
```
The "5" is the standard word length used in all typing tests (gross WPM). Accuracy is `correct / total_typed * 100`.

---

## 15. Key Design Decisions (Viva-ready answers)

**Q: Why use SQLModel instead of plain SQLAlchemy?**
SQLModel combines SQLAlchemy table definitions with Pydantic validation in a single class. You write the model once and get both DB operations and API schema validation.

**Q: Why is refresh token in a cookie, not localStorage?**
`httpOnly` cookies are invisible to JavaScript, making them immune to XSS attacks. The access token (short-lived, 15 min) stays in `localStorage` for convenience.

**Q: Why custom merge sort instead of Python's `sorted()`?**
Project requirement to implement a DSA algorithm. Merge sort is O(n log n) and stable, making it ideal for sorting frequency maps.

**Q: Why does `loadPrompt` have an empty dependency array?**
To prevent an infinite loop. If `loadPrompt` depended on `mistakes` or `activeTask`, it would re-create on every keystroke, triggering a new `useEffect`, which would fetch a new paragraph mid-test. The `activeTaskRef` ref pattern solves this by always reading the latest value without being a dependency.

**Q: What is the PATTERN_THRESHOLD?**
A mistake pattern is only marked `is_active = True` when a user has made the same mistake **3 or more times** across all sessions. This prevents one-time typos from generating practice tasks.

**Q: How does live mistake tracking differ from final mistake detection?**
- **Final detection** (`buildSessionMistakes`): compares the end state of typed vs prompt. If you fixed a mistake, it won't appear.
- **Live tracking** (`liveMistakes`): records every wrong keypress the instant it happens. Even if you backspace and correct it, it's recorded. This gives a more accurate picture of which characters you struggle with.

**Q: Why `React.memo` + `useMemo` on Particles?**
Without it, the `<Particles>` component re-renders on every state change (every keystroke). Since `Math.random()` was called inside the render, particles would get new random positions on every keystroke, causing a chaotic flickering effect.

---

## 16. Environment Variables

### Backend `.env`
```
GOOGLE_API_KEY=AIzaSy...        # Gemini AI access
ENVIRONMENT=development          # Controls cookie security + CORS
FRONTEND_URL=http://localhost:5173
DATABASE_URL=sqlite:///velotypeai.db
JWT_SECRET_KEY=your-long-secret  # Signs all JWTs
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:8000/api/v1
```
Vite exposes only variables prefixed with `VITE_` to the browser.

---

## 17. How to Run the Project

```bash
# Backend
cd VELOTYPE/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd VELOTYPE/App/VeloTypeAI
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 18. Summary — One Paragraph

VeloTypeAI is a full-stack adaptive typing trainer. The React frontend hosts a real-time typing test that measures WPM and accuracy, tracks every wrong keypress (even corrected ones), and submits the session to a FastAPI backend. The backend stores mistakes in SQLite, runs a `Counter`-based pattern analysis using a custom merge sort algorithm to find the user's worst characters, and calls Google Gemini 2.5 Flash to generate a practice paragraph specifically designed to force the user to type those weak characters repeatedly. Users can set a repetition count (2x, 5x, 10x), track their progress rep-by-rep, and then take a post-practice assessment to see their WPM and accuracy improvement. The system is secured with bcrypt-hashed passwords, short-lived JWT access tokens, and httpOnly refresh token cookies.
