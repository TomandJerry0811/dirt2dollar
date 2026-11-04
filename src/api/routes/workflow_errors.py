from typing import Optional, Dict, Any
from fastapi import APIRouter, Query, Body
from src.api.controllers.workflow_error_controller import WorkflowErrorController

router = APIRouter(
    prefix="/api/v1/error-logs",
    tags=["Workflow Errors Logging"]
)

controller = WorkflowErrorController()


@router.get("", response_model=Dict[str, Any])
def get_workflow_errors(
    limit: int = Query(200, ge=1, le=500),
    workflow_name: Optional[str] = Query(None),
    failed_node: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
):
    """
    Retrieve workflow error logs from Supabase with optional search and filters.
    """
    return controller.get_errors(
        limit=limit,
        workflow_name=workflow_name,
        failed_node=failed_node,
        search=search,
    )


@router.get("/{error_id}", response_model=Dict[str, Any])
def get_workflow_error_by_id(error_id: int):
    """
    Retrieve single error log details including full traceback.
    """
    return controller.get_error_by_id(error_id)


@router.post("/test", response_model=Dict[str, Any])
def create_test_error(payload: Dict[str, Any] = Body(default={})):
    """
    Trigger a test error log entry to verify Supabase table integration.
    """
    return controller.log_test_error(
        workflow_name=payload.get("workflow_name", "Client Churn & Recommendation Analysis"),
        failed_node=payload.get("failed_node", "Google Sheets Fetch"),
        error_message=payload.get("error_message", "Simulated connection timeout while fetching client row data"),
        execution_id=payload.get("execution_id")
    )
