from typing import Annotated

from fastapi import APIRouter, Query, status

from src.api.dependencies import CustomerServiceDep, PaginationDep, SortDep
from src.schemas.common import MessageResponse, Page
from src.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=Page[CustomerRead])
def list_customers(
    service: CustomerServiceDep,
    pagination: PaginationDep,
    sort: SortDep,
    search: Annotated[str | None, Query(max_length=255)] = None,
) -> Page[CustomerRead]:
    customers, total = service.list(pagination=pagination, sort=sort, search=search)
    return Page[CustomerRead].build(
        [CustomerRead.model_validate(c) for c in customers],
        total_items=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: int, service: CustomerServiceDep) -> CustomerRead:
    return CustomerRead.model_validate(service.get(customer_id))


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, service: CustomerServiceDep) -> CustomerRead:
    return CustomerRead.model_validate(service.create(payload))


@router.patch("/{customer_id}", response_model=CustomerRead)
def update_customer(
    customer_id: int, payload: CustomerUpdate, service: CustomerServiceDep
) -> CustomerRead:
    return CustomerRead.model_validate(service.update(customer_id, payload))


@router.delete("/{customer_id}", response_model=MessageResponse)
def delete_customer(customer_id: int, service: CustomerServiceDep) -> MessageResponse:
    service.delete(customer_id)
    return MessageResponse(message="Customer archived successfully")
