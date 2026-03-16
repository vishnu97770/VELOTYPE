from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from database import get_session
from models import MistakePattern, MistakePatternRead, User
from routers.auth import get_current_user

# ──────────────────────────────────────────────
#  Router
# ──────────────────────────────────────────────

router = APIRouter()

# ──────────────────────────────────────────────
#  Constants
# ──────────────────────────────────────────────

PATTERN_THRESHOLD = 3  # mistake_count must be >= this to be flagged as active

# ──────────────────────────────────────────────
#  GET /
#  Returns all active mistake patterns for the
#  currently authenticated user
# ──────────────────────────────────────────────

@router.get(
    "/",
    response_model=List[MistakePatternRead],
    summary="Get all active mistake patterns for the current user",
)
def get_patterns(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> List[MistakePatternRead]:
    """
    Returns all patterns where is_active=True for the logged-in user,
    ordered by mistake_count descending so the worst offenders appear first.
    """
    patterns = session.exec(
        select(MistakePattern)
        .where(
            MistakePattern.user_id  == current_user.user_id,
            MistakePattern.is_active == True,
        )
        .order_by(MistakePattern.mistake_count.desc())
    ).all()

    return patterns


# ──────────────────────────────────────────────
#  GET /{pattern_id}
#  Returns a single pattern by ID
# ──────────────────────────────────────────────

@router.get(
    "/{pattern_id}",
    response_model=MistakePatternRead,
    summary="Get a single mistake pattern by ID",
)
def get_pattern(
    pattern_id:   str,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> MistakePatternRead:
    pattern = session.exec(
        select(MistakePattern)
        .where(
            MistakePattern.pattern_id == pattern_id,
            MistakePattern.user_id    == current_user.user_id,
        )
    ).first()

    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pattern not found.",
        )

    return pattern


# ──────────────────────────────────────────────
#  Core Pattern Analysis Logic
#
#  Called internally by sessions.py after a
#  typing session is saved. Not exposed as an
#  HTTP endpoint — used as a shared utility.
# ──────────────────────────────────────────────

def analyse_and_update_patterns(
    user_id: str,
    session: Session,
) -> None:
    """
    Analyse the user's recent mistakes and upsert their mistake_patterns table.

    Steps:
      1. Fetch all mistakes for the user (across all sessions)
      2. Build a frequency map  { word_expected: count }
      3. For each word:
           - If pattern already exists  → update count + last_seen_at
           - If pattern does not exist  → create it
      4. Activate  patterns where count >= PATTERN_THRESHOLD
      5. Deactivate patterns where count <  PATTERN_THRESHOLD
    """
    from datetime import datetime
    from collections import Counter
    from models import Mistake

    # ── Step 1: Fetch all mistakes for this user ──
    mistakes = session.exec(
        select(Mistake).where(Mistake.user_id == user_id)
    ).all()

    if not mistakes:
        return

    # ── Step 2: Build frequency map ──
    frequency: Counter = Counter(m.word_expected for m in mistakes)

    # ── Step 3 & 4 & 5: Upsert patterns ──
    for word, count in frequency.items():
        existing = session.exec(
            select(MistakePattern)
            .where(
                MistakePattern.user_id == user_id,
                MistakePattern.word    == word,
            )
        ).first()

        if existing:
            # Update existing pattern
            existing.mistake_count = count
            existing.last_seen_at  = datetime.utcnow()
            existing.is_active     = count >= PATTERN_THRESHOLD
            session.add(existing)
        else:
            # Create new pattern
            new_pattern = MistakePattern(
                user_id       = user_id,
                word          = word,
                mistake_count = count,
                is_active     = count >= PATTERN_THRESHOLD,
            )
            session.add(new_pattern)

    session.commit()
