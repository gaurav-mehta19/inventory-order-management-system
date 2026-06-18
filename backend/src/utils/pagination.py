from dataclasses import dataclass

from src.core.config import settings


@dataclass(frozen=True, slots=True)
class PaginationParams:
    page: int = 1
    page_size: int = settings.default_page_size

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


@dataclass(frozen=True, slots=True)
class SortParams:
    sort_by: str
    descending: bool
