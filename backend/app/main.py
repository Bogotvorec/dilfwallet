import os
import asyncio
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.routes_auth import router as auth_router
from app.routes_portfolio import router as portfolio_router
from app.routes_budget import router as budget_router
from app.models import Base
from app.db import engine, get_db
from app.logging_config import setup_logging
from app.middleware import ErrorHandlingMiddleware

# Initialize structured logging
setup_logging()
logger = logging.getLogger(__name__)

# ========== Rate Limiter ==========
from app.limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup with retry logic"""
    max_retries = 5
    retry_delay = 3

    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("✅ Database tables created successfully")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"⚠️ DB connection attempt {attempt + 1}/{max_retries} failed: {e}")
                logger.info(f"   Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                logger.error(f"❌ Failed to connect to database after {max_retries} attempts: {e}")

    yield


app = FastAPI(
    title="DILFwallet API",
    description="Multi-portfolio crypto, stocks, ETF, metals tracker with budget management",
    version="2.2.0",
    lifespan=lifespan
)

# ========== Error Handling Middleware ==========
app.add_middleware(ErrorHandlingMiddleware)

# ========== Rate Limiter Setup ==========
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ========== CORS ==========
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Production domains
    "https://dilfwallet.vercel.app",
    "https://www.dilfwallet.com",
    "https://dilfwallet.com",
]

codespace_name = os.getenv("CODESPACE_NAME")
if codespace_name:
    origins.extend([
        f"https://{codespace_name}-3000.app.github.dev",
        f"https://{codespace_name}-8000.app.github.dev",
    ])

extra_origins = os.getenv("ALLOWED_ORIGINS")
if extra_origins:
    for item in extra_origins.split(","):
        host = item.strip()
        if host:
            origins.append(host)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== Routers ==========
app.include_router(auth_router)
app.include_router(portfolio_router)
app.include_router(budget_router)


# ========== Root ==========
@app.get("/")
def root():
    return {
        "message": "DILFwallet API v2.2",
        "features": [
            "Multi-portfolio support (crypto, stocks, ETF, metals)",
            "Budget tracking (income/expenses)",
            "JWT authentication with refresh tokens",
            "Rate limiting",
            "Structured logging & error handling",
        ]
    }


# ========== Health Check ==========
@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint for monitoring and Render health checks"""
    try:
        await db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {e}"

    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "version": "2.2.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
