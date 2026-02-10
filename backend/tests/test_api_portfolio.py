"""Integration tests for portfolio API endpoints"""
import pytest


class TestPortfolioCRUD:
    """Portfolio create, list, delete"""

    async def test_create_portfolio(self, client, auth_headers):
        resp = await client.post("/portfolios", json={
            "name": "My Crypto",
            "type": "crypto"
        }, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["name"] == "My Crypto"
        assert data["type"] == "crypto"
        assert "id" in data

    async def test_create_portfolio_stocks(self, client, auth_headers):
        resp = await client.post("/portfolios", json={
            "name": "US Stocks",
            "type": "stocks"
        }, headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["type"] == "stocks"

    async def test_list_portfolios(self, client, auth_headers):
        # Create two portfolios
        await client.post("/portfolios", json={"name": "P1", "type": "crypto"}, headers=auth_headers)
        await client.post("/portfolios", json={"name": "P2", "type": "stocks"}, headers=auth_headers)

        resp = await client.get("/portfolios", headers=auth_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    async def test_list_portfolios_empty(self, client, auth_headers):
        resp = await client.get("/portfolios", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_create_portfolio_unauthenticated(self, client):
        resp = await client.post("/portfolios", json={
            "name": "Test",
            "type": "crypto"
        })
        assert resp.status_code == 401


class TestPortfolioIsolation:
    """User data isolation — critical for security"""

    async def test_user_cannot_see_other_users_portfolios(self, client):
        # Register User A
        await client.post("/register", json={"email": "a@test.com", "password": "Pass123!A"})
        resp_a = await client.post("/login", data={"username": "a@test.com", "password": "Pass123!A"})
        headers_a = {"Authorization": f"Bearer {resp_a.json()['access_token']}"}

        # Register User B
        await client.post("/register", json={"email": "b@test.com", "password": "Pass123!B"})
        resp_b = await client.post("/login", data={"username": "b@test.com", "password": "Pass123!B"})
        headers_b = {"Authorization": f"Bearer {resp_b.json()['access_token']}"}

        # User A creates a portfolio
        await client.post("/portfolios", json={"name": "Secret Portfolio", "type": "crypto"}, headers=headers_a)

        # User B should see 0 portfolios
        resp = await client.get("/portfolios", headers=headers_b)
        assert len(resp.json()) == 0

        # User A should see 1 portfolio
        resp = await client.get("/portfolios", headers=headers_a)
        assert len(resp.json()) == 1
        assert resp.json()[0]["name"] == "Secret Portfolio"
