"""
Сервис для получения цен активов:
- Крипто: CoinGecko API
- Акции/ETF: Yahoo Finance (yfinance)
- Металлы: Yahoo Finance commodity tickers

Features:
- Redis-backed cache with in-memory fallback
- Configurable TTL per asset type
- Thread pool for synchronous yfinance calls
"""
import httpx
import yfinance as yf
import logging
import os
from typing import Dict, Optional
from datetime import datetime, timedelta
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


# ========== CACHE ==========

class PriceCache:
    """Redis-backed price cache with in-memory fallback"""

    def __init__(self):
        self._memory_cache: Dict[str, tuple[float, datetime]] = {}
        self._redis = None
        redis_url = os.getenv("REDIS_URL")
        if redis_url:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(redis_url, decode_responses=True)
                logger.info("✅ Redis cache connected")
            except Exception as e:
                logger.warning(f"⚠️ Redis not available, using in-memory cache: {e}")

    async def get(self, key: str, ttl_seconds: int = 60) -> Optional[float]:
        """Get cached price, returns None if expired or missing"""
        # Try Redis first
        if self._redis:
            try:
                val = await self._redis.get(f"price:{key}")
                if val is not None:
                    return float(val)
            except Exception:
                pass

        # Fallback to in-memory
        if key in self._memory_cache:
            price, cached_at = self._memory_cache[key]
            if datetime.utcnow() - cached_at < timedelta(seconds=ttl_seconds):
                return price
            else:
                del self._memory_cache[key]  # Expired
        return None

    async def set(self, key: str, price: float, ttl: int = 60):
        """Cache a price with TTL"""
        # Try Redis first
        if self._redis:
            try:
                await self._redis.setex(f"price:{key}", ttl, str(price))
                return
            except Exception:
                pass

        # Fallback to in-memory
        self._memory_cache[key] = (price, datetime.utcnow())

    async def clear(self):
        """Clear all cached prices"""
        if self._redis:
            try:
                keys = await self._redis.keys("price:*")
                if keys:
                    await self._redis.delete(*keys)
            except Exception:
                pass
        self._memory_cache.clear()


# Global cache instance
cache = PriceCache()

# Cache TTLs per asset type (seconds)
CACHE_TTL_CRYPTO = 60    # 1 минута для крипты
CACHE_TTL_STOCKS = 300   # 5 минут для акций
CACHE_TTL_METALS = 600   # 10 минут для металлов

# Thread pool для синхронного yfinance
_executor = ThreadPoolExecutor(max_workers=5)


# ========== CRYPTO (CoinGecko) ==========

SYMBOL_TO_ID = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "USDT": "tether",
    "BNB": "binancecoin",
    "SOL": "solana",
    "XRP": "ripple",
    "USDC": "usd-coin",
    "ADA": "cardano",
    "DOGE": "dogecoin",
    "TRX": "tron",
    "TON": "the-open-network",
    "MATIC": "matic-network",
    "DOT": "polkadot",
    "LTC": "litecoin",
    "AVAX": "avalanche-2",
    "UNI": "uniswap",
    "LINK": "chainlink",
}

COINGECKO_API_URL = "https://api.coingecko.com/api/v3"


async def get_crypto_price(symbol: str, vs_currency: str = "usd") -> Optional[float]:
    """Get cryptocurrency price from CoinGecko"""
    symbol_upper = symbol.upper()
    cache_key = f"crypto_{symbol_upper}_{vs_currency}"

    # Check cache
    cached = await cache.get(cache_key, CACHE_TTL_CRYPTO)
    if cached is not None:
        return cached

    coin_id = SYMBOL_TO_ID.get(symbol_upper, symbol.lower())

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{COINGECKO_API_URL}/simple/price",
                params={"ids": coin_id, "vs_currencies": vs_currency}
            )
            response.raise_for_status()
            data = response.json()

            if coin_id in data and vs_currency in data[coin_id]:
                price = float(data[coin_id][vs_currency])
                await cache.set(cache_key, price, CACHE_TTL_CRYPTO)
                return price
            return None
    except Exception as e:
        logger.error(f"Error fetching crypto price for {symbol}: {e}")
        return None


# ========== STOCKS / ETF (Yahoo Finance) ==========

# Popular stock/ETF symbols
STOCK_SYMBOLS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM",
    "V", "MA", "DIS", "NFLX", "PYPL", "INTC", "AMD", "COIN",
    # ETFs
    "SPY", "QQQ", "IWM", "VTI", "VOO", "VEA", "EFA", "GLD", "SLV"
]


def _get_stock_price_sync(symbol: str) -> Optional[float]:
    """Synchronous helper for yfinance (runs in thread pool)"""
    try:
        ticker = yf.Ticker(symbol.upper())
        # Try fast_info first (faster), fallback to info
        try:
            price = ticker.fast_info.last_price
            if price and price > 0:
                return float(price)
        except Exception:
            pass

        # Fallback: get from history
        hist = ticker.history(period="1d")
        if not hist.empty:
            return float(hist['Close'].iloc[-1])

        return None
    except Exception as e:
        logger.error(f"Error fetching stock price for {symbol}: {e}")
        return None


