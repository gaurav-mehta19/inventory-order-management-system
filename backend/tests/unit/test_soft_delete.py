from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from src.exceptions import CustomerNotFoundException, ProductNotFoundException
from src.schemas.customer import CustomerCreate
from src.schemas.order import OrderCreate, OrderItemCreate
from src.schemas.product import ProductCreate
from src.services.customer import CustomerService
from src.services.order import OrderService
from src.services.product import ProductService
from src.utils.pagination import PaginationParams, SortParams


def _product(service: ProductService, sku: str, stock: int = 10, price: str = "10.00") -> int:
    product = service.create(
        ProductCreate(name=f"Product {sku}", sku=sku, price=Decimal(price), quantity_in_stock=stock)
    )
    return product.id


def _customer(service: CustomerService, email: str = "buyer@example.com") -> int:
    return service.create(CustomerCreate(full_name="Buyer One", email=email)).id


def test_soft_deleted_product_is_hidden_but_history_is_preserved(db_session: Session) -> None:
    products = ProductService(db_session)
    customers = CustomerService(db_session)
    orders = OrderService(db_session)

    product_id = _product(products, "sd-keep")
    customer_id = _customer(customers)
    order = orders.create(
        OrderCreate(
            customer_id=customer_id, items=[OrderItemCreate(product_id=product_id, quantity=1)]
        )
    )

    products.delete(product_id)

    with pytest.raises(ProductNotFoundException):
        products.get(product_id)

    _, total = products.list(
        pagination=PaginationParams(), sort=SortParams(sort_by="id", descending=False)
    )
    assert total == 0

    fetched = orders.get(order.id)
    assert fetched.items[0].product_id == product_id
    assert fetched.items[0].product is not None
    assert fetched.items[0].product.id == product_id


def test_soft_deleted_product_cannot_be_ordered(db_session: Session) -> None:
    products = ProductService(db_session)
    customers = CustomerService(db_session)
    orders = OrderService(db_session)

    product_id = _product(products, "sd-block")
    customer_id = _customer(customers, email="block@example.com")
    products.delete(product_id)

    with pytest.raises(ProductNotFoundException):
        orders.create(
            OrderCreate(
                customer_id=customer_id, items=[OrderItemCreate(product_id=product_id, quantity=1)]
            )
        )


def test_cannot_order_for_soft_deleted_customer(db_session: Session) -> None:
    products = ProductService(db_session)
    customers = CustomerService(db_session)
    orders = OrderService(db_session)

    product_id = _product(products, "sd-cust")
    customer_id = _customer(customers, email="gone@example.com")
    customers.delete(customer_id)

    with pytest.raises(CustomerNotFoundException):
        orders.create(
            OrderCreate(
                customer_id=customer_id, items=[OrderItemCreate(product_id=product_id, quantity=1)]
            )
        )


def test_soft_deleted_customer_is_hidden_from_reads(db_session: Session) -> None:
    customers = CustomerService(db_session)

    customer_id = _customer(customers, email="hidden@example.com")
    customers.delete(customer_id)

    with pytest.raises(CustomerNotFoundException):
        customers.get(customer_id)

    _, total = customers.list(
        pagination=PaginationParams(), sort=SortParams(sort_by="id", descending=False)
    )
    assert total == 0
