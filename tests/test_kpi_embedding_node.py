
from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.kpi_embedding_node import KPIEmbeddingNode


def test_tc140_generates_768_dimensions_and_high_severity_metadata():
    context = WorkflowContext(
        client_id="TEST140",
        client_name="High Risk Client",
        current_kpis={
            "ad_spend_7d": 500.0,
            "lead_cost_7d": 75.0,
            "appt_cost_7d": 100.0,
            "program_stage": "Active",
        },
        kpi_interpretation={
            "matched_pattern_names": ["HIGH_LEAD_COST"],
            "matched_patterns": [
                {"interpretation": "Lead cost is significantly elevated."}
            ],
            "overall_severity": "high",
            "analysis": {
                "overall_health": "High Risk",
                "business_summary": "Client performance is at high risk.",
                "positive_signals": [],
                "risk_factors": ["High lead acquisition cost"],
                "recommendations": ["Review campaign targeting"],
            },
        },
    )

    node = KPIEmbeddingNode()
    expected_embedding = [0.1] * 768

    class FakeEmbeddingProvider:
        def generate_embedding(self, content):
            assert "Overall Severity: high" in content
            return expected_embedding

    class FakeRepository:
        def __init__(self):
            self.saved_data = None

        def find_by_client_id(self, client_id):
            assert client_id == "TEST140"
            return None

        def save_embedding(self, content, embedding, metadata):
            self.saved_data = {
                "content": content,
                "embedding": embedding,
                "metadata": metadata,
            }

    repository = FakeRepository()
    node.embedding_provider = FakeEmbeddingProvider()
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert len(result.kpi_embedding) == 768
    assert result.kpi_embedding == expected_embedding
    assert result.metadata["kpi_embedding_metadata"]["overall_severity"] == "high"
    assert repository.saved_data is not None
    assert len(repository.saved_data["embedding"]) == 768
    assert repository.saved_data["metadata"]["overall_severity"] == "high"


def test_tc141_uses_kpi_dataset_when_current_kpis_unavailable():
    context = WorkflowContext(
        client_id="TEST141",
        client_name="Fallback Client",
        kpi_dataset={
            "current_kpis": {
                "ad_spend_7d": 250.0,
                "lead_cost_7d": 35.0,
                "program_stage": "Active",
            }
        },
        kpi_interpretation={
            "matched_pattern_names": [],
            "matched_patterns": [],
            "overall_severity": "medium",
            "analysis": {
                "overall_health": "Moderate Risk",
                "business_summary": "Fallback KPI data test.",
                "positive_signals": [],
                "risk_factors": [],
                "recommendations": [],
            },
        },
    )

    node = KPIEmbeddingNode()

    class FakeEmbeddingProvider:
        def __init__(self):
            self.received_content = None

        def generate_embedding(self, content):
            self.received_content = content
            return [0.1] * 768

    class FakeRepository:
        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.embedding = embedding
            self.metadata = metadata

    provider = FakeEmbeddingProvider()
    repository = FakeRepository()

    node.embedding_provider = provider
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert "Ad Spend (7D): $250.00" in provider.received_content
    assert "Lead Cost (7D): $35.00" in provider.received_content
    assert len(result.kpi_embedding) == 768
    assert len(repository.embedding) == 768
    assert repository.metadata["overall_severity"] == "medium"


def test_tc142_omits_detected_patterns_section_when_no_patterns_exist():
    context = WorkflowContext(
        client_id="TEST142",
        client_name="No Pattern Client",
        current_kpis={
            "ad_spend_7d": 200.0,
            "lead_cost_7d": 25.0,
        },
        kpi_interpretation={
            "matched_pattern_names": [],
            "matched_patterns": [],
            "overall_severity": "low",
            "analysis": {
                "overall_health": "Healthy",
                "business_summary": "No KPI patterns detected.",
                "positive_signals": [],
                "risk_factors": [],
                "recommendations": [],
            },
        },
    )

    node = KPIEmbeddingNode()

    class FakeEmbeddingProvider:
        def __init__(self):
            self.content = None

        def generate_embedding(self, content):
            self.content = content
            return [0.1] * 768

    class FakeRepository:
        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.embedding = embedding
            self.metadata = metadata

    provider = FakeEmbeddingProvider()
    repository = FakeRepository()

    node.embedding_provider = provider
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert len(result.kpi_embedding) == 768
    assert "========== DETECTED PATTERNS ==========" not in provider.content
    assert repository.embedding == result.kpi_embedding


