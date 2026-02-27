import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from database import init_db

# ──────────────────────────────────────────────
#  Load environment variables
# ──────────────────────────────────────────────

load_dotenv()

ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ──────────────────────────────────────────────
#  Rate Limiter
#  100 requests per minute per IP (as per spec)
# ──────────────────────────────────────────────

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# ──────────────────────────────────────────────
#  Lifespan — runs on startup & shutdown
# ──────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Startup ──
    print("🚀 Starting VeloTypeAI API...")
    init_db()
    print("✅ Database initialised.")
    yield
    # ── Shutdown ──
    print("🛑 Shutting down VeloTypeAI API...")