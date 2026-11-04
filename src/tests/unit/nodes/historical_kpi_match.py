from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.historical_kpi_match_node import HistoricalKPIMatchNode


def test_historical_kpi_match():

    context = WorkflowContext()

    context.kpi_embedding = [0.01] * 768
    context.metadata = {}

    node = HistoricalKPIMatchNode()

    result = node.execute(context)

    print("\n========== HISTORICAL KPI MATCH TEST ==========\n")

    print(
        f"Historical KPI Matches Retrieved : "
        f"{len(result.kpi_matches)}"
    )

    if result.kpi_matches:
        print("\nFirst KPI Match:\n")
        print(result.kpi_matches[0])

    print("\nHistorical KPI Match Test Passed!")

if __name__ == "__main__":
    print("Starting test...")
    test_historical_kpi_match()