from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.historical_update_match_node import HistoricalUpdateMatchNode


def test_historical_update_match():

    context = WorkflowContext()

    context.summary_embedding = [0.01] * 768
    context.metadata = {}

    node = HistoricalUpdateMatchNode()

    result = node.execute(context)

    print("\n========== HISTORICAL UPDATE MATCH TEST ==========\n")

    print(
        f"Historical Summary Matches Retrieved : "
        f"{len(result.summary_matches)}"
    )

    if result.summary_matches:
        print("\nFirst Summary Match:\n")
        print(result.summary_matches[0])

    print("\nHistorical Update Match Test Passed!")

if __name__ == "__main__":
    print("Starting test...")
    test_historical_update_match()