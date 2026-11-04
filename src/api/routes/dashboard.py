from fastapi import APIRouter, Query
from typing import List, Dict, Any
from src.api.controllers.dashboard_controller import DashboardController

router = APIRouter(
    prefix="/api/v1/dashboard",
    tags=["Dashboard Aggregations"]
)

controller = DashboardController()

@router.get("/metrics", response_model=Dict[str, Any])
def get_metrics():
    return controller.get_metrics()

@router.get("/alerts", response_model=List[Dict[str, Any]])
def get_alerts():
    return controller.get_alerts()

@router.get("/activity", response_model=List[Dict[str, Any]])
def get_recent_activity():
    return controller.get_recent_activity()

@router.get("/churn-risk", response_model=List[Dict[str, Any]])
def get_churn_risk_chart():
    return controller.get_churn_risk_chart()

@router.get("/churn-trend", response_model=List[Dict[str, Any]])
def get_churn_trend():
    return controller.get_churn_trend()

@router.get("/health-distribution", response_model=List[Dict[str, Any]])
def get_health_distribution():
    return controller.get_health_distribution()

@router.get("/revenue", response_model=List[Dict[str, Any]])
def get_revenue_chart(period: str = Query("12m")):
    return controller.get_revenue_chart(period)

@router.get("/token-consumption", response_model=Dict[str, Any])
def get_token_consumption():
    return controller.get_token_consumption()

