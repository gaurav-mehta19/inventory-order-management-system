from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from src.core.config import settings
from src.db.session import get_session
from src.services.customer import CustomerService
from src.services.dashboard import DashboardService
from src.services.order import OrderService
from src.services.product import ProductService
from src.utils.pagination import PaginationParams, SortParams

SessionDep = Annotated[Session, Depends(get_session)]


def get_pagination(
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=settings.max_page_size)] = settings.default_page_size,
) -> PaginationParams:
    return PaginationParams(page=page, page_size=page_size)


def get_sort(
    sort_by: Annotated[str, Query(max_length=64)] = "id",
    order: Annotated[str, Query(pattern="^(asc|desc)$")] = "asc",
) -> SortParams:
    return SortParams(sort_by=sort_by, descending=order == "desc")


PaginationDep = Annotated[PaginationParams, Depends(get_pagination)]
SortDep = Annotated[SortParams, Depends(get_sort)]


def get_product_service(session: SessionDep) -> ProductService:
    return ProductService(session)


def get_customer_service(session: SessionDep) -> CustomerService:
    return CustomerService(session)


def get_order_service(session: SessionDep) -> OrderService:
    return OrderService(session)


def get_dashboard_service(session: SessionDep) -> DashboardService:
    return DashboardService(session)


ProductServiceDep = Annotated[ProductService, Depends(get_product_service)]
CustomerServiceDep = Annotated[CustomerService, Depends(get_customer_service)]
OrderServiceDep = Annotated[OrderService, Depends(get_order_service)]
DashboardServiceDep = Annotated[DashboardService, Depends(get_dashboard_service)]
