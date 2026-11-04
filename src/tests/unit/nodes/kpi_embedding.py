from pprint import pprint

from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.kpi_embedding_node import KPIEmbeddingNode


def test_kpi_embedding_service():

    context = WorkflowContext(
        client_id=1,
        client_name="ABC Healthcare"
    )

    # Mock KPI data
    context.current_kpis = {
        "program_type": "Weight Loss",
        "program_stage": "Scaling",
        "campaign_status": "Active",
        "call_center_status": "Healthy",

        "ad_spend_7d": 1200,
        "ad_spend_mtd": 4500,
        "ad_spend_30d": 18000,

        "lead_cost_7d": 110,
        "lead_cost_mtd": 95,
        "lead_cost_30d": 80,

        "appt_cost_7d": 210,
        "appt_cost_mtd": 180,
        "appt_cost_30d": 150
    }

    context.kpi_interpretation = {

        "matched_pattern_names": [
            "CPL_WORSENING",
            "CPAPT_WORSENING",
            "HIGH_CPL_HIGH_CPAPT"
        ],

        "matched_patterns": [
            {
                "pattern_key": "CPL_WORSENING",
                "interpretation": "Lead cost increasing.",
                "category": "warning",
                "severity": 3
            },
            {
                "pattern_key": "CPAPT_WORSENING",
                "interpretation": "Appointment cost increasing.",
                "category": "warning",
                "severity": 3
            }
        ],

        "overall_severity": "high",

        "analysis": {
            "overall_health": "High Risk",

            "business_summary":
                "Lead acquisition costs are increasing while "
                "conversion efficiency is declining.",

            "positive_signals": [
                "Ad spend remains controlled."
            ],

            "risk_factors": [
                "High CPL",
                "High CPAPT"
            ],

            "recommendations": [
                "Optimize campaigns.",
                "Improve conversion funnel."
            ]
        }
    }

    service = KPIEmbeddingNode()

    service.validate(context)

    result = service.process(context)

    print("\n========== KPI EMBEDDING ==========\n")

    pprint(result.kpi_embedding)

    print("\n========== EMBEDDING CONTENT ==========\n")

    print(result.kpi_embedding_content)

    print("\n========== METADATA ==========\n")

    pprint(
        result.metadata.get(
            "kpi_embedding_metadata"
        )
    )

    print("\n======================================\n")


if __name__ == "__main__":

    test_kpi_embedding_service()