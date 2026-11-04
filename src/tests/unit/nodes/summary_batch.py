from src.domain.entities.workflow_context import (
    WorkflowContext
)

from src.nodes.client_data_retrieval_node import (
    ClientDataRetrievalNode
)

from src.nodes.summary_batch_preparation_node import (
    SummaryBatchPreparationNode
)


def main():

    context = WorkflowContext()

    context.client_name = (
        "Anvil Custom"
    )

    # Retrieve client data
    context = (
        ClientDataRetrievalNode()
        .execute(context)
    )

    # Prepare batches
    context = (
        SummaryBatchPreparationNode()
        .execute(context)
    )

    print("\n========== SUMMARY BATCHES ==========\n")

    print(
        f"Total Batches : {len(context.summary_batches)}"
    )

    for batch in context.summary_batches:

        print("\n")
        print("=" * 100)

        print(
            f"Batch {batch['batch_index']} "
            f"of {batch['batch_count']}"
        )

        print("=" * 100)

        print()

        print(batch["text"])

        print()

        print("=" * 100)


if __name__ == "__main__":

    main()