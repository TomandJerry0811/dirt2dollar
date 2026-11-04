from fastapi import APIRouter, Body, Response
from typing import List, Dict, Any
from src.api.controllers.reports_controller import ReportsController

router = APIRouter(
    prefix="/api/v1/reports",
    tags=["Reports Service"]
)

controller = ReportsController()

@router.get("", response_model=List[Dict[str, Any]])
def get_reports():
    return controller.get_reports()

@router.get("/{report_id}", response_model=Dict[str, Any])
def get_report(report_id: str):
    return controller.get_report(report_id)

@router.post("", response_model=Dict[str, Any])
def generate_report(config: Dict[str, Any] = Body(...)):
    return controller.generate_report(config)

@router.get("/{report_id}/download")
def download_report(report_id: str):
    content = controller.get_report_content(report_id)
    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition": f"attachment; filename=report-{report_id}.txt"
        }
    )
