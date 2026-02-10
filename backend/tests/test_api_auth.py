"""Integration tests for auth API endpoints — register, login, refresh, /me"""
import pytest


class TestRegister:
    """POST /register"""

    async def test_register_success(self, client):
        resp = await client.post("/register", json={
            "email": "new@example.com",
            "password": "StrongPass123!"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "new@example.com"
        assert "id" in data

    async def test_register_duplicate_email(self, client):
        user_data = {"email": "dup@example.com", "password": "Pass123!"}
        resp1 = await client.post("/register", json=user_data)
        assert resp1.status_code == 200
        resp2 = await client.post("/register", json=user_data)
        assert resp2.status_code == 400
        assert "already exists" in resp2.json()["detail"]

    async def test_register_missing_email(self, client):
        resp = await client.post("/register", json={
            "password": "Pass123!"
        })
        assert resp.status_code == 422

    async def test_register_missing_password(self, client):
        resp = await client.post("/register", json={
            "email": "test@example.com"
        })
        assert resp.status_code == 422


class TestLogin:
    """POST /login"""

    async def test_login_success(self, client, registered_user):
        resp = await client.post("/login", data={
            "username": "test@example.com",
            "password": "SecurePass123!"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client, registered_user):
        resp = await client.post("/login", data={
            "username": "test@example.com",
            "password": "WrongPassword!"
        })
        assert resp.status_code == 401

    async def test_login_nonexistent_user(self, client):
        resp = await client.post("/login", data={
            "username": "nobody@example.com",
            "password": "Pass123!"
        })
        assert resp.status_code == 401


class TestRefresh:
    """POST /refresh"""

    async def test_refresh_success(self, client, auth_tokens):
        resp = await client.post("/refresh", json={
            "refresh_token": auth_tokens["refresh_token"]
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    async def test_refresh_with_access_token_fails(self, client, auth_tokens):
        """Access tokens should not work as refresh tokens"""
        resp = await client.post("/refresh", json={
            "refresh_token": auth_tokens["access_token"]
        })
        assert resp.status_code == 401

    async def test_refresh_with_invalid_token(self, client):
        resp = await client.post("/refresh", json={
            "refresh_token": "invalid.garbage.token"
        })
        assert resp.status_code == 401


class TestMe:
    """GET /me"""

    async def test_me_authenticated(self, client, auth_headers):
        resp = await client.get("/me", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "test@example.com"

    async def test_me_unauthenticated(self, client):
        resp = await client.get("/me")
        assert resp.status_code == 401

    async def test_me_invalid_token(self, client):
        resp = await client.get("/me", headers={
            "Authorization": "Bearer invalid.token.here"
        })
        assert resp.status_code == 401


class TestHealthCheck:
    """GET /health"""

    async def test_health_check(self, client):
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["database"] == "healthy"
        assert "version" in data
        assert "timestamp" in data

    async def test_root_endpoint(self, client):
        resp = await client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert "DILFwallet" in data["message"]
