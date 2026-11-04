import traceback

from src.domain.entities.workflow_context import WorkflowContext
from src.workflows.summary_workflow import SummaryWorkflow


def main():

    context = WorkflowContext(

        client_id=182135,

        client_name="Yardworx Land Management",

        previous_summary="Client has shown consistent growth in the last month.",

        client_updates=[
            {
                "created_at": "2026-07-24",
                "creator_name": "John",
                "body": "Campaign performing well."
            },
            {
                "created_at": "2026-07-24",
                "creator_name": "John",
                "body": "Lead quality improved."
            },
            {
                "created_at": "2026-07-24",
                "creator_name": "Sarah",
                "body": "Client praised the support team."
            }
        ],

        current_kpis={

            "lead_cost": 320,

            "appointment_cost": 950,

            "ad_spend": 25000

        }

    )

    workflow = SummaryWorkflow()

    try:

        result = workflow.execute(context)

        print("\n========== SUMMARY WORKFLOW COMPLETED ==========\n")

        print("Updated Summary:\n")
        print(result.updated_summary)

        print("\nSatisfaction Score:")
        print(result.updated_satisfaction_score)

        print("\nLLM Usage:")
        print(result.llm_usage)

    except Exception:

        traceback.print_exc()


if __name__ == "__main__":
    main()