from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import logging

load_dotenv()  # Загружаем .env

logger = logging.getLogger(__name__)

IS_PRODUCTION = bool(os.getenv("RENDER") or os.getenv("PRODUCTION"))


def _get_database_url() -> str:
    """Определяет URL БД: PostgreSQL для продакшена, SQLite для разработки"""
    database_url = os.getenv("DATABASE_URL")
    
    # Если есть DATABASE_URL и это PostgreSQL - используем его
    if database_url and (database_url.startswith("postgres://") or database_url.startswith("postgresql://")):
        # Конвертируем postgres:// в postgresql+asyncpg://
        if database_url.startswith("postgres://"):
            return database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif database_url.startswith("postgresql://") and "asyncpg" not in database_url:
            return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return database_url
    
    # По умолчанию для локальной разработки используем SQLite
    return "sqlite+aiosqlite:///./dilfwallet.db"

DATABASE_URL = _get_database_url()

# Параметры для движка — echo always off (floods async event loop with aiosqlite)
engine_kwargs = {
    "echo": False,
}

if "sqlite" in DATABASE_URL:
    # Для SQLite нужно включить check_same_thread=False
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL production pool settings
    engine_kwargs.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 1800,  # Recycle connections every 30 min
    })

logger.info(f"Database: {'PostgreSQL (production)' if IS_PRODUCTION else 'SQLite (development)'}")

engine = create_async_engine(DATABASE_URL, **engine_kwargs)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

