from fastapi import APIRouter

from src.api.dependencies import DashboardServiceDep
from src.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(service: DashboardServiceDep) -> DashboardSummary:
    return service.summary()
