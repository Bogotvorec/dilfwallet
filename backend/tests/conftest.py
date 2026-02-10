import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.main import app
from app.db import get_db
from app.auth import create_access_token

# Test database (in-memory SQLite — fresh per test)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(autouse=True)
def disable_rate_limiting():
    """Disable rate limiting for all tests by disabling the shared limiter"""
    from app.limiter import limiter
    limiter.enabled = False
    yield
    limiter.enabled = True


@pytest.fixture(scope="session")
def event_loop():
    """Create a single event loop for all tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_engine():
    """Create a fresh in-memory database for each test"""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture(scope="function")
async def db_session(db_engine):
    """Get a database session for each test"""
    async_session = sessionmaker(db_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest.fixture(scope="function")
async def client(db_session):
    """HTTP test client with overridden DB dependency"""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.fixture
async def registered_user(client):
    """Register a test user and return their data"""
    resp = await client.post("/register", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })
    return resp.json()


@pytest.fixture
async def auth_headers(client, registered_user):
    """Login and return Authorization headers"""
    resp = await client.post("/login", data={
        "username": "test@example.com",
        "password": "SecurePass123!"
    })
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
async def auth_tokens(client, registered_user):
    """Login and return both access + refresh tokens"""
    resp = await client.post("/login", data={
        "username": "test@example.com",
        "password": "SecurePass123!"
    })
    return resp.json()
