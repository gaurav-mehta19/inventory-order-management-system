from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from src.core.config import settings

engine = create_engine(
    str(settings.database_url),
    echo=settings.database_echo,
    future=True,
)

SessionFactory = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
    class_=Session,
)


def get_session() -> Iterator[Session]:
    session = SessionFactory()
    try:
        yield session
    finally:
        session.close()
