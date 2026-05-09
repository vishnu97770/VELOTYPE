# VeloTypeAI — Complete Project Documentation
> Everything you need to know before presenting, demonstrating, or being interviewed about this project.

---

## 1. The Problem We Are Solving

Most people who want to improve their typing speed use generic typing websites that give them random paragraphs to type. These are not personalised — they practice the same characters repeatedly regardless of what the user is actually struggling with. The user has no idea which specific characters or words are slowing them down, and they waste time practicing things they are already good at.

**The result:** slow, unfocused improvement that plateaus quickly.

---

## 2. What VeloTypeAI Does

VeloTypeAI is a full-stack, AI-powered adaptive typing trainer that:

1. Tracks every single wrong keypress in real time (even ones you immediately correct).
2. After each session, analyses which characters you made the most mistakes on.
3. Groups those characters by finger — if you're bad at "t", you're also likely bad at "g", "b", "r", "f" because they all use the same left-index finger.
4. Calls **Google Gemini 2.5 Flash** to write a custom practice paragraph that forces you to type your weak characters repeatedly and naturally.
5. Makes you practice that paragraph N times (you choose 2×, 5×, 10×).
6. Gives you an assessment at the end and shows how much your WPM and accuracy improved.
7. Lets you compete in **real-time multiplayer typing races** against other users.
8. Ranks players using an **ELO system** (Bronze → Silver → Gold → Platinum → Diamond → Immortal → Velotype Master).
9. Displays a **global leaderboard** showing top players by ELO rating.

**The core insight:** targeted practice on your specific weak spots is 10× more effective than random paragraphs.

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | Component-based SPA framework |
| Vite | 7.3 | Build tool — fast HMR in development, optimised bundle for production |
| React Router DOM | 6.30 | Client-side routing (`/`, `/type`, `/dashboard`, `/multiplayer`, `/leaderboard`) |
| React Context API | built-in | Global auth state — no Redux needed for this app size |
| Lucide React | 0.575 | Icon library |
| Recharts | 3.7 | Chart library (used in dashboard) |
| Vanilla CSS (inline `<style>` tag) | — | Each component defines its own CSS string, no external CSS file |
| HTML5 Canvas | native | Animated particle backgrounds (FloatingParticles.jsx, Landing.jsx) |
| WebSocket API | native browser | Real-time multiplayer race communication |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| FastAPI | latest | Async Python web framework — auto-generates OpenAPI/Swagger docs |
| Uvicorn | latest | ASGI server that runs FastAPI |
| SQLModel | latest | Merges SQLAlchemy (ORM) + Pydantic (validation) into one class |
| SQLAlchemy | (via SQLModel) | Database engine, connection pooling |
| python-jose[cryptography] | latest | JWT creation and verification |
| bcrypt | latest | Password hashing |
| python-dotenv | latest | Loads secrets from `.env` file |
| httpx | latest | Async HTTP client — makes the call to Gemini AI API |
| slowapi | latest | Rate limiting middleware (100 req/min per IP) |
| pydantic[email] | latest | Email validation on registration |
| python-multipart | latest | Parses `form-encoded` login body (FastAPI OAuth2 requirement) |

### Database
| Environment | Database | Connection |
|---|---|---|
| Local development | SQLite | `sqlite:///./velotypeai.db` — file in project root |
| Production (Render.com) | PostgreSQL 16 | `postgresql://...@render.com/velotype_db` |

### AI
| Service | Model | Use |
|---|---|---|
| Google Gemini 2.5 Flash | `gemini-2.5-flash` | Generates personalised practice paragraphs |

### Hosting / Deployment
| Component | Platform | URL |
|---|---|---|
| Backend (API) | Render.com (free tier) | `https://velotype-2-jn34.onrender.com` |
| Frontend (SPA) | Vercel | `https://velotype-three.vercel.app` |
| Database | Render.com PostgreSQL | Internal URL on Render |

---

## 4. Full Project Folder Structure

```
VELOTYPE/
│
├── about.md                         ← this file
│
├── backend/                         ← FastAPI server (Python)
│   ├── main.py                      ← App entry point, CORS, rate limiter, router registration
│   ├── database.py                  ← SQLAlchemy engine + session factory + init_db
│   ├── models.py                    ← ALL database table definitions and Pydantic schemas
│   ├── typing_analysis.py           ← Core DSA: wrong-char map, merge sort, finger grouping
│   ├── requirements.txt             ← Python dependencies
│   ├── .env                         ← Secrets (GOOGLE_API_KEY, DATABASE_URL, SECRET_KEY)
│   └── routers/
│       ├── __init__.py              ← Empty (makes routers a Python package)
│       ├── auth.py                  ← /auth: register, login, refresh, /me
│       ├── sessions.py              ← /sessions: submit session + mistakes + trigger analysis
│       ├── patterns.py              ← /patterns: get patterns + analyse_and_update_patterns()
│       ├── practice.py              ← /practice: AI paragraph generation + daily tasks
│       ├── analytics.py             ← /analytics: progress stats, heatmap, daily stats
│       ├── rooms.py                 ← /rooms: WebSocket race rooms + ELO calculation
│       └── leaderboard.py           ← /leaderboard: global ELO rankings
│
└── App/VeloTypeAI/                  ← React frontend (Vite)
    ├── index.html                   ← Single HTML shell, React mounts into <div id="root">
    ├── vite.config.js               ← Vite config with React + babel-plugin-react-compiler
    ├── package.json                 ← npm dependencies
    ├── vercel.json                  ← Vercel deployment settings
    ├── .env / .env.local            ← VITE_API_URL=http://localhost:8000/api/v1
    └── src/
        ├── main.jsx                 ← React DOM root, wraps app with BrowserRouter + AuthProvider
        ├── App.jsx                  ← Route definitions (all pages)
        ├── App.css                  ← Minimal global resets
        ├── index.css                ← Global: body background #0A0A0A, font, selection color
        ├── apiClient.js             ← Central fetch wrapper (auto-adds JWT Bearer token)
        ├── context/
        │   └── AuthContext.jsx      ← Login/logout/register/token state for the whole app
        ├── assets/
        │   └── styles/login.css     ← Login page dedicated stylesheet
        └── components/
            ├── Landing.jsx          ← Home page with hero, features, demo stats
            ├── TypingTest.jsx       ← Main typing engine (2000+ lines)
            ├── Dashboard.jsx        ← Progress charts: scatter, histogram, heatmap, daily
            ├── Multiplayer.jsx      ← Real-time race: lobby → waiting → countdown → race → results
            ├── Leaderboard.jsx      ← Global ELO leaderboard table
            ├── Navbar.jsx           ← Sticky top navigation bar
            ├── login.jsx            ← Login/Register form with tabs
            ├── FloatingParticles.jsx← Global animated canvas particle background
            ├── footer.jsx           ← Footer component
            ├── contact.jsx          ← Contact page
            ├── security.jsx         ← Security policy page
            └── privacy.jsx          ← Privacy policy page
```

