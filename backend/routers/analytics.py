from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session, select, func

from database import get_session
from models import MistakePattern, TypingSession, Mistake, User
from routers.auth import get_current_user

# ──────────────────────────────────────────────
#  Router
# ──────────────────────────────────────────────

router = APIRouter()

# ──────────────────────────────────────────────
#  Pydantic Schemas
# ──────────────────────────────────────────────

class ProgressPoint(BaseModel):
    """A single data point on the WPM / accuracy progress chart."""
    session_number: int
    wpm:            float
    accuracy:       float
    created_at:     datetime


class ProgressResponse(BaseModel):
    """Overall progress stats + per-session history."""
    total_sessions:   int
    average_wpm:      float
    average_accuracy: float
    best_wpm:         float
    total_time_mins:  float
    history:          List[ProgressPoint]


class HeatmapEntry(BaseModel):
    """A single word and how many times it has been mistyped."""
    word:          str
    mistake_count: int
    is_active:     bool


class HeatmapResponse(BaseModel):
    """Full heatmap of the user's most frequently mistyped words."""
    total_unique_words: int
    entries:            List[HeatmapEntry]


# ──────────────────────────────────────────────
#  GET /progress
#  Returns WPM & accuracy trends over time
# ──────────────────────────────────────────────

@router.get(
    "/progress",
    response_model=ProgressResponse,
    summary="Get WPM and accuracy progress over time",
)
def get_progress(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
    limit:        int     = Query(default=50, ge=1, le=200, description="Number of recent sessions to include"),
) -> ProgressResponse:
    """
    Returns the user's typing performance history, including:
      - Total sessions completed
      - Average WPM and accuracy
      - Personal best WPM
      - Total time spent typing (in minutes)
      - Per-session history for charting (newest first)
    """

    # Fetch the user's most recent sessions
    sessions = session.exec(
        select(TypingSession)
        .where(TypingSession.user_id == current_user.user_id)
        .order_by(TypingSession.created_at.asc())
        .limit(limit)
    ).all()

    if not sessions:
        return ProgressResponse(
            total_sessions=0,
            average_wpm=0.0,
            average_accuracy=0.0,
            best_wpm=0.0,
            total_time_mins=0.0,
            history=[],
        )

    # Compute aggregate stats
    total_sessions   = len(sessions)
    average_wpm      = round(sum(s.wpm for s in sessions) / total_sessions, 2)
    average_accuracy = round(sum(s.accuracy for s in sessions) / total_sessions, 2)
    best_wpm         = round(max(s.wpm for s in sessions), 2)
    total_time_mins  = round(sum(s.duration_seconds for s in sessions) / 60, 2)

    # Build per-session history for the progress chart
    history = [
        ProgressPoint(
            session_number=idx + 1,
            wpm=round(s.wpm, 2),
            accuracy=round(s.accuracy, 2),
            created_at=s.created_at,
        )
        for idx, s in enumerate(sessions)
    ]

    return ProgressResponse(
        total_sessions=total_sessions,
        average_wpm=average_wpm,
        average_accuracy=average_accuracy,
        best_wpm=best_wpm,
        total_time_mins=total_time_mins,
        history=history,
    )


# ──────────────────────────────────────────────
#  GET /heatmap
#  Returns mistake frequency data for all words
# ──────────────────────────────────────────────

@router.get(
    "/heatmap",
    response_model=HeatmapResponse,
    summary="Get mistake frequency heatmap for the current user",
)
def get_heatmap(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session),
    only_active:  bool    = Query(default=False, description="If true, return only active patterns"),
) -> HeatmapResponse:
    """
    Returns all of the user's mistyped words and how many times
    each has been mistyped — used to render a mistake heatmap
    on the frontend.

    Ordered by mistake_count descending so the worst words
    appear first.

    Pass ?only_active=true to return only words that have
    crossed the pattern threshold (mistake_count >= 3).
    """

    query = (
        select(MistakePattern)
        .where(MistakePattern.user_id == current_user.user_id)
        .order_by(MistakePattern.mistake_count.desc())
    )

    if only_active:
        query = query.where(MistakePattern.is_active == True)

    patterns = session.exec(query).all()

    entries = [
        HeatmapEntry(
            word=p.word,
            mistake_count=p.mistake_count,
            is_active=p.is_active,
        )
        for p in patterns
    ]

    return HeatmapResponse(
        total_unique_words=len(entries),
        entries=entries,
    )