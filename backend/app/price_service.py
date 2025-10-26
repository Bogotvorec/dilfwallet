"""
Сервис для получения цен криптовалют через CoinGecko API
"""
import httpx
from typing import Dict, Optional
from datetime import datetime, timedelta
import asyncio

# Простой in-memory кэш с TTL
_price_cache: Dict[str, tuple[float, datetime]] = {}
CACHE_TTL_SECONDS = 60  # 1 минута

# Маппинг популярных символов на CoinGecko ID
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


async def get_price(symbol: str, vs_currency: str = "usd") -> Optional[float]:
    """
    Получить текущую цену криптовалюты
    
    Args:
        symbol: Символ криптовалюты (например, BTC, ETH)
        vs_currency: Валюта для отображения цены (по умолчанию USD)
    
    Returns:
        Цена в указанной валюте или None при ошибке
    """
    symbol_upper = symbol.upper()
    cache_key = f"{symbol_upper}_{vs_currency}"
    
    # Проверяем кэш
    if cache_key in _price_cache:
        price, cached_at = _price_cache[cache_key]
        if datetime.utcnow() - cached_at < timedelta(seconds=CACHE_TTL_SECONDS):
            return price
    
    # Получаем coin_id из маппинга
    coin_id = SYMBOL_TO_ID.get(symbol_upper)
    if not coin_id:
        # Пробуем использовать символ напрямую в нижнем регистре
        coin_id = symbol.lower()
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{COINGECKO_API_URL}/simple/price",
                params={
                    "ids": coin_id,
                    "vs_currencies": vs_currency,
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if coin_id in data and vs_currency in data[coin_id]:
                price = float(data[coin_id][vs_currency])
                # Сохраняем в кэш
                _price_cache[cache_key] = (price, datetime.utcnow())
                return price
            
            return None
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
        return None


async def get_multiple_prices(symbols: list[str], vs_currency: str = "usd") -> Dict[str, Optional[float]]:
    """
    Получить цены для нескольких криптовалют одновременно
    
    Args:
        symbols: Список символов криптовалют
        vs_currency: Валюта для отображения цены
    
    Returns:
        Словарь {symbol: price}
    """
    tasks = [get_price(symbol, vs_currency) for symbol in symbols]
    prices = await asyncio.gather(*tasks)
    return dict(zip(symbols, prices))


async def get_historical_price(
    symbol: str,
    date: datetime,
    vs_currency: str = "usd"
) -> Optional[float]:
    """
    Получить историческую цену криптовалюты на определённую дату
    
    Args:
        symbol: Символ криптовалюты
        date: Дата для получения цены
        vs_currency: Валюта для отображения цены
    
    Returns:
        Цена на указанную дату или None при ошибке
    """
    symbol_upper = symbol.upper()
    coin_id = SYMBOL_TO_ID.get(symbol_upper, symbol.lower())
    
    # Форматируем дату как DD-MM-YYYY
    date_str = date.strftime("%d-%m-%Y")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{COINGECKO_API_URL}/coins/{coin_id}/history",
                params={
                    "date": date_str,
                    "localization": "false"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if "market_data" in data and "current_price" in data["market_data"]:
                return float(data["market_data"]["current_price"].get(vs_currency, 0))
            
            return None
    except Exception as e:
        print(f"Error fetching historical price for {symbol} on {date_str}: {e}")
        return None


def clear_cache():
    """Очистить кэш цен"""
    global _price_cache
    _price_cache.clear()
