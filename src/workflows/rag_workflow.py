from src.base.base_workflow import BaseWorkflow

from src.nodes.historical_update_match_node import (
    HistoricalUpdateMatchNode
)
from src.nodes.historical_kpi_match_node import (
    HistoricalKPIMatchNode
)


class RAGWorkflow(BaseWorkflow):
    """
    Workflow responsible for retrieving
    historical summary and KPI matches.
    """

    def __init__(self):

        super().__init__(
            workflow_name="RAG Workflow"
        )

    def build_workflow(self):

        self.add_service(
            HistoricalUpdateMatchNode()
        )

        self.add_service(
            HistoricalKPIMatchNode()
        )