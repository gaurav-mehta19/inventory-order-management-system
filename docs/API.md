# API Reference

Base URL: `/api/v1` · Interactive docs: `/docs` (Swagger) and `/redoc`.

## Conventions

- **Success** responses return the resource (or a `{ items, meta }` page) directly.
- **Errors** always use the envelope below. `details` is included only when the error carries
  structured context (e.g. the offending field, SKU, or stock numbers) and is omitted otherwise:

  ```json
  { "success": false, "message": "Human readable", "error_code": "STABLE_CODE", "details": { } }
  ```

- **Pagination / sorting** query params (list endpoints): `page` (≥1), `page_size` (1–100),
  `sort_by`, `order` (`asc`|`desc`), and `search`.
- **Deletes are soft** for products and customers: `DELETE` archives the record (sets `deleted_at`)
  and returns `200` with a confirmation message. Archived records disappear from list/detail/search
  and cannot be used in new orders, but remain visible inside the historical orders that reference
  them.
- Every response carries an `X-Request-ID` header for tracing.

### Error codes

| Code                     | HTTP | Meaning                              |
| ------------------------ | ---- | ------------------------------------ |
| `VALIDATION_ERROR`       | 422  | Payload failed validation            |
| `PRODUCT_NOT_FOUND`      | 404  | Unknown product                      |
| `CUSTOMER_NOT_FOUND`     | 404  | Unknown customer                     |
| `ORDER_NOT_FOUND`        | 404  | Unknown order                        |
| `DUPLICATE_SKU`          | 409  | SKU already exists                   |
| `DUPLICATE_EMAIL`        | 409  | Email already exists                 |
| `INSUFFICIENT_INVENTORY` | 409  | Not enough stock to fulfil the order |
| `INTERNAL_SERVER_ERROR`  | 500  | Unexpected error                     |

---

## Products

### Create

```http
POST /api/v1/products
Content-Type: application/json

{ "name": "Mechanical Keyboard", "sku": "KBD-MX-87", "price": "139.00", "quantity_in_stock": 54 }
```

```json
201 Created
{
  "id": 3,
  "name": "Mechanical Keyboard",
  "sku": "KBD-MX-87",
  "price": "139.00",
  "quantity_in_stock": 54,
  "created_at": "2026-06-18T10:00:00Z",
  "updated_at": "2026-06-18T10:00:00Z"
}
```

### List (paginated)

```http
GET /api/v1/products?page=1&page_size=20&sort_by=price&order=desc&search=keyboard
```

```json
{
  "items": [ /* ProductRead[] */ ],
  "meta": { "page": 1, "page_size": 20, "total_items": 42, "total_pages": 3 }
}
```

Other product routes: `GET /products/{id}`, `PUT /products/{id}`, `PATCH /products/{id}`,
`DELETE /products/{id}`.

### Update

`PATCH /products/{id}` applies a partial update (send only the fields you want to change).
`PUT /products/{id}` replaces the product and requires the full set of fields (`name`, `sku`,
`price`, `quantity_in_stock`), same validation as create. Both return `200 OK` with the product.

### Delete (soft / archive)

```http
DELETE /api/v1/products/3
```

```json
200 OK
{ "success": true, "message": "Product archived successfully" }
```

---

## Customers

```http
POST /api/v1/customers
{ "full_name": "Ada Lovelace", "email": "ada@example.com", "phone": "+1 202 555 0100" }
```

Duplicate email →

```json
409 Conflict
{
  "success": false,
  "message": "A customer with email 'ada@example.com' already exists",
  "error_code": "DUPLICATE_EMAIL",
  "details": { "email": "ada@example.com" }
}
```

Other customer routes: `GET /customers` (paginated, supports `search`), `GET /customers/{id}`,
`PATCH /customers/{id}`, `DELETE /customers/{id}`.

---

## Orders

### Create (atomic)

```http
POST /api/v1/orders
{
  "customer_id": 1,
  "items": [
    { "product_id": 3, "quantity": 2 },
    { "product_id": 5, "quantity": 1 }
  ]
}
```

```json
201 Created
{
  "id": 10,
  "customer_id": 1,
  "total_amount": "337.00",
  "status": "pending",
  "created_at": "2026-06-18T10:05:00Z",
  "items": [
    { "id": 1, "product_id": 3, "quantity": 2, "unit_price": "139.00", "line_total": "278.00", "product": { } },
    { "id": 2, "product_id": 5, "quantity": 1, "unit_price": "59.00", "line_total": "59.00", "product": { } }
  ],
  "customer": { "id": 1, "full_name": "Ada Lovelace", "email": "ada@example.com", "phone": null, "created_at": "…" }
}
```

Insufficient stock (nothing is persisted) →

```json
409 Conflict
{
  "success": false,
  "message": "Insufficient stock for product 5: requested 1, available 0",
  "error_code": "INSUFFICIENT_INVENTORY",
  "details": { "product_id": 5, "requested": 1, "available": 0 }
}
```

### List / filter

```http
GET /api/v1/orders?status=shipped&page=1&page_size=20&sort_by=created_at&order=desc
```

### Get one (detail)

```http
GET /api/v1/orders/10
```

Returns the order with its `items` (each including the nested `product`) and the full `customer`.

### Update status

```http
PATCH /api/v1/orders/10/status
{ "status": "shipped" }
```

### Cancel (restores stock)

```http
DELETE /api/v1/orders/10
```

```json
200 OK
{ "success": true, "message": "Order cancelled successfully" }
```

Cancelling sets the order's status to `cancelled` and returns each item's quantity to product
stock, preserving the order record for history. Cancelling an already-cancelled order returns a
`422` validation error.

---

## Dashboard

```http
GET /api/v1/dashboard/summary
```

```json
{
  "total_products": 8,
  "total_customers": 4,
  "total_orders": 12,
  "total_revenue": "4210.00",
  "low_stock_count": 3,
  "low_stock_threshold": 10,
  "low_stock_products": [ /* ProductRead[] */ ],
  "orders_by_status": [ { "status": "pending", "count": 5 } ],
  "revenue_trend": [ { "date": "2026-06-12", "revenue": "320.00", "orders": 2 } ]
}
```

---

## Health

| Endpoint        | Purpose                          |
| --------------- | -------------------------------- |
| `GET /health`       | Liveness (process is up)     |
| `GET /health/ready` | Readiness (DB reachable)     |
