from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()  # Загружаем .env

def _make_asyncpg_url(url: str | None) -> str:
    """
    Приводит URL БД к формату для SQLAlchemy async с asyncpg.
    Примеры входа:
    - postgres://user:pass@host:5432/db
    - postgresql://user:pass@host:5432/db
    - postgresql+asyncpg://user:pass@host:5432/db
    """
    if not url:
        raise RuntimeError("DATABASE_URL is not set")

    # Render и ряд провайдеров выдают postgres:// — заменяем
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    # Добавляем драйвер asyncpg, если его нет
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    return url

DATABASE_URL_RAW = os.getenv("DATABASE_URL")
DATABASE_URL = _make_asyncpg_url(DATABASE_URL_RAW)

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
