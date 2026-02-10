"""Tests for price service — mocked external APIs"""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from app.price_service import get_crypto_price, cache


class TestCryptoPrice:
    """Test CoinGecko price fetching with mocked HTTP"""

    @pytest.fixture(autouse=True)
    async def clear_price_cache(self):
        """Clear cache before each test"""
        cache._memory_cache.clear()

    async def test_get_bitcoin_price(self):
        mock_response = MagicMock()
        mock_response.json.return_value = {"bitcoin": {"usd": 42000.0}}
        mock_response.raise_for_status = MagicMock()

        with patch("app.price_service.httpx.AsyncClient") as MockClient:
            instance = AsyncMock()
            instance.get.return_value = mock_response
            MockClient.return_value.__aenter__ = AsyncMock(return_value=instance)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

            price = await get_crypto_price("BTC")
            assert price == 42000.0

    async def test_get_ethereum_price(self):
        mock_response = MagicMock()
        mock_response.json.return_value = {"ethereum": {"usd": 2500.0}}
        mock_response.raise_for_status = MagicMock()

        with patch("app.price_service.httpx.AsyncClient") as MockClient:
            instance = AsyncMock()
            instance.get.return_value = mock_response
            MockClient.return_value.__aenter__ = AsyncMock(return_value=instance)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

            price = await get_crypto_price("ETH")
            assert price == 2500.0

    async def test_network_error_returns_none(self):
        with patch("app.price_service.httpx.AsyncClient") as MockClient:
            instance = AsyncMock()
            instance.get.side_effect = Exception("Network error")
            MockClient.return_value.__aenter__ = AsyncMock(return_value=instance)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

            price = await get_crypto_price("BTC")
            assert price is None

    async def test_unknown_coin_returns_none(self):
        mock_response = MagicMock()
        mock_response.json.return_value = {}
        mock_response.raise_for_status = MagicMock()

        with patch("app.price_service.httpx.AsyncClient") as MockClient:
            instance = AsyncMock()
            instance.get.return_value = mock_response
            MockClient.return_value.__aenter__ = AsyncMock(return_value=instance)
            MockClient.return_value.__aexit__ = AsyncMock(return_value=False)

            price = await get_crypto_price("FAKECOIN999")
            assert price is None

    async def test_cached_price_returned(self):
        """Second call should use cache, not hit API again"""
        # Pre-fill cache
        await cache.set("crypto_BTC_usd", 42000.0, ttl=60)

        # Should return cached value without any HTTP call
        price = await get_crypto_price("BTC")
        assert price == 42000.0


class TestPriceCache:
    """Test the PriceCache class directly"""

    async def test_set_and_get(self):
        cache._memory_cache.clear()
        await cache.set("test_key", 123.45, ttl=60)
        result = await cache.get("test_key", ttl_seconds=60)
        assert result == 123.45

    async def test_missing_key_returns_none(self):
        cache._memory_cache.clear()
        result = await cache.get("nonexistent_key", ttl_seconds=60)
        assert result is None

    async def test_clear_removes_all(self):
        await cache.set("k1", 1.0, ttl=60)
        await cache.set("k2", 2.0, ttl=60)
        await cache.clear()
        assert await cache.get("k1", ttl_seconds=60) is None
        assert await cache.get("k2", ttl_seconds=60) is None