def test_tc143_handles_incomplete_analysis():
    context = WorkflowContext(
        client_id="TEST143",
        client_name="Incomplete Analysis Client",
        current_kpis={
            "ad_spend_7d": 300.0,
            "lead_cost_7d": 40.0,
        },
        kpi_interpretation={
            "matched_pattern_names": [],
            "matched_patterns": [],
            "analysis": {
                "business_summary": "Partial analysis available."
            },
        },
    )

    node = KPIEmbeddingNode()

    class FakeEmbeddingProvider:
        def __init__(self):
            self.content = None

        def generate_embedding(self, content):
            self.content = content
            return [0.1] * 768

    class FakeRepository:
        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.embedding = embedding
            self.metadata = metadata

    provider = FakeEmbeddingProvider()
    repository = FakeRepository()

    node.embedding_provider = provider
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert len(result.kpi_embedding) == 768
    assert "Overall Severity: Unknown" in provider.content
    assert "Overall Health: Unknown" in provider.content
    assert "Business Summary:\nPartial analysis available." in provider.content
    assert "Positive Signals:\nNone" in provider.content
    assert "Risk Factors:\nNone" in provider.content
    assert "Recommendations:\nNone" in provider.content
    assert repository.embedding == result.kpi_embedding
    assert repository.metadata["overall_severity"] is None


def test_tc144_handles_missing_kpi_values():
    context = WorkflowContext(
        client_id="TEST144",
        client_name="Missing KPI Client",
        current_kpis={
            "ad_spend_7d": None,
            "lead_cost_7d": "",
            "appt_cost_7d": 100.0,
        },
        kpi_interpretation={
            "matched_pattern_names": [],
            "matched_patterns": [],
            "overall_severity": "medium",
            "analysis": {
                "overall_health": "Moderate Risk",
                "business_summary": "Some KPI values are missing.",
                "positive_signals": [],
                "risk_factors": [],
                "recommendations": [],
            },
        },
    )

    node = KPIEmbeddingNode()

    class FakeEmbeddingProvider:
        def __init__(self):
            self.content = None

        def generate_embedding(self, content):
            self.content = content
            return [0.1] * 768

    class FakeRepository:
        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.embedding = embedding

    provider = FakeEmbeddingProvider()
    repository = FakeRepository()

    node.embedding_provider = provider
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert "Ad Spend (7D): $0" in provider.content
    assert "Lead Cost (7D): $0" in provider.content
    assert "Appointment Cost (7D): $100.00" in provider.content
    assert len(result.kpi_embedding) == 768
    assert repository.embedding == result.kpi_embedding


def test_tc145_formats_numeric_string_kpi_values():
    context = WorkflowContext(
        client_id="TEST145",
        client_name="String KPI Client",
        current_kpis={
            "ad_spend_7d": "1200",
            "ad_spend_mtd": "4500.50",
            "lead_cost_7d": "110.25",
        },
        kpi_interpretation={
            "matched_pattern_names": [],
            "matched_patterns": [],
            "overall_severity": "low",
            "analysis": {
                "overall_health": "Healthy",
                "business_summary": "KPI values supplied as strings.",
                "positive_signals": [],
                "risk_factors": [],
                "recommendations": [],
            },
        },
    )

    node = KPIEmbeddingNode()

    class FakeEmbeddingProvider:
        def __init__(self):
            self.content = None

        def generate_embedding(self, content):
            self.content = content
            return [0.1] * 768

    class FakeRepository:
        def find_by_client_id(self, client_id):
            return None

        def save_embedding(self, content, embedding, metadata):
            self.embedding = embedding

    provider = FakeEmbeddingProvider()
    repository = FakeRepository()

    node.embedding_provider = provider
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert "Ad Spend (7D): $1200.00" in provider.content
    assert "Ad Spend (MTD): $4500.50" in provider.content
    assert "Lead Cost (7D): $110.25" in provider.content
    assert len(result.kpi_embedding) == 768
    assert repository.embedding == result.kpi_embedding


