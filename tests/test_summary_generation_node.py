
import json

from src.nodes.summary_generation_node import SummaryGenerationNode
from src.domain.entities.workflow_context import WorkflowContext


def test_tc174_generates_valid_summary_and_tracks_token_usage(monkeypatch):

    expected_summary = "Client engagement and satisfaction are improving."

    class FakeGroqProvider:
        def execute(self, *args, **kwargs):
            return {
                "content": json.dumps({
                    "client_name": "Test Client",
                    "client_id": "182135",
                    "summary": expected_summary,
                    "satisfaction_score": 82
                }),
                "usage": {
                    "prompt_tokens": 100,
                    "completion_tokens": 50,
                    "total_tokens": 150
                },
                "model": "test-groq-model"
            }

    monkeypatch.setattr(
        "src.nodes.summary_generation_node.GroqProvider",
        lambda: FakeGroqProvider()
    )

    node = SummaryGenerationNode()

    context = WorkflowContext(
        client_id=182135,
        client_name="Test Client",
        summary_batches=[
            {
                "batch_index": 1,
                "batch_count": 1,
                "update_count": 1,
                "text": "Client satisfaction has improved."
            }
        ]
    )

    result = node.process(context)

    assert result.updated_summary == expected_summary
    assert result.updated_satisfaction_score == 82

    assert result.llm_output["client_id"] == "182135"
    assert result.llm_output["satisfaction_score"] == 82

    assert result.llm_usage == {
        "prompt_tokens": 100,
        "completion_tokens": 50,
        "total_tokens": 150
    }

import pytest
from src.core.exceptions import ServiceException


def test_tc177_invalid_provider_response(monkeypatch):

    class FakeGroqProvider:
        def execute(self, *args, **kwargs):
            return "invalid provider response"

    monkeypatch.setattr(
        "src.nodes.summary_generation_node.GroqProvider",
        lambda: FakeGroqProvider()
    )

    node = SummaryGenerationNode()

    context = WorkflowContext(
        client_id=182135,
        client_name="Test Client",
        summary_batches=[
            {
                "batch_index": 1,
                "batch_count": 1,
                "update_count": 1,
                "text": "Test update"
            }
        ]
    )

    with pytest.raises(ServiceException):
        node.process(context)
        
import pytest
from src.core.exceptions import ServiceException


def test_tc178_invalid_json_response(monkeypatch):

    class FakeGroqProvider:
        def execute(self, *args, **kwargs):
            return {
                "content": "This is not valid JSON",
                "usage": {
                    "prompt_tokens": 100,
                    "completion_tokens": 50,
                    "total_tokens": 150
                }
            }

    monkeypatch.setattr(
        "src.nodes.summary_generation_node.GroqProvider",
        lambda: FakeGroqProvider()
    )

    node = SummaryGenerationNode()

    context = WorkflowContext(
        client_id=182135,
        client_name="Test Client",
        summary_batches=[
            {
                "batch_index": 1,
                "batch_count": 1,
                "update_count": 1,
                "text": "Test update"
            }
        ]
    )

    with pytest.raises(ServiceException, match="Unable to parse JSON"):
        node.process(context)
        
import pytest
from src.core.exceptions import ServiceException


def test_tc179_missing_required_json_key(monkeypatch):

    class FakeGroqProvider:
        def execute(self, *args, **kwargs):
            return {
                "content": json.dumps({
                    "client_name": "Test Client",
                    "client_id": "182135",
                    "summary": "Client summary generated."
                    # satisfaction_score intentionally missing
                }),
                "usage": {
                    "prompt_tokens": 100,
                    "completion_tokens": 50,
                    "total_tokens": 150
                }
            }

    monkeypatch.setattr(
        "src.nodes.summary_generation_node.GroqProvider",
        lambda: FakeGroqProvider()
    )

    node = SummaryGenerationNode()

    context = WorkflowContext(
        client_id=182135,
        client_name="Test Client",
        summary_batches=[
            {
                "batch_index": 1,
                "batch_count": 1,
                "update_count": 1,
                "text": "Test update"
            }
        ]
    )

    with pytest.raises(
        ServiceException,
        match="Missing key: satisfaction_score"
    ):
        node.process(context)
        
import pytest


def test_tc180_groq_runtime_error_propagates(monkeypatch):

    class FakeGroqProvider:
        def execute(self, *args, **kwargs):
            raise RuntimeError("Groq provider failed.")

    monkeypatch.setattr(
        "src.nodes.summary_generation_node.GroqProvider",
        lambda: FakeGroqProvider()
    )

    node = SummaryGenerationNode()

    context = WorkflowContext(
        client_id=182135,
        client_name="Test Client",
        summary_batches=[
            {
                "batch_index": 1,
                "batch_count": 1,
                "update_count": 1,
                "text": "Test update"
            }
        ]
    )

    with pytest.raises(RuntimeError, match="Groq provider failed"):
        node.process(context)
        
def test_tc181_accumulates_tokens_across_multiple_batches(monkeypatch):

    responses = [
        {
            "content": json.dumps({
                "client_name": "Test Client",
                "client_id": "182135",
                "summary": "Summary after batch one.",
                "satisfaction_score": 75
            }),
            "usage": {
                "prompt_tokens": 100,
                "completion_tokens": 50,
                "total_tokens": 150
            }
        },
        {
            "content": json.dumps({
                "client_name": "Test Client",
                "client_id": "182135",
                "summary": "Final updated summary.",
                "satisfaction_score": 85
            }),
            "usage": {
                "prompt_tokens": 120,
                "completion_tokens": 60,
                "total_tokens": 180
            }
        }
    ]

    class FakeGroqProvider:
        def __init__(self):
            self.call_count = 0

        def execute(self, *args, **kwargs):
            response = responses[self.call_count]
            self.call_count += 1
            return response

    monkeypatch.setattr(
        "src.nodes.summary_generation_node.GroqProvider",
        lambda: FakeGroqProvider()
    )

    node = SummaryGenerationNode()

    context = WorkflowContext(
        client_id=182135,
        client_name="Test Client",
        summary_batches=[
            {
                "batch_index": 1,
                "batch_count": 2,
                "update_count": 1,
                "text": "First batch update."
            },
            {
                "batch_index": 2,
                "batch_count": 2,
                "update_count": 1,
                "text": "Second batch update."
            }
        ]
    )

    result = node.process(context)

    assert result.updated_summary == "Final updated summary."
    assert result.updated_satisfaction_score == 85

    assert result.llm_usage == {
        "prompt_tokens": 220,
        "completion_tokens": 110,
        "total_tokens": 330
    }