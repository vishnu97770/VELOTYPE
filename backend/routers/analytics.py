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


