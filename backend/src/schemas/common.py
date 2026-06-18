from collections.abc import Sequence
from math import ceil
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PageMeta(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class Page(BaseModel, Generic[T]):
    items: list[T]
    meta: PageMeta

    @classmethod
    def build(cls, items: Sequence[T], total_items: int, page: int, page_size: int) -> "Page[T]":
        total_pages = ceil(total_items / page_size) if page_size else 0
        return cls(
            items=list(items),
            meta=PageMeta(
                page=page,
                page_size=page_size,
                total_items=total_items,
                total_pages=total_pages,
            ),
        )


class SuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T


class MessageResponse(BaseModel):
    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: str
    details: dict[str, object] | None = None


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SortOrder(BaseModel):
    field: str = Field(default="id")
    descending: bool = Field(default=False)
