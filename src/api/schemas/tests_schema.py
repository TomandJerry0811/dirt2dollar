from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ClientExtractionTestCase(BaseModel):
    test_case: int
    query: str
    client_name: Optional[str] = None
    extraction_method: Optional[str] = None


class ClientExtractionTestResponse(BaseModel):
    test_suite: str = "Client Name Extraction Test"
    total_cases: int
    results: List[ClientExtractionTestCase]


class ClientDataRetrievalTestResponse(BaseModel):
    client_id: Optional[str] = None
    client_name: Optional[str] = None
    program_type: Optional[str] = None
    program_stage: Optional[str] = None
    campaign_status: Optional[str] = None
    current_satisfaction: Optional[str] = None
    current_kpis: Dict[str, Any] = {}
    total_updates: int = 0
    latest_update: Optional[Dict[str, Any]] = None


class AvailableTestItem(BaseModel):
    name: str
    endpoint: str
    description: str


class AvailableTestsResponse(BaseModel):
    available_tests: List[AvailableTestItem]


class AllTestsResponse(BaseModel):
    status: str = "success"
    test_suites: Dict[str, Any]
