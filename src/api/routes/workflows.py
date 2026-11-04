from fastapi import APIRouter, Body
from typing import List, Dict, Any
from src.api.controllers.workflows_controller import WorkflowsController

router = APIRouter(
    prefix="/api/v1/workflows",
    tags=["Workflow Monitor"]
)

controller = WorkflowsController()

@router.get("", response_model=List[Dict[str, Any]])
def get_workflows():
    return controller.get_workflows()

@router.get("/stats", response_model=Dict[str, Any])
def get_stats():
    return controller.get_stats()

@router.get("/executions", response_model=List[Dict[str, Any]])
def get_executions():
    return controller.get_executions()

@router.get("/executions/{exec_id}/logs", response_model=List[Dict[str, Any]])
def get_execution_logs(exec_id: str):
    return controller.get_execution_logs(exec_id)

@router.post("/{workflow_id}/execute", response_model=Dict[str, Any])
def execute_workflow(workflow_id: str, data: Dict[str, Any] = Body(default={})):
    return controller.execute_workflow(workflow_id, data)

from src.api.controllers.workflow_error_controller import WorkflowErrorController
error_controller = WorkflowErrorController()

@router.get("/errors", response_model=Dict[str, Any])
def get_workflow_errors(
    limit: int = 200,
    workflow_name: str = None,
    failed_node: str = None,
    search: str = None
):
    return error_controller.get_errors(
        limit=limit,
        workflow_name=workflow_name,
        failed_node=failed_node,
        search=search
    )

@router.get("/errors/{error_id}", response_model=Dict[str, Any])
def get_workflow_error_detail(error_id: int):
    return error_controller.get_error_by_id(error_id)

@router.post("/errors/test", response_model=Dict[str, Any])
def create_test_workflow_error(payload: Dict[str, Any] = Body(default={})):
    return error_controller.log_test_error(
        workflow_name=payload.get("workflow_name", "Client Churn & Recommendation Analysis"),
        failed_node=payload.get("failed_node", "Google Sheets Fetch"),
        error_message=payload.get("error_message", "Simulated connection timeout while fetching client row data"),
        execution_id=payload.get("execution_id")
    )
