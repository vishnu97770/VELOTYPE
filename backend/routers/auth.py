import os
import uuid
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from database import get_session
from models import User, UserRead

# ──────────────────────────────────────────────
#  Router
# ──────────────────────────────────────────────

router = APIRouter()

# ──────────────────────────────────────────────
#  JWT Config
# ──────────────────────────────────────────────

SECRET_KEY: str           = os.getenv("JWT_SECRET_KEY", "changeme-use-a-long-random-secret")
ALGORITHM: str            = "HS256"
ACCESS_TOKEN_EXPIRE_MIN   = 15    # 15 minutes
REFRESH_TOKEN_EXPIRE_DAYS = 7     # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# ──────────────────────────────────────────────
#  Pydantic Schemas
# ──────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email:    EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None


# ──────────────────────────────────────────────
#  Password Helpers
# ──────────────────────────────────────────────

def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Check a plain-text password against its bcrypt hash."""
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


# ──────────────────────────────────────────────
#  JWT Helpers
# ──────────────────────────────────────────────

def create_access_token(user_id: uuid.UUID) -> str:
    """Create a short-lived JWT access token (15 min)."""
    expire  = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MIN)
    payload = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: uuid.UUID) -> str:
    """Create a long-lived JWT refresh token (7 days)."""
    expire  = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire, "type": "refresh"}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> TokenData:
    """Decode and validate a JWT, returning its TokenData."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )
        return TokenData(user_id=user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ──────────────────────────────────────────────
#  Current User Dependency
#  Use in any protected route:
#  current_user: User = Depends(get_current_user)
# ──────────────────────────────────────────────

def get_current_user(
    token:   str     = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> User:
    """Decode the Bearer token and return the authenticated User."""
    token_data = decode_token(token)

    user = session.exec(
        select(User).where(User.user_id == uuid.UUID(token_data.user_id))
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return user


# ──────────────────────────────────────────────
#  POST /register
# ──────────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(
    body:    RegisterRequest,
    session: Session = Depends(get_session),
) -> UserRead:
    # Check username is not already taken
    existing_username = session.exec(
        select(User).where(User.username == body.username)
    ).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already taken.",
        )

    # Check email is not already registered
    existing_email = session.exec(
        select(User).where(User.email == body.email)
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    # Create and save the new user
    new_user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user


# ──────────────────────────────────────────────
#  POST /login
# ──────────────────────────────────────────────

@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Login and receive access + refresh tokens",
)
def login(
    response: Response,
    form:     OAuth2PasswordRequestForm = Depends(),
    session:  Session                   = Depends(get_session),
) -> LoginResponse:
    # Look up user by username
    user = session.exec(
        select(User).where(User.username == form.username)
    ).first()

    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generate both tokens
    access_token  = create_access_token(user.user_id)
    refresh_token = create_refresh_token(user.user_id)

    # Store refresh token in a secure httpOnly cookie (not accessible via JS)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=os.getenv("ENVIRONMENT", "development") != "development",
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # seconds
    )

    return LoginResponse(access_token=access_token)


# ──────────────────────────────────────────────
#  POST /refresh
# ──────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=LoginResponse,
    summary="Use the refresh token cookie to get a new access token",
)
def refresh(
    request: Request,
    session: Session = Depends(get_session),
) -> LoginResponse:
    # Read refresh token from the httpOnly cookie
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found. Please log in again.",
        )

    # Decode and validate the refresh token
    token_data = decode_token(refresh_token)

    # Confirm the user still exists in the database
    user = session.exec(
        select(User).where(User.user_id == uuid.UUID(token_data.user_id))
    ).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    # Issue a brand new access token
    new_access_token = create_access_token(user.user_id)
    return LoginResponse(access_token=new_access_token)


# ──────────────────────────────────────────────
#  GET /me
# ──────────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserRead,
    summary="Get the currently authenticated user",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    return current_user
