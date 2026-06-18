from collections.abc import Sequence
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal

from sqlalchemy import Numeric, asc, cast, desc, func, select
from sqlalchemy.orm import joinedload, selectinload

from src.models.order import Order, OrderStatus
from src.models.order_item import OrderItem
from src.models.product import Product
from src.repositories.base import BaseRepository
from src.utils.pagination import PaginationParams, SortParams

SORTABLE_FIELDS = {
    "id": Order.id,
    "total_amount": Order.total_amount,
    "status": Order.status,
    "created_at": Order.created_at,
}


class OrderRepository(BaseRepository[Order]):
    model = Order

    def get_with_details(self, order_id: int) -> Order | None:
        statement = (
            select(Order)
            .where(Order.id == order_id)
            .options(
                joinedload(Order.customer),
                selectinload(Order.items).joinedload(OrderItem.product),
            )
        )
        return self.session.execute(statement).unique().scalar_one_or_none()

    def lock_products(self, product_ids: Sequence[int]) -> dict[int, Product]:
        statement = (
            select(Product)
            .where(Product.id.in_(product_ids), Product.deleted_at.is_(None))
            .with_for_update()
        )
        products = self.session.execute(statement).scalars().all()
        return {product.id: product for product in products}

    def lock_products_for_restock(self, product_ids: Sequence[int]) -> dict[int, Product]:
        statement = select(Product).where(Product.id.in_(product_ids)).with_for_update()
        products = self.session.execute(statement).scalars().all()
        return {product.id: product for product in products}

    def search(
        self,
        *,
        pagination: PaginationParams,
        sort: SortParams,
        status: OrderStatus | None = None,
        customer_id: int | None = None,
    ) -> tuple[Sequence[Order], int]:
        statement = select(Order).options(selectinload(Order.items), joinedload(Order.customer))
        if status is not None:
            statement = statement.where(Order.status == status)
        if customer_id is not None:
            statement = statement.where(Order.customer_id == customer_id)

        total = self.count(statement)
        column = SORTABLE_FIELDS.get(sort.sort_by, Order.id)
        ordering = desc(column) if sort.descending else asc(column)
        statement = statement.order_by(ordering).offset(pagination.offset).limit(pagination.limit)
        return self.session.execute(statement).unique().scalars().all(), total

    def total_count(self) -> int:
        return self.count(select(Order))

    def total_revenue(self) -> Decimal:
        statement = select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.status != OrderStatus.CANCELLED
        )
        return self.session.execute(statement).scalar_one()

    def count_by_status(self) -> list[tuple[str, int]]:
        statement = select(Order.status, func.count()).group_by(Order.status)
        return [(row[0].value, row[1]) for row in self.session.execute(statement).all()]

    def revenue_trend(self, days: int) -> list[tuple[date, Decimal, int]]:
        since = datetime.now(UTC) - timedelta(days=days)
        day_bucket = func.date(Order.created_at)
        statement = (
            select(
                day_bucket.label("day"),
                cast(func.coalesce(func.sum(Order.total_amount), 0), Numeric(14, 2)),
                func.count(),
            )
            .where(Order.created_at >= since, Order.status != OrderStatus.CANCELLED)
            .group_by(day_bucket)
            .order_by(asc(day_bucket))
        )
        return [(row[0], row[1], row[2]) for row in self.session.execute(statement).all()]
