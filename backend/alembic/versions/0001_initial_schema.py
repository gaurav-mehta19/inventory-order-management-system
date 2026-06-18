"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-18 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

ORDER_STATUS = sa.Enum(
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    name="order_status",
)


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("sku", sa.String(length=64), nullable=False),
        sa.Column("price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column("quantity_in_stock", sa.Integer(), server_default=sa.text("0"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("price > 0", name="ck_products_price_positive"),
        sa.CheckConstraint("quantity_in_stock >= 0", name="ck_products_quantity_non_negative"),
        sa.PrimaryKeyConstraint("id", name="pk_products"),
        sa.UniqueConstraint("sku", name="uq_products_sku"),
    )
    op.create_index("ix_products_sku", "products", ["sku"], unique=True)

    op.create_table(
        "customers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_customers"),
        sa.UniqueConstraint("email", name="uq_customers_email"),
    )
    op.create_index("ix_customers_email", "customers", ["email"], unique=True)

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("customer_id", sa.Integer(), nullable=False),
        sa.Column("total_amount", sa.Numeric(precision=14, scale=2), server_default=sa.text("0"), nullable=False),
        sa.Column("status", ORDER_STATUS, server_default=sa.text("'pending'"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("total_amount >= 0", name="ck_orders_total_amount_non_negative"),
        sa.ForeignKeyConstraint(
            ["customer_id"], ["customers.id"], name="fk_orders_customer_id_customers", ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_orders"),
    )
    op.create_index("ix_orders_customer_id", "orders", ["customer_id"])

    op.create_table(
        "order_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("order_id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("unit_price", sa.Numeric(precision=12, scale=2), nullable=False),
        sa.CheckConstraint("quantity > 0", name="ck_order_items_quantity_positive"),
        sa.CheckConstraint("unit_price > 0", name="ck_order_items_unit_price_positive"),
        sa.ForeignKeyConstraint(
            ["order_id"], ["orders.id"], name="fk_order_items_order_id_orders", ondelete="CASCADE"
        ),
        sa.ForeignKeyConstraint(
            ["product_id"], ["products.id"], name="fk_order_items_product_id_products", ondelete="RESTRICT"
        ),
        sa.PrimaryKeyConstraint("id", name="pk_order_items"),
    )
    op.create_index("ix_order_items_order_id", "order_items", ["order_id"])
    op.create_index("ix_order_items_product_id", "order_items", ["product_id"])


def downgrade() -> None:
    op.drop_table("order_items")
    op.drop_index("ix_orders_customer_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_customers_email", table_name="customers")
    op.drop_table("customers")
    op.drop_index("ix_products_sku", table_name="products")
    op.drop_table("products")
    ORDER_STATUS.drop(op.get_bind(), checkfirst=True)
