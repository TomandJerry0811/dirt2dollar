from abc import abstractmethod
from typing import List

from src.base.base_node import BaseNode
from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.domain.enums.status_enum import WorkflowStatus


from src.utils.workflow_error_logger import WorkflowErrorLogger
from src.core.logging import logger


class BaseWorkflow:
    """
    Base class for all workflows.

    Handles orchestration of services (nodes) and logs
    any errors to workflow_error_logs via WorkflowErrorLogger.
    """

    def __init__(self, workflow_name: str):
        self.workflow_name = workflow_name
        self.services = []
        self.error_logger = WorkflowErrorLogger()
        self.build_workflow()

    def build_workflow(self):
        """
        Implemented by subclasses to add services (nodes).
        """
        raise NotImplementedError

    def add_service(self, service):
        self.services.append(service)

    def execute(self, context):
        """
        Executes each service in sequence.
        Any exception in a service is logged and re-raised.
        """
        for service in self.services:
            try:
                context = service.execute(context)
            except Exception as exc:
                metadata = getattr(context, "metadata", {}) if context is not None else {}

                execution_id = metadata.get("execution_id")
                client_id = metadata.get("client_id")
                client_name = metadata.get("client_name")
                run_id = metadata.get("run_id")
                parent_run_id = metadata.get("parent_run_id")
                root_run_id = metadata.get("root_run_id")
                source_workflow_type = metadata.get("source_workflow_type")
                environment = metadata.get("environment", "production")

                node_name = service.__class__.__name__

                # The error-logging call itself must never be allowed to
                # mask the original exception. If logging fails for any
                # reason (e.g. the DB is the thing that's down), we log
                # that failure locally and still raise the real error.
                try:
                    self.error_logger.log(
                        workflow_name=self.workflow_name,
                        workflow_id=metadata.get("workflow_id"),
                        execution_id=execution_id,
                        execution_url=metadata.get("execution_url"),
                        retry_of=metadata.get("retry_of"),
                        mode=metadata.get("mode"),
                        node_name=node_name,
                        exc=exc,
                        severity="error",
                        client_id=client_id,
                        client_name=client_name,
                        run_id=run_id,
                        parent_run_id=parent_run_id,
                        root_run_id=root_run_id,
                        source_workflow_type=source_workflow_type,
                        environment=environment,
                        execution_payload={"metadata": metadata},
                        workflow_payload={"workflow_name": self.workflow_name},
                    )
                except Exception as log_error:
                    logger.error(
                        f"Failed to log workflow error for node '{node_name}' "
                        f"in workflow '{self.workflow_name}': {log_error}"
                    )

                # Let the caller (AIWorkflowOrchestrator) also see the error
                raise

        return context