async def get_stock_price(symbol: str) -> Optional[float]:
    """Get stock/ETF price from Yahoo Finance"""
    symbol_upper = symbol.upper()
    cache_key = f"stock_{symbol_upper}"

    # Check cache
    cached = await cache.get(cache_key, CACHE_TTL_STOCKS)
    if cached is not None:
        return cached

    loop = asyncio.get_event_loop()
    price = await loop.run_in_executor(_executor, _get_stock_price_sync, symbol)

    if price:
        await cache.set(cache_key, price, CACHE_TTL_STOCKS)

    return price


# ========== METALS ==========

# Metal symbols and their Yahoo Finance tickers
METAL_TICKERS = {
    "XAU": "GC=F",      # Gold futures
    "GOLD": "GC=F",
    "XAG": "SI=F",      # Silver futures
    "SILVER": "SI=F",
    "XPT": "PL=F",      # Platinum futures
    "PLATINUM": "PL=F",
    "XPD": "PA=F",      # Palladium futures
    "PALLADIUM": "PA=F",
}

# Price per troy ounce (roughly)
METALS_INFO = {
    "XAU": {"name": "Золото", "unit": "oz"},
    "GOLD": {"name": "Золото", "unit": "oz"},
    "XAG": {"name": "Серебро", "unit": "oz"},
    "SILVER": {"name": "Серебро", "unit": "oz"},
    "XPT": {"name": "Платина", "unit": "oz"},
    "PLATINUM": {"name": "Платина", "unit": "oz"},
    "XPD": {"name": "Палладий", "unit": "oz"},
    "PALLADIUM": {"name": "Палладий", "unit": "oz"},
}


async def get_metal_price(symbol: str) -> Optional[float]:
    """Get precious metal price from Yahoo Finance futures"""
    symbol_upper = symbol.upper()
    cache_key = f"metal_{symbol_upper}"

    # Check cache
    cached = await cache.get(cache_key, CACHE_TTL_METALS)
    if cached is not None:
        return cached

    ticker_symbol = METAL_TICKERS.get(symbol_upper)
    if not ticker_symbol:
        logger.warning(f"Unknown metal symbol: {symbol}")
        return None

    loop = asyncio.get_event_loop()
    price = await loop.run_in_executor(_executor, _get_stock_price_sync, ticker_symbol)

    if price:
        await cache.set(cache_key, price, CACHE_TTL_METALS)

    return price


# ========== UNIFIED PRICE FUNCTION ==========

async def get_price_by_type(symbol: str, portfolio_type: str) -> Optional[float]:
    """
    Get asset price based on portfolio type

    Args:
        symbol: Asset symbol (BTC, AAPL, XAU, etc.)
        portfolio_type: One of 'crypto', 'stocks', 'etf', 'metals'

    Returns:
        Price in USD or None
    """
    ptype = portfolio_type.lower()

    if ptype == "crypto":
        return await get_crypto_price(symbol)
    elif ptype in ("stocks", "etf"):
        return await get_stock_price(symbol)
    elif ptype == "metals":
        return await get_metal_price(symbol)
    else:
        # Default to stock
        return await get_stock_price(symbol)


async def get_multiple_prices_by_type(
    symbols: list[str],
    portfolio_type: str
) -> Dict[str, Optional[float]]:
    """Get multiple asset prices based on portfolio type"""
    tasks = [get_price_by_type(symbol, portfolio_type) for symbol in symbols]
    prices = await asyncio.gather(*tasks)
    return dict(zip(symbols, prices))


# ========== LEGACY FUNCTIONS (для совместимости) ==========

async def get_price(symbol: str, vs_currency: str = "usd") -> Optional[float]:
    """Legacy: Get crypto price (for backward compatibility)"""
    return await get_crypto_price(symbol, vs_currency)


async def get_multiple_prices(symbols: list[str], vs_currency: str = "usd") -> Dict[str, Optional[float]]:
    """Legacy: Get multiple crypto prices"""
    tasks = [get_crypto_price(symbol, vs_currency) for symbol in symbols]
    prices = await asyncio.gather(*tasks)
    return dict(zip(symbols, prices))


async def get_historical_price(
    symbol: str,
    date: datetime,
    vs_currency: str = "usd"
) -> Optional[float]:
    """Get historical crypto price from CoinGecko"""
    symbol_upper = symbol.upper()
    coin_id = SYMBOL_TO_ID.get(symbol_upper, symbol.lower())
    date_str = date.strftime("%d-%m-%Y")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{COINGECKO_API_URL}/coins/{coin_id}/history",
                params={"date": date_str, "localization": "false"}
            )
            response.raise_for_status()
            data = response.json()

            if "market_data" in data and "current_price" in data["market_data"]:
                return float(data["market_data"]["current_price"].get(vs_currency, 0))
            return None
    except Exception as e:
        logger.error(f"Error fetching historical price for {symbol} on {date_str}: {e}")
        return None


def clear_cache():
    """Clear price cache (sync wrapper for backward compat)"""
    asyncio.create_task(cache.clear())
