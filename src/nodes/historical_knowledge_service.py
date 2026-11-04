from typing import Any, Dict, List

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.providers.embeddings.huggingface_provider import (
    HuggingFaceProvider
)
from src.repositories.weighted_embedding_repository import (
    WeightedEmbeddingRepository
)
from src.core.exceptions import ValidationException, ServiceException, ProviderException, RepositoryException


# Service responsible for building a retrieval profile from the
# current client's state, embedding it, and retrieving similar
# historical clients from the Historical Knowledge Base.
class HistoricalKnowledgeService(BaseService):
    """
    Similarity Retrieval Engine.

    Builds a text profile from the current client's summary,
    KPI interpretation, and program context, embeds it, and
    queries the Historical Knowledge Base (client_weighted_embeddings)
    for similar past client states via match_client_update.

    Populates context.historical_matches for downstream use
    by the Churn Probability & Risk Analysis workflow.
    """

    def __init__(
        self,
        match_count: int = 5,
        match_threshold: float = 0.75
    ):
        # Initialize the base service with service metadata.
        super().__init__(
            service_name="Historical Knowledge Service",
            service_type="SIMILARITY_RETRIEVAL"
        )

        # Repository backing the Historical Knowledge Base.
        self.weighted_embedding_repository = (
            WeightedEmbeddingRepository()
        )

        # Provider used to embed the retrieval profile.
        self.huggingface_provider = HuggingFaceProvider()

        # Similarity search configuration.
        self.match_count = match_count
        self.match_threshold = match_threshold

    def validate(self, context: WorkflowContext):
        # Ensure a client_id exists before retrieval.
        if not context.client_id:
            raise ValidationException("client_id is required in workflow context")

        # Need at least a summary or KPI interpretation to build a profile.
        summary_text = context.final_client_summary or context.summary
        if not summary_text and not context.kpi_interpretation:
            raise ValidationException(
                "final summary or kpi interpretation is required "
                "to build a retrieval profile"
            )

        return True

    def process(self, context: WorkflowContext) -> WorkflowContext:
        # Build the retrieval profile text from current client state.
        retrieval_profile = self._build_retrieval_profile(context)

        # Embed the retrieval profile.
        try:
            embedding_response = self.huggingface_provider.generate_embedding(
                text=retrieval_profile
            )
        except ProviderException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to embed retrieval profile for client '{context.client_id}': {error}"
            )

        query_embedding = embedding_response.get("embedding")

        if not query_embedding:
            raise ServiceException(
                "Embedding provider returned no embedding for the retrieval profile."
            )

        # Query the Historical Knowledge Base for similar clients.
        historical_matches = self._find_similar_clients(
            query_embedding=query_embedding,
            client_id=context.client_id
        )

        # Store the results in the shared workflow context.
        context.historical_matches = historical_matches

        return context

    def _build_retrieval_profile(
        self,
        context: WorkflowContext
    ) -> str:
        # Decide which summary text should be used for retrieval.
        summary_text = context.final_client_summary or context.summary or ""

        # Pull out KPI interpretation details when available.
        kpi_interpretation = context.kpi_interpretation or {}
        matched_pattern_names = kpi_interpretation.get(
            "matched_pattern_names", []
        )
        overall_severity = kpi_interpretation.get(
            "overall_severity", "unknown"
        )

        # Assemble a compact text profile, mirroring the retrieval
        # profile built in the n8n "Build Retrieval Profile" node.
        profile_lines = [
            f"Program type: {context.program_type or 'unknown'}",
            f"Program stage: {context.program_stage or 'unknown'}",
            f"Program duration: {context.program_duration or 'unknown'}",
            f"Campaign status: {context.campaign_status or 'unknown'}",
            f"KPI severity: {overall_severity}",
            f"Matched KPI patterns: {', '.join(matched_pattern_names) or 'none'}",
            f"Latest summary snippet: {summary_text[:500]}",
        ]

        return "\n".join(profile_lines).strip()

    def _find_similar_clients(
        self,
        query_embedding: List[float],
        client_id: str
    ) -> List[Dict[str, Any]]:
        # Query the Historical Knowledge Base, excluding the
        # current client from its own similarity results.
        try:
            results = self.weighted_embedding_repository.find_similar(
                query_embedding=query_embedding,
                match_count=self.match_count,
                match_threshold=self.match_threshold
            ) or []
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to query historical knowledge base for client '{client_id}': {error}"
            )

        return [
            match for match in results
            if (match.get("metadata") or {}).get("client_id") != client_id
        ]