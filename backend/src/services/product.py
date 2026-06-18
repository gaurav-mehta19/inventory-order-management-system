from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from src.core.logging import get_logger
from src.exceptions import DuplicateSKUException, ProductNotFoundException
from src.models.product import Product
from src.repositories.product import ProductRepository
from src.schemas.product import ProductCreate, ProductUpdate
from src.utils.pagination import PaginationParams, SortParams

logger = get_logger("service.product")


class ProductService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = ProductRepository(session)

    def get(self, product_id: int) -> Product:
        product = self.repository.get(product_id)
        if product is None:
            raise ProductNotFoundException(product_id)
        return product

    def list(
        self,
        *,
        pagination: PaginationParams,
        sort: SortParams,
        search: str | None = None,
        low_stock_threshold: int | None = None,
    ) -> tuple[Sequence[Product], int]:
        return self.repository.search(
            pagination=pagination,
            sort=sort,
            search=search,
            low_stock_threshold=low_stock_threshold,
        )

    def create(self, payload: ProductCreate) -> Product:
        if self.repository.get_by_sku(payload.sku) is not None:
            raise DuplicateSKUException(payload.sku)
        product = Product(
            name=payload.name,
            sku=payload.sku,
            price=payload.price,
            quantity_in_stock=payload.quantity_in_stock,
        )
        self.repository.add(product)
        self.session.commit()
        self.session.refresh(product)
        logger.info("product.created", extra={"product_id": product.id, "sku": product.sku})
        return product

    def update(self, product_id: int, payload: ProductUpdate) -> Product:
        product = self.get(product_id)
        data = payload.model_dump(exclude_unset=True)

        new_sku = data.get("sku")
        if new_sku and new_sku != product.sku:
            existing = self.repository.get_by_sku(new_sku)
            if existing is not None and existing.id != product.id:
                raise DuplicateSKUException(new_sku)

        for field, value in data.items():
            setattr(product, field, value)

        self.session.commit()
        self.session.refresh(product)
        logger.info("product.updated", extra={"product_id": product.id})
        return product

    def replace(self, product_id: int, payload: ProductCreate) -> Product:
        return self.update(product_id, ProductUpdate(**payload.model_dump()))

    def delete(self, product_id: int) -> None:
        product = self.get(product_id)
        product.deleted_at = datetime.now(UTC)
        self.session.commit()
        logger.info("product.archived", extra={"product_id": product_id})
