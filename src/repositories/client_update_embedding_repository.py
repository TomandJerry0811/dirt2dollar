from src.base.base_repository import BaseRepository
from src.core.exceptions import RepositoryException


class ClientUpdateEmbeddingRepository(BaseRepository):
    EXPECTED_DIMENSION = 768

    def __init__(self):
        super().__init__(
            repository_name="Client Update Embedding Repository",
            table_name="client_update_embeddings"
        )

    def _validate_embedding(self, embedding: list) -> None:
        if not isinstance(embedding, list):
            raise RepositoryException("Embedding must be a list.")
        if len(embedding) != self.EXPECTED_DIMENSION:
            raise RepositoryException(
                f"Invalid embedding dimension: expected "
                f"{self.EXPECTED_DIMENSION}, got {len(embedding)}"
            )

    def match_historical_clients(
        self,
        query_embedding: list,
        match_threshold: float = 0.65,
        match_count: int = 5,
    ) -> list:
        try:
            self._validate_embedding(query_embedding)

            response = self.provider.execute(
                operation="rpc",
                function_name="match_historical_clients",
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
                f"Failed to match historical clients: {error}"
            )