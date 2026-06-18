from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from src.exceptions import (
    CustomerNotFoundException,
    InsufficientInventoryException,
    OrderNotFoundException,
    ProductNotFoundException,
    ValidationException,
)
from src.models.order import OrderStatus
from src.schemas.customer import CustomerCreate
from src.schemas.order import OrderCreate, OrderItemCreate
from src.schemas.product import ProductCreate
from src.services.customer import CustomerService
from src.services.order import OrderService
from src.services.product import ProductService
from src.utils.pagination import PaginationParams, SortParams


@pytest.fixture
def services(db_session: Session) -> tuple[ProductService, CustomerService, OrderService]:
    return (
        ProductService(db_session),
        CustomerService(db_session),
        OrderService(db_session),
    )


def _seed_product(service: ProductService, sku: str, stock: int, price: str) -> int:
    product = service.create(
        ProductCreate(
            name=f"Product {sku}",
            sku=sku,
            price=Decimal(price),
            quantity_in_stock=stock,
        )
    )
    return product.id


def _seed_customer(service: CustomerService, email: str = "buyer@example.com") -> int:
    customer = service.create(CustomerCreate(full_name="Buyer One", email=email))
    return customer.id


def test_create_order_reduces_stock_and_computes_total(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, customers, orders = services
    product_a = _seed_product(products, "ord-a", stock=10, price="20.00")
    product_b = _seed_product(products, "ord-b", stock=5, price="5.50")
    customer_id = _seed_customer(customers)

    order = orders.create(
        OrderCreate(
            customer_id=customer_id,
            items=[
                OrderItemCreate(product_id=product_a, quantity=2),
                OrderItemCreate(product_id=product_b, quantity=3),
            ],
        )
    )

    assert order.total_amount == Decimal("56.50")
    assert order.status == OrderStatus.PENDING
    assert products.get(product_a).quantity_in_stock == 8
    assert products.get(product_b).quantity_in_stock == 2


def test_create_order_rejects_unknown_customer(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, _, orders = services
    product_id = _seed_product(products, "ord-c", stock=4, price="10.00")

    with pytest.raises(CustomerNotFoundException):
        orders.create(
            OrderCreate(
                customer_id=4242,
                items=[OrderItemCreate(product_id=product_id, quantity=1)],
            )
        )


def test_create_order_rejects_unknown_product(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    _, customers, orders = services
    customer_id = _seed_customer(customers)

    with pytest.raises(ProductNotFoundException):
        orders.create(
            OrderCreate(
                customer_id=customer_id,
                items=[OrderItemCreate(product_id=999, quantity=1)],
            )
        )


def test_insufficient_stock_rolls_back_entire_order(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, customers, orders = services
    product_ok = _seed_product(products, "ord-ok", stock=10, price="10.00")
    product_low = _seed_product(products, "ord-low", stock=1, price="10.00")
    customer_id = _seed_customer(customers)

    with pytest.raises(InsufficientInventoryException):
        orders.create(
            OrderCreate(
                customer_id=customer_id,
                items=[
                    OrderItemCreate(product_id=product_ok, quantity=2),
                    OrderItemCreate(product_id=product_low, quantity=5),
                ],
            )
        )

    assert products.get(product_ok).quantity_in_stock == 10
    assert products.get(product_low).quantity_in_stock == 1
    items, total = orders.list(
        pagination=PaginationParams(),
        sort=SortParams(sort_by="id", descending=False),
    )
    assert total == 0
    assert items == []


def test_duplicate_product_lines_are_aggregated(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, customers, orders = services
    product_id = _seed_product(products, "ord-agg", stock=10, price="4.00")
    customer_id = _seed_customer(customers)

    order = orders.create(
        OrderCreate(
            customer_id=customer_id,
            items=[
                OrderItemCreate(product_id=product_id, quantity=2),
                OrderItemCreate(product_id=product_id, quantity=3),
            ],
        )
    )

    assert order.total_amount == Decimal("20.00")
    assert len(order.items) == 1
    assert products.get(product_id).quantity_in_stock == 5


def test_update_status_transitions_order(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, customers, orders = services
    product_id = _seed_product(products, "ord-status", stock=10, price="9.00")
    customer_id = _seed_customer(customers)
    order = orders.create(
        OrderCreate(
            customer_id=customer_id,
            items=[OrderItemCreate(product_id=product_id, quantity=1)],
        )
    )

    updated = orders.update_status(order.id, OrderStatus.SHIPPED)

    assert updated.status == OrderStatus.SHIPPED


def test_cancel_order_restores_stock_and_marks_cancelled(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, customers, orders = services
    product_id = _seed_product(products, "ord-cancel", stock=10, price="12.00")
    customer_id = _seed_customer(customers)
    order = orders.create(
        OrderCreate(
            customer_id=customer_id,
            items=[OrderItemCreate(product_id=product_id, quantity=4)],
        )
    )
    assert products.get(product_id).quantity_in_stock == 6

    orders.cancel(order.id)

    assert orders.get(order.id).status == OrderStatus.CANCELLED
    assert products.get(product_id).quantity_in_stock == 10


def test_cancel_unknown_order_raises(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    _, _, orders = services

    with pytest.raises(OrderNotFoundException):
        orders.cancel(4242)


def test_cancel_already_cancelled_order_raises(
    services: tuple[ProductService, CustomerService, OrderService],
) -> None:
    products, customers, orders = services
    product_id = _seed_product(products, "ord-twice", stock=5, price="8.00")
    customer_id = _seed_customer(customers)
    order = orders.create(
        OrderCreate(
            customer_id=customer_id,
            items=[OrderItemCreate(product_id=product_id, quantity=1)],
        )
    )
    orders.cancel(order.id)

    with pytest.raises(ValidationException):
        orders.cancel(order.id)
