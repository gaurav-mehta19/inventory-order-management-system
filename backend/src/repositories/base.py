from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select

from src.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get(self, entity_id: int) -> ModelT | None:
        return self.session.get(self.model, entity_id)

    def add(self, entity: ModelT) -> ModelT:
        self.session.add(entity)
        self.session.flush()
        return entity

    def list(self, statement: Select[tuple[ModelT]]) -> Sequence[ModelT]:
        return self.session.execute(statement).scalars().all()

    def count(self, statement: Select[tuple[ModelT]]) -> int:
        count_stmt = select(func.count()).select_from(statement.order_by(None).subquery())
        return self.session.execute(count_stmt).scalar_one()

    def base_statement(self) -> Select[tuple[ModelT]]:
        return select(self.model)
