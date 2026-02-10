"""
Global error handling middleware for DILFwallet.

- Catches unhandled exceptions and returns clean JSON errors
- Logs errors with context
- Never exposes stack traces to clients in production
"""
import logging
import os
import time
import uuid
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)
IS_PRODUCTION = bool(os.getenv("RENDER") or os.getenv("PRODUCTION"))


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Catch unhandled exceptions and return clean JSON errors"""

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())[:8]
        start_time = time.time()

        try:
            response = await call_next(request)

            # Log slow requests (> 2s)
            duration = time.time() - start_time
            if duration > 2.0:
                logger.warning(
                    f"Slow request: {request.method} {request.url.path} "
                    f"took {duration:.2f}s [rid:{request_id}]"
                )

            # Add request ID header for debugging
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as exc:
            duration = time.time() - start_time
            logger.error(
                f"Unhandled error: {request.method} {request.url.path} "
                f"[rid:{request_id}] [{duration:.2f}s]: {exc}",
                exc_info=not IS_PRODUCTION  # Full traceback in dev only
            )

            # Clean error response — no stack traces in production
            detail = "Internal server error"
            if not IS_PRODUCTION:
                detail = str(exc)

            return JSONResponse(
                status_code=500,
                content={
                    "detail": detail,
                    "request_id": request_id,
                },
            )
