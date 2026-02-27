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


    

app = FastAPI(
title="VeloTypeAI API",
description="AI-Powered Adaptive Typing Assistant & Pattern-Based Learning System",
version="1.0.0",
docs_url="/api/v1/docs",
redoc_url="/api/v1/redoc",
openapi_url="/api/v1/openapi.json",
lifespan=lifespan,
)

# ──────────────────────────────────────────────
#  Middleware
# ──────────────────────────────────────────────

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — restrict origins per environment
allowed_origins = (
["*"]
if ENVIRONMENT == "development"
else [FRONTEND_URL]
)

app.add_middleware(
CORSMiddleware,
allow_origins=allowed_origins,
allow_credentials=True,         # needed for httpOnly cookie (refresh token)
allow_methods=["*"],
allow_headers=["*"],
)

# ──────────────────────────────────────────────
#  Routers
#  Each router lives in its own file under /routers
# ──────────────────────────────────────────────

from routers import auth, sessions, patterns, practice, analytics  # noqa: E402

API_PREFIX = "/api/v1"

app.include_router(auth.router,      prefix=f"{API_PREFIX}/auth",      tags=["Auth"])
app.include_router(sessions.router,  prefix=f"{API_PREFIX}/sessions",  tags=["Sessions"])
app.include_router(patterns.router,  prefix=f"{API_PREFIX}/patterns",  tags=["Patterns"])
app.include_router(practice.router,  prefix=f"{API_PREFIX}/practice",  tags=["Practice"])
app.include_router(analytics.router, prefix=f"{API_PREFIX}/analytics", tags=["Analytics"])

# ──────────────────────────────────────────────
#  Health Check
# ──────────────────────────────────────────────

@app.get("/api/v1/health", tags=["Health"])
def health_check():
    """Quick endpoint to confirm the API is running."""
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": ENVIRONMENT,
}


# ──────────────────────────────────────────────
#  Entry point (for running with `python main.py`)
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=ENVIRONMENT == "development",
)