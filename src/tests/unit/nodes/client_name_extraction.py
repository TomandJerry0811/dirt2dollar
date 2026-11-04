from src.domain.entities.workflow_context import WorkflowContext

from src.nodes.client_name_extraction_node import (
    ClientNameExtractionNode
)


def main():

    print(
        "\n========== CLIENT NAME EXTRACTION TEST ==========\n"
    )

    test_queries = [

        "Show churn report for Yardworx",

        "Give me KPI analysis of ABC Healthcare",

        "Latest updates for SafeTrack",

        "Client Pristine summary",

        "Show analysis about Dirt2Dollar",

        "Need the full report for Vision Dental",

        "Give me details for XYZ Industries",

        "Show churn report",

        "What is the weather today?"

    ]

    service = ClientNameExtractionNode()

    for index, query in enumerate(
        test_queries,
        start=1
    ):

        print(
            f"\n---------- Test Case {index} ----------"
        )

        context = WorkflowContext()

        context.metadata["user_query"] = query

        context = service.execute(
            context
        )

        print(
            f"Query              : {query}"
        )

        print(
            f"Extracted Client   : {context.client_name}"
        )

        print(
            "Extraction Method  : "
            f"{context.metadata.get('client_name_extraction_method')}"
        )

    print(
        "\n========== TEST COMPLETED =========="
    )


if __name__ == "__main__":

    main()