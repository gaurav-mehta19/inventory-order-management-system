from fastapi import APIRouter

from src.api.controllers import customers, dashboard, orders, products

api_router = APIRouter()
api_router.include_router(dashboard.router)
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(orders.router)
