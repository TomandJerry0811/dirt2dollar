from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.client_name_extraction_node import ClientNameExtractionNode
from src.nodes.client_data_retrieval_node import ClientDataRetrievalNode
from src.nodes.updates_data_node import UpdatesDataNode
from src.nodes.kpi_data_node import KPIDataNode


class InputPipelineOrchestrator:
    """
    Orchestrates the red-circled input pipeline:

    1. Client Name Extraction
    2. Client Data Retrieval
    3. Updates Data
    4. KPI Data
    """

    def __init__(self):
        self.client_name_extraction_service = ClientNameExtractionNode()
        self.client_data_retrieval_service = ClientDataRetrievalNode()
        self.updates_data_service = UpdatesDataNode()
        self.kpi_data_service = KPIDataNode()

    def run(self, user_query: str) -> WorkflowContext:
        context = WorkflowContext()
        context.metadata["user_query"] = user_query

        context = self.client_name_extraction_service.execute(context)
        context = self.client_data_retrieval_service.execute(context)
        context = self.updates_data_service.execute(context)
        context = self.kpi_data_service.execute(context)

        return context

    def run_with_context(self, context: WorkflowContext) -> WorkflowContext:
        context = self.client_name_extraction_service.execute(context)
        context = self.client_data_retrieval_service.execute(context)
        context = self.updates_data_service.execute(context)
        context = self.kpi_data_service.execute(context)

        return context