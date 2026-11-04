from src.base.base_workflow import BaseWorkflow

from src.nodes.kpi_analysis_node import (
    KPIAnalysisNode
)

from src.nodes.kpi_embedding_node import (
    KPIEmbeddingNode
)


class KPIWorkflow(BaseWorkflow):

    def __init__(self):

        super().__init__(
            workflow_name="KPI Workflow"
        )

    def build_workflow(self):

        self.add_service(
            KPIAnalysisNode()
        )

        self.add_service(
            KPIEmbeddingNode()
        )