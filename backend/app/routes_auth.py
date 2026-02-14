from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from jose import JWTError
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse

from app.models import User
from app.schemas import UserCreate, UserRead
from app.db import get_db
from app.utils import hash_password, verify_password
from app.auth import create_access_token, create_refresh_token, verify_token
from app.dependencies import get_current_user


router = APIRouter()


class RefreshTokenRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserRead)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info(f"📝 Registering user: {user_in.email}")
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalars().first()

    if existing_user:
        logger.info(f"⚠️ User already exists: {user_in.email}")
        raise HTTPException(status_code=400, detail="User already exists")

    hashed = hash_password(user_in.password)
    new_user = User(email=user_in.email, hashed_password=hashed)
    db.add(new_user)
    
    logger.info("💾 Committing to database...")
    await db.commit()
    # Removed refresh(new_user) to avoid potential asyncpg hanging issues in this version
    
    logger.info(f"✅ Successfully registered user: {user_in.email}")
    return new_user


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return JSONResponse({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    })


@router.post("/refresh")
async def refresh(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    """Exchange a valid refresh token for a new access token"""
    try:
        payload = verify_token(body.refresh_token, expected_type="refresh")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token payload")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(user.id)
    return JSONResponse({
        "access_token": new_access_token,
        "token_type": "bearer"
    })


@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user