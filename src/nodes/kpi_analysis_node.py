
import json
from typing import Any, Dict, Optional, List

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.prompts.kpi_analysis_prompt import (
    KPI_ANALYSIS_SYSTEM_PROMPT,
    build_kpi_analysis_prompt,
)
from src.providers.llm.groq_provider import GroqProvider
from src.repositories.pattern_repository import PatternRepository
from src.core.exceptions import (
    ValidationException,
    ServiceException,
    RepositoryException,
)
from src.core.logging import logger


class KPIAnalysisNode(BaseService):
    """
    Analyze KPI trends, detect predefined business patterns,
    generate business interpretation using the LLM,
    and update the workflow context.
    """

    def __init__(self):
        super().__init__(
            service_name="KPI Analysis Service",
            service_type="KPI_ANALYSIS",
        )

        self.pattern_repository = PatternRepository()
        self.groq_provider = GroqProvider()

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(self, context: WorkflowContext):
        if not context.client_id:
            raise ValidationException("client_id is required.")

        if not context.kpi_dataset:
            raise ValidationException("kpi_dataset is required.")

        current_kpis = context.kpi_dataset.get("current_kpis")

        if not current_kpis:
            raise ValidationException(
                "current_kpis is missing from kpi_dataset."
            )

        return True

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(self, context: WorkflowContext) -> WorkflowContext:

        current_kpis = context.kpi_dataset["current_kpis"]
        current_kpis = self._normalize_record(current_kpis)

        try:
            matched_pattern_names = self._detect_patterns(current_kpis)
        except Exception as error:
            raise ServiceException(
                f"Failed to detect KPI patterns for client "
                f"'{context.client_id}': {error}"
            )

        # -------------------------------------------------
        # DATA INCOMPLETE: deterministic handling
        # -------------------------------------------------

        if "DATA_INCOMPLETE" in matched_pattern_names:

            matched_patterns = self._fetch_pattern_rows(
                ["DATA_INCOMPLETE"]
            )

            # Use a deterministic fallback if the pattern
            # is not available in the pattern repository.
            if not matched_patterns:
                matched_patterns = [
                    {
                        "pattern_key": "DATA_INCOMPLETE",
                        "category": "data_quality",
                        "severity": "medium",
                        "interpretation": (
                            "Required KPI values are missing. "
                            "There is insufficient data to reliably "
                            "evaluate client performance."
                        ),
                    }
                ]

            overall_severity = "medium"

            analysis = {
                "overall_health": "Moderate Risk",
                "business_summary": (
                    "KPI analysis cannot be completed reliably because "
                    "one or more required KPI values are missing. "
                    "The available data is insufficient to determine "
                    "the client's actual performance or churn risk."
                ),
                "positive_signals": [],
                "risk_factors": [
                    (
                        "Required KPI values are missing. "
                        "A reliable performance assessment cannot "
                        "be generated."
                    )
                ],
                "recommendations": [
                    (
                        "Verify the source KPI dataset and provide "
                        "all required lead-cost and appointment-cost "
                        "values."
                    ),
                    (
                        "Re-run KPI analysis after the missing values "
                        "have been corrected."
                    ),
                ],
            }

            context.kpi_interpretation = {
                "client_id": context.client_id,
                "client_name": context.client_name,
                "matched_pattern_names": ["DATA_INCOMPLETE"],
                "matched_patterns": matched_patterns,
                "overall_severity": overall_severity,
                "analysis": analysis,
            }

            logger.warning(
                f"KPI analysis skipped for client '{context.client_id}': "
                "required KPI data is incomplete."
            )

            return context

        # -------------------------------------------------
        # Normal KPI analysis
        # -------------------------------------------------

        matched_patterns = self._fetch_pattern_rows(
            matched_pattern_names
        )

        overall_severity = self._calculate_overall_severity(
            matched_patterns
        )

        analysis = self._generate_kpi_analysis(
            client_name=context.client_name,
            current_kpis=current_kpis,
            matched_patterns=matched_patterns,
            overall_severity=overall_severity,
        )

        context.kpi_interpretation = {
            "client_id": context.client_id,
            "client_name": context.client_name,
            "matched_pattern_names": matched_pattern_names,
            "matched_patterns": matched_patterns,
            "overall_severity": overall_severity,
            "analysis": analysis,
        }

        return context

    # -------------------------------------------------
    # KPI Normalization
    # -------------------------------------------------

    def _normalize_record(
        self,
        record: Dict[str, Any],
    ) -> Dict[str, Any]:

        numeric_fields = {
            "ad_spend_7d",
            "ad_spend_mtd",
            "ad_spend_30d",
            "lead_cost_7d",
            "lead_cost_mtd",
            "lead_cost_30d",
            "appt_cost_7d",
            "appt_cost_mtd",
            "appt_cost_30d",
            "retry_count",
        }

        normalized = {}

        for key, value in record.items():
            if key in numeric_fields:
                normalized[key] = self._to_float(value)
            else:
                normalized[key] = value

        return normalized

    def _to_float(self, value: Any) -> Optional[float]:

        if value in (None, ""):
            return None

        try:
            return float(value)
        except (TypeError, ValueError):
            return value

    # -------------------------------------------------
    # Pattern Detection
    # -------------------------------------------------

    def _detect_patterns(
        self,
        kpi: Dict[str, Any],
    ) -> List[str]:

        patterns = []

        def num(field: str) -> Optional[float]:
            value = kpi.get(field)

            if value is None:
                return None

            try:
                return float(value)
            except (TypeError, ValueError):
                return None

        # Extract KPI values

        lead_7d = num("lead_cost_7d")
        lead_mtd = num("lead_cost_mtd")
        lead_30d = num("lead_cost_30d")

        appt_7d = num("appt_cost_7d")
        appt_mtd = num("appt_cost_mtd")
        appt_30d = num("appt_cost_30d")

        ad_7d = num("ad_spend_7d")
        ad_mtd = num("ad_spend_mtd")
        ad_30d = num("ad_spend_30d")

        # Data quality

        if (
            lead_7d is None
            or lead_mtd is None
            or lead_30d is None
            or appt_7d is None
            or appt_mtd is None
            or appt_30d is None
        ):
            patterns.append("DATA_INCOMPLETE")
            return patterns

        # Lead Cost (CPL)

        if lead_7d < lead_mtd < lead_30d:
            patterns.append("CPL_IMPROVING")

        elif lead_7d > lead_mtd > lead_30d:
            patterns.append("CPL_WORSENING")

        else:
            patterns.append("CPL_STABLE")

        if lead_30d and lead_7d > (lead_30d * 1.50):
            patterns.append("CPL_7D_SPIKE")

        elif lead_30d and lead_7d < (lead_30d * 0.70):
            patterns.append("CPL_7D_DROP")

        if lead_30d and (
            max(lead_7d, lead_mtd, lead_30d)
            - min(lead_7d, lead_mtd, lead_30d)
            > (lead_30d * 0.50)
        ):
            patterns.append("VOLATILE_CPL")

        # Appointment Cost

        if appt_7d < appt_mtd < appt_30d:
            patterns.append("CPAPT_IMPROVING")

        elif appt_7d > appt_mtd > appt_30d:
            patterns.append("CPAPT_WORSENING")

        else:
            patterns.append("CPAPT_STABLE")

        if appt_30d and appt_7d > (appt_30d * 1.50):
            patterns.append("CPAPT_7D_SPIKE")

        elif appt_30d and appt_7d < (appt_30d * 0.70):
            patterns.append("CPAPT_7D_DROP")

        if appt_30d and (
            max(appt_7d, appt_mtd, appt_30d)
            - min(appt_7d, appt_mtd, appt_30d)
            > (appt_30d * 0.50)
        ):
            patterns.append("VOLATILE_CPAPT")

        # Ad Spend

        if (
            ad_7d is not None
            and ad_mtd is not None
            and ad_30d is not None
        ):

            expected_weekly = ad_30d / 4.3

            if ad_7d > expected_weekly * 1.20:
                patterns.append("ADSPEND_INCREASING")

            elif ad_7d < expected_weekly * 0.80:
                patterns.append("ADSPEND_DECREASING")

            else:
                patterns.append("ADSPEND_STABLE")

        # Combined Funnel

        if lead_7d > lead_mtd and appt_7d > appt_mtd:
            patterns.append("HIGH_CPL_HIGH_CPAPT")

        elif lead_7d < lead_mtd and appt_7d < appt_mtd:
            patterns.append("LOW_CPL_LOW_CPAPT")

        elif lead_7d > lead_mtd and appt_7d < appt_mtd:
            patterns.append("HIGH_CPL_LOW_CPAPT")

        elif lead_7d < lead_mtd and appt_7d > appt_mtd:
            patterns.append("LOW_CPL_HIGH_CPAPT")

        # Funnel Health

        if lead_7d < lead_mtd and appt_7d < appt_mtd:
            patterns.append("FULL_FUNNEL_HEALTHY")

        if lead_7d < lead_mtd and appt_7d > appt_mtd:
            patterns.append("FUNNEL_BOTTLENECK")

        # Momentum

        if lead_7d < lead_mtd and appt_7d < appt_mtd:
            patterns.append("RECENT_POSITIVE_MOMENTUM")

        elif lead_7d > lead_mtd and appt_7d > appt_mtd:
            patterns.append("RECENT_NEGATIVE_MOMENTUM")

        if lead_mtd < lead_30d and appt_mtd < appt_30d:
            patterns.append("MTD_STRONGER_THAN_30D")

        elif lead_mtd > lead_30d and appt_mtd > appt_30d:
            patterns.append("MTD_WEAKER_THAN_30D")

        # Business Scenarios

        if ad_7d is not None and ad_mtd is not None:

            if ad_7d > ad_mtd and lead_7d > lead_mtd:
                patterns.append("HIGH_SPEND_LOW_RESULTS")

            if ad_7d < ad_mtd and lead_7d < lead_mtd:
                patterns.append("LOW_SPEND_HIGH_RESULTS")

        # Zero Activity

        if lead_7d == 0:
            patterns.append("NO_LEADS")

        if appt_7d == 0:
            patterns.append("NO_APPOINTMENTS")

        return list(dict.fromkeys(patterns))

    # -------------------------------------------------
    # Pattern Repository
    # -------------------------------------------------

    def _fetch_pattern_rows(
        self,
        pattern_keys: List[str],
    ) -> List[Dict[str, Any]]:

        matched_patterns = []

        for pattern_key in pattern_keys:

            try:
                pattern = (
                    self.pattern_repository.find_by_pattern_key(
                        pattern_key
                    )
                )

            except RepositoryException as error:
                logger.warning(
                    f"Could not fetch pattern '{pattern_key}': {error}"
                )
                continue

            if pattern:
                matched_patterns.append(pattern)

        return matched_patterns

    # -------------------------------------------------
    # Overall Severity
    # -------------------------------------------------

    def _calculate_overall_severity(
        self,
        matched_patterns: List[Dict[str, Any]],
    ) -> str:

        if not matched_patterns:
            return "low"

        severity_rank = {
            "healthy": 1,
            "warning": 2,
            "critical": 3,
            "data_quality": 2,
        }

        highest = max(
            severity_rank.get(
                p.get("category", "").lower(),
                1,
            )
            for p in matched_patterns
        )

        reverse = {
            1: "low",
            2: "medium",
            3: "high",
        }

        return reverse.get(highest, "low")

    # -------------------------------------------------
    # LLM Analysis
    # -------------------------------------------------

    def _generate_kpi_analysis(
        self,
        client_name: str,
        current_kpis: Dict[str, Any],
        matched_patterns: List[Dict[str, Any]],
        overall_severity: str,
    ) -> Dict[str, Any]:

        try:
            prompt = build_kpi_analysis_prompt(
                client_name=client_name,
                current_kpis=current_kpis,
                matched_patterns=matched_patterns,
                overall_severity=overall_severity,
            )

            response = self.groq_provider.generate_response(
                prompt=prompt,
                system_prompt=KPI_ANALYSIS_SYSTEM_PROMPT,
                temperature=0.2,
            )

            content = response.get("content", "").strip()

            if content.startswith("```"):
                content = (
                    content
                    .replace("```json", "")
                    .replace("```", "")
                    .strip()
                )

            return json.loads(content)

        except json.JSONDecodeError as error:
            logger.error(
                f"KPI analysis: LLM returned invalid JSON for "
                f"'{client_name}': {error}"
            )

        except Exception as error:
            logger.error(
                f"KPI analysis: generation failed for "
                f"'{client_name}': {error}",
                exc_info=True,
            )

        return {
            "overall_health": "Unknown",
            "business_summary": "Unable to generate KPI analysis.",
            "positive_signals": [],
            "risk_factors": [],
            "recommendations": [],
        }
