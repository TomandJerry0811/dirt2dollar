from src.domain.entities.workflow_context import (
    WorkflowContext
)

from src.nodes.updates_data_node import (
    UpdatesDataNode
)


def main():

    # ---------------------------------------------
    # Create Workflow Context
    # ---------------------------------------------

    context = WorkflowContext()

    # Existing client from previous service
    context.client_id = "182135"

    # ---------------------------------------------
    # Execute Service
    # ---------------------------------------------

    service = UpdatesDataNode()

    context = service.execute(
        context
    )

    # ---------------------------------------------
    # Print Results
    # ---------------------------------------------

    print("\n========== CLIENT ==========\n")

    print(
        "Client ID :",
        context.client_id
    )

    print(
        "Is New Client :",
        context.is_new_client
    )

    print("\n========== PREVIOUS SUMMARY ==========\n")

    if context.previous_summary:

        print(context.previous_summary)

    else:

        print("No previous summary found.")

    print("\n========== PREVIOUS TIMESTAMP ==========\n")

    print(
        context.previous_summary_timestamp
    )

    print("\n========== PREVIOUS SATISFACTION ==========\n")

    print(
        context.previous_satisfaction_score
    )


if __name__ == "__main__":

    main() 