from __future__ import annotations

import enum
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Enum, ForeignKey, Numeric, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base, TimestampMixin

if TYPE_CHECKING:
    from src.models.customer import Customer
    from src.models.order_item import OrderItem


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    __table_args__ = (CheckConstraint("total_amount >= 0", name="total_amount_non_negative"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(14, 2), nullable=False, server_default=text("0")
    )
    status: Mapped[OrderStatus] = mapped_column(
        Enum(
            OrderStatus,
            name="order_status",
            values_callable=lambda enum_cls: [e.value for e in enum_cls],
        ),
        nullable=False,
        server_default=text(f"'{OrderStatus.PENDING.value}'"),
    )

    customer: Mapped[Customer] = relationship(back_populates="orders")
    items: Mapped[list[OrderItem]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="OrderItem.id",
    )
