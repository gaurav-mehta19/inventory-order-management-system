from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from src.api.router import api_router
from src.core.config import settings
from src.core.logging import configure_logging, get_logger
from src.db.session import engine
from src.middlewares import (
    RequestContextMiddleware,
    SecurityHeadersMiddleware,
    register_exception_handlers,
)

logger = get_logger("app")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    configure_logging()
    logger.info("app.startup", extra={"environment": settings.environment})
    yield
    engine.dispose()
    logger.info("app.shutdown")


def create_app() -> FastAPI:
    configure_logging()
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID"],
    )
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestContextMiddleware)

    register_exception_handlers(app)

    @app.get("/health", tags=["System"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/health/ready", tags=["System"])
    def readiness() -> dict[str, str]:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {"status": "ready"}

    app.include_router(api_router, prefix=settings.api_v1_prefix)
    return app


app = create_app()
