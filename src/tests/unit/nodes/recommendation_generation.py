from src.domain.entities.workflow_context import (
    WorkflowContext
)
from src.nodes.recommendation_generation_node import (
    RecommendationGenerationNode
)


def main():

    print("\n========== RECOMMENDATION GENERATION TEST ==========\n")

    context = WorkflowContext()

    # -------------------------------------------------
    # Client Information
    # -------------------------------------------------

    context.client_id = "182135"

    context.client_name = "Yardworx Land Management"

    context.program_stage = "Growth"

    context.campaign_status = "Active"

    # -------------------------------------------------
    # Current KPIs
    # -------------------------------------------------

    context.current_kpis = {

        "Ad Spend (30D)": "$2500",

        "Lead Cost (30D)": "$42",

        "Appointment Cost (30D)": "$95",

        "Campaign Health": "Average"

    }

    # -------------------------------------------------
    # Final Churn Report
    # -------------------------------------------------

    context.final_probability = 82

    context.risk_level = "HIGH"

    context.final_analysis = (
        "The client shows a high likelihood of churn due to "
        "declining lead quality, inconsistent appointment "
        "performance, and reduced engagement over the last month."
    )

    context.final_red_flags = [

        "Poor lead quality",

        "Declining engagement",

        "High appointment cost"

    ]

    context.final_bottlenecks = [

        "Low conversion rate",

        "Delayed follow-up"

    ]

    context.final_historical_insights = [

        "Clients with similar patterns improved after weekly follow-ups.",

        "Reducing lead cost improved retention for similar clients.",

        "Frequent campaign reviews reduced churn."

    ]

    # -------------------------------------------------
    # Execute Service
    # -------------------------------------------------

    service = RecommendationGenerationNode()

    context = service.execute(
        context
    )

    # -------------------------------------------------
    # Output
    # -------------------------------------------------

    print("\n========== RECOMMENDATIONS ==========\n")

    for index, recommendation in enumerate(
        context.recommendations,
        start=1
    ):

        print(f"{index}. {recommendation}")

    print("\n========== TOKEN USAGE ==========\n")

    for key, value in context.llm_usage.items():

        print(f"{key:<20}: {value}")


if __name__ == "__main__":

    main()