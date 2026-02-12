"""
Global error handling for DILFwallet.

Registers exception handlers on the FastAPI app.
No middleware — avoids known request hanging issues with Starlette.
"""
import logging
import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)
IS_PRODUCTION = bool(os.getenv("RENDER") or os.getenv("PRODUCTION"))


def register_error_handlers(app: FastAPI) -> None:
    """Register global exception handlers on the FastAPI app"""

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        """Catch unhandled exceptions and return clean JSON"""
        logger.error(
            f"Unhandled error: {request.method} {request.url.path}: {exc}",
            exc_info=not IS_PRODUCTION
        )

        detail = "Internal server error"
        if not IS_PRODUCTION:
            detail = str(exc)

        return JSONResponse(
            status_code=500,
            content={"detail": detail},
        )
