import os
from typing import Generator

from sqlmodel import SQLModel, Session, create_engine
from dotenv import load_dotenv

# ──────────────────────────────────────────────
#  Load environment variables
# ──────────────────────────────────────────────

load_dotenv()

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/velotypeai",
)

# ──────────────────────────────────────────────
#  Engine
#
#  pool_pre_ping  – drops stale connections before use
#  pool_size      – number of persistent connections kept open
#  max_overflow   – extra connections allowed above pool_size under load
#  echo           – set True locally to log every SQL statement
# ──────────────────────────────────────────────

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=os.getenv("DB_ECHO", "false").lower() == "true",
)

