
from src.nodes.updates_data_node import UpdatesDataNode
from src.domain.entities.workflow_context import WorkflowContext


def test_tc182_retrieves_existing_client_data(monkeypatch):

    expected_record = {
        "client_id": 182135,
        "summary": "Previous client summary.",
        "timestamp": "2026-08-17T10:30:00",
        "satisfaction_score": 85
    }

    class FakeClientRepository:
        def find_by_client_id(self, client_id):
            assert client_id == 182135
            return expected_record

    monkeypatch.setattr(
        "src.nodes.updates_data_node.ClientRepository",
        lambda: FakeClientRepository()
    )

    node = UpdatesDataNode()

    context = WorkflowContext(
        client_id=182135
    )

    result = node.process(context)

    assert result.is_new_client is False
    assert result.previous_summary == "Previous client summary."
    assert result.previous_summary_timestamp == "2026-08-17T10:30:00"
    assert result.previous_satisfaction_score == 85
    assert result.previous_record == expected_record

import pytest
from src.core.exceptions import ValidationException


def test_tc183_missing_client_id():

    node = UpdatesDataNode()

    context = WorkflowContext(
        client_id=None
    )

    with pytest.raises(ValidationException):
        node.validate(context)
        
def test_tc184_none_workflow_context():

    node = UpdatesDataNode()

    with pytest.raises(ValidationException):
        node.validate(None)
        
def test_tc185_new_client_returns_default_previous_data(monkeypatch):

    class FakeClientRepository:
        def find_by_client_id(self, client_id):
            assert client_id == 999999
            return None

    monkeypatch.setattr(
        "src.nodes.updates_data_node.ClientRepository",
        lambda: FakeClientRepository()
    )

    node = UpdatesDataNode()

    context = WorkflowContext(
        client_id=999999
    )

    result = node.process(context)

    assert result.is_new_client is True
    assert result.previous_summary is None
    assert result.previous_summary_timestamp is None
    assert result.previous_satisfaction_score is None
    
def test_tc186_missing_summary_retains_other_fields(monkeypatch):

    record = {
        "client_id": 182135,
        "summary": None,
        "timestamp": "2026-08-17T10:30:00",
        "satisfaction_score": 80
    }

    class FakeClientRepository:
        def find_by_client_id(self, client_id):
            return record

    monkeypatch.setattr(
        "src.nodes.updates_data_node.ClientRepository",
        lambda: FakeClientRepository()
    )

    node = UpdatesDataNode()
    context = WorkflowContext(client_id=182135)

    result = node.process(context)

    assert result.is_new_client is False
    assert result.previous_summary is None
    assert result.previous_summary_timestamp == "2026-08-17T10:30:00"
    assert result.previous_satisfaction_score == 80
    
def test_tc187_missing_satisfaction_score_retains_other_fields(monkeypatch):

    record = {
        "client_id": 182135,
        "summary": "Previous client summary.",
        "timestamp": "2026-08-17T10:30:00",
        "satisfaction_score": None
    }

    class FakeClientRepository:
        def find_by_client_id(self, client_id):
            return record

    monkeypatch.setattr(
        "src.nodes.updates_data_node.ClientRepository",
        lambda: FakeClientRepository()
    )

    node = UpdatesDataNode()
    context = WorkflowContext(client_id=182135)

    result = node.process(context)

    assert result.is_new_client is False
    assert result.previous_summary == "Previous client summary."
    assert result.previous_summary_timestamp == "2026-08-17T10:30:00"
    assert result.previous_satisfaction_score is None
    
def test_tc188_stores_complete_previous_record(monkeypatch):

    expected_record = {
        "client_id": 182135,
        "summary": "Previous client summary.",
        "timestamp": "2026-08-17T10:30:00",
        "satisfaction_score": 88,
        "additional_field": "Additional repository data"
    }

    class FakeClientRepository:
        def find_by_client_id(self, client_id):
            return expected_record

    monkeypatch.setattr(
        "src.nodes.updates_data_node.ClientRepository",
        lambda: FakeClientRepository()
    )

    node = UpdatesDataNode()
    context = WorkflowContext(client_id=182135)

    result = node.process(context)

    assert result.previous_record == expected_record
    assert result.previous_record is expected_record
    

def test_tc189_repository_runtime_error_propagates(monkeypatch):

    class FakeClientRepository:
        def find_by_client_id(self, client_id):
            raise RuntimeError("Repository failed.")

    monkeypatch.setattr(
        "src.nodes.updates_data_node.ClientRepository",
        lambda: FakeClientRepository()
    )

    node = UpdatesDataNode()
    context = WorkflowContext(client_id=182135)

    with pytest.raises(RuntimeError, match="Repository failed"):
        node.process(context)
