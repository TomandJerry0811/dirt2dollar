from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.repositories.client_update_embedding_repository import ClientUpdateEmbeddingRepository
from src.core.exceptions import ValidationException, ServiceException, RepositoryException


class HistoricalUpdateMatchNode(BaseService):
    """
    Retrieves historical client update profiles that are semantically similar
    to the current client's generated summary embedding.

    Requires the Supabase function:
    public.match_historical_clients(
        query_embedding vector(768),
        match_threshold float,
        match_count int
    )
    """

    DEFAULT_MATCH_THRESHOLD = 0.65
    DEFAULT_MATCH_COUNT = 5

    def __init__(
        self,
        match_threshold: float = DEFAULT_MATCH_THRESHOLD,
        match_count: int = DEFAULT_MATCH_COUNT
    ):
        super().__init__(
            service_name="Historical Update Match Service",
            service_type="UPDATE_RETRIEVAL"
        )

        self.match_threshold = match_threshold
        self.match_count = match_count

        self.client_update_embedding_repository = (
            ClientUpdateEmbeddingRepository()
        )

    def validate(
        self,
        context: WorkflowContext
    ) -> bool:
        """
        A summary embedding must be generated before historical update retrieval.
        """
        if not context.summary_embedding:
            raise ValidationException(
                "Summary embedding is required before historical update matching."
            )

        if len(context.summary_embedding) != 768:
            raise ValidationException(
                "Summary embedding must contain exactly 768 dimensions."
            )

        return True

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:
        """
        Call the SQL RPC function and store the best historical update matches.
        """
        self.validate(context)

        try:
            matches = (
                self.client_update_embedding_repository
                .match_historical_clients(
                    query_embedding=context.summary_embedding,
                    match_threshold=self.match_threshold,
                    match_count=self.match_count
                )
            )
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to match historical updates for client '{context.client_id}': {error}"
            )

        context.summary_matches = matches or []

        context.metadata["summary_match_count"] = len(context.summary_matches)
        context.metadata["summary_match_threshold"] = self.match_threshold

        return context