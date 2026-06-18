import pytest
from sqlalchemy.orm import Session

from src.exceptions import CustomerNotFoundException, DuplicateEmailException
from src.schemas.customer import CustomerCreate, CustomerUpdate
from src.services.customer import CustomerService
from src.utils.pagination import PaginationParams, SortParams


def _payload(email: str = "ada@example.com", **overrides: object) -> CustomerCreate:
    data: dict[str, object] = {"full_name": "Ada Lovelace", "email": email}
    data.update(overrides)
    return CustomerCreate(**data)


def test_create_customer_normalizes_email(db_session: Session) -> None:
    service = CustomerService(db_session)

    customer = service.create(_payload(email="ADA@Example.com", phone="+1 202 555 0100"))

    assert customer.id is not None
    assert customer.email == "ada@example.com"
    assert customer.phone == "+1 202 555 0100"


def test_create_customer_rejects_duplicate_email(db_session: Session) -> None:
    service = CustomerService(db_session)
    service.create(_payload(email="dup@example.com"))

    with pytest.raises(DuplicateEmailException):
        service.create(_payload(email="dup@example.com", full_name="Another"))


def test_get_missing_customer_raises(db_session: Session) -> None:
    with pytest.raises(CustomerNotFoundException):
        CustomerService(db_session).get(404)


def test_update_customer_changes_fields(db_session: Session) -> None:
    service = CustomerService(db_session)
    customer = service.create(_payload(email="up@example.com"))

    updated = service.update(
        customer.id, CustomerUpdate(full_name="Ada L.", phone="+1 700 000 0000")
    )

    assert updated.full_name == "Ada L."
    assert updated.phone == "+1 700 000 0000"


def test_update_to_existing_email_raises(db_session: Session) -> None:
    service = CustomerService(db_session)
    service.create(_payload(email="a@example.com"))
    second = service.create(_payload(email="b@example.com"))

    with pytest.raises(DuplicateEmailException):
        service.update(second.id, CustomerUpdate(email="a@example.com"))


def test_list_supports_search_and_pagination(db_session: Session) -> None:
    service = CustomerService(db_session)
    service.create(_payload(email="grace@example.com", full_name="Grace Hopper"))
    service.create(_payload(email="alan@example.com", full_name="Alan Turing"))

    items, total = service.list(
        pagination=PaginationParams(page=1, page_size=10),
        sort=SortParams(sort_by="full_name", descending=False),
        search="grace",
    )

    assert total == 1
    assert items[0].full_name == "Grace Hopper"


@pytest.mark.parametrize("bad_email", ["not-an-email", "missing@", "@nodomain"])
def test_customer_schema_rejects_invalid_email(bad_email: str) -> None:
    with pytest.raises(ValueError):
        _payload(email=bad_email)


def test_customer_schema_rejects_invalid_phone() -> None:
    with pytest.raises(ValueError):
        _payload(phone="abc")
