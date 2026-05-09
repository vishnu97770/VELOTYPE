import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, Text, JSON, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel


# ──────────────────────────────────────────────
#  Helpers
# ──────────────────────────────────────────────

def uuid_pk() -> uuid.UUID:
    """Default factory for UUID primary keys."""
    return uuid.uuid4()


def now_utc() -> datetime:
    """Default factory for UTC timestamps."""
    return datetime.utcnow()


# ──────────────────────────────────────────────
#  USERS
# ──────────────────────────────────────────────

class UserBase(SQLModel):
    username: str = Field(unique=True, index=True, max_length=50)
    email: str    = Field(unique=True, index=True, max_length=255)


class User(UserBase, table=True):
    __tablename__ = "users"

    user_id:       uuid.UUID = Field(
        default_factory=uuid_pk,
        primary_key=True,
        nullable=False,
    )
    password_hash: str       = Field(nullable=False)
    created_at:    datetime  = Field(default_factory=now_utc, nullable=False)
    updated_at:    datetime  = Field(default_factory=now_utc, nullable=False)

    # ── ELO / competitive fields (added via ALTER TABLE in init_db) ──
    elo_rating: int = Field(default=1000, nullable=False)
    wins:       int = Field(default=0,    nullable=False)
    losses:     int = Field(default=0,    nullable=False)

    # ── Relationships ──
    sessions:         List["TypingSession"]  = Relationship(back_populates="user")
    mistakes:         List["Mistake"]        = Relationship(back_populates="user")
    mistake_patterns: List["MistakePattern"] = Relationship(back_populates="user")
    practice_tasks:   List["PracticeTask"]   = Relationship(back_populates="user")
    room_players:     List["RoomPlayer"]     = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    user_id:    uuid.UUID
    created_at: datetime
    updated_at: datetime
    elo_rating: int = 1000
    wins:       int = 0
    losses:     int = 0


# ──────────────────────────────────────────────
#  PROMPTS
# ──────────────────────────────────────────────

class PromptBase(SQLModel):
    content:    str           = Field(sa_column=Column(Text, nullable=False))
    difficulty: str           = Field(max_length=20)   # e.g. "easy" | "medium" | "hard"
    word_count: int           = Field(nullable=False)
    category:   Optional[str] = Field(default=None, max_length=50)


class Prompt(PromptBase, table=True):
    __tablename__ = "prompts"

    prompt_id: uuid.UUID = Field(
        default_factory=uuid_pk,
        primary_key=True,
        nullable=False,
    )

    # ── Relationships ──
    sessions: List["TypingSession"] = Relationship(back_populates="prompt")


class PromptCreate(PromptBase):
    pass


class PromptRead(PromptBase):
    prompt_id: uuid.UUID


# ──────────────────────────────────────────────
#  TYPING SESSIONS
# ──────────────────────────────────────────────

class TypingSessionBase(SQLModel):
    wpm:              float = Field(nullable=False)
    accuracy:         float = Field(nullable=False)          # 0.0 – 100.0
    duration_seconds: int   = Field(nullable=False)
    keystrokes_total: int   = Field(nullable=False)


class TypingSession(TypingSessionBase, table=True):
    __tablename__ = "typing_sessions"

    session_id:    uuid.UUID      = Field(
        default_factory=uuid_pk,
        primary_key=True,
        nullable=False,
    )
    user_id:       uuid.UUID      = Field(foreign_key="users.user_id",   nullable=False, index=True)
    prompt_id:     Optional[uuid.UUID] = Field(default=None, foreign_key="prompts.prompt_id", nullable=True)
    task_id:       Optional[uuid.UUID] = Field(default=None, foreign_key="practice_tasks.task_id", nullable=True)
    raw_typed_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at:    datetime       = Field(default_factory=now_utc, nullable=False)

    # ── Relationships ──
    user:     "User"          = Relationship(back_populates="sessions")
    prompt:   "Prompt"        = Relationship(back_populates="sessions")
    mistakes: List["Mistake"] = Relationship(back_populates="session")

class TypingSessionCreate(TypingSessionBase):
    prompt_id:      Optional[uuid.UUID] = None
    task_id:        Optional[uuid.UUID] = None
    raw_typed_text: Optional[str] = None


class TypingSessionRead(TypingSessionBase):
    session_id:     uuid.UUID
    user_id:        uuid.UUID
    prompt_id:      Optional[uuid.UUID]
    task_id:        Optional[uuid.UUID]
    raw_typed_text: Optional[str]
    created_at:     datetime


# ──────────────────────────────────────────────
#  MISTAKES
# ──────────────────────────────────────────────

class MistakeBase(SQLModel):
    word_expected: str = Field(max_length=100,  nullable=False)
    word_typed:    str = Field(max_length=100,  nullable=False)
    error_type:    str = Field(max_length=30,   nullable=False)
    # Allowed values: "substitution" | "omission" | "insertion" | "transposition"
    position:      int = Field(nullable=False)


class Mistake(MistakeBase, table=True):
    __tablename__ = "mistakes"

    mistake_id: uuid.UUID = Field(
        default_factory=uuid_pk,
        primary_key=True,
        nullable=False,
    )
    session_id: uuid.UUID = Field(foreign_key="typing_sessions.session_id", nullable=False, index=True)
    user_id:    uuid.UUID = Field(foreign_key="users.user_id",              nullable=False, index=True)

    # ── Relationships ──
    session: "TypingSession" = Relationship(back_populates="mistakes")
    user:    "User"          = Relationship(back_populates="mistakes")


