import asyncio
import random
import string
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel
from sqlmodel import Session, select

from database import get_session
from models import Room, RoomPlayer, User
from routers.auth import get_current_user, get_user_from_token

router = APIRouter()

# ──────────────────────────────────────────────
#  Race prompt pool
# ──────────────────────────────────────────────

RACE_PROMPTS = [
    "The quick brown fox jumps over the lazy dog. Speed and precision define the master typist. Every keystroke brings you closer to excellence and glory.",
    "In the realm of competitive typing, accuracy matters as much as speed. Focus on each word as it comes, breathe steadily, and let your fingers find their rhythm.",
    "Technology transforms the way we communicate and collaborate. The keyboard becomes an extension of thought when your fingers move with practiced confidence and grace.",
    "Champions are not born overnight. They are forged through countless hours of deliberate practice, relentless focus, and the courage to compete against the best.",
    "The universe is under no obligation to make sense to you. Through curiosity, persistence, and the right tools, we unravel its mysteries one discovery at a time.",
    "A smooth sea never made a skilled sailor. Face each challenge head on, adapt your technique, and transform every obstacle into an opportunity for growth.",
    "Efficiency is doing things right. Effectiveness is doing the right things. The master typist balances both: precise keystrokes delivered at the perfect moment.",
    "Code is poetry written in logic. Every line tells a story, every function solves a problem, and every program is a conversation between human intention and machine.",
    "Time is the most valuable currency we possess. Invest it wisely in learning skills that compound over years and separate the extraordinary from the ordinary typist.",
    "The art of typing is the art of thinking made visible. Train your hands to follow your mind seamlessly, and your ideas will flow onto the page without friction.",
    "Velocity without direction is chaos. Precision without speed is stagnation. The elite typist masters both, transforming raw keystrokes into words that move the world.",
    "Every word you type is a small victory. String enough victories together and you become unstoppable. Practice daily, compete fiercely, improve endlessly, and never quit.",
]


def _gen_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


# ──────────────────────────────────────────────
#  ELO helpers
# ──────────────────────────────────────────────

def get_rank(elo: int) -> str:
    if elo >= 3500: return "Velotype Master"
    if elo >= 3000: return "Immortal"
    if elo >= 2500: return "Diamond"
    if elo >= 2000: return "Platinum"
    if elo >= 1500: return "Gold"
    if elo >= 1000: return "Silver"
    return "Bronze"


def calc_elo_change(my_elo: int, opp_elos: list[int], pos: int, total: int) -> int:
    if not opp_elos:
        return 0
    K = 32
    avg_opp = sum(opp_elos) / len(opp_elos)
    expected = 1 / (1 + 10 ** ((avg_opp - my_elo) / 400))
    actual = 1.0 - (pos - 1) / max(total - 1, 1) if total > 1 else 1.0
    return round(K * (actual - expected))


# ──────────────────────────────────────────────
#  WebSocket connection manager (in-process)
# ──────────────────────────────────────────────

class _Manager:
    def __init__(self):
        # room_code → {str(user_id): WebSocket}
        self._rooms: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, code: str, uid: str, ws: WebSocket):
        await ws.accept()
        self._rooms.setdefault(code, {})[uid] = ws

    def disconnect(self, code: str, uid: str):
        room = self._rooms.get(code, {})
        room.pop(uid, None)
        if not room:
            self._rooms.pop(code, None)

    def connected_uids(self, code: str) -> list[str]:
        return list(self._rooms.get(code, {}).keys())

    async def broadcast(self, code: str, msg: dict):
        dead: list[str] = []
        for uid, ws in list(self._rooms.get(code, {}).items()):
            try:
                await ws.send_json(msg)
            except Exception:
                dead.append(uid)
        for uid in dead:
            self._rooms.get(code, {}).pop(uid, None)

    async def send_to(self, code: str, uid: str, msg: dict):
        ws = self._rooms.get(code, {}).get(uid)
        if ws:
            try:
                await ws.send_json(msg)
            except Exception:
                pass


manager = _Manager()


# ──────────────────────────────────────────────
#  Shared broadcast helpers
# ──────────────────────────────────────────────

def _player_row(p: RoomPlayer, user: Optional[User] = None) -> dict:
    return {
        "user_id":        str(p.user_id),
        "username":       p.username,
        "progress":       p.progress,
        "wpm":            p.wpm,
        "accuracy":       p.accuracy,
        "finish_position": p.finish_position,
        "elo_change":     p.elo_change,
        "elo":            getattr(user, "elo_rating", 1000) if user else 1000,
    }


