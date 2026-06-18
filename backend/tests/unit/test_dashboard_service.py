from decimal import Decimal

from sqlalchemy.orm import Session

from src.models.order import OrderStatus
from src.schemas.customer import CustomerCreate
from src.schemas.order import OrderCreate, OrderItemCreate
from src.schemas.product import ProductCreate
from src.services.customer import CustomerService
from src.services.dashboard import DashboardService
from src.services.order import OrderService
from src.services.product import ProductService


def _seed(db_session: Session) -> int:
    products = ProductService(db_session)
    customers = CustomerService(db_session)
    orders = OrderService(db_session)

    cheap = products.create(
        ProductCreate(name="Low", sku="LOW-1", price=Decimal("5.00"), quantity_in_stock=2)
    )
    products.create(
        ProductCreate(name="Plenty", sku="HIGH-1", price=Decimal("20.00"), quantity_in_stock=500)
    )
    customer = customers.create(CustomerCreate(full_name="Buyer", email="buyer@example.com"))
    orders.create(
        OrderCreate(
            customer_id=customer.id, items=[OrderItemCreate(product_id=cheap.id, quantity=1)]
        )
    )
    return cheap.id


def test_summary_aggregates_totals(db_session: Session) -> None:
    _seed(db_session)

    summary = DashboardService(db_session).summary()

    assert summary.total_products == 2
    assert summary.total_customers == 1
    assert summary.total_orders == 1
    assert summary.total_revenue == Decimal("5.00")
    assert summary.low_stock_count == 1
    assert summary.low_stock_threshold == 10
    assert summary.low_stock_products[0].sku == "LOW-1"


def test_summary_counts_orders_by_status_and_trend(db_session: Session) -> None:
    _seed(db_session)

    summary = DashboardService(db_session).summary()

    statuses = {row.status: row.count for row in summary.orders_by_status}
    assert statuses == {OrderStatus.PENDING.value: 1}
    assert len(summary.revenue_trend) == 1
    assert summary.revenue_trend[0].revenue == Decimal("5.00")
    assert summary.revenue_trend[0].orders == 1


def test_summary_excludes_soft_deleted_products(db_session: Session) -> None:
    product_id = _seed(db_session)
    ProductService(db_session).delete(product_id)

    summary = DashboardService(db_session).summary()

    assert summary.total_products == 1
    assert summary.low_stock_count == 0
    assert summary.low_stock_products == []