def test_tc146_updates_existing_embedding_instead_of_creating_new():
    context = WorkflowContext(
        client_id="TEST146",
        client_name="Existing Embedding Client",
        current_kpis={
            "ad_spend_7d": 500.0,
            "lead_cost_7d": 45.0,
        },
        kpi_interpretation={
            "matched_pattern_names": ["HIGH_LEAD_COST"],
            "matched_patterns": [],
            "overall_severity": "high",
            "analysis": {
                "overall_health": "High Risk",
                "business_summary": "Existing embedding update test.",
                "positive_signals": [],
                "risk_factors": ["High lead cost"],
                "recommendations": ["Review campaign"],
            },
        },
    )

    node = KPIEmbeddingNode()

    existing_record = {"id": "EXISTING-146"}

    class FakeEmbeddingProvider:
        def generate_embedding(self, content):
            return [0.2] * 768

    class FakeRepository:
        def __init__(self):
            self.update_called = False
            self.save_called = False
            self.updated_id = None
            self.updated_data = None

        def find_by_client_id(self, client_id):
            assert client_id == "TEST146"
            return existing_record

        def update_embedding(self, record_id, data):
            self.update_called = True
            self.updated_id = record_id
            self.updated_data = data

        def save_embedding(self, content, embedding, metadata):
            self.save_called = True

    repository = FakeRepository()

    node.embedding_provider = FakeEmbeddingProvider()
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert repository.update_called is True
    assert repository.save_called is False
    assert repository.updated_id == "EXISTING-146"

    assert repository.updated_data["content"] == result.kpi_embedding_content
    assert repository.updated_data["embedding"] == result.kpi_embedding
    assert len(repository.updated_data["embedding"]) == 768
    assert repository.updated_data["metadata"]["overall_severity"] == "high"
    
def test_tc147_creates_new_embedding_when_no_existing_record():
    context = WorkflowContext(
        client_id="TEST147",
        client_name="New Embedding Client",
        current_kpis={
            "ad_spend_7d": 500.0,
            "lead_cost_7d": 45.0,
        },
        kpi_interpretation={
            "matched_pattern_names": ["HIGH_LEAD_COST"],
            "matched_patterns": [],
            "overall_severity": "high",
            "analysis": {
                "overall_health": "High Risk",
                "business_summary": "New embedding creation test.",
                "positive_signals": [],
                "risk_factors": ["High lead cost"],
                "recommendations": ["Review campaign"],
            },
        },
    )

    node = KPIEmbeddingNode()

    class FakeEmbeddingProvider:
        def generate_embedding(self, content):
            return [0.2] * 768

    class FakeRepository:
        def __init__(self):
            self.save_called = False
            self.update_called = False
            self.saved_content = None
            self.saved_embedding = None
            self.saved_metadata = None

        def find_by_client_id(self, client_id):
            assert client_id == "TEST147"
            return None

        def save_embedding(self, content, embedding, metadata):
            self.save_called = True
            self.saved_content = content
            self.saved_embedding = embedding
            self.saved_metadata = metadata

        def update_embedding(self, record_id, data):
            self.update_called = True

    repository = FakeRepository()

    node.embedding_provider = FakeEmbeddingProvider()
    node.kpi_embedding_repository = repository

    result = node.process(context)

    assert repository.save_called is True
    assert repository.update_called is False
    assert repository.saved_content == result.kpi_embedding_content
    assert repository.saved_embedding == result.kpi_embedding
    assert len(repository.saved_embedding) == 768
    assert repository.saved_metadata["overall_severity"] == "high"       
    
def test_tc148_raises_error_when_client_id_is_missing():
    from src.core.exceptions import ValidationException
    import pytest

    context = WorkflowContext(
        client_id=None,
        client_name="Test Client",
        current_kpis={"ad_spend_7d": 500.0},
        kpi_interpretation={
            "matched_pattern_names": [],
            "matched_patterns": [],
            "overall_severity": "medium",
            "analysis": {
                "overall_health": "Moderate Risk",
                "business_summary": "Test summary",
                "positive_signals": [],
                "risk_factors": [],
                "recommendations": [],
            },
        },
    )

    node = KPIEmbeddingNode()

    with pytest.raises(
        ValidationException,
        match="^Client ID is required\\.$"
    ):
        node.process(context)
        
def test_tc149_raises_error_when_kpi_interpretation_is_missing():
    from src.core.exceptions import ValidationException
    import pytest

    context = WorkflowContext(
        client_id="TEST149",
        client_name="Test Client",
        current_kpis={"ad_spend_7d": 500.0},
        kpi_interpretation=None,
    )

    node = KPIEmbeddingNode()

    with pytest.raises(
        ValidationException,
        match="^KPI interpretation is required\\.$"
    ):
        node.process(context)