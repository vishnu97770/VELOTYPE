import os
import random
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import MistakePattern, PracticeTask, PracticeTaskRead, User
from routers.auth import get_current_user

# ──────────────────────────────────────────────
#  Router
# ──────────────────────────────────────────────

router = APIRouter()

# ──────────────────────────────────────────────
#  Constants
# ──────────────────────────────────────────────

TOP_K_PATTERNS  = 5    # how many of the worst patterns to target per task
AI_MODEL        = "claude-sonnet-4-20250514"
GEMINI_MODEL    = "gemini-2.5-flash"   # Correct working model for this API key
GEMINI_MODEL_PATH = "models/gemini-2.5-flash"  # Full path required for v1beta
AI_MAX_TOKENS   = 512


# ──────────────────────────────────────────────
#  Rule-Based Sentence Templates
#  {word} is replaced with each focus word
# ──────────────────────────────────────────────

TEMPLATES = [
    "Please type the following word carefully: {word}.",
    "Focus on typing {word} correctly every single time.",
    "The word {word} requires your full attention.",
    "Practice makes perfect when typing {word} repeatedly.",
    "Try not to make a mistake when you type {word}.",
    "Make sure you spell {word} accurately without hesitation.",
    "The key to improvement is mastering words like {word}.",
    "Take your time and type {word} with precision.",
]


# ──────────────────────────────────────────────
#  Rule-Based Generator
# ──────────────────────────────────────────────

def generate_rule_based(focus_words: List[str]) -> str:
    """
    Build a practice paragraph by injecting each focus word
    into a randomly chosen sentence template.
    """
    sentences = []
    for word in focus_words:
        template = random.choice(TEMPLATES)
        sentences.append(template.format(word=word))
    return " ".join(sentences)


# ──────────────────────────────────────────────
#  AI-Augmented Generator
#  Calls Claude API to generate a natural paragraph
#  that includes the focus words organically.
#  Falls back to rule-based if the API call fails.
# ──────────────────────────────────────────────

async def generate_ai_paragraph(
    focus_words: List[str],
    difficulty:  str,
    word_count:  int = 50,
) -> tuple[str, bool]:
    """
    Returns (content, ai_generated).
    ai_generated = True  if the AI call succeeded.
    ai_generated = False if it fell back to rule-based.
    """
    import httpx

    api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if not api_key:
        # No API key configured — use rule-based
        return generate_rule_based(focus_words), False


    # ── Step 2: Build Frequency Weighted Prompt ──
    from collections import Counter
    counts = Counter(focus_words)
    
    # Identify "high priority" words (those appearing multiple times)
    high_priority = [word for word, count in counts.items() if count > 1]
    all_unique = list(counts.keys())
    
    words_joined = ", ".join(all_unique)
    priority_note = ""
    if high_priority:
        priority_note = (
            f" CRITICAL: The user is consistently failing on these characters/words: {', '.join(high_priority)}. "
            f"You MUST repeat these specific characters/words MULTIPLE TIMES throughout the paragraph "
            f"to force the user to practice them repeatedly."
        )

    prompt = (
        f"Generate a single, natural, coherent paragraph of approximately {word_count} words "
        f"for a typing practice exercise. The paragraph MUST naturally include all of "
        f"the following words: {words_joined}.{priority_note} "
        f"Difficulty level: {difficulty}. "
        f"Return only the paragraph text — no titles, no explanations, no bullet points."
    )

    try:
        # ── Try Claude (Anthropic) first ──
        if os.getenv("ANTHROPIC_API_KEY"):
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key":         os.getenv("ANTHROPIC_API_KEY"),
                        "anthropic-version": "2023-06-01",
                        "content-type":      "application/json",
                    },
                    json={
                        "model":      AI_MODEL,
                        "max_tokens": AI_MAX_TOKENS,
                        "messages":   [{"role": "user", "content": prompt}],
                    },
                )
                response.raise_for_status()
                data    = response.json()
                content = data["content"][0]["text"].strip()
                return content, True

        # ── Fallback: Try OpenAI ──
        if os.getenv("OPENAI_API_KEY"):
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
                        "Content-Type":  "application/json",
                    },
                    json={
                        "model":      "gpt-3.5-turbo",
                        "max_tokens": AI_MAX_TOKENS,
                        "messages":   [{"role": "user", "content": prompt}],
                    },
                )
                response.raise_for_status()
                data    = response.json()
                content = data["choices"][0]["message"]["content"].strip()
                return content, True

        # ── Try Gemini (Google) ──
        if os.getenv("GOOGLE_API_KEY"):
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/{GEMINI_MODEL_PATH}:generateContent?key={os.getenv('GOOGLE_API_KEY')}",
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "maxOutputTokens": AI_MAX_TOKENS,
                            "temperature": 0.7,
                        }
                    },
                )
                response.raise_for_status()
                data    = response.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                # Strip any markdown or extra newlines
                content = content.replace('\n', ' ').strip()
                return content, True


    except Exception as e:
        # Log but fall back gracefully
        print(f"[generate_ai_paragraph] AI call failed: {type(e).__name__}: {e}")
        pass

    return generate_rule_based(focus_words), False


# ──────────────────────────────────────────────
#  Pydantic Schemas
# ──────────────────────────────────────────────

