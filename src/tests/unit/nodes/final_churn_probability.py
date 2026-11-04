from src.domain.entities.workflow_context import (
    WorkflowContext
)

from src.nodes.final_churn_probability_node import (
    FinalChurnProbabilityNode
)


def main():

    # ---------------------------------------------
    # Create Workflow Context
    # ---------------------------------------------

    context = WorkflowContext()

    # ---------------------------------------------
    # Test Values
    # ---------------------------------------------

    context.summary_probability = 55

    context.kpi_probability = 60

    context.current_kpis = {
        "program_stage": "Scaling"
    }

    context.campaign_status = "Scaling"

    # ---------------------------------------------
    # Summary Analysis
    # ---------------------------------------------

    context.summary_analysis = (
        "Customer engagement has declined "
        "during the last few weeks."
    )

    context.summary_red_flags = [
        "Low customer engagement",
        "Missed follow-ups"
    ]

    context.summary_bottlenecks = [
        "Slow response time"
    ]

    context.summary_historical_insights = [
        "Similar customers churned after "
        "60 days."
    ]

    # ---------------------------------------------
    # KPI Analysis
    # ---------------------------------------------

    context.kpi_analysis = (
        "Lead cost has increased while "
        "conversion rate has decreased."
    )

    context.kpi_red_flags = [
        "High lead cost",
        "Low customer engagement"
    ]

    context.kpi_bottlenecks = [
        "Poor conversion rate"
    ]

    context.kpi_historical_insights = [
        "Lead quality has declined over "
        "the last month."
    ]

    # ---------------------------------------------
    # Execute Service
    # ---------------------------------------------

    service = FinalChurnProbabilityNode()

    context = service.execute(
        context
    )

    # ---------------------------------------------
    # Results
    # ---------------------------------------------

    print("\n========== FINAL CHURN ==========\n")

    print(
        "Summary Probability :",
        context.summary_probability
    )

    print(
        "KPI Probability :",
        context.kpi_probability
    )

    print(
        "Final Probability :",
        context.final_probability
    )

    print(
        "Risk Level :",
        context.risk_level
    )

    print("\n========== FINAL ANALYSIS ==========\n")

    print(
        context.final_analysis
    )

    print("\n========== FINAL RED FLAGS ==========\n")

    for flag in context.final_red_flags:

        print("-", flag)

    print("\n========== FINAL BOTTLENECKS ==========\n")

    for bottleneck in context.final_bottlenecks:

        print("-", bottleneck)

    print(
        "\n========== FINAL HISTORICAL INSIGHTS ==========\n"
    )

    for insight in context.final_historical_insights:

        print("-", insight)


if __name__ == "__main__":

    main()