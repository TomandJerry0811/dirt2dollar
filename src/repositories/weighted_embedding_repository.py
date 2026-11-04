from src.base.base_embedding_repository import (
    BaseEmbeddingRepository
)


class WeightedEmbeddingRepository(
    BaseEmbeddingRepository
):
    """
    Repository responsible for storing and
    retrieving weighted embeddings.

    Inherits all common embedding operations
    from BaseEmbeddingRepository.
    """

    def __init__(self):

        super().__init__(
            repository_name="Weighted Embedding Repository",
            table_name="client_weighted_embeddings"
        )