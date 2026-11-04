from pprint import pprint

from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.kpi_analysis_node import KPIAnalysisNode


def test_kpi_analysis_node():
    """
    Test KPIAnalysisNode end-to-end.
    """

    context = WorkflowContext(
        client_id=1,
        client_name="ABC Healthcare",
        kpi_dataset={
            "current_kpis": {
                "ad_spend_7d": 1200,
                "ad_spend_mtd": 4500,
                "ad_spend_30d": 18000,

                "lead_cost_7d": 110,
                "lead_cost_mtd": 95,
                "lead_cost_30d": 80,

                "appt_cost_7d": 350,
                "appt_cost_mtd": 320,
                "appt_cost_30d": 290,

                "campaign_status": "Active",
                "call_center_status": "Available",
                "program_stage": "Scaling"
            }
        }
    )

    node = KPIAnalysisNode()

    node.validate(context)

    result = node.process(context)

    print("\n========== KPI INTERPRETATION ==========\n")

    pprint(result.kpi_interpretation)

    print("\n=======================================\n")


if __name__ == "__main__":
    test_kpi_analysis_node()