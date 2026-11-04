from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ClientInfo(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    program_type: Optional[str] = None
    program_duration: Optional[str] = None
    program_stage: Optional[str] = None
    campaign_status: Optional[str] = None


class SummaryResult(BaseModel):
    text: Optional[str] = None
    satisfaction_score: Optional[int] = None


class KPIResult(BaseModel):
    interpretation: Dict[str, Any] = {}


class HistoricalContext(BaseModel):
    historical_matches: List[Dict[str, Any]] = []
    summary_matches: List[Dict[str, Any]] = []
    kpi_matches: List[Dict[str, Any]] = []


class ChurnResult(BaseModel):
    probability: Optional[float] = None
    risk_level: Optional[str] = None
    analysis: Optional[str] = None
    red_flags: List[str] = []
    bottlenecks: List[str] = []
    historical_insights: List[str] = []


class ClientAnalysisResponse(BaseModel):
    client: ClientInfo
    summary: SummaryResult
    kpi: KPIResult
    historical_context: HistoricalContext
    churn: ChurnResult
    recommendations: List[str] = []
    status: Optional[str] = None