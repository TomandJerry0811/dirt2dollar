from src.domain.entities.workflow_context import (
    WorkflowContext
)

from src.nodes.final_client_summary_node import (
    FinalClientSummaryNode
)

from src.repositories.client_repository import (
    ClientRepository
)


def main():

    context = WorkflowContext()

    context.client_id = "182135"

    repository = ClientRepository()

    context.client_name = "Yardworx Land Management"

    context.updated_summary = (
        "This is a test summary generated "
        "from Final Client Summary Service."
    )

    context.updated_satisfaction_score = 90

    service = FinalClientSummaryNode()

    service.execute(
        context
    )

    print()

    print("Summary updated successfully.")

    updated = repository.find_by_client_id(
        context.client_id
    )

    print()

    print(updated["summary"])

    print()

    print(updated["satisfaction_score"])


if __name__ == "__main__":

    main()