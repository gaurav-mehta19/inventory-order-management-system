from collections.abc import Sequence

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.sql import Select

from src.models.customer import Customer
from src.repositories.base import BaseRepository
from src.utils.pagination import PaginationParams, SortParams

SORTABLE_FIELDS = {
    "id": Customer.id,
    "full_name": Customer.full_name,
    "email": Customer.email,
    "created_at": Customer.created_at,
}


class CustomerRepository(BaseRepository[Customer]):
    model = Customer

    def base_statement(self) -> Select[tuple[Customer]]:
        return select(Customer).where(Customer.deleted_at.is_(None))

    def get(self, entity_id: int) -> Customer | None:
        return self.session.execute(
            self.base_statement().where(Customer.id == entity_id)
        ).scalar_one_or_none()

    def get_by_email(self, email: str) -> Customer | None:
        return self.session.execute(
            select(Customer).where(Customer.email == email)
        ).scalar_one_or_none()

    def search(
        self,
        *,
        pagination: PaginationParams,
        sort: SortParams,
        search: str | None = None,
    ) -> tuple[Sequence[Customer], int]:
        statement = self.base_statement()
        if search:
            pattern = f"%{search.lower()}%"
            statement = statement.where(
                or_(
                    func.lower(Customer.full_name).like(pattern),
                    func.lower(Customer.email).like(pattern),
                )
            )
        total = self.count(statement)
        column = SORTABLE_FIELDS.get(sort.sort_by, Customer.id)
        ordering = desc(column) if sort.descending else asc(column)
        statement = statement.order_by(ordering).offset(pagination.offset).limit(pagination.limit)
        return self.list(statement), total

    def total_count(self) -> int:
        return self.count(self.base_statement())
