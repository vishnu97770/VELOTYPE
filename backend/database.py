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

# ──────────────────────────────────────────────
#  Table initialisation
#
#  Called once at startup (useful for dev / testing).
#  In production, schema changes are handled by Alembic
#  migrations — so this function is a no-op when all
#  tables already exist.
# ──────────────────────────────────────────────

def init_db() -> None:
    """Create all tables that do not yet exist in the database."""
    # Import all models here so SQLModel's metadata is populated
    # before create_all() is called.
    import models  # noqa: F401  (side-effect import)

    SQLModel.metadata.create_all(engine)


# ──────────────────────────────────────────────
#  Session dependency
#
#  Use this as a FastAPI dependency:
#
#      from database import get_session
#      from sqlmodel import Session
#      from fastapi import Depends
#
#      @router.get("/example")
#      def example(session: Session = Depends(get_session)):
#          ...
# ──────────────────────────────────────────────

def get_session() -> Generator[Session, None, None]:
    """
    Yield a database session for the duration of a single request,
    then close it automatically — even if an exception is raised.
    """
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()