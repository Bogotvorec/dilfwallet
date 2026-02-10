from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from uuid import UUID
import os
import secrets
import warnings

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("RENDER") or os.getenv("PRODUCTION"):
        raise RuntimeError("SECRET_KEY environment variable must be set in production!")
    warnings.warn("SECRET_KEY not set — using insecure dev default. Never use in production!")
    SECRET_KEY = "dev-secret-do-not-use-in-production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15   # Short-lived access token
REFRESH_TOKEN_EXPIRE_DAYS = 30     # Long-lived refresh token


def create_access_token(user_id: UUID) -> str:
    """Create a short-lived access token (15 min)"""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: UUID) -> str:
    """Create a long-lived refresh token (30 days) with unique ID for revocation"""
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
        "jti": secrets.token_urlsafe(32),  # Unique token ID
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str, expected_type: str = "access") -> dict:
    """Verify and decode a JWT token, checking the type claim"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        token_type = payload.get("type")
        # If token has no type claim (old tokens), accept as access
        if token_type and token_type != expected_type:
            raise JWTError(f"Expected {expected_type} token, got {token_type}")
        return payload
    except JWTError:
        raise
