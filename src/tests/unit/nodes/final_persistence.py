from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.result_persistence_node import ResultPersistenceNode


def main():

    context = WorkflowContext()

    context.client_id = 101
    context.client_name = "Yardworx"

    context.updated_summary = (
        "Client has shown declining engagement over the past month."
    )

    context.final_bottlenecks = [
        "High lead cost",
        "Low appointment conversion"
    ]

    context.final_red_flags = [
        "Campaign paused",
        "Drop in qualified leads"
    ]

    context.recommendations = [
        "Resume campaigns",
        "Review ad targeting",
        "Optimize landing page"
    ]

    context.updated_satisfaction_score = 68

    context.risk_level = "HIGH"

    context.final_probability = 82.4

    service = ResultPersistenceNode()

    service.execute(context)

    print("\n========== RESULT PERSISTENCE TEST ==========")
    print("Result successfully persisted to client_updates.")


if __name__ == "__main__":
    main()