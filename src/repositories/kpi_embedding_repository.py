from src.base.base_embedding_repository import BaseEmbeddingRepository
from src.core.exceptions import RepositoryException


class KPIEmbeddingRepository(BaseEmbeddingRepository):
    """
    Repository responsible for storing and
    retrieving KPI embeddings.

    Inherits all common embedding operations
    from BaseEmbeddingRepository.
    """

    EXPECTED_DIMENSION = 768

    def __init__(self):
        super().__init__(
            repository_name="KPI Embedding Repository",
            table_name="client_kpi_embeddings"
        )

    def match_historical_kpis(
        self,
        query_embedding,
        match_threshold: float = 0.65,
        match_count: int = 5
    ):
        """
        Calls the Supabase RPC function that runs KPI vector similarity search.
        """
        try:
            if not isinstance(query_embedding, list):
                raise RepositoryException("Embedding must be a list.")

            if len(query_embedding) != self.EXPECTED_DIMENSION:
                raise RepositoryException(
                    f"Invalid embedding dimension: expected "
                    f"{self.EXPECTED_DIMENSION}, got {len(query_embedding)}"
                )

            response = self.provider.execute(
                operation="rpc",
                function_name="match_historical_kpis",
                parameters={
                    "query_embedding": query_embedding,
                    "match_threshold": match_threshold,
                    "match_count": match_count,
                }
            )

            return getattr(response, "data", response) or []

        except RepositoryException:
            raise

        except Exception as error:
            raise RepositoryException(
                f"Failed to match historical KPIs: {error}"
            )