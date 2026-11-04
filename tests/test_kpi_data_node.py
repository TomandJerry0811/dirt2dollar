
from src.domain.entities.workflow_context import WorkflowContext
from src.nodes.kpi_data_node import KPIDataNode


def test_kpi_data_node_populates_current_kpis():
    records = [
        {
            "client_id": "TEST001",
            "client_name": "Test Client",
            "ad_spend_7d": "450.50",
            "lead_cost_7d": "45.25",
            "created_at": "2026-11-01T10:00:00Z",
            "updated_at": "2026-11-01T10:00:00Z",
        },
        {
            "client_id": "TEST001",
            "client_name": "Test Client",
            "ad_spend_7d": "580.93",
            "lead_cost_7d": "52.81",
            "ad_spend_mtd": "1200.50",
            "ad_spend_30d": "2500.75",
            "created_at": "2026-11-02T10:00:00Z",
            "updated_at": "2026-11-02T10:00:00Z",
        },
    ]

    context = WorkflowContext(
        client_id="TEST001",
        client_name="Test Client",
    )

    node = KPIDataNode()

    class FakeRepository:
        def find_by_id(self, client_id):
            return records

    node.kpi_repository = FakeRepository()
    result = node.process(context)

    assert result.current_kpis["ad_spend_7d"] == 580.93
    assert result.current_kpis["lead_cost_7d"] == 52.81
    assert result.current_kpis == result.kpi_dataset["current_kpis"]
    assert result.kpi_dataset["record_count"] == 2
    assert result.kpi_dataset["windows_calculated"] == [
        "7d", "mtd", "30d"
    ]


def test_kpi_data_node_creates_missing_client_record():
    context = WorkflowContext(
        client_id="999",
        client_name="New Client",
        google_sheet_data={
            "client_id": "999",
            "client_name": "New Client",
            "program_type": "Seasonal",
            "program_stage": "Launch",
            "program_duration": "90 Days",
            "campaign_status": "Active",
            "call_center_status": "Available",
            "ad_spend_7d": 100,
            "ad_spend_mtd": 300,
            "ad_spend_30d": 900,
            "lead_cost_7d": 20,
            "lead_cost_mtd": 25,
            "lead_cost_30d": 30,
            "appt_cost_7d": 40,
            "appt_cost_mtd": 45,
            "appt_cost_30d": 50,
            "appointments_7d": 5,
            "appointments_mtd": 10,
            "appointments_30d": 20,
        },
    )

    node = KPIDataNode()

    class FakeRepository:
        def __init__(self):
            self.records = []
            self.saved = False

        def find_by_id(self, client_id):
            return [
                record for record in self.records
                if record["client_id"] == client_id
            ]

        def save(self, data):
            self.records.append(data.copy())
            self.saved = True
            return [data]

    fake_repository = FakeRepository()
    node.kpi_repository = fake_repository

    result = node.process(context)

    assert fake_repository.saved is True
    assert result.kpi_dataset["record_count"] == 1
    assert result.current_kpis

    assert result.current_kpis["appointments_7d"] == 5.0
    assert result.current_kpis["appointments_mtd"] == 10.0
    assert result.current_kpis["appointments_30d"] == 20.0


def test_kpi_data_node_selects_latest_using_created_at():
    records = [
        {
            "client_id": "TEST002",
            "ad_spend_7d": "100",
            "created_at": "2026-07-08",
        },
        {
            "client_id": "TEST002",
            "ad_spend_7d": "300",
            "created_at": "2026-07-10",
        },
        {
            "client_id": "TEST002",
            "ad_spend_7d": "200",
            "created_at": "2026-07-09",
        },
    ]

    node = KPIDataNode()

    normalized_records = [
        node._normalize_record(record)
        for record in records
    ]

    latest = node._select_latest_record(normalized_records)

    assert latest["ad_spend_7d"] == 300.0
    assert latest["created_at"] == "2026-07-10"


def test_kpi_data_node_resolves_client_name_from_google_sheet():
    records = [
        {
            "client_id": "TEST137",
            "ad_spend_7d": "300",
            "created_at": "2026-11-03T10:00:00Z",
        }
    ]

    context = WorkflowContext(
        client_id="TEST137",
        google_sheet_data={
            "client_name": "Sheet Client",
        },
    )

    node = KPIDataNode()

    class FakeRepository:
        def find_by_id(self, client_id):
            return records

    node.kpi_repository = FakeRepository()

    result = node.process(context)

    assert result.client_name == "Sheet Client"
    assert result.kpi_dataset["client_name"] == "Sheet Client"
    assert result.kpi_dataset["record_count"] == 1


def test_kpi_data_node_creates_record_from_latest_client_update():
    context = WorkflowContext(
        client_id="106",
        latest_client_update={
            "client_id": "106",
            "client_name": "Fallback Client",
            "program_stage": "Active",
            "ad_spend_7d": "150.0",
        },
    )

    node = KPIDataNode()

    class FakeRepository:
        def __init__(self):
            self.records = []
            self.saved = False

        def find_by_id(self, client_id):
            return [
                record for record in self.records
                if record["client_id"] == client_id
            ]

        def save(self, data):
            self.records.append(data.copy())
            self.saved = True
            return [data]

    fake_repository = FakeRepository()
    node.kpi_repository = fake_repository

    result = node.process(context)

    assert fake_repository.saved is True
    assert result.kpi_dataset["record_count"] == 1
    assert result.client_name == "Fallback Client"

    assert result.current_kpis["client_id"] == "106"
    assert result.current_kpis["program_stage"] == "Active"
    assert result.current_kpis["ad_spend_7d"] == 150.0

    assert result.kpi_dataset["client_id"] == "106"


def test_kpi_data_node_handles_empty_repository_after_save():
    context = WorkflowContext(
        client_id="139",
        client_name="Empty Result Client",
        google_sheet_data={
            "client_id": "139",
            "client_name": "Empty Result Client",
            "program_stage": "Active",
            "ad_spend_7d": 150,
        },
    )

    node = KPIDataNode()

    class FakeRepository:
        def __init__(self):
            self.save_called = False
            self.fetch_count = 0

        def find_by_id(self, client_id):
            self.fetch_count += 1
            return []

        def save(self, data):
            self.save_called = True
            return [data]

    fake_repository = FakeRepository()
    node.kpi_repository = fake_repository

    result = node.process(context)

    assert fake_repository.save_called is True
    assert fake_repository.fetch_count == 2

    assert result.kpi_dataset["record_count"] == 0
    assert result.current_kpis == {}
    assert result.kpi_dataset["current_kpis"] == {}
    assert result.kpi_dataset["windows_calculated"] == []
    assert result.kpi_dataset["records"] == []
