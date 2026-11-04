from src.workflows.ai_workflow_orchestrator import AIWorkflowOrchestrator


def test_ai_workflow():

    orchestrator = AIWorkflowOrchestrator()

    context = orchestrator.run(
        "give me churn analysis for Yardworx Land Management"
    )

    print("\n========== CLIENT ==========")
    print("Client:", context.client_name)

    print("\n========== SUMMARY ==========")
    print(context.updated_summary)

    print("\n========== KPI ==========")
    print(context.kpi_interpretation)

    print("\n========== SUMMARY MATCHES ==========")
    print(len(context.summary_matches))

    if context.summary_matches:
        print(context.summary_matches[0])

    print("\n========== KPI MATCHES ==========")
    print(len(context.kpi_matches))

    if context.kpi_matches:
        print(context.kpi_matches[0])

    print("\n========== SUMMARY CHURN ==========")
    print(context.summary_probability)
    print(context.summary_analysis)

    print("\n========== KPI CHURN ==========")
    print(context.kpi_probability)
    print(context.kpi_analysis)

    print("\n========== FINAL CHURN ==========")
    print(context.final_probability)
    print(context.risk_level)
    print(context.final_analysis)

    print("\n========== RECOMMENDATIONS ==========")

    for recommendation in context.recommendations:
        print("-", recommendation)

if __name__ == "__main__":
    print("Starting AI Workflow Integration Test...\n")
    test_ai_workflow()