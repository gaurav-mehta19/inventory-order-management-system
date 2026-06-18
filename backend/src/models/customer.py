from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base, SoftDeleteMixin, TimestampMixin
from src.models.order import Order


class Customer(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)

    orders: Mapped[list[Order]] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan",
    )
