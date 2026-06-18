import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.core.logging import get_logger, request_id_var

logger = get_logger("api.request")

REQUEST_ID_HEADER = "X-Request-ID"


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or str(uuid4())
        token = request_id_var.set(request_id)
        started_at = time.perf_counter()

        logger.info(
            "request.start",
            extra={"method": request.method, "path": request.url.path},
        )
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
            logger.exception(
                "request.failed",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                },
            )
            raise
        finally:
            request_id_var.reset(token)

        duration_ms = round((time.perf_counter() - started_at) * 1000, 2)
        response.headers[REQUEST_ID_HEADER] = request_id
        logger.info(
            "request.end",
            extra={
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
