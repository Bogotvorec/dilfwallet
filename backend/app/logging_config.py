"""
Structured logging configuration for DILFwallet.

- Production (Render): JSON format for log aggregation
- Development: Human-readable colored format
"""
import logging
import logging.config
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
        if hasattr(record, "request_id"):
            log_entry["request_id"] = record.request_id
        if hasattr(record, "user_id"):
            log_entry["user_id"] = record.user_id
        return json.dumps(log_entry, ensure_ascii=False)


def setup_logging() -> None:
    """Configure logging based on environment"""
    if IS_PRODUCTION:
        # JSON logs for production
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        level = logging.INFO
    else:
        # Readable logs for development
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(
            "%(asctime)s │ %(levelname)-7s │ %(name)-20s │ %(message)s",
            datefmt="%H:%M:%S"
        ))
        level = logging.DEBUG

    # Root logger
    logging.root.handlers.clear()
    logging.root.addHandler(handler)
    logging.root.setLevel(level)

    # Quiet noisy libraries
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("yfinance").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.INFO)
