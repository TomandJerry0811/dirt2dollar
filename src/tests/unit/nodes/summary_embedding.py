from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.summary_embedding_node import (
    SummaryEmbeddingNode
)


def main():

    context = WorkflowContext()

    context.client_id = 182135

    context.client_name = "Yardworx Land Management"

    context.updated_summary = """
    Yardworx Land Management continues to make
    steady progress with its marketing campaign.
    The client has received multiple qualified
    leads and maintains a positive relationship
    with the team.
    """

    service = SummaryEmbeddingNode()

    context = service.execute(
        context
    )

    print("\n========== SUMMARY EMBEDDING ==========\n")

    print("Embedding Dimension")
    print("-" * 50)
    print(len(context.summary_embedding))

    print("\nFirst 10 Values")
    print("-" * 50)
    print(context.summary_embedding[:10])

    print("\nContent")
    print("-" * 50)
    print(context.summary_embedding_content)

    print("\nMetadata")
    print("-" * 50)
    print(
        context.metadata[
            "summary_embedding_metadata"
        ]
    )


if __name__ == "__main__":

    main()