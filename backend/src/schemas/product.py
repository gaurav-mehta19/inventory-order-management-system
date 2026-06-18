from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field, field_validator

from src.schemas.common import ORMModel

SKU_PATTERN = r"^[A-Za-z0-9][A-Za-z0-9\-_]{1,63}$"


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=2, max_length=64, pattern=SKU_PATTERN)
    price: Decimal = Field(gt=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int = Field(ge=0)

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be blank")
        return cleaned

    @field_validator("sku")
    @classmethod
    def _normalize_sku(cls, value: str) -> str:
        return value.strip().upper()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=2, max_length=64, pattern=SKU_PATTERN)
    price: Decimal | None = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    quantity_in_stock: int | None = Field(default=None, ge=0)

    @field_validator("sku")
    @classmethod
    def _normalize_sku(cls, value: str | None) -> str | None:
        return value.strip().upper() if value else value

    @field_validator("name")
    @classmethod
    def _strip_name(cls, value: str | None) -> str | None:
        return value.strip() if value else value


class ProductRead(ORMModel):
    id: int
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime
