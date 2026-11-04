from typing import List, Dict, Any, Optional
from collections import Counter
from datetime import datetime
from fastapi import HTTPException

from src.repositories.workflow_error_repository import WorkflowErrorRepository
from src.core.exceptions import FrameworkException
from src.core.logging import logger


class WorkflowErrorController:
    """
    Controller responsible for fetching, filtering,
    and analyzing workflow error logs from Supabase.
    """

    def __init__(self):
        self.repository = WorkflowErrorRepository()

    def get_errors(
        self,
        limit: int = 200,
        workflow_name: Optional[str] = None,
        failed_node: Optional[str] = None,
        search: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            # Fetch latest logs ordered by created_at descending
            raw_logs = self.repository.find_all(limit=limit, order_by="created_at", desc=True)
            if raw_logs is None:
                raw_logs = []

            # Compute global statistics from all fetched logs
            total_count = len(raw_logs)
            failed_nodes_list = [r.get("failed_node") or "Unspecified Step" for r in raw_logs]
            workflows_list = [r.get("workflow_name") or "Unspecified Workflow" for r in raw_logs]

            node_counter = Counter(failed_nodes_list)
            workflow_counter = Counter(workflows_list)

            top_node, top_node_count = node_counter.most_common(1)[0] if node_counter else ("None", 0)
            top_wf, top_wf_count = workflow_counter.most_common(1)[0] if workflow_counter else ("None", 0)
            latest_time = raw_logs[0].get("created_at") if raw_logs else None

            stats = {
                "totalErrors": total_count,
                "topFailedNode": top_node,
                "topFailedNodeCount": top_node_count,
                "topWorkflow": top_wf,
                "topWorkflowCount": top_wf_count,
                "latestErrorAt": latest_time,
                "availableWorkflows": sorted(list(set(w for w in workflows_list if w))),
                "availableNodes": sorted(list(set(n for n in failed_nodes_list if n))),
            }

            # Apply filters
            filtered_logs = raw_logs

            if workflow_name and workflow_name != "all":
                filtered_logs = [
                    r for r in filtered_logs
                    if (r.get("workflow_name") or "").lower() == workflow_name.lower()
                ]

            if failed_node and failed_node != "all":
                filtered_logs = [
                    r for r in filtered_logs
                    if (r.get("failed_node") or "").lower() == failed_node.lower()
                ]

            if search:
                query = search.strip().lower()
                filtered_logs = [
                    r for r in filtered_logs
                    if query in (r.get("error_message") or "").lower()
                    or query in (r.get("failed_node") or "").lower()
                    or query in (r.get("workflow_name") or "").lower()
                    or query in str(r.get("execution_id") or "").lower()
                    or query in str(r.get("workflow_id") or "").lower()
                ]

            return {
                "total": len(filtered_logs),
                "stats": stats,
                "logs": filtered_logs
            }

        except (HTTPException, FrameworkException):
            raise
        except Exception as error:
            logger.error(f"Failed to fetch workflow error logs: {error}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to fetch workflow error logs: {error}")

    def get_error_by_id(self, error_id: int) -> Dict[str, Any]:
        try:
            log = self.repository.find_by_id(error_id)
            if not log:
                raise HTTPException(status_code=404, detail=f"Workflow error log with ID {error_id} not found.")
            return log
        except HTTPException:
            raise
        except Exception as error:
            logger.error(f"Failed to fetch error log {error_id}: {error}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to fetch error log: {error}")

    def log_test_error(
        self,
        workflow_name: str = "Client Churn & Recommendation Analysis",
        failed_node: str = "Google Sheets Fetch",
        error_message: str = "Simulated connection timeout while fetching client row data",
        execution_id: Optional[str] = None
    ) -> Dict[str, Any]:
        try:
            exec_id = execution_id or f"test_exec_{int(datetime.utcnow().timestamp())}"
            mock_stack = (
                f"Traceback (most recent call last):\n"
                f'  File "/app/src/workflows/churn_analysis.py", line 42, in execute\n'
                f"    context = self.{failed_node.lower().replace(' ', '_')}.execute(context)\n"
                f'  File "/app/src/nodes/{failed_node.lower().replace(" ", "_")}_node.py", line 88, in process\n'
                f"    raise ConnectionError('{error_message}')\n"
                f"ConnectionError: {error_message}\n"
            )

            data = {
                "workflow_name": workflow_name,
                "failed_node": failed_node,
                "error_message": error_message,
                "execution_id": exec_id,
                "workflow_id": "w-101",
                "error_stack": mock_stack,
                "created_at": datetime.utcnow().isoformat(),
            }

            res = self.repository.log_error(data)
            return {
                "success": True,
                "message": "Test workflow error logged successfully",
                "data": res
            }
        except Exception as error:
            logger.error(f"Failed to log test workflow error: {error}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to log test error: {error}")
