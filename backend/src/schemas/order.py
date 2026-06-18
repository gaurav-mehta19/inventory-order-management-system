from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from src.models.order import OrderStatus
from src.schemas.common import ORMModel
from src.schemas.customer import CustomerRead
from src.schemas.product import ProductRead


class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(gt=0, le=100_000)


class OrderCreate(BaseModel):
    customer_id: int = Field(gt=0)
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderItemRead(ORMModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    product: ProductRead | None = None


class OrderRead(ORMModel):
    id: int
    customer_id: int
    total_amount: Decimal
    status: OrderStatus
    created_at: datetime
    items: list[OrderItemRead]


class OrderDetail(OrderRead):
    customer: CustomerRead
