from fastapi import APIRouter, Query, Body
from typing import List, Dict, Any
from src.api.controllers.recommendations_controller import RecommendationsController

router = APIRouter(
    prefix="/api/v1/recommendations",
    tags=["Recommendations Management"]
)

controller = RecommendationsController()

@router.get("", response_model=List[Dict[str, Any]])
def list_recommendations(clientId: str = Query(None)):
    return controller.get_recommendations(clientId)

@router.get("/summary", response_model=Dict[str, Any])
def get_summary():
    return controller.get_summary()

@router.post("/generate", response_model=List[Dict[str, Any]])
def generate_recommendations(data: Dict[str, Any] = Body(default={})):
    clientId = data.get("clientId")
    return controller.generate_recommendations(clientId)

@router.post("/{rec_id}/dismiss", response_model=Dict[str, Any])
def dismiss_recommendation(rec_id: str, data: Dict[str, Any] = Body(default={})):
    return {"success": True, "message": f"Recommendation {rec_id} dismissed."}

@router.post("/{rec_id}/complete", response_model=Dict[str, Any])
def complete_recommendation(rec_id: str, data: Dict[str, Any] = Body(default={})):
    return {"success": True, "message": f"Recommendation {rec_id} marked complete."}
