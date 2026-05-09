import uuid
from typing import List

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlmodel import Session, select, func

from database import get_session
from models import User, TypingSession
from routers.auth import get_current_user

router = APIRouter()


def get_rank(elo: int) -> str:
    if elo >= 3500: return "Velotype Master"
    if elo >= 3000: return "Immortal"
    if elo >= 2500: return "Diamond"
    if elo >= 2000: return "Platinum"
    if elo >= 1500: return "Gold"
    if elo >= 1000: return "Silver"
    return "Bronze"


class LeaderboardEntry(BaseModel):
    position:  int
    user_id:   str
    username:  str
    elo:       int
    rank_name: str
    wins:      int
    losses:    int
    avg_wpm:   float
    is_me:     bool = False


class LeaderboardResponse(BaseModel):
    entries:     List[LeaderboardEntry]
    total_users: int
    my_position: int = 0
    my_elo:      int = 0
    my_rank:     str = "Bronze"


@router.get(
    "/",
    response_model=LeaderboardResponse,
    summary="Global ELO leaderboard",
)
def get_leaderboard(
    limit:        int     = Query(default=50, ge=1, le=100),
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_session),
):
    # Top N users by ELO
    top_users = db.exec(
        select(User)
        .order_by(User.elo_rating.desc())
        .limit(limit)
    ).all()

    # Avg WPM per user (across all sessions)
    entries: list[LeaderboardEntry] = []
    for pos, u in enumerate(top_users, start=1):
        avg_wpm = db.exec(
            select(func.avg(TypingSession.wpm))
            .where(TypingSession.user_id == u.user_id)
        ).one() or 0.0

        entries.append(LeaderboardEntry(
            position=pos,
            user_id=str(u.user_id),
            username=u.username,
            elo=getattr(u, "elo_rating", 1000),
            rank_name=get_rank(getattr(u, "elo_rating", 1000)),
            wins=getattr(u, "wins", 0),
            losses=getattr(u, "losses", 0),
            avg_wpm=round(float(avg_wpm), 1),
            is_me=(u.user_id == current_user.user_id),
        ))

    # Current user's global position
    my_elo = getattr(current_user, "elo_rating", 1000)
    my_pos = db.exec(
        select(func.count(User.user_id))
        .where(User.elo_rating > my_elo)
    ).one() or 0
    my_pos = int(my_pos) + 1

    total = db.exec(select(func.count(User.user_id))).one() or 0

    return LeaderboardResponse(
        entries=entries,
        total_users=int(total),
        my_position=my_pos,
        my_elo=my_elo,
        my_rank=get_rank(my_elo),
    )
