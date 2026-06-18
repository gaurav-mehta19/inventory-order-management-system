from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.core.logging import get_logger
from src.exceptions import DomainException

logger = get_logger("api.error")


def _error_body(
    message: str, error_code: str, details: dict[str, Any] | None = None
) -> dict[str, Any]:
    body: dict[str, Any] = {
        "success": False,
        "message": message,
        "error_code": error_code,
    }
    if details:
        body["details"] = details
    return body


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(DomainException)
    async def handle_domain_exception(_: Request, exc: DomainException) -> JSONResponse:
        logger.warning(
            "domain.exception",
            extra={"error_code": exc.error_code, "detail": exc.message},
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(exc.message, exc.error_code, exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        details = {
            "fields": [
                {
                    "field": ".".join(str(part) for part in error["loc"][1:]),
                    "message": error["msg"],
                }
                for error in exc.errors()
            ]
        }
        logger.info("request.validation_error", extra={"errors": details})
        return JSONResponse(
            status_code=422,
            content=_error_body("Request validation failed", "VALIDATION_ERROR", details),
        )

    @app.exception_handler(IntegrityError)
    async def handle_integrity_error(_: Request, exc: IntegrityError) -> JSONResponse:
        logger.error("database.integrity_error", extra={"error": str(exc.orig)})
        return JSONResponse(
            status_code=409,
            content=_error_body(
                "The operation violates a data integrity constraint",
                "INTEGRITY_ERROR",
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_body(str(exc.detail), f"HTTP_{exc.status_code}"),
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled.exception", extra={"error": str(exc)})
        return JSONResponse(
            status_code=500,
            content=_error_body("An unexpected error occurred", "INTERNAL_SERVER_ERROR"),
        )
