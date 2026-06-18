from typing import Annotated

from fastapi import APIRouter, Query, status

from src.api.dependencies import OrderServiceDep, PaginationDep, SortDep
from src.models.order import OrderStatus
from src.schemas.common import MessageResponse, Page
from src.schemas.order import (
    OrderCreate,
    OrderDetail,
    OrderRead,
    OrderStatusUpdate,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=Page[OrderRead])
def list_orders(
    service: OrderServiceDep,
    pagination: PaginationDep,
    sort: SortDep,
    order_status: Annotated[OrderStatus | None, Query(alias="status")] = None,
    customer_id: Annotated[int | None, Query(ge=1)] = None,
) -> Page[OrderRead]:
    orders, total = service.list(
        pagination=pagination,
        sort=sort,
        status=order_status,
        customer_id=customer_id,
    )
    return Page[OrderRead].build(
        [OrderRead.model_validate(o) for o in orders],
        total_items=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get("/{order_id}", response_model=OrderDetail)
def get_order(order_id: int, service: OrderServiceDep) -> OrderDetail:
    return OrderDetail.model_validate(service.get(order_id))


@router.post("", response_model=OrderDetail, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, service: OrderServiceDep) -> OrderDetail:
    return OrderDetail.model_validate(service.create(payload))


@router.patch("/{order_id}/status", response_model=OrderDetail)
def update_order_status(
    order_id: int, payload: OrderStatusUpdate, service: OrderServiceDep
) -> OrderDetail:
    return OrderDetail.model_validate(service.update_status(order_id, payload.status))


@router.delete("/{order_id}", response_model=MessageResponse)
def cancel_order(order_id: int, service: OrderServiceDep) -> MessageResponse:
    service.cancel(order_id)
    return MessageResponse(message="Order cancelled successfully")
