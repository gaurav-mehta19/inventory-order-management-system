from decimal import Decimal

from pydantic import BaseModel

from src.schemas.product import ProductRead


class OrdersByStatus(BaseModel):
    status: str
    count: int


class RevenuePoint(BaseModel):
    date: str
    revenue: Decimal
    orders: int


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_count: int
    low_stock_threshold: int
    low_stock_products: list[ProductRead]
    orders_by_status: list[OrdersByStatus]
    revenue_trend: list[RevenuePoint]
