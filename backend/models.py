import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Column, Text, ARRAY, UniqueConstraint
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

    # ── Relationships ──
    sessions:         List["TypingSession"]  = Relationship(back_populates="user")
    mistakes:         List["Mistake"]        = Relationship(back_populates="user")
    mistake_patterns: List["MistakePattern"] = Relationship(back_populates="user")
    practice_tasks:   List["PracticeTask"]   = Relationship(back_populates="user")


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    user_id:    uuid.UUID
    created_at: datetime
    updated_at: datetime


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
    prompt_id:     uuid.UUID      = Field(foreign_key="prompts.prompt_id", nullable=False)
    raw_typed_text: Optional[str] = Field(default=None, sa_column=Column(Text))
    created_at:    datetime       = Field(default_factory=now_utc, nullable=False)

    # ── Relationships ──
    user:     "User"          = Relationship(back_populates="sessions")
    prompt:   "Prompt"        = Relationship(back_populates="sessions")
    mistakes: List["Mistake"] = Relationship(back_populates="session")