class MistakeCreate(MistakeBase):
    session_id: uuid.UUID


class MistakeRead(MistakeBase):
    mistake_id: uuid.UUID
    session_id: uuid.UUID
    user_id:    uuid.UUID


# ──────────────────────────────────────────────
#  MISTAKE PATTERNS
# ──────────────────────────────────────────────

class MistakePatternBase(SQLModel):
    word:          str      = Field(max_length=100, nullable=False)
    mistake_count: int      = Field(default=1,      nullable=False)
    is_active:     bool     = Field(default=True,   nullable=False)


class MistakePattern(MistakePatternBase, table=True):
    __tablename__ = "mistake_patterns"

    __table_args__ = (
        UniqueConstraint("user_id", "word", name="uq_user_word"),
    )

    pattern_id:   uuid.UUID = Field(
        default_factory=uuid_pk,
        primary_key=True,
        nullable=False,
    )
    user_id:      uuid.UUID = Field(foreign_key="users.user_id", nullable=False, index=True)
    last_seen_at: datetime  = Field(default_factory=now_utc, nullable=False)

    # ── Relationships ──
    user: "User" = Relationship(back_populates="mistake_patterns")


class MistakePatternCreate(MistakePatternBase):
    pass


class MistakePatternRead(MistakePatternBase):
    pattern_id:   uuid.UUID
    user_id:      uuid.UUID
    last_seen_at: datetime


# ──────────────────────────────────────────────
#  PRACTICE TASKS
# ──────────────────────────────────────────────

class PracticeTaskBase(SQLModel):
    content:      str  = Field(sa_column=Column(Text, nullable=False))
    difficulty:   str  = Field(max_length=20, nullable=False)  # "easy" | "medium" | "hard"
    ai_generated: bool = Field(default=False, nullable=False)


class PracticeTask(PracticeTaskBase, table=True):
    __tablename__ = "practice_tasks"

    task_id:     uuid.UUID = Field(
        default_factory=uuid_pk,
        primary_key=True,
        nullable=False,
    )
    user_id:     uuid.UUID = Field(foreign_key="users.user_id", nullable=False, index=True)
    # Stored as a PostgreSQL TEXT[] array
    focus_words: List[str] = Field(default=[], sa_column=Column(JSON, nullable=False))
    created_at:  datetime  = Field(default_factory=now_utc, nullable=False)

    # ── New Progress Tracking Fields ──
    repetition_count:    int = Field(default=1, nullable=False)
    completed_count:     int = Field(default=0, nullable=False)
    is_assessment:       bool = Field(default=False, nullable=False)
    original_session_id: Optional[uuid.UUID] = Field(default=None, foreign_key="typing_sessions.session_id")

    # ── Relationships ──
    user: "User" = Relationship(back_populates="practice_tasks")


class PracticeTaskCreate(PracticeTaskBase):
    focus_words: List[str] = []


class PracticeTaskRead(PracticeTaskBase):
    task_id:             uuid.UUID
    user_id:             uuid.UUID
    focus_words:         List[str]
    created_at:          datetime
    repetition_count:    int
    completed_count:     int
    is_assessment:       bool
    original_session_id: Optional[uuid.UUID]


# ──────────────────────────────────────────────
#  MULTIPLAYER ROOMS
# ──────────────────────────────────────────────

class Room(SQLModel, table=True):
    __tablename__ = "rooms"

    room_id:     uuid.UUID          = Field(default_factory=uuid_pk, primary_key=True, nullable=False)
    code:        str                = Field(max_length=6, unique=True, index=True, nullable=False)
    status:      str                = Field(default="waiting", max_length=20, nullable=False)
    prompt_text: str                = Field(sa_column=Column(Text, nullable=False))
    host_id:     uuid.UUID          = Field(foreign_key="users.user_id", nullable=False)
    created_at:  datetime           = Field(default_factory=now_utc, nullable=False)
    started_at:  Optional[datetime] = Field(default=None, nullable=True)
    finished_at: Optional[datetime] = Field(default=None, nullable=True)

    players: List["RoomPlayer"] = Relationship(back_populates="room")


class RoomPlayer(SQLModel, table=True):
    __tablename__ = "room_players"
    __table_args__ = (UniqueConstraint("room_id", "user_id", name="uq_room_user"),)

    id:              uuid.UUID          = Field(default_factory=uuid_pk, primary_key=True, nullable=False)
    room_id:         uuid.UUID          = Field(foreign_key="rooms.room_id", nullable=False, index=True)
    user_id:         uuid.UUID          = Field(foreign_key="users.user_id", nullable=False, index=True)
    username:        str                = Field(max_length=50, nullable=False)
    progress:        float              = Field(default=0.0, nullable=False)
    wpm:             float              = Field(default=0.0, nullable=False)
    accuracy:        float              = Field(default=0.0, nullable=False)
    finish_position: Optional[int]      = Field(default=None, nullable=True)
    finished_at:     Optional[datetime] = Field(default=None, nullable=True)
    elo_change:      Optional[int]      = Field(default=None, nullable=True)

    room: "Room" = Relationship(back_populates="players")
    user: "User" = Relationship(back_populates="room_players")
