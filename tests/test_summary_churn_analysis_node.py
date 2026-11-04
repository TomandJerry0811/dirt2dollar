
from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.summary_churn_analysis_node import SummaryChurnAnalysisNode


def test_tc158_processes_valid_summary_churn_analysis():
    context = WorkflowContext(
        client_id="TEST158",
        client_name="Test Client",
        updated_summary="Client engagement has declined recently.",
        summary_matches=[
            {
                "summary": "Historical client engagement decline.",
                "similarity": 0.91,
            }
        ],
    )

    node = SummaryChurnAnalysisNode()

    class FakeGroqProvider:
        def generate_response(self, **kwargs):
            return {
                "content": """
                {
                    "probability": 72,
                    "analysis": "Client shows elevated churn risk.",
                    "red_flags": ["Declining engagement"],
                    "bottlenecks": ["Slow follow-up"],
                    "historical_insights": ["Similar clients previously churned"]
                }
                """,
                "usage": {
                    "prompt_tokens": 110,
                    "completion_tokens": 90,
                    "total_tokens": 200,
                },
                "model": "test-groq-model",
            }

    node.groq_provider = FakeGroqProvider()

    result = node.process(context)

    assert result.summary_probability == 72
    assert result.summary_analysis == "Client shows elevated churn risk."
    assert result.summary_red_flags == ["Declining engagement"]
    assert result.summary_bottlenecks == ["Slow follow-up"]
    assert result.summary_historical_insights == [
        "Similar clients previously churned"
    ]

    assert result.llm_usage["summary_prompt_tokens"] == 110
    assert result.llm_usage["summary_completion_tokens"] == 90
    assert result.llm_usage["summary_total_tokens"] == 200

    assert result.metadata["summary_analysis_model"] == "test-groq-model"
    assert result.metadata["summary_analysis_completed"] is True


import pytest
from src.core.exceptions import ValidationException


def test_tc159_raises_error_when_summary_text_is_missing():
    context = WorkflowContext(
        client_id="TEST159",
        client_name="Test Client",
        updated_summary=None,
        summary_matches=[
            {"summary": "Historical summary", "similarity": 0.9}
        ],
    )

    node = SummaryChurnAnalysisNode()

    with pytest.raises(
        ValidationException,
        match="^Current summary/update text is required before summary churn analysis\\.$"
    ):
        node.execute(context)
        
def test_tc160_raises_error_when_summary_matches_are_missing():
    context = WorkflowContext(
        client_id="TEST160",
        client_name="Test Client",
        updated_summary="Client engagement has declined.",
        summary_matches=[],
    )

    node = SummaryChurnAnalysisNode()

    with pytest.raises(
        ValidationException,
        match="^Summary matches are required before summary churn analysis\\.$"
    ):
        node.execute(context)
        
def test_tc161_raises_value_error_for_invalid_json_response():
    context = WorkflowContext(
        client_id="TEST161",
        client_name="Test Client",
        updated_summary="Client engagement has declined.",
        summary_matches=[
            {"summary": "Historical summary", "similarity": 0.9}
        ],
    )

    node = SummaryChurnAnalysisNode()

    class FakeGroqProvider:
        def generate_response(self, **kwargs):
            return {
                "content": "This is not valid JSON",
                "usage": {},
                "model": "test-groq-model",
            }

    node.groq_provider = FakeGroqProvider()

    with pytest.raises(
        ValueError,
        match="Failed to parse summary churn analysis JSON"
    ):
        node.process(context)
        