---

## 5. Database Schema (All Tables)

### 5.1 `users`
```
user_id       UUID        PRIMARY KEY (auto uuid4)
username      VARCHAR(50) UNIQUE, INDEXED
email         VARCHAR(255) UNIQUE, INDEXED
password_hash VARCHAR     bcrypt hash
created_at    DATETIME    UTC
updated_at    DATETIME    UTC
elo_rating    INT         DEFAULT 1000  ← ELO rank for multiplayer
wins          INT         DEFAULT 0    ← Race wins
losses        INT         DEFAULT 0    ← Race losses
```
One user → many sessions, mistakes, patterns, practice_tasks, room_players.

### 5.2 `prompts`
```
prompt_id   UUID    PRIMARY KEY
content     TEXT    The paragraph text
difficulty  VARCHAR easy | medium | hard
word_count  INT
category    VARCHAR optional tag
```
Reusable pre-seeded typing paragraphs. Sessions may optionally link to one.

### 5.3 `typing_sessions`
```
session_id        UUID    PRIMARY KEY
user_id           UUID    FK → users
prompt_id         UUID?   FK → prompts (nullable — AI tasks have no fixed prompt)
task_id           UUID?   FK → practice_tasks (nullable — links session to a daily task)
wpm               FLOAT   Words per minute (correct chars / 5 / minutes)
accuracy          FLOAT   0.0 – 100.0
duration_seconds  INT     How long the test ran
keystrokes_total  INT     Total keys pressed (including backspace etc.)
raw_typed_text    TEXT?   Full string the user typed
created_at        DATETIME
```

### 5.4 `mistakes`
```
mistake_id     UUID    PRIMARY KEY
session_id     UUID    FK → typing_sessions
user_id        UUID    FK → users (denormalised for fast per-user queries)
word_expected  VARCHAR The character that SHOULD have been typed
word_typed     VARCHAR What the user ACTUALLY typed
error_type     VARCHAR substitution | omission | insertion | transposition
position       INT     Index position in the prompt string
```
One session → many mistakes. The user_id denormalisation avoids needing a JOIN for pattern analysis.

### 5.5 `mistake_patterns`
```
pattern_id    UUID    PRIMARY KEY
user_id       UUID    FK → users
word          VARCHAR The problematic character/word
mistake_count INT     Total times mistyped across all sessions
is_active     BOOL    True if count >= PATTERN_THRESHOLD (1)
last_seen_at  DATETIME
UNIQUE (user_id, word)    ← one row per character per user
```
This is the aggregated "what are your weak spots" table. It is what Gemini reads to generate practice.

### 5.6 `practice_tasks`
```
task_id              UUID     PRIMARY KEY
user_id              UUID     FK → users
content              TEXT     The AI-generated paragraph
focus_words          JSON     List of targeted characters e.g. ["t","p","g"]
difficulty           VARCHAR  easy | medium | hard
ai_generated         BOOL     True if Gemini wrote it, False if rule-based fallback
repetition_count     INT      How many times user must type this paragraph
completed_count      INT      How many times user has completed it so far
is_assessment        BOOL     True if this is a post-practice assessment test
original_session_id  UUID?    FK → typing_sessions (which session triggered this task)
created_at           DATETIME
```

### 5.7 `rooms` (Multiplayer)
```
room_id      UUID    PRIMARY KEY
code         VARCHAR(6) UNIQUE, INDEXED  ← e.g. "XF7K2A" — share this to invite
status       VARCHAR waiting | countdown | racing | finished
prompt_text  TEXT    The paragraph all players will type
host_id      UUID    FK → users (who created the room)
created_at   DATETIME
started_at   DATETIME?
finished_at  DATETIME?
```

### 5.8 `room_players` (Multiplayer)
```
id               UUID   PRIMARY KEY
room_id          UUID   FK → rooms
user_id          UUID   FK → users
username         VARCHAR
progress         FLOAT  0–100 (percentage of prompt typed)
wpm              FLOAT
accuracy         FLOAT
finish_position  INT?   1st, 2nd, 3rd... NULL if not finished yet
finished_at      DATETIME?
elo_change       INT?   ELO delta after race (positive = gained, negative = lost)
UNIQUE (room_id, user_id)
```

