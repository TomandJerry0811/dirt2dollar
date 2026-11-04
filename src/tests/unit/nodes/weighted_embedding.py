from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.weighted_embedding import (
    WeightedEmbeddingService
)


def main():

    print("\n========== WEIGHTED EMBEDDING SERVICE TEST ==========\n")

    context = WorkflowContext()

    # -------------------------------------------------
    # Client Information
    # -------------------------------------------------

    context.client_id = 182135

    context.client_name = "Yardworx Land Management"

    # -------------------------------------------------
    # Summary
    # -------------------------------------------------

    context.summary = """
    Yardworx Land Management continues to make
    steady progress with its marketing campaign.
    The client has received multiple qualified
    leads and maintains a positive relationship
    with the team.
    """

    # -------------------------------------------------
    # KPI Interpretation
    # -------------------------------------------------

    context.kpi_interpretation = {

        "llm_summary": (
            "Campaign is performing consistently. "
            "Lead costs remain healthy while ad spend "
            "is stable."
        )

    }

    # -------------------------------------------------
    # Dummy Embeddings
    # -------------------------------------------------

    provider = (
        WeightedEmbeddingService()
        .embedding_provider
    )

    context.summary_embedding = provider.generate_embedding(
        context.summary
    )["embedding"]

    context.kpi_embedding = provider.generate_embedding(
        context.kpi_interpretation["llm_summary"]
    )["embedding"]

    # -------------------------------------------------
    # Execute Service
    # -------------------------------------------------

    service = WeightedEmbeddingService()

    context = service.execute(
        context
    )

    # -------------------------------------------------
    # Print Results
    # -------------------------------------------------

    print("\n========== WEIGHTED EMBEDDING ==========\n")

    print("Embedding Dimension")
    print("-" * 50)
    print(len(context.weighted_embedding))

    print("\nFirst 10 Values")
    print("-" * 50)
    print(context.weighted_embedding[:10])

    print("\nContent")
    print("-" * 50)
    print(context.weighted_embedding_content)

    print("\nMetadata")
    print("-" * 50)
    print(
        context.metadata.get(
            "weighted_embedding_metadata"
        )
    )

    print("\nWeighted Embedding Test Successful")


if __name__ == "__main__":
    main()