async def _bcast_room_state(code: str, db: Session):
    room = db.exec(select(Room).where(Room.code == code)).first()
    if not room:
        return
    players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
    host = db.get(User, room.host_id)
    rows = [_player_row(p, db.get(User, p.user_id)) for p in players]
    await manager.broadcast(code, {
        "type":          "room_state",
        "status":        room.status,
        "host_id":       str(room.host_id),
        "host_username": host.username if host else "",
        "players":       rows,
        "prompt":        room.prompt_text if room.status not in ("waiting", "countdown") else None,
    })


async def _bcast_progress(code: str, room_id: uuid.UUID, db: Session):
    players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room_id)).all()
    await manager.broadcast(code, {
        "type": "player_progress",
        "players": [{
            "user_id":        str(p.user_id),
            "username":       p.username,
            "progress":       p.progress,
            "wpm":            p.wpm,
            "accuracy":       p.accuracy,
            "finish_position": p.finish_position,
        } for p in players],
    })


async def _finish_race(code: str, room: Room, db: Session):
    players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
    total = len(players)

    # Assign last position to anyone who hasn't finished
    finished = sorted([p for p in players if p.finish_position is not None], key=lambda x: x.finish_position)
    dnf_pos = (finished[-1].finish_position + 1) if finished else 1
    for p in players:
        if p.finish_position is None:
            p.finish_position = dnf_pos
            dnf_pos += 1
            db.add(p)
    db.flush()

    # Collect ELO ratings
    elos: dict[str, int] = {}
    for p in players:
        u = db.get(User, p.user_id)
        elos[str(p.user_id)] = getattr(u, "elo_rating", 1000) if u else 1000

    # Update ELO and win/loss
    for p in players:
        pid = str(p.user_id)
        opp_elos = [v for k, v in elos.items() if k != pid]
        change = calc_elo_change(elos[pid], opp_elos, p.finish_position, total)
        p.elo_change = change
        db.add(p)

        u = db.get(User, p.user_id)
        if u:
            u.elo_rating = max(0, getattr(u, "elo_rating", 1000) + change)
            if p.finish_position == 1:
                u.wins = getattr(u, "wins", 0) + 1
            else:
                u.losses = getattr(u, "losses", 0) + 1
            db.add(u)

    room.status = "finished"
    room.finished_at = datetime.utcnow()
    db.add(room)
    db.commit()
    db.expire_all()

    # Refresh players after commit
    players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
    results = sorted(players, key=lambda x: x.finish_position or 999)

    await manager.broadcast(code, {
        "type": "race_results",
        "results": [{
            "user_id":        str(p.user_id),
            "username":       p.username,
            "finish_position": p.finish_position,
            "wpm":            p.wpm,
            "accuracy":       p.accuracy,
            "elo_change":     p.elo_change or 0,
            "new_elo":        elos[str(p.user_id)] + (p.elo_change or 0),
        } for p in results],
    })


# ──────────────────────────────────────────────
#  Pydantic schemas
# ──────────────────────────────────────────────

class RoomCreateResponse(BaseModel):
    room_code: str
    room_id:   str

class JoinRequest(BaseModel):
    room_code: str


# ──────────────────────────────────────────────
#  HTTP endpoints
# ──────────────────────────────────────────────

@router.post("/", response_model=RoomCreateResponse, summary="Create a new race room")
def create_room(
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_session),
):
    for _ in range(10):
        code = _gen_code()
        existing = db.exec(
            select(Room).where(Room.code == code, Room.status != "finished")
        ).first()
        if not existing:
            break

    room = Room(
        code=code,
        host_id=current_user.user_id,
        prompt_text=random.choice(RACE_PROMPTS),
        status="waiting",
    )
    db.add(room)
    db.flush()

    db.add(RoomPlayer(
        room_id=room.room_id,
        user_id=current_user.user_id,
        username=current_user.username,
    ))
    db.commit()
    db.refresh(room)
    return RoomCreateResponse(room_code=room.code, room_id=str(room.room_id))


@router.post("/join", response_model=RoomCreateResponse, summary="Join a room by code")
def join_room(
    body:         JoinRequest,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_session),
):
    room = db.exec(select(Room).where(Room.code == body.room_code.upper())).first()
    if not room:
        raise HTTPException(404, "Room not found")
    if room.status != "waiting":
        raise HTTPException(400, "Race already started or finished")

    players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
    if len(players) >= 6:
        raise HTTPException(400, "Room is full (max 6 players)")

    already = next((p for p in players if p.user_id == current_user.user_id), None)
    if not already:
        db.add(RoomPlayer(
            room_id=room.room_id,
            user_id=current_user.user_id,
            username=current_user.username,
        ))
        db.commit()

    return RoomCreateResponse(room_code=room.code, room_id=str(room.room_id))


