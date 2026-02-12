"""
Structured logging configuration for DILFwallet.

- Production (Render): JSON format for log aggregation
- Development: Human-readable format, INFO level
"""
import logging
import os
import sys
import json
from datetime import datetime, timezone


IS_PRODUCTION = bool(os.getenv("RENDER") or os.getenv("PRODUCTION"))


class JSONFormatter(logging.Formatter):
    """JSON log formatter for production — works with Render log drains"""

    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info and record.exc_info[0]:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging() -> None:
    """Configure logging based on environment"""
    if IS_PRODUCTION:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
    else:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s │ %(levelname)-7s │ %(name)-20s │ %(message)s",
            datefmt="%H:%M:%S"
        ))

    # Always use INFO — DEBUG floods the event loop via aiosqlite
    level = logging.INFO

    logging.root.handlers.clear()
    logging.root.addHandler(handler)
    logging.root.setLevel(level)

    # Quiet noisy libraries
    for noisy in ["httpx", "httpcore", "yfinance", "aiosqlite",
                   "sqlalchemy.engine", "uvicorn.access"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)