---

## 6. How the Core Algorithm Works (`typing_analysis.py`)

This module contains the custom DSA implementation — a hand-written merge sort.

### Step 1: `build_wrong_char_map(practice_text, user_text)`
- Uses `itertools.zip_longest` to pair each character of target text and user text.
- If they differ, increments a Python `Counter` for the expected character.
- Returns `{"t": 4, "p": 2, "e": 1}` — how many times each char was mistyped.

### Step 2: `build_wrong_char_array(wrong_char_map)`
- Converts the dict to a list of single-key dicts: `[{"t": 4}, {"p": 2}, {"e": 1}]`
- This format is what the merge sort operates on.

### Step 3: `merge_sort_wrong_chars(array)` — Custom Merge Sort
```
Time complexity:  O(n log n)
Space complexity: O(n)

Algorithm:
1. If len <= 1: return array (base case)
2. mid = len(array) // 2
3. left  = merge_sort_wrong_chars(array[:mid])   ← recursive
4. right = merge_sort_wrong_chars(array[mid:])   ← recursive
5. Merge: compare values of left[i] vs right[j]
   — pick the LARGER frequency first (descending order)
6. Append any leftover elements from whichever side has items remaining
```
**Why custom?** This is a project DSA requirement. Python's `sorted()` is fine in production, but implementing merge sort demonstrates understanding of divide-and-conquer algorithms.

### Step 4: `top_wrong_chars(wrong_char_map, top_k=5)`
- Calls steps 1–3 and returns the top K character strings: `["t", "p", "e"]`

### Step 5: `expand_chars_by_finger(top_chars)`
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
- For each weak character, find its finger group.
- Add ALL characters in that group to the practice focus list.
- Uses a `seen` set to avoid duplicates.

**Insight:** If you're bad at "t", you're probably also weak on "g", "b", "r", "f" — all left-index finger keys. This forces the practice paragraph to include the whole finger's range, not just one char.

### Step 6: `analyze_typing_session(practice_text, user_text, top_k=5)`
Master function that chains everything and returns:
```python
{
  "wrong_char_map": {"t": 4, "p": 2},
  "top_chars":      ["t", "p"],
  "focus_chars":    ["r", "f", "v", "t", "g", "b", "p", ";", "/"]
}
```

---

## 7. How Gemini AI Generates Practice Paragraphs

### Trigger
After a session ends, the user can click "Add to Daily Task". This collects:
- `liveMistakes[]` — every wrong keypress during the session (even corrected ones)
- `finalMistakes[]` — wrong characters in the final comparison
- Both lists are merged into `focus_words` (e.g., `["t","t","t","p","p","e"]` — with repetition encoding frequency)

### Backend: `generate_ai_paragraph()` in `practice.py`

**Step 1:** Count focus_words with `Counter(focus_words)` → `{"t": 3, "p": 2, "e": 1}`

**Step 2:** Identify high-priority characters (count > 1): `["t", "p"]`

**Step 3:** Build prompt string:
```
"Generate a single, natural, coherent paragraph of approximately 50 words for a typing
practice exercise. The paragraph MUST naturally include all of the following words: t, p, e.
CRITICAL: The user is consistently failing on these characters/words: t, p.
You MUST repeat these specific characters/words MULTIPLE TIMES throughout the paragraph
to force the user to practice them repeatedly.
Difficulty level: medium.
Return only the paragraph text — no titles, no explanations."
```

**Step 4:** HTTP POST to Gemini API:
```
POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
     ?key={GOOGLE_API_KEY}
Body: {
  "contents": [{"parts": [{"text": "...prompt..."}]}],
  "generationConfig": {"maxOutputTokens": 512, "temperature": 0.7}
}
```

**Step 5:** Parse response:
```python
content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
content = content.replace('\n', ' ')  # clean any markdown newlines
return content, True  # (text, ai_generated=True)
```

**Step 6:** On any error → fallback to `generate_rule_based()` which picks from 5 template strings and interpolates the focus words. Returns `(text, ai_generated=False)`.

**Result:** A `PracticeTask` row is saved with `content` = the paragraph, `focus_words` = the list, `ai_generated` = True/False, `repetition_count` = user's chosen N.

---

## 8. Complete Website Workflow (User Journey)