def test_tc162_raises_value_error_when_required_json_keys_are_missing(monkeypatch):
    import json
    import pytest
    from src.nodes.summary_churn_analysis_node import SummaryChurnAnalysisNode
    from src.domain.entities.workflow_context import WorkflowContext

    class FakeGroqProvider:
        def generate_response(self, *args, **kwargs):
            return {
                "content": json.dumps({
                    "probability": 72,
                    "analysis": "Churn risk analysis",
                    "red_flags": ["Declining engagement"],
                    "bottlenecks": ["Low conversion"]
                    # historical_insights is intentionally missing
                }),
                "usage": {},
                "model": "test-groq-model"
            }

    monkeypatch.setattr(
        "src.nodes.summary_churn_analysis_node.GroqProvider",
        lambda *args, **kwargs: FakeGroqProvider()
    )

    node = SummaryChurnAnalysisNode()
    context = WorkflowContext(
        client_id="TEST162",
        updated_summary="Client engagement has declined.",
        summary_matches=[{"content": "Previous client summary"}]
    )

    with pytest.raises(ValueError, match="Summary churn analysis missing keys"):
        node.process(context)
        


def test_tc163_raises_value_error_for_string_probability(monkeypatch):
    import json
    import pytest
    from src.nodes.summary_churn_analysis_node import SummaryChurnAnalysisNode
    from src.domain.entities.workflow_context import WorkflowContext

    class FakeGroqProvider:
        def generate_response(self, *args, **kwargs):
            return {
                "content": json.dumps({
                    "probability": "72",
                    "analysis": "Churn risk analysis",
                    "red_flags": ["Declining engagement"],
                    "bottlenecks": ["Low conversion"],
                    "historical_insights": ["Previous risk observed"]
                }),
                "usage": {},
                "model": "test-groq-model"
            }

    monkeypatch.setattr(
        "src.nodes.summary_churn_analysis_node.GroqProvider",
        lambda *args, **kwargs: FakeGroqProvider()
    )

    node = SummaryChurnAnalysisNode()

    context = WorkflowContext(
        client_id="TEST163",
        updated_summary="Client engagement has declined.",
        summary_matches=[{"content": "Previous client summary"}]
    )

    with pytest.raises(
        ValueError,
        match="Summary churn probability must be an integer."
    ):
        node.process(context)


def test_tc164_raises_value_error_for_probability_out_of_range(monkeypatch):
    import json
    import pytest
    from src.nodes.summary_churn_analysis_node import SummaryChurnAnalysisNode
    from src.domain.entities.workflow_context import WorkflowContext

    class FakeGroqProvider:
        def generate_response(self, *args, **kwargs):
            return {
                "content": json.dumps({
                    "probability": 140,
                    "analysis": "Churn risk analysis",
                    "red_flags": ["Declining engagement"],
                    "bottlenecks": ["Low conversion"],
                    "historical_insights": ["Previous risk observed"]
                }),
                "usage": {},
                "model": "test-groq-model"
            }

    monkeypatch.setattr(
        "src.nodes.summary_churn_analysis_node.GroqProvider",
        lambda *args, **kwargs: FakeGroqProvider()
    )

    node = SummaryChurnAnalysisNode()

    context = WorkflowContext(
        client_id="TEST164",
        updated_summary="Client engagement has declined.",
        summary_matches=[{"content": "Previous client summary"}]
    )

    with pytest.raises(
        ValueError,
        match="Summary churn probability must be between 0 and 100."
    ):
        node.process(context)
        
def test_tc165_propagates_groq_runtime_error(monkeypatch):
    import pytest
    from src.nodes.summary_churn_analysis_node import SummaryChurnAnalysisNode
    from src.domain.entities.workflow_context import WorkflowContext

    class FakeGroqProvider:
        def generate_response(self, *args, **kwargs):
            raise RuntimeError("Groq API unavailable")

    monkeypatch.setattr(
        "src.nodes.summary_churn_analysis_node.GroqProvider",
        lambda *args, **kwargs: FakeGroqProvider()
    )

    node = SummaryChurnAnalysisNode()

    context = WorkflowContext(
        client_id="TEST165",
        updated_summary="Client engagement has declined.",
        summary_matches=[{"content": "Previous client summary"}]
    )

    with pytest.raises(RuntimeError, match="Groq API unavailable"):
        node.process(context)