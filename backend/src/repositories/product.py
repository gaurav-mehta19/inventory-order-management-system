from collections.abc import Sequence

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.sql import Select

from src.models.product import Product
from src.repositories.base import BaseRepository
from src.utils.pagination import PaginationParams, SortParams

SORTABLE_FIELDS = {
    "id": Product.id,
    "name": Product.name,
    "sku": Product.sku,
    "price": Product.price,
    "quantity_in_stock": Product.quantity_in_stock,
    "created_at": Product.created_at,
}


class ProductRepository(BaseRepository[Product]):
    model = Product

    def base_statement(self) -> Select[tuple[Product]]:
        return select(Product).where(Product.deleted_at.is_(None))

    def get(self, entity_id: int) -> Product | None:
        return self.session.execute(
            self.base_statement().where(Product.id == entity_id)
        ).scalar_one_or_none()

    def get_by_sku(self, sku: str) -> Product | None:
        return self.session.execute(select(Product).where(Product.sku == sku)).scalar_one_or_none()

    def search(
        self,
        *,
        pagination: PaginationParams,
        sort: SortParams,
        search: str | None = None,
        low_stock_threshold: int | None = None,
    ) -> tuple[Sequence[Product], int]:
        statement = self.base_statement()
        if search:
            pattern = f"%{search.lower()}%"
            statement = statement.where(
                or_(
                    func.lower(Product.name).like(pattern),
                    func.lower(Product.sku).like(pattern),
                )
            )
        if low_stock_threshold is not None:
            statement = statement.where(Product.quantity_in_stock <= low_stock_threshold)

        total = self.count(statement)
        column = SORTABLE_FIELDS.get(sort.sort_by, Product.id)
        ordering = desc(column) if sort.descending else asc(column)
        statement = statement.order_by(ordering).offset(pagination.offset).limit(pagination.limit)
        return self.list(statement), total

    def list_low_stock(self, threshold: int, limit: int) -> Sequence[Product]:
        statement = (
            self.base_statement()
            .where(Product.quantity_in_stock <= threshold)
            .order_by(asc(Product.quantity_in_stock))
            .limit(limit)
        )
        return self.list(statement)

    def count_low_stock(self, threshold: int) -> int:
        return self.count(self.base_statement().where(Product.quantity_in_stock <= threshold))

    def total_count(self) -> int:
        return self.count(self.base_statement())
