from typing import Annotated

from fastapi import APIRouter, Query, status

from src.api.dependencies import PaginationDep, ProductServiceDep, SortDep
from src.schemas.common import MessageResponse, Page
from src.schemas.product import ProductCreate, ProductRead, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=Page[ProductRead])
def list_products(
    service: ProductServiceDep,
    pagination: PaginationDep,
    sort: SortDep,
    search: Annotated[str | None, Query(max_length=255)] = None,
    low_stock_threshold: Annotated[int | None, Query(ge=0)] = None,
) -> Page[ProductRead]:
    products, total = service.list(
        pagination=pagination,
        sort=sort,
        search=search,
        low_stock_threshold=low_stock_threshold,
    )
    return Page[ProductRead].build(
        [ProductRead.model_validate(p) for p in products],
        total_items=total,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, service: ProductServiceDep) -> ProductRead:
    return ProductRead.model_validate(service.get(product_id))


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, service: ProductServiceDep) -> ProductRead:
    return ProductRead.model_validate(service.create(payload))


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int, payload: ProductUpdate, service: ProductServiceDep
) -> ProductRead:
    return ProductRead.model_validate(service.update(product_id, payload))


@router.put("/{product_id}", response_model=ProductRead)
def replace_product(
    product_id: int, payload: ProductCreate, service: ProductServiceDep
) -> ProductRead:
    return ProductRead.model_validate(service.replace(product_id, payload))


@router.delete("/{product_id}", response_model=MessageResponse)
def delete_product(product_id: int, service: ProductServiceDep) -> MessageResponse:
    service.delete(product_id)
    return MessageResponse(message="Product archived successfully")
