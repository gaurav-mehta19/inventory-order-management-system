import re
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from src.schemas.common import ORMModel

PHONE_PATTERN = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


def _validate_phone(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    if not PHONE_PATTERN.match(cleaned):
        raise ValueError("phone must be a valid phone number")
    return cleaned


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=32)

    @field_validator("full_name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("full_name must not be blank")
        return cleaned

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, value: str | None) -> str | None:
        return _validate_phone(value)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, max_length=32)

    @field_validator("email")
    @classmethod
    def _normalize_email(cls, value: str | None) -> str | None:
        return value.strip().lower() if value else value

    @field_validator("phone")
    @classmethod
    def _check_phone(cls, value: str | None) -> str | None:
        return _validate_phone(value)


class CustomerRead(ORMModel):
    id: int
    full_name: str
    email: str
    phone: str | None
    created_at: datetime
