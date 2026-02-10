from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from uuid import UUID
import os
import warnings

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    if os.getenv("RENDER") or os.getenv("PRODUCTION"):
        raise RuntimeError("SECRET_KEY environment variable must be set in production!")
    warnings.warn("SECRET_KEY not set — using insecure dev default. Never use in production!")
    SECRET_KEY = "dev-secret-do-not-use-in-production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire, "type": "access"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
