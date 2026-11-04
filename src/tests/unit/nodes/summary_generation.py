from src.domain.entities.workflow_context import (
    WorkflowContext
)

from src.nodes.client_data_retrieval_node import (
    ClientDataRetrievalNode
)

from src.nodes.updates_data_node import (
    UpdatesDataNode
)

from src.nodes.summary_batch_preparation_node import (
    SummaryBatchPreparationNode
)

from src.nodes.summary_generation_node import (
    SummaryGenerationNode
)


def main():

    # -------------------------------------------------
    # Create Workflow Context
    # -------------------------------------------------

    context = WorkflowContext()

    context.client_name = (
        "Yardworx Land Management"
    )

    print("\n========== SUMMARY SERVICE TEST ==========\n")

    # -------------------------------------------------
    # Retrieve Client Data
    # -------------------------------------------------

    print("Step 1 : Retrieving Client Data")

    context = (
        ClientDataRetrievalNode()
        .execute(context)
    )

    # -------------------------------------------------
    # Retrieve Previous Summary
    # -------------------------------------------------

    print("Step 2 : Retrieving Previous Summary")

    context = (
        UpdatesDataNode()
        .execute(context)
    )

    # -------------------------------------------------
    # Prepare Batches
    # -------------------------------------------------

    print("Step 3 : Preparing Summary Batches")

    context = (
        SummaryBatchPreparationNode()
        .execute(context)
    )

    # -------------------------------------------------
    # Generate Updated Summary
    # -------------------------------------------------

    print("Step 4 : Generating Updated Summary")

    context = (
        SummaryGenerationNode()
        .execute(context)
    )

    # -------------------------------------------------
    # Display Results
    # -------------------------------------------------

    print("\n")
    print("=" * 100)
    print("FINAL UPDATED SUMMARY")
    print("=" * 100)

    print()

    print(
        context.updated_summary
    )

    print()

    print("=" * 100)
    print("UPDATED SATISFACTION SCORE")
    print("=" * 100)

    print()

    print(
        context.updated_satisfaction_score
    )

    print()

    print("=" * 100)
    print("TOKEN USAGE")
    print("=" * 100)

    print()

    for key, value in context.llm_usage.items():

        print(
            f"{key:<20}: {value}"
        )


if __name__ == "__main__":

    main()
    