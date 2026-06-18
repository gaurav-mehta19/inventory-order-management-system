from decimal import Decimal

from sqlalchemy import CheckConstraint, Numeric, String, text
from sqlalchemy.orm import Mapped, mapped_column

from src.db.base import Base, SoftDeleteMixin, TimestampMixin, UpdatedAtMixin


class Product(Base, TimestampMixin, UpdatedAtMixin, SoftDeleteMixin):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price > 0", name="price_positive"),
        CheckConstraint("quantity_in_stock >= 0", name="quantity_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    quantity_in_stock: Mapped[int] = mapped_column(nullable=False, server_default=text("0"))
