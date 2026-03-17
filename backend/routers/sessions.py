import uuid
from typing import List, Optional
 
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import Session, select
 
from database import get_session
from models import (
    Mistake,
    MistakeCreate,
    MistakeRead,
    TypingSession,
    TypingSessionCreate,
    TypingSessionRead,
    User,
)
from routers.auth import get_current_user
from routers.patterns import analyse_and_update_patterns
 
# ──────────────────────────────────────────────
#  Router
# ──────────────────────────────────────────────
 
router = APIRouter()
 
# ──────────────────────────────────────────────
#  Pydantic Schemas
# ──────────────────────────────────────────────
 
class MistakeInput(BaseModel):
    """Mistake data submitted alongside a new session."""
    word_expected: str
    word_typed:    str
    error_type:    str   # substitution | omission | insertion | transposition
    position:      int
 
 
class CreateSessionRequest(BaseModel):
    """Full payload for submitting a completed typing session."""
    prompt_id:      uuid.UUID
    wpm:            float
    accuracy:       float
    duration_seconds: int
    keystrokes_total: int
    raw_typed_text: Optional[str] = None
    mistakes:       List[MistakeInput] = []
 
 
class SessionDetailRead(TypingSessionRead):
    """A session with its associated mistakes included."""
    mistakes: List[MistakeRead] = []
 
 
# ──────────────────────────────────────────────
#  POST /
#  Submit a completed typing session
# ──────────────────────────────────────────────
 
@router.post(
    "/",
    response_model=SessionDetailRead,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a completed typing session with mistakes",
)
def create_session(
    body:         CreateSessionRequest,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> SessionDetailRead:
    """
    Persists a typing session and its associated mistakes,
    then triggers pattern analysis for the user.
 
    Flow:
      1. Save the TypingSession
      2. Save each Mistake linked to the session
      3. Run analyse_and_update_patterns()
      4. Return the saved session + mistakes
    """
 
    # ── Step 1: Save the session ──
    new_session = TypingSession(
        user_id=current_user.user_id,
        prompt_id=body.prompt_id,
        wpm=body.wpm,
        accuracy=body.accuracy,
        duration_seconds=body.duration_seconds,
        keystrokes_total=body.keystrokes_total,
        raw_typed_text=body.raw_typed_text,
    )
    session.add(new_session)
    session.commit()
    session.refresh(new_session)
 
    # ── Step 2: Save each mistake ──
    saved_mistakes: List[Mistake] = []
 
    for m in body.mistakes:
        new_mistake = Mistake(
            session_id=new_session.session_id,
            user_id=current_user.user_id,
            word_expected=m.word_expected,
            word_typed=m.word_typed,
            error_type=m.error_type,
            position=m.position,
        )
        session.add(new_mistake)
        saved_mistakes.append(new_mistake)
 
    session.commit()
 
    # Refresh each mistake so their IDs are populated
    for m in saved_mistakes:
        session.refresh(m)
 
    # ── Step 3: Trigger pattern analysis ──
    analyse_and_update_patterns(
        user_id=current_user.user_id,
        session=session,
    )
 
    # ── Step 4: Return session + mistakes ──
    return SessionDetailRead(
        **new_session.dict(),
        mistakes=saved_mistakes,
    )
 
 
# ──────────────────────────────────────────────
#  GET /
#  Get all sessions for the current user
#  (paginated)
# ──────────────────────────────────────────────
 
@router.get(
    "/",
    response_model=List[TypingSessionRead],
    summary="Get all typing sessions for the current user",
)
def get_sessions(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
    offset:       int     = Query(default=0,  ge=0,  description="Number of records to skip"),
    limit:        int     = Query(default=20, ge=1, le=100, description="Number of records to return"),
) -> List[TypingSessionRead]:
    """
    Returns the user's typing sessions, newest first.
    Supports pagination via offset and limit query params:
      GET /api/v1/sessions?offset=0&limit=20
    """
    sessions = session.exec(
        select(TypingSession)
        .where(TypingSession.user_id == current_user.user_id)
        .order_by(TypingSession.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()
 
    return sessions
 
 
# ──────────────────────────────────────────────
#  GET /{session_id}
#  Get a single session with its mistakes
# ──────────────────────────────────────────────
 
@router.get(
    "/{session_id}",
    response_model=SessionDetailRead,
    summary="Get a single typing session with its mistakes",
)
def get_session_by_id(
    session_id:   uuid.UUID,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
) -> SessionDetailRead:
    """
    Returns a single typing session by its ID, including
    all mistakes recorded during that session.
    """
    # Fetch the session
    typing_session = session.exec(
        select(TypingSession)
        .where(
            TypingSession.session_id == session_id,
            TypingSession.user_id    == current_user.user_id,
        )
    ).first()
 
    if not typing_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found.",
        )
 
    # Fetch the associated mistakes
    mistakes = session.exec(
        select(Mistake)
        .where(Mistake.session_id == session_id)
        .order_by(Mistake.position.asc())
    ).all()
 
    return SessionDetailRead(
        **typing_session.dict(),
        mistakes=mistakes,
    )