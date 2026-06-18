from datetime import date

from sqlalchemy.orm import Session

from src.repositories.customer import CustomerRepository
from src.repositories.order import OrderRepository
from src.repositories.product import ProductRepository
from src.schemas.dashboard import (
    DashboardSummary,
    OrdersByStatus,
    RevenuePoint,
)
from src.schemas.product import ProductRead

LOW_STOCK_THRESHOLD = 10
LOW_STOCK_PREVIEW_LIMIT = 5
REVENUE_TREND_DAYS = 14


def _format_day(day: date | str) -> str:
    return day.isoformat() if isinstance(day, date) else str(day)


class DashboardService:
    def __init__(self, session: Session) -> None:
        self.products = ProductRepository(session)
        self.customers = CustomerRepository(session)
        self.orders = OrderRepository(session)

    def summary(self) -> DashboardSummary:
        low_stock_products = self.products.list_low_stock(
            LOW_STOCK_THRESHOLD, LOW_STOCK_PREVIEW_LIMIT
        )
        return DashboardSummary(
            total_products=self.products.total_count(),
            total_customers=self.customers.total_count(),
            total_orders=self.orders.total_count(),
            total_revenue=self.orders.total_revenue(),
            low_stock_threshold=LOW_STOCK_THRESHOLD,
            low_stock_count=self.products.count_low_stock(LOW_STOCK_THRESHOLD),
            low_stock_products=[ProductRead.model_validate(p) for p in low_stock_products],
            orders_by_status=[
                OrdersByStatus(status=status, count=count)
                for status, count in self.orders.count_by_status()
            ],
            revenue_trend=[
                RevenuePoint(date=_format_day(day), revenue=revenue, orders=orders)
                for day, revenue, orders in self.orders.revenue_trend(REVENUE_TREND_DAYS)
            ],
        )