class GeneratePracticeRequest(BaseModel):
    difficulty:   str           = "medium"   # "easy" | "medium" | "hard"
    top_k:        Optional[int] = TOP_K_PATTERNS
    use_ai:       bool          = True        # set False to force rule-based


class GeneratePracticeResponse(PracticeTaskRead):
    pass


class DailyTaskRequest(BaseModel):
    focus_words:         List[str]
    repetition_count:    int
    difficulty:          str = "medium"
    original_session_id: Optional[uuid.UUID] = None
    is_assessment:       bool = False
    word_count:          int = 50


# ──────────────────────────────────────────────
#  POST /generate
#  Generate a new personalised practice task
# ──────────────────────────────────────────────

@router.post(
    "/generate",
    response_model=GeneratePracticeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate a personalised practice task from the user's active patterns",
)
async def generate_practice(
    body:         GeneratePracticeRequest,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> GeneratePracticeResponse:
    """
    Flow:
      1. Fetch the user's top-K active mistake patterns
      2. Extract the focus words
      3. Generate content via AI (or rule-based fallback)
      4. Save and return the new PracticeTask
    """

    # ── Step 1: Fetch top-K active patterns ──
    patterns = session.exec(
        select(MistakePattern)
        .where(
            MistakePattern.user_id   == current_user.user_id,
            MistakePattern.is_active == True,
        )
        .order_by(MistakePattern.mistake_count.desc())
        .limit(body.top_k or TOP_K_PATTERNS)
    ).all()

    if not patterns:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "No active mistake patterns found. "
                "Complete a few typing sessions first so we can identify your weak spots!"
            ),
        )

    # ── Step 2: Extract focus words ──
    focus_words = [p.word for p in patterns]

    # ── Step 3: Generate content ──
    if body.use_ai:
        content, ai_generated = await generate_ai_paragraph(focus_words, body.difficulty)
    else:
        content      = generate_rule_based(focus_words)
        ai_generated = False

    # ── Step 4: Save and return ──
    new_task = PracticeTask(
        user_id      = current_user.user_id,
        content      = content,
        focus_words  = focus_words,
        difficulty   = body.difficulty,
        ai_generated = ai_generated,
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task


# ──────────────────────────────────────────────
#  POST /daily-task
#  Create a specific practice task (e.g. for repetitions)
# ──────────────────────────────────────────────

@router.post(
    "/daily-task",
    response_model=PracticeTaskRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a custom practice task with repetitions",
)
async def create_daily_task(
    body:         DailyTaskRequest,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> PracticeTaskRead:
    """
    Creates a practice task with a specific repetition count.
    Used when a user clicks 'Add to Daily Task' after a session.
    """
    # Generate content
    content, ai_generated = await generate_ai_paragraph(
        body.focus_words, 
        body.difficulty, 
        word_count=body.word_count
    )

    new_task = PracticeTask(
        user_id             = current_user.user_id,
        content             = content,
        focus_words         = body.focus_words,
        difficulty          = body.difficulty,
        ai_generated        = ai_generated,
        repetition_count    = body.repetition_count,
        completed_count     = 0,
        is_assessment       = body.is_assessment,
        original_session_id = body.original_session_id,
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task


# ──────────────────────────────────────────────
#  GET /history
#  Get all previously generated practice tasks
# ──────────────────────────────────────────────

@router.get(
    "/history",
    response_model=List[PracticeTaskRead],
    summary="Get previously generated practice tasks for the current user",
)
def get_practice_history(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
    offset:       int     = Query(default=0,  ge=0,   description="Number of records to skip"),
    limit:        int     = Query(default=20, ge=1, le=100, description="Max records to return"),
) -> List[PracticeTaskRead]:
    """
    Returns the user's practice task history, newest first.
    Supports pagination via offset and limit query params:
      GET /api/v1/practice/history?offset=0&limit=20
    """
    tasks = session.exec(
        select(PracticeTask)
        .where(PracticeTask.user_id == current_user.user_id)
        .order_by(PracticeTask.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return tasks


# ──────────────────────────────────────────────
#  GET /next
#  Get the next recommended practice task
# ──────────────────────────────────────────────

@router.get(
    "/next",
    response_model=PracticeTaskRead,
    summary="Get the next recommended practice task",
)
async def get_next_practice(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> PracticeTaskRead:
    """
    Returns the most recent practice task, or generates a new one
    if the user has patterns but no tasks.
    """
    # 1. Fetch newest task
    task = session.exec(
        select(PracticeTask)
        .where(PracticeTask.user_id == current_user.user_id)
        .order_by(PracticeTask.created_at.desc())
    ).first()

    if task:
        return task

    # 2. No task? Try to generate one from patterns
    patterns = session.exec(
        select(MistakePattern)
        .where(
            MistakePattern.user_id   == current_user.user_id,
            MistakePattern.is_active == True,
        )
        .order_by(MistakePattern.mistake_count.desc())
        .limit(TOP_K_PATTERNS)
    ).all()

    if not patterns:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending practice",
        )

    # Generate on the fly
    focus_words = [p.word for p in patterns]
    content, ai_generated = await generate_ai_paragraph(focus_words, "medium")

    new_task = PracticeTask(
        user_id      = current_user.user_id,
        content      = content,
        focus_words  = focus_words,
        difficulty   = "medium",
        ai_generated = ai_generated,
    )
    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return new_task