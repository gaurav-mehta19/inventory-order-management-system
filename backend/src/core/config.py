from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "Inventory & Order Management API"
    app_version: str = "1.0.0"
    environment: Literal["development", "staging", "production", "test"] = "development"
    debug: bool = False

    api_v1_prefix: str = "/api/v1"

    database_url: PostgresDsn = Field(
        default="postgresql+psycopg://postgres:postgres@localhost:5432/inventory",  # type: ignore[assignment]
    )
    database_echo: bool = False

    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )

    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    log_json: bool = True

    default_page_size: int = 20
    max_page_size: int = 100

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