```
1. User visits velotype-three.vercel.app
   → Landing page with hero animation (canvas particles)
   → Can try free typing test immediately (no login required)

2. Free Typing Test (/type)
   → Random paragraph from SAMPLE_PROMPTS[] (7 built-in paragraphs)
   → Timer: 15 / 30 / 60 seconds
   → Live WPM + accuracy + combo counter
   → After finishing: shows results but CANNOT save or generate AI practice
   → Prompt: "Create an account to unlock AI personalisation"

3. Registration/Login (/login)
   → Username + email + password → POST /auth/register → bcrypt hash → DB
   → Login → POST /auth/login → access token (15min) in localStorage
                               → refresh token (7 days) in httpOnly cookie

4. Logged-in Typing Test (/type)
   → On first load: GET /practice/next
     - If active practice task exists with reps remaining → show that task
     - Else if no patterns yet → show sample prompts
   → Each session completion: POST /sessions (saves WPM, accuracy, mistakes)
     → Backend: save mistakes → analyse_and_update_patterns() → upsert patterns table
   → After finish: "Add to Daily Task" button
     → User picks: focus words + N repetitions + word count
     → POST /practice/daily-task → Gemini generates paragraph → saved to DB

5. Practice Mode
   → User types AI paragraph N times
   → Each completion increments task.completed_count
   → Progress bar: "3 / 5 repetitions"
   → After all reps done: "Take Assessment" button

6. Assessment Mode
   → User picks 75 / 100 / 150 word test
   → System shows a fresh AI paragraph (is_assessment=True)
   → User types it → result compared to their INITIAL stats
   → Shows: "Before: 65 WPM → After: 78 WPM (+13 WPM)"

7. Dashboard (/dashboard)
   → GET /analytics/progress (last 1000 sessions)
   → GET /analytics/daily (today's stats)
   → Charts: scatter plot (WPM over sessions), histogram (WPM distribution),
             activity heatmap (GitHub-style calendar), daily bar chart
   → Personal bests: last 10 / 25 / 50 sessions + all-time
   → Stats grid: total sessions, total time, avg WPM, best WPM

8. Multiplayer Race (/multiplayer)
   → Create Room → 6-char code generated → WebSocket connects
   → Share code with friends → they enter code → Join Room → WebSocket connects
   → Host clicks "Start Race" → server sends 3-2-1 countdown via WS
   → All players type same paragraph simultaneously
   → Real-time progress bars show everyone's position
   → First to finish = 1st place → ELO calculated for all players
   → Results screen: position, WPM, accuracy, ELO change

9. Leaderboard (/leaderboard)
   → GET /leaderboard → top 50 by ELO
   → Shows: rank, username, ELO, tier badge, wins/losses, avg WPM
   → Your row is highlighted in gold
   → Your position shown even if outside top 50
```

---

## 9. Authentication Flow (Detailed)

### JWT Strategy
```
Access Token  → 15 minutes lifespan → sent as Authorization: Bearer <token> header
Refresh Token → 7 days lifespan    → stored in httpOnly cookie (JS cannot read it)
```

### Registration
```
POST /auth/register { username, email, password }
→ Check username uniqueness → 409 Conflict if taken
→ Check email uniqueness → 409 Conflict if taken
→ bcrypt.hashpw(password.encode(), bcrypt.gensalt()) → password_hash
→ INSERT user → return UserRead (no password)
```

### Login
```
POST /auth/login (form-encoded: username + password)
→ SELECT user by username
→ bcrypt.checkpw(plain, hashed) → constant-time compare (prevents timing attacks)
→ create_access_token(user_id)  → JWT signed with HS256, 15-min expiry
→ create_refresh_token(user_id) → JWT signed with HS256, 7-day expiry
→ Set cookie: httpOnly=True, secure=True (prod), samesite="lax"
→ Return { access_token }
```

### Every Protected API Request
```
Client sends: Authorization: Bearer <access_token>
→ FastAPI: oauth2_scheme extracts token from header
→ get_current_user(token, session):
    jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    → extract user_id from "sub" claim
    → SELECT user from DB
    → return User object (injected into endpoint function)
→ If token expired or tampered: JWTError → 401 Unauthorized
```

### Token Refresh
```
POST /auth/refresh (no body needed — sends cookie automatically)
→ Read refresh_token from httpOnly cookie
→ decode_token(refresh_token)
→ Check user still exists in DB
→ Return new { access_token }
```

### Frontend (AuthContext.jsx)
```
On mount:
  → Read access_token from localStorage
  → Fetch GET /auth/me with that token
  → If 200: set user state (user is logged in)
  → If 401: clear localStorage, set user = null (session expired)

login():
  → POST /auth/login (form-encoded)
  → Fetch GET /auth/me immediately after to get full user object
  → Store token in localStorage + update React state

logout():
  → Remove token from localStorage
  → Set user = null (React re-renders, redirects to home)
```

### Why httpOnly Cookie for Refresh Token?
httpOnly cookies are completely invisible to JavaScript. Even if an attacker runs malicious JS on the page (XSS), they cannot steal the refresh token. The access token is short-lived (15 min) to limit damage if stolen from localStorage.

---

## 10. Frontend–Backend Integration

### How Data Flows

```
React Component
      │
      │ calls apiClient('/sessions', { method: 'POST', body: JSON.stringify({...}) })
      │
      ▼
apiClient.js
      │ reads access_token from localStorage
      │ builds fetch() call with:
      │   Authorization: Bearer <token>
      │   Content-Type: application/json
      │   credentials: "include"  ← sends httpOnly cookie too
      │
      ▼
FastAPI Backend
      │ CORS middleware checks origin
      │ Rate limiter checks IP
      │ oauth2_scheme extracts Bearer token
      │ get_current_user() validates JWT + loads user from DB
      │ Endpoint function runs
      │ Returns JSON response
      │
      ▼
apiClient.js
      │ if res.ok → return res.json()
      │ if !res.ok → parse error, throw new Error(detail)
      │
      ▼
React Component
      catches error → sets error state → shows to user
```

### WebSocket Integration (Multiplayer)

```
Frontend Multiplayer.jsx
      │
      │ const token = localStorage.getItem('access_token')
      │ const ws = new WebSocket(`wss://api.../rooms/${code}/ws?token=${token}`)
      │
      ▼
