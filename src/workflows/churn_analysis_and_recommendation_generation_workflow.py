from src.base.base_workflow import BaseWorkflow

from src.nodes.summary_churn_analysis_node import SummaryChurnAnalysisNode
from src.nodes.kpi_churn_analysis_node import KPIChurnAnalysisNode
from src.nodes.final_churn_probability_node import FinalChurnProbabilityNode
from src.nodes.recommendation_generation_node import RecommendationGenerationNode
from src.nodes.result_persistence_node import ResultPersistenceNode


class ChurnWorkflow(BaseWorkflow):

    def __init__(self):
        super().__init__("Churn Workflow")

    def build_workflow(self):

        self.add_service(
            SummaryChurnAnalysisNode()
        )

        self.add_service(
            KPIChurnAnalysisNode()
        )

        self.add_service(
            FinalChurnProbabilityNode()
        )

        self.add_service(
            RecommendationGenerationNode()
        )

        self.add_service(
            ResultPersistenceNode()
        )