from __future__ import annotations

from decimal import Decimal

from src.db.session import SessionFactory
from src.schemas.customer import CustomerCreate
from src.schemas.order import OrderCreate, OrderItemCreate
from src.schemas.product import ProductCreate
from src.services.customer import CustomerService
from src.services.order import OrderService
from src.services.product import ProductService

PRODUCTS = [
    ("Aeron Ergonomic Chair", "CHAIR-AERON", "1195.00", 18),
    ("Standing Desk Pro", "DESK-STAND-01", "649.00", 9),
    ("Mechanical Keyboard", "KBD-MX-87", "139.00", 54),
    ("4K USB-C Monitor", "MON-4K-27", "429.00", 6),
    ("Wireless Mouse", "MOU-WL-200", "59.00", 120),
    ("Noise Cancelling Headset", "AUD-NC-900", "299.00", 4),
    ("Laptop Stand Aluminium", "STND-ALU-3", "45.00", 73),
    ("USB-C Hub 8-in-1", "HUB-8IN1", "79.00", 31),
]

CUSTOMERS = [
    ("Ada Lovelace", "ada@example.com", "+1 202 555 0100"),
    ("Grace Hopper", "grace@example.com", "+1 202 555 0101"),
    ("Alan Turing", "alan@example.com", None),
    ("Katherine Johnson", "katherine@example.com", "+1 202 555 0103"),
]


def seed() -> None:
    session = SessionFactory()
    try:
        products = ProductService(session)
        customers = CustomerService(session)
        orders = OrderService(session)

        created_products = [
            products.create(
                ProductCreate(
                    name=name, sku=sku, price=Decimal(price), quantity_in_stock=stock
                )
            )
            for name, sku, price, stock in PRODUCTS
        ]
        created_customers = [
            customers.create(CustomerCreate(full_name=name, email=email, phone=phone))
            for name, email, phone in CUSTOMERS
        ]

        orders.create(
            OrderCreate(
                customer_id=created_customers[0].id,
                items=[
                    OrderItemCreate(product_id=created_products[0].id, quantity=1),
                    OrderItemCreate(product_id=created_products[2].id, quantity=2),
                ],
            )
        )
        orders.create(
            OrderCreate(
                customer_id=created_customers[1].id,
                items=[OrderItemCreate(product_id=created_products[4].id, quantity=3)],
            )
        )
    finally:
        session.close()


if __name__ == "__main__":
    seed()