Backend rooms.py WebSocket endpoint
      │ Extracts ?token= query parameter (browsers can't set headers on WS)
      │ Calls get_user_from_token(token, db) → returns User or None
      │ If None → ws.close(4001)  // unauthorized
      │
      ▼
ConnectionManager (in-memory singleton)
      │ Stores { room_code: { user_id: WebSocket } }
      │ Handles broadcast() → sends JSON to all players in a room
      │
Message types:
  Client → Server:
    { type: "start_race" }                          ← host starts race
    { type: "progress_update", progress, wpm, accuracy }  ← during race
    { type: "finished", wpm, accuracy }             ← player done
  
  Server → Client:
    { type: "room_state", players, status, ... }    ← full room snapshot
    { type: "countdown", count: 3|2|1 }             ← countdown
    { type: "race_start", prompt }                  ← race begins
    { type: "player_progress", players: [...] }     ← live bar updates
    { type: "race_results", results: [...] }        ← final standings + ELO
```

---

## 11. ELO Ranking System

### Tiers
| Tier | Min ELO | Color |
|---|---|---|
| Bronze | 0 | `#cd7f32` |
| Silver | 1000 | `#c0c0c0` |
| Gold | 1500 | `#FFD600` |
| Platinum | 2000 | `#00e5cc` |
| Diamond | 2500 | `#4fc3f7` |
| Immortal | 3000 | `#ba68c8` |
| Velotype Master | 3500 | `#ff4444` |

All new users start at **1000 ELO (Silver)**.

### ELO Calculation
```python
K = 32  # how fast ratings change (standard chess K-factor for active players)
expected_score = 1 / (1 + 10 ** ((avg_opponent_elo - my_elo) / 400))
actual_score   = 1.0 - (finish_position - 1) / (total_players - 1)
# 1st place = 1.0 score, last place = 0.0, linear interpolation in between
elo_change = round(K * (actual_score - expected_score))
```
- Win against higher-rated opponents → big ELO gain.
- Lose to lower-rated opponents → big ELO loss.
- 1st finisher counts as a win, everyone else as a loss.

---

## 12. How to Run Locally

### Requirements
- Python 3.10+
- Node.js 18+ and npm
- A Google Gemini API key (free at ai.google.dev)

### Backend Setup
```bash
cd VELOTYPE/backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # Linux/Mac
.venv\Scripts\activate             # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
GOOGLE_API_KEY=your_gemini_key_here
DATABASE_URL=sqlite:///./velotypeai.db
SECRET_KEY=your-long-random-secret-string-here
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
EOF

# Start server (auto-reloads on file changes)
uvicorn main:app --reload --port 8000

# API is live at:   http://localhost:8000/api/v1
# Swagger docs at:  http://localhost:8000/api/v1/docs
# ReDoc docs at:    http://localhost:8000/api/v1/redoc
```

### Frontend Setup
```bash
cd VELOTYPE/App/VeloTypeAI

# Install dependencies
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env.local

# Start dev server
npm run dev
# Opens at http://localhost:5173
```

### Production Build (Frontend)
```bash
npm run build
# Creates optimised files in dist/ folder
# Deploy dist/ to any static host (Vercel, Netlify, etc.)
```

### Database Tables
Tables are created automatically when the server starts — `init_db()` calls `SQLModel.metadata.create_all(engine)`. For PostgreSQL, it also runs `ALTER TABLE users ADD COLUMN IF NOT EXISTS elo_rating ...` to add new columns idempotently.

---

## 13. API Reference (All Endpoints)

Base URL (local): `http://localhost:8000/api/v1`
Base URL (prod):  `https://velotype-2-jn34.onrender.com/api/v1`

### Auth (`/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login, get access token + cookie |
| POST | `/auth/refresh` | Cookie | Get new access token |
| GET | `/auth/me` | Bearer | Get current user profile |

### Sessions (`/sessions`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/sessions` | Bearer | Submit completed session + mistakes |
| GET | `/sessions` | Bearer | List all sessions (paginated) |
| GET | `/sessions/{id}` | Bearer | Get one session with mistakes |

### Patterns (`/patterns`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/patterns` | Bearer | Get all active mistake patterns |
| GET | `/patterns/{id}` | Bearer | Get one pattern |

### Practice (`/practice`)
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/practice/generate` | Bearer | Generate task from patterns |
| POST | `/practice/daily-task` | Bearer | Create task from custom focus_words |
| GET | `/practice/next` | Bearer | Get next pending task |
| GET | `/practice/history` | Bearer | List past practice tasks |

### Analytics (`/analytics`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/analytics/progress` | Bearer | WPM/accuracy trends |
| GET | `/analytics/heatmap` | Bearer | Most mistyped words |
| GET | `/analytics/daily` | Bearer | Today's session stats |

### Rooms (`/rooms`) — Multiplayer
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/rooms` | Bearer | Create new race room |
| POST | `/rooms/join` | Bearer | Join room by code |
| GET | `/rooms/{code}` | Bearer | Get room state |
| WS | `/rooms/{code}/ws?token=` | Token param | Real-time race WebSocket |

### Leaderboard (`/leaderboard`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard` | Bearer | Top 50 users by ELO |

---

## 14. Key React Patterns Used

### `useRef` to Avoid Stale Closures
```javascript
// Problem: loadPrompt is in a useCallback with empty deps []
// But it needs to read activeTask (which changes during the session)
// Solution: mirror state into a ref
const activeTaskRef = useRef(activeTask);
useEffect(() => { activeTaskRef.current = activeTask; }, [activeTask]);

// Now loadPrompt reads activeTaskRef.current (always latest) without activeTask as dep
```
Without this pattern, the `useCallback` with empty `[]` deps would always see the initial `activeTask` value (stale closure).

### `React.memo` + `useMemo([])` for Particles
```javascript
const Particles = React.memo(() => {
  const particles = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      // ...
    }));
  }, []); // empty dep = computed ONCE on mount, never again
  // ...
});
```
Without `memo` + `useMemo([])`, particles regenerate on every keystroke → positions jump randomly → visual chaos.

### `submittedSessionRef` Prevents Double-Submit
```javascript
const submittedSessionRef = useRef(false);
useEffect(() => {
  if (!finished || submittedSessionRef.current) return;
  submittedSessionRef.current = true; // block re-entry
  submitSession();
}, [finished]);
```
In React 18 Strict Mode, effects run twice in development. Without this guard, two sessions would be saved for every test completion.

### Context API for Auth State
```javascript
// Provider in main.jsx wraps the whole app
<AuthProvider>
  <App />
</AuthProvider>

// Any component can consume auth state
const { isLoggedIn, user, login, logout } = useAuth();
```

### `credentials: "include"` on All Fetch Calls
Required to send the httpOnly refresh token cookie cross-origin (Vercel → Render). Without this, the cookie is never sent and the `/auth/refresh` endpoint can't work.

---

## 15. Key Design Decisions (Interview Q&A)

**Q: Why SQLModel instead of plain SQLAlchemy?**
SQLModel merges SQLAlchemy table definitions with Pydantic validation into one class. Write the model once, get both ORM and API schema validation. Example: `class User(SQLModel, table=True)` is both a DB table and a Pydantic validator for input/output.

**Q: Why store the refresh token in a cookie instead of localStorage?**
httpOnly cookies are inaccessible to JavaScript — XSS attacks can't steal them. The access token (15 min) lives in localStorage for easy header injection. If stolen, it expires fast. The refresh token (7 days) never touches JS land.

**Q: Why implement merge sort manually when Python has `sorted()`?**
Project DSA requirement. The merge sort is O(n log n) and stable — stable meaning elements with equal frequency keep their original order. Demonstrates understanding of divide-and-conquer recursion.

**Q: Why does `generate_ai_paragraph` have a fallback chain?**
Reliability. If Gemini is down, rate-limited, or the API key is missing, the user still gets a practice paragraph — just a templated one instead of AI-generated. `ai_generated=False` is stored so we can tell them it was a fallback.

**Q: Why track `liveMistakes` separately from final mistakes?**
Final mistake detection (`buildSessionMistakes`) only sees the end state — if you typed "tge" and backspaced to "the", the mistake is gone. Live tracking records every wrong keypress the instant it happens, regardless of corrections. This gives a more accurate picture of struggle characters.

**Q: Why does the timer poll at 200ms instead of 1000ms?**
For smooth WPM display. At 1000ms polling, the WPM number jumps in 1-second steps. At 200ms it updates fluidly. The `setInterval(fn, 200)` calculates real elapsed time from `Date.now() - startedAt.current` so it's still accurate even with tab switching.

**Q: Why `credentials: "include"` in fetch calls?**
Browsers only send cookies in cross-origin requests if `credentials: "include"` is explicitly set on the fetch call AND the server allows it with `Access-Control-Allow-Credentials: true`. Without this, the httpOnly refresh token cookie never reaches the backend.

**Q: Why can't you use wildcard `*` for CORS with credentials?**
Browsers enforce a rule: if a request uses credentials (cookies or auth headers), the server must respond with a specific origin in `Access-Control-Allow-Origin`, not `*`. Using `*` with `credentials: include` causes the browser to block the request silently.

**Q: What does `pool_pre_ping=True` do?**
Before using a database connection from the pool, SQLAlchemy sends a lightweight "ping" query. If the connection is stale or the DB restarted, it drops the dead connection and creates a fresh one. Without this, you'd get `OperationalError: server closed the connection` on cold starts.

**Q: How does pattern analysis scale?**
Currently `analyse_and_update_patterns()` fetches ALL mistakes for a user across all sessions. For a power user with 10,000 sessions this is slow. The fix would be to run the analysis only on the new session's mistakes (incremental update). The current threshold-based approach (PATTERN_THRESHOLD = 1) means every mistake activates a pattern immediately.

**Q: What is the WPM formula?**
```
WPM = (correct_characters_typed / 5) / (time_elapsed_in_minutes)
```
The "5" is the standard word length definition used universally in typing metrics (gross WPM). So 60 correct characters in 1 minute = 12 WPM. Accuracy = correct_chars / total_typed × 100.

**Q: How does the WebSocket multiplayer work under the hood?**
The `ConnectionManager` class holds an in-memory dictionary: `{ room_code → { user_id → WebSocket } }`. When a player connects, their WebSocket object is stored. When the host sends `start_race`, the server starts an async countdown (`asyncio.sleep(1)` three times), then broadcasts `race_start` with the prompt to everyone. As players type, they send `progress_update` every 400ms. When a player finishes, they send `finished`. When all players finish, ELO is calculated and `race_results` is broadcast to everyone.

**Q: What's the limitation of the in-memory WebSocket manager?**
It only works with a single process. If the backend runs with multiple workers (horizontal scaling), each worker has its own `ConnectionManager` and players on different workers can't see each other. In production this would need Redis Pub/Sub as a message broker. For Render.com free tier (1 process), the current approach works.

---

## 16. Interview Questions by Topic

### Python / Backend Questions

1. What is FastAPI and how does it differ from Flask?
   - FastAPI is async-first, uses Python type hints for automatic validation, and auto-generates OpenAPI docs. Flask is synchronous by default and requires manual validation.

2. What is a Pydantic model and what does it do?
   - A class that validates and parses data using Python type annotations. If input doesn't match the declared types, Pydantic raises a validation error with a clear message.

3. What is SQLModel? How does it combine SQLAlchemy and Pydantic?
   - SQLModel extends both. When `table=True`, it creates a DB table (SQLAlchemy). When used as a function parameter in FastAPI, it validates request body (Pydantic).

4. What is the difference between `session.add()` and `session.commit()`?
   - `add()` stages the change in memory (marks it as pending). `commit()` writes it to the actual database and ends the transaction.

5. What is dependency injection in FastAPI?
   - `Depends()` — FastAPI automatically resolves and calls the function before the endpoint runs. Used for `get_current_user`, `get_session`, etc. This makes authentication reusable across all routes.

6. What is bcrypt and why not use MD5/SHA256?
   - bcrypt is a password hashing algorithm designed to be slow (adjustable cost factor). MD5/SHA256 are too fast — an attacker can compute billions of hashes per second. bcrypt makes brute-force impractical.

7. What does `pool_pre_ping=True` do?
   - Tests each connection before use. Drops stale connections and creates fresh ones to prevent `OperationalError` on cold starts.

8. What is rate limiting and why use it?
   - Limits how many requests an IP can make per time window. Prevents abuse: brute-force login attacks, DoS, scraping. SlowAPI wraps a Redis/memory counter per IP.

9. What is `asyncio.sleep()` vs `time.sleep()`?
   - `asyncio.sleep()` suspends only the current coroutine, letting other async tasks run. `time.sleep()` blocks the entire thread, freezing all other requests during the countdown.

10. Why do we call `db.expire_all()` after `db.commit()` in WebSocket handlers?
    - After a commit, SQLAlchemy marks all loaded objects as "expired". Without `expire_all()` + re-query, you'd read stale cached data from before the commit.

### React / Frontend Questions

1. What is the difference between `useEffect` and `useLayoutEffect`?
   - `useEffect` runs after the browser paints. `useLayoutEffect` runs synchronously after DOM mutations but before paint. Use `useLayoutEffect` for measuring DOM nodes.

2. What causes the stale closure problem and how does `useRef` solve it?
   - When a `useCallback` or `useEffect` captures a variable in its closure, it captures the value at the time of creation. If the variable updates later, the closure still sees the old value. A `useRef` is a mutable container — reading `.current` always gives the latest value.

3. Why does React 18 Strict Mode run effects twice in development?
   - To detect side effects that aren't properly cleaned up. React mounts, unmounts, then remounts every component. This is why we need `submittedSessionRef.current = true` to prevent double API calls.

4. What is the difference between `useState` and `useRef`?
   - `useState` triggers a re-render when updated. `useRef` does not. Use `useRef` for values that need to persist across renders but shouldn't trigger re-renders (timers, DOM nodes, flags).

5. What is `React.memo` and when should you use it?
   - A HOC that prevents re-rendering a component if its props haven't changed. Use for expensive components that receive stable props — like our `<Particles>` canvas which shouldn't re-render on every keystroke.

6. What is the Context API and what problem does it solve?
   - React Context lets you share data (like auth state) through the component tree without passing props manually through every level (prop drilling). Components that need auth call `useAuth()`.

7. Why does Vite expose only `VITE_` prefixed env vars to the browser?
   - For security. If all env vars were exposed, you might accidentally expose backend secrets (`DATABASE_URL`, `SECRET_KEY`) to client-side JavaScript which anyone can read.

8. What is the difference between `credentials: "include"` and `credentials: "same-origin"`?
   - `"include"` sends cookies on every request including cross-origin. `"same-origin"` only sends cookies to the same domain. We need `"include"` because the frontend (Vercel) and backend (Render) are different domains.

9. What does React Router's `useNavigate` do vs `<Link>`?
   - `useNavigate` is programmatic navigation (called in JS code, e.g., after login success). `<Link>` is declarative navigation in JSX (renders as an `<a>` tag).

10. What is `useMemo` and how is it different from `useCallback`?
    - `useMemo` memoizes a computed **value**. `useCallback` memoizes a **function**. Both re-compute only when their dependencies change.

### Database / SQL Questions

1. What is a UUID primary key vs an integer auto-increment? Pros and cons?
   - UUID: globally unique across tables and services, no sequential guessing (security). Cons: larger storage (16 bytes vs 4 bytes), slower indexing.
   - Auto-increment: simple, fast, small. Cons: predictable (attacker can enumerate), doesn't work across distributed systems.

2. What is the UNIQUE constraint on `(user_id, word)` in mistake_patterns?
   - Ensures one row per user per character. If you insert a duplicate, the DB raises a constraint violation. We use `SELECT + UPDATE or INSERT` (upsert) logic to handle this correctly.

3. What is connection pooling?
   - Instead of opening and closing a DB connection per request (slow), a pool maintains N open connections and reuses them. `pool_size=10` keeps 10 always open. `max_overflow=20` allows up to 20 extra under peak load.

4. What is the difference between `session.exec(select(...))` and raw SQL?
   - `session.exec` uses SQLModel/SQLAlchemy ORM which translates Python objects to SQL and maps results back to model objects. Raw SQL is a string; you handle mapping yourself. ORM prevents SQL injection, raw SQL can be vulnerable if not parameterised.

5. Why is `raw_typed_text` stored as TEXT when it could be derived from mistakes?
   - Denormalisation for future features. Having the raw typed string allows replaying the session, generating richer analysis, or debugging. Deriving it from mistakes is complex and lossy.

6. What is `PATTERN_THRESHOLD`?
   - A constant (value: 1) — a mistake pattern is only marked `is_active = True` when the user has made that mistake at least once. Tunable: set to 3 to only flag persistent mistakes.

7. What does `order_by(MistakePattern.mistake_count.desc())` do?
   - Sorts results from highest mistake_count to lowest so the worst characters appear first. `.desc()` = descending order.

8. How does `CREATE TABLE IF NOT EXISTS` vs `ALTER TABLE ADD COLUMN IF NOT EXISTS` differ?
   - `CREATE TABLE IF NOT EXISTS` creates the table only if it doesn't exist yet. `ALTER TABLE ADD COLUMN IF NOT EXISTS` adds a column to an existing table only if that column doesn't already exist. We need the latter when adding new fields to a production table without dropping and recreating it.

### System Design / Architecture Questions

1. How would you add caching to reduce Gemini API calls?
   - Store generated paragraphs by their `focus_words` hash in Redis. Before calling Gemini, check if a paragraph for these focus words already exists. Cache for 24 hours.

2. How would you scale the WebSocket multiplayer to multiple server instances?
   - Replace the in-memory `ConnectionManager` with Redis Pub/Sub. When a player sends a message, the server publishes to a Redis channel named after the room code. All server instances subscribe to the same channel and broadcast to their local WebSocket connections.

3. How would you handle the Render.com cold start problem?
   - Free tier servers spin down after 15 minutes of inactivity. `AuthContext.jsx` uses `fetchWithTimeout` with a 30-second timeout and catches `AbortError` to show "Server is waking up — please try again." A production fix would use a paid tier or a cron job that pings the server every 10 minutes to keep it warm.

4. What happens if a player disconnects mid-race?
   - The `WebSocketDisconnect` exception is caught, `manager.disconnect()` removes them, and if the room is still in `waiting` status, `_bcast_room_state` broadcasts the updated player list. If racing, the remaining players continue. ELO is only calculated when all registered players finish.

5. How would you add real-time notification if the Gemini API is slow?
   - Server-Sent Events (SSE) or WebSocket streaming. While Gemini generates, stream the partial text back to the frontend so the user sees it being written in real time instead of waiting for the full response.

---

## 17. What Makes This Project Stand Out

1. **Real DSA implementation:** Custom merge sort in `typing_analysis.py` — not just calling `sorted()`. Demonstrates understanding of divide-and-conquer, time/space complexity.

2. **Personalized AI feedback:** Not a generic typing test. The Gemini prompt construction uses frequency-weighted `Counter` and builds a `CRITICAL` instruction for high-frequency weak characters. The practice text is literally written for your specific weakness.

3. **Finger-group expansion logic:** Grouping weak characters by finger (`FINGER_MAP`) is an original insight — most typing trainers don't do this. It means "if you're weak at 't', you'll also practice 'g', 'b', 'r', 'f'" because they share the same left-index finger.

4. **Live vs final mistake tracking:** Two distinct tracking systems — `liveMistakes` captures every error in real time, `buildSessionMistakes` compares the final state. The live tracking catches "phantom" errors you corrected before the test ended. Most typing apps only do final comparison.

5. **Real-time multiplayer with ELO:** WebSocket-powered typing races with a 7-tier ELO ranking system. Most typing trainers are solo-only. VeloRace adds a competitive dimension that significantly increases engagement.

6. **Full-stack implementation from scratch:** No typing library used. The character-by-character rendering, timer, combo counter, progress calculation, and mistake detection are all written in raw React — no dependency on external typing test packages.

7. **Security best practices:** bcrypt (adaptive cost), JWT (short-lived access tokens), httpOnly cookies (XSS-resistant refresh tokens), parameterised ORM queries (SQL injection prevention), CORS with explicit origin list (no wildcard with credentials).

8. **Production deployment:** Deployed and accessible at a real URL. Most projects stay on localhost. This one has a live backend on Render.com and frontend on Vercel with actual HTTPS, CORS headers, and cookie security.

9. **Graceful degradation:** If Gemini API is down, the app still works — it falls back to rule-based paragraph generation. If the user isn't logged in, they still get a typing test from local sample prompts. Failures are handled at every layer.

10. **Canvas animations without a library:** FloatingParticles.jsx, Landing.jsx hero particles, and login.jsx particles are all vanilla HTML5 Canvas — no Three.js, no particle library. Mouse repulsion physics, bell-curve alpha fade, deferred `requestAnimationFrame` to fix the `offsetWidth=0` timing bug — all custom implementations.

---

## 18. One-Paragraph Summary for Introduction

VeloTypeAI is a full-stack adaptive typing training platform built with React (Vite) on the frontend and FastAPI (Python) on the backend, using PostgreSQL as the production database. The core innovation is a two-layer mistake tracking system: every wrong keypress is recorded live, and a final character comparison runs when the test ends. These mistakes are aggregated into a personal weakness profile using a custom merge sort algorithm and a finger-map grouping system. The weakness profile is sent to Google Gemini 2.5 Flash with a precision-engineered prompt that instructs the AI to write a paragraph specifically forcing the user to type their worst characters repeatedly. Users practice the AI-generated paragraph N times, then take a post-practice assessment that shows their exact WPM and accuracy improvement. On top of the solo practice system, the platform includes a real-time multiplayer racing mode using native WebSockets, where players race to type the same paragraph and earn or lose ELO points based on finish position. A global leaderboard tracks the top players across seven rank tiers from Bronze to Velotype Master. The entire system is secured with bcrypt password hashing, HS256 JWT access tokens with 15-minute expiry, and httpOnly refresh token cookies that resist XSS attacks.
