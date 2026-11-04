
from typing import Any, Dict, List, Optional

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.providers.embeddings.huggingface_provider import HuggingFaceProvider
from src.repositories.kpi_embedding_repository import KPIEmbeddingRepository
from src.core.exceptions import (
    ValidationException,
    ServiceException,
    ProviderException,
    RepositoryException,
)


class KPIEmbeddingNode(BaseService):
    """
    Generates a semantic embedding from the KPI interpretation,
    persists it in the vector table and updates the workflow context.
    """

    def __init__(self):
        super().__init__(
            service_name="KPI Embedding Service",
            service_type="KPI_EMBEDDING",
        )

        self.embedding_provider = HuggingFaceProvider()
        self.kpi_embedding_repository = KPIEmbeddingRepository()

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(self, context: WorkflowContext):
        if not context.client_id:
            raise ValidationException("Client ID is required.")

        if not context.kpi_interpretation:
            raise ValidationException("KPI interpretation is required.")

        return True

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(self, context: WorkflowContext) -> WorkflowContext:

        # Validate before generating or persisting embeddings.
        self.validate(context)

        interpretation = context.kpi_interpretation or {}
        current_kpis = context.current_kpis or {}

        if not current_kpis and context.kpi_dataset:
            current_kpis = context.kpi_dataset.get("current_kpis", {})

        # Build embedding content
        try:
            content = self._build_embedding_content(
                client_name=context.client_name,
                current_kpis=current_kpis,
                interpretation=interpretation,
            )
        except Exception as error:
            raise ServiceException(
                f"Failed to build KPI embedding content "
                f"for client '{context.client_id}': {error}"
            )

        # Generate embedding
        embedding = self._generate_embedding(content)

        # Metadata
        metadata = {
            "client_id": context.client_id,
            "source": "kpi_interpretation",
            "matched_pattern_names": interpretation.get(
                "matched_pattern_names", []
            ),
            "overall_severity": interpretation.get("overall_severity"),
        }

        # Find existing embedding
        try:
            existing = (
                self.kpi_embedding_repository.find_by_client_id(
                    context.client_id
                )
            )
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to look up existing KPI embedding "
                f"for client '{context.client_id}': {error}"
            )

        # Update existing / Insert new
        try:
            if existing:
                self.kpi_embedding_repository.update_embedding(
                    existing["id"],
                    {
                        "content": content,
                        "embedding": embedding,
                        "metadata": metadata,
                    },
                )
            else:
                self.kpi_embedding_repository.save_embedding(
                    content,
                    embedding,
                    metadata,
                )

        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to persist KPI embedding "
                f"for client '{context.client_id}': {error}"
            )

        # Update Workflow Context
        context.kpi_embedding = embedding
        context.kpi_embedding_content = content
        context.metadata["kpi_embedding_metadata"] = metadata

        return context

    # -------------------------------------------------
    # Build Embedding Content
    # -------------------------------------------------

    def _build_embedding_content(
        self,
        client_name: Optional[str],
        current_kpis: Dict[str, Any],
        interpretation: Dict[str, Any],
    ) -> str:

        program_type = current_kpis.get("program_type")
        program_stage = current_kpis.get("program_stage")
        campaign_status = current_kpis.get("campaign_status")
        call_center_status = current_kpis.get("call_center_status")

        ad_spend_7d = self._format_number(
            current_kpis.get("ad_spend_7d")
        )
        ad_spend_mtd = self._format_number(
            current_kpis.get("ad_spend_mtd")
        )
        ad_spend_30d = self._format_number(
            current_kpis.get("ad_spend_30d")
        )

        lead_cost_7d = self._format_number(
            current_kpis.get("lead_cost_7d")
        )
        lead_cost_mtd = self._format_number(
            current_kpis.get("lead_cost_mtd")
        )
        lead_cost_30d = self._format_number(
            current_kpis.get("lead_cost_30d")
        )

        appt_cost_7d = self._format_number(
            current_kpis.get("appt_cost_7d")
        )
        appt_cost_mtd = self._format_number(
            current_kpis.get("appt_cost_mtd")
        )
        appt_cost_30d = self._format_number(
            current_kpis.get("appt_cost_30d")
        )

        matched_pattern_keys = interpretation.get(
            "matched_pattern_names", []
        ) or []

        matched_patterns = interpretation.get(
            "matched_patterns", []
        ) or []

        analysis = interpretation.get("analysis", {}) or {}

        overall_severity = interpretation.get("overall_severity")
        overall_health = analysis.get("overall_health")
        business_summary = analysis.get("business_summary")

        positive_signals = analysis.get(
            "positive_signals", []
        ) or []

        risk_factors = analysis.get(
            "risk_factors", []
        ) or []

        recommendations = analysis.get(
            "recommendations", []
        ) or []

        interpretation_lines = []

        for pattern in matched_patterns:
            text = (pattern or {}).get("interpretation")

            if text:
                interpretation_lines.append(text)

        interpretation_lines = list(
            dict.fromkeys(interpretation_lines)
        )

        content_parts = [
            "========== CLIENT ==========",
            f"Client Name: {client_name or 'Unknown Client'}",
            "",
            "========== PROGRAM ==========",
            f"Program Type: {program_type or 'Unknown'}",
            f"Program Stage: {program_stage or 'Unknown'}",
            f"Campaign Status: {campaign_status or 'Unknown'}",
            f"Call Center Status: {call_center_status or 'Unknown'}",
            "",
            "========== CURRENT KPI METRICS ==========",
            f"Ad Spend (7D): {ad_spend_7d}",
            f"Ad Spend (MTD): {ad_spend_mtd}",
            f"Ad Spend (30D): {ad_spend_30d}",
            "",
            f"Lead Cost (7D): {lead_cost_7d}",
            f"Lead Cost (MTD): {lead_cost_mtd}",
            f"Lead Cost (30D): {lead_cost_30d}",
            "",
            f"Appointment Cost (7D): {appt_cost_7d}",
            f"Appointment Cost (MTD): {appt_cost_mtd}",
            f"Appointment Cost (30D): {appt_cost_30d}",
        ]

        # Include detected patterns only when patterns exist.
        if matched_pattern_keys:
            content_parts.extend([
                "",
                "========== DETECTED PATTERNS ==========",
                ", ".join(matched_pattern_keys),
            ])

        # Remaining interpretation and analysis
        content_parts.extend([
            "",
            "========== BUSINESS INTERPRETATIONS ==========",
            "\n".join(interpretation_lines)
            if interpretation_lines
            else "None",
            "",
            "========== LLM ANALYSIS ==========",
            f"Overall Severity: {overall_severity or 'Unknown'}",
            f"Overall Health: {overall_health or 'Unknown'}",
            "",
            "Business Summary:",
            business_summary or "None",
            "",
            "Positive Signals:",
            "\n".join(
                f"- {signal}" for signal in positive_signals
            ) or "None",
            "",
            "Risk Factors:",
            "\n".join(
                f"- {risk}" for risk in risk_factors
            ) or "None",
            "",
            "Recommendations:",
            "\n".join(
                f"- {rec}" for rec in recommendations
            ) or "None",
        ])

        return "\n".join(content_parts).strip()

    # -------------------------------------------------
    # Generate Embedding
    # -------------------------------------------------

    def _generate_embedding(self, content: str) -> List[float]:

        try:
            embedding = self.embedding_provider.generate_embedding(
                content
            )
        except ProviderException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to generate KPI embedding: {error}"
            )

        if isinstance(embedding, dict):
            result = (
                embedding.get("embedding")
                or embedding.get("vector")
            )

            if not result:
                raise ServiceException(
                    "Embedding provider returned a dict with no "
                    "'embedding' or 'vector' key."
                )

            return result

        if isinstance(embedding, list):
            return embedding

        raise ServiceException(
            "Invalid embedding returned from HuggingFaceProvider."
        )

    # -------------------------------------------------
    # Format Numbers
    # -------------------------------------------------

    def _format_number(self, value: Any) -> str:

        if value in (None, ""):
            return "$0"

        try:
            return f"${float(value):.2f}"
        except (TypeError, ValueError):
            return str(value)
