from decimal import Decimal

import pytest
from sqlalchemy.orm import Session

from src.exceptions import DuplicateSKUException, ProductNotFoundException
from src.schemas.product import ProductCreate, ProductUpdate
from src.services.product import ProductService
from src.utils.pagination import PaginationParams, SortParams


def _payload(sku: str = "SKU-001", **overrides: object) -> ProductCreate:
    data: dict[str, object] = {
        "name": "Mechanical Keyboard",
        "sku": sku,
        "price": Decimal("129.99"),
        "quantity_in_stock": 25,
    }
    data.update(overrides)
    return ProductCreate(**data)


def test_create_product_persists_and_normalizes_sku(product_service: ProductService) -> None:
    product = product_service.create(_payload(sku="kbd-100"))

    assert product.id is not None
    assert product.sku == "KBD-100"
    assert product.price == Decimal("129.99")


def test_create_product_rejects_duplicate_sku(product_service: ProductService) -> None:
    product_service.create(_payload(sku="dup-1"))

    with pytest.raises(DuplicateSKUException):
        product_service.create(_payload(sku="dup-1", name="Another"))


def test_get_missing_product_raises(product_service: ProductService) -> None:
    with pytest.raises(ProductNotFoundException):
        product_service.get(9999)


def test_update_product_changes_fields(product_service: ProductService) -> None:
    product = product_service.create(_payload(sku="up-1"))

    updated = product_service.update(
        product.id, ProductUpdate(price=Decimal("99.00"), quantity_in_stock=5)
    )

    assert updated.price == Decimal("99.00")
    assert updated.quantity_in_stock == 5


def test_update_to_existing_sku_raises(product_service: ProductService) -> None:
    product_service.create(_payload(sku="a-1"))
    second = product_service.create(_payload(sku="b-1"))

    with pytest.raises(DuplicateSKUException):
        product_service.update(second.id, ProductUpdate(sku="a-1"))


def test_replace_product_overwrites_all_fields(product_service: ProductService) -> None:
    product = product_service.create(_payload(sku="rep-1", name="Original"))

    replaced = product_service.replace(
        product.id,
        _payload(sku="rep-2", name="Replaced", quantity_in_stock=7),
    )

    assert replaced.id == product.id
    assert replaced.name == "Replaced"
    assert replaced.sku == "REP-2"
    assert replaced.quantity_in_stock == 7


def test_replace_product_rejects_duplicate_sku(product_service: ProductService) -> None:
    product_service.create(_payload(sku="rep-a"))
    second = product_service.create(_payload(sku="rep-b"))

    with pytest.raises(DuplicateSKUException):
        product_service.replace(second.id, _payload(sku="rep-a"))


def test_delete_product_removes_it(product_service: ProductService) -> None:
    product = product_service.create(_payload(sku="del-1"))

    product_service.delete(product.id)

    with pytest.raises(ProductNotFoundException):
        product_service.get(product.id)


def test_list_supports_search_and_pagination(
    product_service: ProductService, db_session: Session
) -> None:
    for index in range(5):
        product_service.create(_payload(sku=f"list-{index}", name=f"Widget {index}"))

    items, total = product_service.list(
        pagination=PaginationParams(page=1, page_size=2),
        sort=SortParams(sort_by="sku", descending=False),
        search="widget",
    )

    assert total == 5
    assert len(items) == 2


@pytest.mark.parametrize("invalid_price", [Decimal("0"), Decimal("-1")])
def test_product_schema_rejects_non_positive_price(invalid_price: Decimal) -> None:
    with pytest.raises(ValueError):
        _payload(price=invalid_price)


def test_product_schema_rejects_negative_quantity() -> None:
    with pytest.raises(ValueError):
        _payload(quantity_in_stock=-3)