@router.get("/{code}", summary="Get current room state")
def get_room(
    code:         str,
    current_user: User    = Depends(get_current_user),
    db:           Session = Depends(get_session),
):
    room = db.exec(select(Room).where(Room.code == code.upper())).first()
    if not room:
        raise HTTPException(404, "Room not found")

    host = db.get(User, room.host_id)
    players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
    return {
        "room_code":      room.code,
        "status":         room.status,
        "host_username":  host.username if host else "",
        "host_id":        str(room.host_id),
        "players":        [_player_row(p, db.get(User, p.user_id)) for p in players],
        "prompt":         room.prompt_text if room.status not in ("waiting", "countdown") else None,
    }


# ──────────────────────────────────────────────
#  WebSocket endpoint
# ──────────────────────────────────────────────

@router.websocket("/{code}/ws")
async def ws_endpoint(
    code:      str,
    websocket: WebSocket,
    token:     str     = Query(...),
    db:        Session = Depends(get_session),
):
    code = code.upper()
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=4001)
        return

    room = db.exec(select(Room).where(Room.code == code)).first()
    if not room:
        await websocket.close(code=4004)
        return

    uid = str(user.user_id)

    # Ensure the player record exists (handles reconnects)
    player = db.exec(
        select(RoomPlayer).where(
            RoomPlayer.room_id == room.room_id,
            RoomPlayer.user_id == user.user_id,
        )
    ).first()
    if not player:
        if room.status != "waiting":
            await websocket.close(code=4003)
            return
        db.add(RoomPlayer(room_id=room.room_id, user_id=user.user_id, username=user.username))
        db.commit()
        db.expire_all()

    await manager.connect(code, uid, websocket)
    await _bcast_room_state(code, db)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            # Reload room on each message to get fresh status
            db.expire_all()
            room = db.exec(select(Room).where(Room.code == code)).first()
            if not room:
                break

            if msg_type == "start_race":
                if str(room.host_id) != uid or room.status != "waiting":
                    continue
                players = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
                if len(players) < 1:
                    continue

                room.status = "countdown"
                db.add(room)
                db.commit()

                for i in (3, 2, 1):
                    await manager.broadcast(code, {"type": "countdown", "count": i})
                    await asyncio.sleep(1)

                db.expire_all()
                room = db.exec(select(Room).where(Room.code == code)).first()
                room.status    = "racing"
                room.started_at = datetime.utcnow()
                db.add(room)
                db.commit()
                db.expire_all()

                room = db.exec(select(Room).where(Room.code == code)).first()
                await manager.broadcast(code, {
                    "type":   "race_start",
                    "prompt": room.prompt_text,
                })

            elif msg_type == "progress_update":
                player = db.exec(
                    select(RoomPlayer).where(
                        RoomPlayer.room_id == room.room_id,
                        RoomPlayer.user_id == user.user_id,
                    )
                ).first()
                if player and player.finish_position is None:
                    player.progress = min(float(data.get("progress", 0)), 99.9)
                    player.wpm      = float(data.get("wpm", 0))
                    player.accuracy = float(data.get("accuracy", 100))
                    db.add(player)
                    db.commit()
                    db.expire_all()
                await _bcast_progress(code, room.room_id, db)

            elif msg_type == "finished":
                player = db.exec(
                    select(RoomPlayer).where(
                        RoomPlayer.room_id == room.room_id,
                        RoomPlayer.user_id == user.user_id,
                    )
                ).first()
                if not player or player.finish_position is not None:
                    continue

                all_p = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
                done_count = sum(1 for p in all_p if p.finish_position is not None)

                player.progress        = 100.0
                player.wpm             = float(data.get("wpm", 0))
                player.accuracy        = float(data.get("accuracy", 100))
                player.finish_position = done_count + 1
                player.finished_at     = datetime.utcnow()
                db.add(player)
                db.commit()
                db.expire_all()

                all_p = db.exec(select(RoomPlayer).where(RoomPlayer.room_id == room.room_id)).all()
                if all(p.finish_position is not None for p in all_p):
                    room = db.exec(select(Room).where(Room.code == code)).first()
                    await _finish_race(code, room, db)
                else:
                    await _bcast_progress(code, room.room_id, db)

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(code, uid)
        db.expire_all()
        room = db.exec(select(Room).where(Room.code == code)).first()
        if room and room.status == "waiting":
            await _bcast_room_state(code, db)
