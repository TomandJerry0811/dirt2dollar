from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.repositories.kpi_embedding_repository import KPIEmbeddingRepository
from src.core.exceptions import ValidationException, ServiceException, RepositoryException


class HistoricalKPIMatchNode(BaseService):
    """
    Retrieves historical client KPI profiles that are semantically similar
    to the current client's generated KPI embedding.

    Requires the Supabase function:
    public.match_historical_kpis(
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
            service_name="Historical KPI Match Service",
            service_type="KPI_RETRIEVAL"
        )

        self.match_threshold = match_threshold
        self.match_count = match_count

        self.kpi_embedding_repository = KPIEmbeddingRepository()

    def validate(
        self,
        context: WorkflowContext
    ) -> bool:
        """
        A KPI embedding must be generated before historical retrieval.
        """
        if not context.kpi_embedding:
            raise ValidationException(
                "KPI embedding is required before historical KPI matching."
            )

        if len(context.kpi_embedding) != 768:
            raise ValidationException(
                "KPI embedding must contain exactly 768 dimensions."
            )

        return True

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:
        """
        Call the SQL RPC function and store the best historical KPI matches.
        """
        self.validate(context)

        try:
            matches = (
                self.kpi_embedding_repository
                .match_historical_kpis(
                    query_embedding=context.kpi_embedding,
                    match_threshold=self.match_threshold,
                    match_count=self.match_count
                )
            )
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to match historical KPIs for client '{context.client_id}': {error}"
            )

        context.kpi_matches = matches or []

        context.metadata["kpi_match_count"] = len(context.kpi_matches)
        context.metadata["kpi_match_threshold"] = self.match_threshold

        return context