from src.domain.entities.workflow_context import WorkflowContext
from src.workflows.churn_analysis_and_recommendation_generation_workflow import ChurnWorkflow


def test_churn_workflow():

    context = WorkflowContext()

    # =====================================================
    # Client Information
    # =====================================================

    context.client_id = 182135
    context.client_name = "Yardworx Land Management"

    # =====================================================
    # Summary Workflow Output (Mock)
    # =====================================================

    context.updated_summary = """
    Client engagement has reduced during the last month.
    Campaign approvals are slower than usual.
    Communication frequency has decreased.
    Overall client sentiment appears slightly negative.
    """

    context.updated_satisfaction_score = 68

    # =====================================================
    # KPI Workflow Output (Mock)
    # =====================================================

    context.kpi_dataset = {
        "current_kpis": {
            "ad_spend_7d": 4200,
            "ad_spend_mtd": 18500,
            "ad_spend_30d": 72000,

            "lead_cost_7d": 38,
            "lead_cost_mtd": 41,
            "lead_cost_30d": 43,

            "appt_cost_7d": 18,
            "appt_cost_mtd": 19,
            "appt_cost_30d": 20,

            "campaign_status": "Running",
            "program_stage": "Growth"
        }
    }

    context.kpi_interpretation = {
        "overall_severity": "Medium",
        "summary": (
            "Lead cost is increasing while appointment "
            "cost remains stable."
        ),
        "recommendations": [
            "Improve lead quality",
            "Optimize targeting"
        ]
    }

    # =====================================================
    # Mock Summary Retrieval
    # =====================================================

    context.summary_matches = [
        {
            "content": (
                "Historical summaries show declining "
                "engagement over the last two months."
            ),
            "similarity": 0.95
        },
        {
            "content": (
                "Client previously delayed campaign "
                "approvals."
            ),
            "similarity": 0.91
        }
    ]

    # =====================================================
    # Mock KPI Retrieval
    # =====================================================

    context.kpi_matches = [
        {
            "content": (
                "Historical KPIs indicate increasing lead "
                "cost over several weeks."
            ),
            "similarity": 0.96
        },
        {
            "content": (
                "Appointment cost remained stable despite "
                "higher ad spend."
            ),
            "similarity": 0.92
        }
    ]

    # =====================================================
    # Execute Churn Workflow
    # =====================================================

    workflow = ChurnWorkflow()

    context = workflow.execute(context)

    # =====================================================
    # Print Results
    # =====================================================

    print("\n========== SUMMARY CHURN ==========")

    print("Probability:")
    print(context.summary_probability)

    print("\nAnalysis:")
    print(context.summary_analysis)

    print("\nRed Flags:")
    print(context.summary_red_flags)

    print("\nBottlenecks:")
    print(context.summary_bottlenecks)

    print("\nHistorical Insights:")
    print(context.summary_historical_insights)

    print("\n========== KPI CHURN ==========")

    print("Probability:")
    print(context.kpi_probability)

    print("\nAnalysis:")
    print(context.kpi_analysis)

    print("\nRed Flags:")
    print(context.kpi_red_flags)

    print("\nBottlenecks:")
    print(context.kpi_bottlenecks)

    print("\nHistorical Insights:")
    print(context.kpi_historical_insights)

    print("\n========== FINAL CHURN ==========")

    print("Probability:")
    print(context.final_probability)

    print("\nRisk Level:")
    print(context.risk_level)

    print("\nAnalysis:")
    print(context.final_analysis)

    print("\n========== RECOMMENDATIONS ==========")

    print(context.recommendations)


if __name__ == "__main__":
    test_churn_workflow()