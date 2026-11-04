
from src.nodes.summary_embedding_node import SummaryEmbeddingNode
from src.domain.entities.workflow_context import WorkflowContext


def test_tc166_generates_and_stores_valid_summary_embedding(monkeypatch):
    expected_embedding = [0.1, 0.2, 0.3, 0.4, 0.5]
    summary_text = "Client has shown declining engagement."

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            assert text == summary_text
            return expected_embedding

    class FakeSummaryEmbeddingRepository:
        def __init__(self):
            self.saved_content = None
            self.saved_embedding = None
            self.saved_metadata = None

        def find_by_client_id(self, client_id):
            assert client_id == 182135
            return None

        def save_embedding(self, content, embedding, metadata):
            self.saved_content = content
            self.saved_embedding = embedding
            self.saved_metadata = metadata

    fake_repository = FakeSummaryEmbeddingRepository()

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: fake_repository
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135,
        updated_summary=summary_text
    )

    result = node.process(context)

    assert result.summary_embedding == expected_embedding
    assert len(result.summary_embedding) == 5

    assert result.summary_embedding_content == summary_text

    assert fake_repository.saved_content == summary_text
    assert fake_repository.saved_embedding == expected_embedding

    assert fake_repository.saved_metadata == {
        "client_id": 182135,
        "source": "summary"
    }

    assert result.metadata["summary_embedding_metadata"] == {
        "client_id": 182135,
        "source": "summary"
    }

def test_tc167_raises_value_error_when_client_id_is_missing():
    import pytest
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        updated_summary="Client engagement has declined."
    )

    with pytest.raises(ValueError, match="Client ID is required."):
        node.process(context)
        

def test_tc168_raises_value_error_when_summary_is_missing(monkeypatch):
    import pytest
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            raise AssertionError("Embedding should not be generated")

    class FakeSummaryEmbeddingRepository:
        pass

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: FakeSummaryEmbeddingRepository()
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135
    )

    with pytest.raises(ValueError, match="Summary is required."):
        node.process(context)
        

def test_tc169_updates_existing_summary_embedding(monkeypatch):
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    expected_embedding = [0.11, 0.22, 0.33]
    summary_text = "Updated client summary."

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            return expected_embedding

    class FakeSummaryEmbeddingRepository:
        def __init__(self):
            self.updated_id = None
            self.updated_data = None
            self.save_called = False

        def find_by_client_id(self, client_id):
            return {"id": 55}

        def update_embedding(self, embedding_id, data):
            self.updated_id = embedding_id
            self.updated_data = data

        def save_embedding(self, content, embedding, metadata):
            self.save_called = True

    fake_repository = FakeSummaryEmbeddingRepository()

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: fake_repository
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135,
        updated_summary=summary_text
    )

    result = node.process(context)

    assert fake_repository.updated_id == 55
    assert fake_repository.updated_data["content"] == summary_text
    assert fake_repository.updated_data["embedding"] == expected_embedding
    assert fake_repository.updated_data["metadata"] == {
        "client_id": 182135,
        "source": "summary"
    }

    assert fake_repository.save_called is False
    assert result.summary_embedding == expected_embedding
    assert result.summary_embedding_content == summary_text


def test_tc170_creates_new_summary_embedding_when_none_exists(monkeypatch):
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    expected_embedding = [0.15, 0.25, 0.35]
    summary_text = "New client summary."

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            return expected_embedding

    class FakeSummaryEmbeddingRepository:
        def __init__(self):
            self.saved_content = None
            self.saved_embedding = None
            self.saved_metadata = None
            self.update_called = False

        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.saved_content = content
            self.saved_embedding = embedding
            self.saved_metadata = metadata

        def update_embedding(self, embedding_id, data):
            self.update_called = True

    fake_repository = FakeSummaryEmbeddingRepository()

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: fake_repository
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135,
        updated_summary=summary_text
    )

    result = node.process(context)

    assert fake_repository.saved_content == summary_text
    assert fake_repository.saved_embedding == expected_embedding
    assert fake_repository.saved_metadata == {
        "client_id": 182135,
        "source": "summary"
    }

    assert fake_repository.update_called is False
    assert result.summary_embedding == expected_embedding
    assert result.summary_embedding_content == summary_text


def test_tc171_extracts_embedding_from_dictionary_response(monkeypatch):
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    expected_embedding = [0.5, 0.6, 0.7]

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            return {"embedding": expected_embedding}

    class FakeSummaryEmbeddingRepository:
        def __init__(self):
            self.saved_embedding = None

        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.saved_embedding = embedding

    fake_repository = FakeSummaryEmbeddingRepository()

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: fake_repository
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135,
        updated_summary="Dictionary embedding test."
    )

    result = node.process(context)

    assert result.summary_embedding == expected_embedding
    assert fake_repository.saved_embedding == expected_embedding


def test_tc172_extracts_vector_from_dictionary_response(monkeypatch):
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    expected_embedding = [0.8, 0.9, 1.0]

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            return {"vector": expected_embedding}

    class FakeSummaryEmbeddingRepository:
        def __init__(self):
            self.saved_embedding = None

        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.saved_embedding = embedding

    fake_repository = FakeSummaryEmbeddingRepository()

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: fake_repository
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135,
        updated_summary="Vector dictionary response test."
    )

    result = node.process(context)

    assert result.summary_embedding == expected_embedding
    assert fake_repository.saved_embedding == expected_embedding


def test_tc173_propagates_embedding_provider_runtime_error(monkeypatch):
    import pytest
    from src.nodes.summary_embedding_node import SummaryEmbeddingNode
    from src.domain.entities.workflow_context import WorkflowContext

    class FakeEmbeddingProvider:
        def generate_embedding(self, text):
            raise RuntimeError("Hugging Face provider error")

    class FakeSummaryEmbeddingRepository:
        def find_by_client_id(self, client_id):
            raise AssertionError(
                "Database lookup should not happen after provider failure"
            )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.HuggingFaceProvider",
        lambda: FakeEmbeddingProvider()
    )

    monkeypatch.setattr(
        "src.nodes.summary_embedding_node.SummaryEmbeddingRepository",
        lambda: FakeSummaryEmbeddingRepository()
    )

    node = SummaryEmbeddingNode()

    context = WorkflowContext(
        client_id=182135,
        updated_summary="Embedding provider exception test."
    )

    with pytest.raises(
        RuntimeError,
        match="Hugging Face provider error"
    ):
        node.process(context)
