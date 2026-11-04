from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from src.api.controllers.clients_controller import ClientsController

router = APIRouter(
    prefix="/api/v1/clients",
    tags=["Clients Management"]
)

controller = ClientsController()

@router.get("", response_model=List[Dict[str, Any]])
def list_clients(
    search: Optional[str] = Query(None),
    riskLevel: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    industry: Optional[str] = Query(None),
    campaign: Optional[str] = Query(None),
):
    return controller.get_all_clients(
        search=search,
        risk_level=riskLevel,
        status=status,
        industry=industry,
        campaign=campaign
    )

@router.get("/{client_id}", response_model=Dict[str, Any])
def get_client(client_id: str):
    return controller.get_client(client_id)

@router.get("/{client_id}/kpis", response_model=List[Dict[str, Any]])
def get_client_kpis(client_id: str):
    return controller.get_client_kpis(client_id)

@router.get("/{client_id}/analysis", response_model=Dict[str, Any])
def get_client_analysis(client_id: str):
    client = controller.get_client(client_id)
    # Return formatted risk details based on AI summary and scores
    return {
        "status": "success",
        "data": {
            "clientId": client_id,
            "churnProbability": client["churnProbability"],
            "healthScore": client["healthScore"],
            "summary": client["metadata"]["summary"],
            "satisfactionScore": client["metadata"]["satisfaction_score"],
            "redFlags": client["tags"],
            "bottlenecks": client["metadata"]["bottlenecks"] or [],
            "actionItems": client["metadata"]["action_items"] or []
        }
    }

@router.get("/{client_id}/history", response_model=List[Dict[str, Any]])
def get_client_history(client_id: str):
    return controller.get_client_history(client_id)