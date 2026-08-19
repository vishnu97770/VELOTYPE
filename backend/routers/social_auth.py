import os
import uuid
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select

from database import get_session
from models import User
from routers.auth import create_access_token, hash_password

router = APIRouter()

# ── Config ─────────────────────────────────────────────────────────────────────

def _backend() -> str:
    return os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")

def _frontend() -> str:
    raw = os.getenv("FRONTEND_URL", "http://localhost:5173")
    # FRONTEND_URL may be stored without scheme (legacy)
    if not raw.startswith("http"):
        raw = "https://" + raw
    return raw.rstrip("/").split(",")[0]   # take first if comma-separated

# Log resolved URLs at import time so they appear in deploy logs on every startup.
# If either still shows localhost in production, the env var is not set on Render.
print(f"[OAuth] BACKEND_URL  resolved → {_backend()}")
print(f"[OAuth] FRONTEND_URL resolved → {_frontend()}")
print(f"[OAuth] Google redirect_uri   → {_backend()}/api/v1/auth/google/callback")
print(f"[OAuth] GitHub redirect_uri   → {_backend()}/api/v1/auth/github/callback")


# ── Shared: find-or-create user from OAuth info ────────────────────────────────

def _upsert_user(email: str, display_name: str, db: Session) -> User:
    user = db.exec(select(User).where(User.email == email)).first()
    if user:
        return user

    base = (display_name or email.split("@")[0]).replace(" ", "_").lower()[:30]
    username = base
    n = 1
    while db.exec(select(User).where(User.username == username)).first():
        username = f"{base}{n}"
        n += 1

    user = User(
        username=username,
        email=email,
        password_hash=hash_password(uuid.uuid4().hex),   # random — social users never use password login
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _redirect_with_token(user: User) -> RedirectResponse:
    token = create_access_token(user.user_id)
    return RedirectResponse(f"{_frontend()}/login?token={token}")


def _redirect_error(msg: str) -> RedirectResponse:
    return RedirectResponse(f"{_frontend()}/login?error={msg}")


# ── Google OAuth ───────────────────────────────────────────────────────────────

@router.get("/google", summary="Redirect to Google OAuth consent screen")
def google_login():
    client_id = os.getenv("GOOGLE_CLIENT_ID")
    if not client_id:
        return _redirect_error("google_not_configured")

    params = {
        "client_id": client_id,
        "redirect_uri": f"{_backend()}/api/v1/auth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}")


@router.get("/google/callback", summary="Google OAuth callback")
async def google_callback(code: str = "", error: str = "", db: Session = Depends(get_session)):
    if error or not code:
        return _redirect_error("google_denied")

    client_id     = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            # Exchange code → access token
            tok = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "code": code,
                    "client_id": client_id,
                    "client_secret": client_secret,
                    "redirect_uri": f"{_backend()}/api/v1/auth/google/callback",
                    "grant_type": "authorization_code",
                },
            )
            tok.raise_for_status()
            access_token = tok.json().get("access_token")

            # Fetch user info
            info_res = await client.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            info_res.raise_for_status()
            info = info_res.json()

    except Exception as e:
        print(f"[Google OAuth error] {e}")
        return _redirect_error("google_failed")

    email = info.get("email")
    if not email:
        return _redirect_error("google_no_email")

    name = info.get("name") or info.get("given_name") or email.split("@")[0]
    user = _upsert_user(email, name, db)
    return _redirect_with_token(user)


# ── GitHub OAuth ───────────────────────────────────────────────────────────────

@router.get("/github", summary="Redirect to GitHub OAuth consent screen")
def github_login():
    client_id = os.getenv("GITHUB_CLIENT_ID")
    if not client_id:
        return _redirect_error("github_not_configured")

    params = {
        "client_id": client_id,
        "redirect_uri": f"{_backend()}/api/v1/auth/github/callback",
        "scope": "read:user user:email",
    }
    return RedirectResponse(f"https://github.com/login/oauth/authorize?{urlencode(params)}")


@router.get("/github/callback", summary="GitHub OAuth callback")
async def github_callback(code: str = "", error: str = "", db: Session = Depends(get_session)):
    if error or not code:
        return _redirect_error("github_denied")

    client_id     = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")

    async with httpx.AsyncClient(timeout=15) as client:
        # Exchange code → access token
        tok = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": client_id,
                "client_secret": client_secret,
                "code": code,
            },
        )
        tok.raise_for_status()
        gh_token = tok.json().get("access_token")

        # Fetch user profile
        user_res = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {gh_token}", "Accept": "application/vnd.github+json"},
        )
        user_res.raise_for_status()
        profile = user_res.json()

        email = profile.get("email")

        # GitHub may hide email — fetch the verified primary from /user/emails
        if not email:
            email_res = await client.get(
                "https://api.github.com/user/emails",
                headers={"Authorization": f"Bearer {gh_token}", "Accept": "application/vnd.github+json"},
            )
            if email_res.status_code == 200:
                emails = email_res.json()
                primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
                if primary:
                    email = primary["email"]

    if not email:
        return _redirect_error("github_no_email")

    name = profile.get("name") or profile.get("login") or email.split("@")[0]
    user = _upsert_user(email, name, db)
    return _redirect_with_token(user)
