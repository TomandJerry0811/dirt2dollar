from pprint import pprint

from src.domain.entities.workflow_context import (
    WorkflowContext
)

from src.nodes.client_data_retrieval_node import (
    ClientDataRetrievalNode
)


def main():

    context = WorkflowContext()

    context.client_name = (
        "Yardworx Land Management"
    )

    service = ClientDataRetrievalNode()

    context = service.execute(
        context
    )

    print("\n========== CLIENT ==========\n")

    print("Client ID :", context.client_id)
    print("Client Name :", context.client_name)
    print("Program Type :", context.program_type)
    print("Program Stage :", context.program_stage)
    print("Campaign Status :", context.campaign_status)
    print("Current Satisfaction :", context.current_satisfaction)

    print("\n========== KPI ==========\n")

    pprint(context.current_kpis)

    print("\n========== UPDATES ==========\n")

    print(
        "Total Updates :",
        context.total_updates
    )

    print("\nLatest Update\n")

    pprint(context.latest_update)

    print("\n========== RAW JSON ==========\n")

    pprint(context.google_sheet_data)


if __name__ == "__main__":
    main()