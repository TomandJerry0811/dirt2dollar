from src.workflows.input_pipeline_orchestrator import InputPipelineOrchestrator
from src.workflows.summary_workflow import SummaryWorkflow
from src.workflows.kpi_workflow import KPIWorkflow
from src.workflows.rag_workflow import RAGWorkflow
from src.workflows.churn_analysis_and_recommendation_generation_workflow import ChurnWorkflow

from src.utils.workflow_error_logger import WorkflowErrorLogger
from src.core.logging import logger


class AIWorkflowOrchestrator:
    """
    Orchestrates the full AI workflow:

    1. Input pipeline
    2. Summary workflow
    3. KPI workflow
    4. RAG workflow
    5. Churn workflow
    """

    def __init__(self):
        self.input_pipeline = InputPipelineOrchestrator()
        self.summary_workflow = SummaryWorkflow()
        self.kpi_workflow = KPIWorkflow()
        self.rag_workflow = RAGWorkflow()
        self.churn_workflow = ChurnWorkflow()

        self.error_logger = WorkflowErrorLogger()

    def run(self, user_query):
        context = None

        try:
            # Step 1: build initial context via input pipeline
            context = self.input_pipeline.run(user_query)

            # Add a high-level metadata tag (optional)
            context.metadata.setdefault("source_workflow_type", "ai_orchestrator")

            # Step 2: summary workflow
            context = self.summary_workflow.execute(context)

            # Step 3: KPI workflow
            context = self.kpi_workflow.execute(context)

            # Step 4: RAG workflow
            context = self.rag_workflow.execute(context)

            # Step 5: Churn workflow
            context = self.churn_workflow.execute(context)

            return context

        except Exception as exc:
            metadata = getattr(context, "metadata", {}) if context is not None else {}
            execution_id = metadata.get("execution_id")

            try:
                # Orchestration-level error log
                self.error_logger.log(
                    workflow_name="AIWorkflowOrchestrator",
                    workflow_id=metadata.get("workflow_id"),
                    execution_id=execution_id,
                    execution_url=metadata.get("execution_url"),
                    retry_of=metadata.get("retry_of"),
                    mode=metadata.get("mode"),
                    node_name=None,  # not a specific node here
                    exc=exc,
                    severity="error",
                    client_id=metadata.get("client_id"),
                    client_name=metadata.get("client_name"),
                    run_id=metadata.get("run_id"),
                    parent_run_id=metadata.get("parent_run_id"),
                    root_run_id=metadata.get("root_run_id"),
                    source_workflow_type=metadata.get("source_workflow_type", "ai_orchestrator"),
                    environment=metadata.get("environment", "production"),
                    execution_payload={
                        "metadata": metadata,
                        "user_query": user_query,
                    },
                )
            except Exception as log_error:
                logger.error(f"Failed to log orchestrator-level error to DB: {log_error}")

            # Re-raise to let FastAPI / caller handle the HTTP response
            raise