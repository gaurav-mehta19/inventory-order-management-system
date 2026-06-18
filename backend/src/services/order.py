from collections.abc import Mapping, Sequence
from decimal import Decimal

from sqlalchemy.orm import Session

from src.core.logging import get_logger
from src.exceptions import (
    CustomerNotFoundException,
    InsufficientInventoryException,
    OrderNotFoundException,
    ProductNotFoundException,
    ValidationException,
)
from src.models.order import Order, OrderStatus
from src.models.order_item import OrderItem
from src.models.product import Product
from src.repositories.customer import CustomerRepository
from src.repositories.order import OrderRepository
from src.schemas.order import OrderCreate, OrderItemCreate
from src.utils.pagination import PaginationParams, SortParams

logger = get_logger("service.order")


class OrderService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = OrderRepository(session)
        self.customers = CustomerRepository(session)

    def get(self, order_id: int) -> Order:
        order = self.repository.get_with_details(order_id)
        if order is None:
            raise OrderNotFoundException(order_id)
        return order

    def list(
        self,
        *,
        pagination: PaginationParams,
        sort: SortParams,
        status: OrderStatus | None = None,
        customer_id: int | None = None,
    ) -> tuple[Sequence[Order], int]:
        return self.repository.search(
            pagination=pagination, sort=sort, status=status, customer_id=customer_id
        )

    def create(self, payload: OrderCreate) -> Order:
        requested = self._aggregate_quantities(payload.items)

        if self.customers.get(payload.customer_id) is None:
            raise CustomerNotFoundException(payload.customer_id)

        try:
            products = self.repository.lock_products(list(requested.keys()))
            self._assert_all_products_exist(requested, products)

            order = Order(customer_id=payload.customer_id, status=OrderStatus.PENDING)
            total = Decimal("0.00")

            for product_id, quantity in requested.items():
                product = products[product_id]
                if product.quantity_in_stock < quantity:
                    raise InsufficientInventoryException(
                        product_id, quantity, product.quantity_in_stock
                    )
                product.quantity_in_stock -= quantity
                order.items.append(
                    OrderItem(
                        product_id=product_id,
                        quantity=quantity,
                        unit_price=product.price,
                    )
                )
                total += product.price * quantity

            order.total_amount = total
            self.session.add(order)
            self.session.commit()
        except Exception:
            self.session.rollback()
            raise

        logger.info(
            "order.created",
            extra={"order_id": order.id, "customer_id": order.customer_id, "total": str(total)},
        )
        return self.get(order.id)

    def update_status(self, order_id: int, status: OrderStatus) -> Order:
        order = self.repository.get(order_id)
        if order is None:
            raise OrderNotFoundException(order_id)
        order.status = status
        self.session.commit()
        logger.info("order.status_updated", extra={"order_id": order_id, "status": status.value})
        return self.get(order_id)

    @staticmethod
    def _aggregate_quantities(items: Sequence[OrderItemCreate]) -> dict[int, int]:
        aggregated: dict[int, int] = {}
        for item in items:
            aggregated[item.product_id] = aggregated.get(item.product_id, 0) + item.quantity
        if not aggregated:
            raise ValidationException("An order must contain at least one item")
        return aggregated

    @staticmethod
    def _assert_all_products_exist(
        requested: Mapping[int, int], products: Mapping[int, Product]
    ) -> None:
        missing = set(requested) - set(products)
        if missing:
            raise ProductNotFoundException(sorted(missing)[0])
