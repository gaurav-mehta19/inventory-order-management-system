from collections.abc import Sequence
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from src.core.logging import get_logger
from src.exceptions import CustomerNotFoundException, DuplicateEmailException
from src.models.customer import Customer
from src.repositories.customer import CustomerRepository
from src.schemas.customer import CustomerCreate, CustomerUpdate
from src.utils.pagination import PaginationParams, SortParams

logger = get_logger("service.customer")


class CustomerService:
    def __init__(self, session: Session) -> None:
        self.session = session
        self.repository = CustomerRepository(session)

    def get(self, customer_id: int) -> Customer:
        customer = self.repository.get(customer_id)
        if customer is None:
            raise CustomerNotFoundException(customer_id)
        return customer

    def list(
        self,
        *,
        pagination: PaginationParams,
        sort: SortParams,
        search: str | None = None,
    ) -> tuple[Sequence[Customer], int]:
        return self.repository.search(pagination=pagination, sort=sort, search=search)

    def create(self, payload: CustomerCreate) -> Customer:
        if self.repository.get_by_email(payload.email) is not None:
            raise DuplicateEmailException(payload.email)
        customer = Customer(
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
        )
        self.repository.add(customer)
        self.session.commit()
        self.session.refresh(customer)
        logger.info("customer.created", extra={"customer_id": customer.id})
        return customer

    def update(self, customer_id: int, payload: CustomerUpdate) -> Customer:
        customer = self.get(customer_id)
        data = payload.model_dump(exclude_unset=True)

        new_email = data.get("email")
        if new_email and new_email != customer.email:
            existing = self.repository.get_by_email(new_email)
            if existing is not None and existing.id != customer.id:
                raise DuplicateEmailException(new_email)

        for field, value in data.items():
            setattr(customer, field, value)

        self.session.commit()
        self.session.refresh(customer)
        logger.info("customer.updated", extra={"customer_id": customer.id})
        return customer

    def delete(self, customer_id: int) -> None:
        customer = self.get(customer_id)
        customer.deleted_at = datetime.now(UTC)
        self.session.commit()
        logger.info("customer.archived", extra={"customer_id": customer_id})
