from datetime import datetime, timedelta
from jose import JWTError, jwt
from uuid import UUID
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")  # ⚠️ в .env обязательно заменить
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(user_id: UUID) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
