import logging
import sys
from contextvars import ContextVar

from pythonjsonlogger import json as jsonlogger

from src.core.config import settings

request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)


class RequestContextFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


def _build_handler() -> logging.Handler:
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestContextFilter())
    if settings.log_json:
        formatter: logging.Formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s %(request_id)s",
            rename_fields={"asctime": "timestamp", "levelname": "level"},
            timestamp=True,
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | rid=%(request_id)s | %(message)s"
        )
    handler.setFormatter(formatter)
    return handler


def configure_logging() -> None:
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(_build_handler())
    root.setLevel(settings.log_level)

    for noisy_logger in ("uvicorn.access", "uvicorn.error"):
        logging.getLogger(noisy_logger).handlers.clear()
        logging.getLogger(noisy_logger).propagate = True


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
