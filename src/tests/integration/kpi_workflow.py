from pprint import pprint

from src.domain.entities.workflow_context import WorkflowContext
from src.workflows.kpi_workflow import KPIWorkflow


def test_kpi_workflow():

    # -------------------------------------------------
    # Create Workflow Context
    # -------------------------------------------------

    context = WorkflowContext(
        client_id=1,
        client_name="ABC Healthcare"
    )

    # -------------------------------------------------
    # Mock Current KPI Data
    # -------------------------------------------------

    current_kpis = {

        "program_type": "Weight Loss",
        "program_stage": "Scaling",
        "campaign_status": "Active",
        "call_center_status": "Healthy",

        "ad_spend_7d": 1200,
        "ad_spend_mtd": 4500,
        "ad_spend_30d": 18000,

        "lead_cost_7d": 110,
        "lead_cost_mtd": 95,
        "lead_cost_30d": 80,

        "appt_cost_7d": 210,
        "appt_cost_mtd": 180,
        "appt_cost_30d": 150
    }

    # -------------------------------------------------
    # Populate Workflow Context
    # -------------------------------------------------

    context.current_kpis = current_kpis

    context.kpi_dataset = {
        "current_kpis": current_kpis
    }

    # -------------------------------------------------
    # Execute Workflow
    # -------------------------------------------------

    workflow = KPIWorkflow()

    result = workflow.execute(context)

    # -------------------------------------------------
    # Print Results
    # -------------------------------------------------

    print("\n========== KPI INTERPRETATION ==========\n")

    pprint(result.kpi_interpretation)

    print("\n========== KPI EMBEDDING ==========\n")

    print(
        f"Embedding Dimension : {len(result.kpi_embedding)}"
    )

    print(
        f"First 10 Values     : "
        f"{result.kpi_embedding[:10]}"
    )

    print("\n========== EMBEDDING CONTENT ==========\n")

    print(result.kpi_embedding_content)

    print("\n========== METADATA ==========\n")

    pprint(
        result.metadata.get(
            "kpi_embedding_metadata"
        )
    )

    print("\n========== WORKFLOW STATUS ==========\n")

    print(workflow.workflow_status)

    print("\n=======================================\n")


if __name__ == "__main__":

    test_kpi_workflow()