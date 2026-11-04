from pprint import pprint

from src.workflows.input_pipeline_orchestrator import InputPipelineOrchestrator


def test_red_circle_flow_real_execution():

    print("\nStarting Input Pipeline...\n")

    orchestrator = InputPipelineOrchestrator()

    context = orchestrator.run(
        "give me churn analysis for Yardworx Land Management"
    )

    print("\n========== RESULT ==========\n")

    print("Client ID:", context.client_id)
    print("Client Name:", context.client_name)
    print("Is New Client:", context.is_new_client)

    print("\nGoogle Sheet Data")
    pprint(context.google_sheet_data)

    print("\nClient Updates")
    pprint(context.client_updates)

    print("\nKPI Dataset")
    pprint(context.kpi_dataset)

    print("\nFinished Successfully!\n")


if __name__ == "__main__":
    test_red_circle_flow_real_execution()