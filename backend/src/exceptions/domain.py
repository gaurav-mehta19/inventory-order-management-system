from typing import Any


class DomainException(Exception):
    status_code: int = 400
    error_code: str = "DOMAIN_ERROR"

    def __init__(
        self,
        message: str,
        *,
        error_code: str | None = None,
        status_code: int | None = None,
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        if error_code is not None:
            self.error_code = error_code
        if status_code is not None:
            self.status_code = status_code
        self.details = details


class NotFoundException(DomainException):
    status_code = 404
    error_code = "NOT_FOUND"


class ConflictException(DomainException):
    status_code = 409
    error_code = "CONFLICT"


class ValidationException(DomainException):
    status_code = 422
    error_code = "VALIDATION_ERROR"


class ProductNotFoundException(NotFoundException):
    error_code = "PRODUCT_NOT_FOUND"

    def __init__(self, identifier: int | str) -> None:
        super().__init__(f"Product '{identifier}' not found", details={"identifier": identifier})


class CustomerNotFoundException(NotFoundException):
    error_code = "CUSTOMER_NOT_FOUND"

    def __init__(self, identifier: int | str) -> None:
        super().__init__(f"Customer '{identifier}' not found", details={"identifier": identifier})


class OrderNotFoundException(NotFoundException):
    error_code = "ORDER_NOT_FOUND"

    def __init__(self, identifier: int | str) -> None:
        super().__init__(f"Order '{identifier}' not found", details={"identifier": identifier})


class DuplicateSKUException(ConflictException):
    error_code = "DUPLICATE_SKU"

    def __init__(self, sku: str) -> None:
        super().__init__(f"A product with SKU '{sku}' already exists", details={"sku": sku})


class DuplicateEmailException(ConflictException):
    error_code = "DUPLICATE_EMAIL"

    def __init__(self, email: str) -> None:
        super().__init__(
            f"A customer with email '{email}' already exists", details={"email": email}
        )


class InsufficientInventoryException(DomainException):
    status_code = 409
    error_code = "INSUFFICIENT_INVENTORY"

    def __init__(self, product_id: int, requested: int, available: int) -> None:
        super().__init__(
            f"Insufficient stock for product {product_id}: "
            f"requested {requested}, available {available}",
            details={
                "product_id": product_id,
                "requested": requested,
                "available": available,
            },
        )
