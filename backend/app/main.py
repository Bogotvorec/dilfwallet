import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes_auth import router as auth_router
from app.routes_portfolio import router as portfolio_router
from app.routes_budget import router as budget_router

app = FastAPI(
    title="DILFwallet API",
    description="Multi-portfolio crypto, stocks, ETF, metals tracker with budget management",
    version="2.0.0"
)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
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
