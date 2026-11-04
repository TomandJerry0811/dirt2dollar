from src.base.base_workflow import BaseWorkflow

from src.nodes.summary_batch_preparation_node import (
    SummaryBatchPreparationNode
)
from src.nodes.summary_generation_node import (
    SummaryGenerationNode
)
from src.nodes.final_client_summary_node import (
    FinalClientSummaryNode
)
from src.nodes.summary_embedding_node import (
    SummaryEmbeddingNode
)

class SummaryWorkflow(BaseWorkflow):
    """
    Workflow responsible for generating and persisting
    the client summary.
    """

    def __init__(self):
        super().__init__(
            workflow_name="Summary Workflow"
        )

    def build_workflow(self):

        self.add_service(
            SummaryBatchPreparationNode()
        )

        self.add_service(
            SummaryGenerationNode()
        )

        self.add_service(
            FinalClientSummaryNode()
        )

        self.add_service(
            SummaryEmbeddingNode()
        )