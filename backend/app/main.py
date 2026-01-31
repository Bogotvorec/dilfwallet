import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes_auth import router as auth_router
from app.routes_portfolio import router as portfolio_router
from app.routes_budget import router as budget_router
from app.models import Base
from app.db import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup with retry logic"""
    max_retries = 5
    retry_delay = 3
    
    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ Database tables created successfully")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"⚠️ DB connection attempt {attempt + 1}/{max_retries} failed: {e}")
                print(f"   Retrying in {retry_delay} seconds...")
                await asyncio.sleep(retry_delay)
            else:
                print(f"❌ Failed to connect to database after {max_retries} attempts: {e}")
                # Don't crash - let the app start anyway, DB might come up later
    
    yield


app = FastAPI(
    title="DILFwallet API",
    description="Multi-portfolio crypto, stocks, ETF, metals tracker with budget management",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
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

app.include_router(auth_router)
app.include_router(portfolio_router)
app.include_router(budget_router)

@app.get("/")
def root():
    return {
        "message": "DILFwallet API v2.0",
        "features": [
            "Multi-portfolio support (crypto, stocks, ETF, metals)",
            "Budget tracking (income/expenses)",
            "JWT authentication"
        ]
    }
