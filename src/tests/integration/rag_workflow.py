import os
import pytest

from src.providers.external.google_sheet_provider import GoogleSheetsProvider

from src.workflows.input_pipeline_orchestrator import InputPipelineOrchestrator
from src.workflows.rag_workflow import (
    HistoricalRetrievalOrchestrator,
)

from src.nodes.summary_batch_preparation_node import SummaryBatchPreparationNode
from src.nodes.summary_generation_node import SummaryGenerationNode
from src.nodes.kpi_analysis_node import KPIAnalysisNode
from src.nodes.summary_embedding_node import SummaryEmbeddingNode
from src.nodes.kpi_embedding_node import KPIEmbeddingNode


@pytest.mark.skipif(
    os.getenv("RUN_INTEGRATION_TESTS") != "1",
    reason="Set RUN_INTEGRATION_TESTS=1 to run integration tests."
)
def test_historical_retrieval_flow_real_execution():
    rows = GoogleSheetsProvider().get_all_records()
    assert rows, "Google Sheet returned no rows"

    client_name = rows[0].get("Client_name")
    assert client_name, "Client_name missing in first row"

    # Step 1: Input pipeline
    input_orchestrator = InputPipelineOrchestrator()
    context = input_orchestrator.run(
        f"give me churn analysis for {client_name}"
    )

    assert context is not None
    assert context.client_id is not None
    assert context.client_name is not None
    assert context.kpi_dataset is not None

    # Step 2: Prepare summary batches
    context = SummaryBatchPreparationNode().execute(context)
    assert context.summary_batches is not None
    assert isinstance(context.summary_batches, list)
    assert len(context.summary_batches) > 0

    # Step 3: Generate updated summary
    context = SummaryGenerationNode().execute(context)
    assert context.updated_summary is not None
    assert isinstance(context.updated_summary, str)
    assert context.updated_summary.strip() != ""

    # Step 4: Generate KPI interpretation
    context = KPIAnalysisNode().execute(context)
    assert context.kpi_interpretation is not None
    assert isinstance(context.kpi_interpretation, dict)

    # Step 5: Generate embeddings
    context = SummaryEmbeddingNode().execute(context)
    context = KPIEmbeddingNode().execute(context)

    assert context.summary_embedding is not None
    assert context.kpi_embedding is not None
    assert len(context.summary_embedding) == 768
    assert len(context.kpi_embedding) == 768

    # Step 6: Historical retrieval flow
    historical_orchestrator = HistoricalRetrievalOrchestrator()
    context = historical_orchestrator.run_with_context(context)

    # Step 7: Validate outputs
    assert hasattr(context, "historical_summary_embeddings")
    assert hasattr(context, "historical_kpi_embeddings")
    assert isinstance(context.historical_summary_embeddings, list)
    assert isinstance(context.historical_kpi_embeddings, list)

    assert hasattr(context, "update_matches")
    assert hasattr(context, "kpi_matches")
    assert isinstance(context.update_matches, list)
    assert isinstance(context.kpi_matches, list)

    assert "update_match_count" in context.metadata
    assert "kpi_match_count" in context.metadata
    assert "update_match_threshold" in context.metadata
    assert "kpi_match_threshold" in context.metadata