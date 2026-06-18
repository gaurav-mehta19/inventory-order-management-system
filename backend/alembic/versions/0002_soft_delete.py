"""soft delete for products and customers

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-18 00:00:00

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002"
down_revision: str | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "customers",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_products_deleted_at", "products", ["deleted_at"])
    op.create_index("ix_customers_deleted_at", "customers", ["deleted_at"])


def downgrade() -> None:
    op.drop_index("ix_customers_deleted_at", table_name="customers")
    op.drop_index("ix_products_deleted_at", table_name="products")
    op.drop_column("customers", "deleted_at")
    op.drop_column("products", "deleted_at")
