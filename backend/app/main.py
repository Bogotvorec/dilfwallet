import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes_auth import router as auth_router
from app.routes_portfolio import router as portfolio_router

app = FastAPI()

# CORS: разрешаем запросы с веб-клиента
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Добавляем Codespaces URL если запущено в Codespaces
codespace_name = os.getenv("CODESPACE_NAME")
if codespace_name:
    origins.extend([
        f"https://{codespace_name}-3000.app.github.dev",
        f"https://{codespace_name}-8000.app.github.dev",
    ])

# Читаем дополнительные домены для прод-окружения из переменной окружения
# Пример: ALLOWED_ORIGINS="https://your-project.web.app,https://your-project.firebaseapp.com,https://your-domain.com"
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

@app.get("/")
def root():
    return {"message": "DILFwallet backend running!"}
