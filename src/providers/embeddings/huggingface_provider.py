from typing import List

import numpy as np

from src.base.base_provider import BaseProvider
from src.core.settings import settings
from src.core.exceptions import ProviderException


class HuggingFaceProvider(BaseProvider):
    """
    Provider responsible for generating embeddings
    using a local sentence-transformers model.

    This provider contains NO business logic.
    """

    EXPECTED_DIMENSION = 768

    def __init__(self):
        super().__init__(
            provider_name="HuggingFace Local Provider",
            base_url="LOCAL_MODEL",
        )
        self.client = None  # not used; kept for interface

        model_name = getattr(settings, "embedding_model", None) or "sentence-transformers/all-mpnet-base-v2"

        try:
            from sentence_transformers import SentenceTransformer
            self.model = SentenceTransformer(model_name)
        except Exception as error:
            raise ProviderException(
                f"Unable to load embedding model '{model_name}': {error}"
            )

        self.expected_dimension = getattr(settings, "embedding_dimension", self.EXPECTED_DIMENSION)

    # -------------------------------------------------
    # Connection
    # -------------------------------------------------

    def connect(self):
        """
        For local model, nothing special to connect.
        Kept for interface compatibility.
        """
        super().connect()

        try:
            test_vec = self.model.encode("test", convert_to_numpy=True)
        except Exception as error:
            raise ProviderException(
                f"Embedding model failed a test encode: {error}"
            )

        if test_vec.shape[-1] != self.expected_dimension:
            raise ProviderException(
                f"Embedding dimension mismatch: expected "
                f"{self.expected_dimension}, got {test_vec.shape[-1]}"
            )

    # -------------------------------------------------
    # Internal Validation
    # -------------------------------------------------

    def _validate_text(self, text: str) -> None:
        if not isinstance(text, str):
            raise ProviderException("Input text must be a string.")
        if not text.strip():
            raise ProviderException("Input text cannot be empty.")

    def _validate_embedding_dimension(self, embedding) -> None:
        if embedding is None:
            raise ProviderException("Embedding cannot be None.")

        if len(embedding) != self.expected_dimension:
            raise ProviderException(
                f"Embedding dimension mismatch: expected "
                f"{self.expected_dimension}, got {len(embedding)}"
            )

    def _to_float_list(self, embedding) -> List[float]:
        try:
            if isinstance(embedding, np.ndarray):
                embedding = embedding.astype(np.float32).tolist()
            elif isinstance(embedding, list):
                embedding = [float(x) for x in embedding]
            else:
                embedding = list(embedding)
                embedding = [float(x) for x in embedding]
        except (TypeError, ValueError) as error:
            raise ProviderException(
                f"Could not convert embedding to float list: {error}"
            )

        self._validate_embedding_dimension(embedding)
        return embedding

    # -------------------------------------------------
    # Local Embedding Execution
    # -------------------------------------------------

    def _generate_local_embedding(self, text: str) -> List[float]:
        """
        Generate embedding using local sentence-transformers model.
        """
        try:
            vec = self.model.encode(text, convert_to_numpy=True)
        except Exception as error:
            raise ProviderException(
                f"Local embedding generation failed: {error}"
            )

        if vec.ndim > 1:
            vec = vec.squeeze()

        return self._to_float_list(vec)

    def send_request(self, text: str):
        """
        Generate embedding for input text via local model.
        """
        try:
            self.connect()
            self._validate_text(text)

            embedding = self._generate_local_embedding(text)

            return np.asarray(embedding, dtype=np.float32)

        except ProviderException:
            raise

        except Exception as error:
            raise ProviderException(
                f"HuggingFace request failed: {error}"
            )

    # -------------------------------------------------
    # Weighted Embedding
    # -------------------------------------------------

    def generate_weighted_embedding(
        self,
        summary_embedding: List[float],
        kpi_embedding: List[float],
        summary_weight: float = 0.7,
        kpi_weight: float = 0.3,
    ) -> List[float]:
        """
        Generate a weighted embedding by combining
        summary and KPI embeddings.

        The resulting vector is normalized to unit length.
        """
        try:
            summary_embedding_arr = np.asarray(summary_embedding, dtype=np.float32)
            kpi_embedding_arr = np.asarray(kpi_embedding, dtype=np.float32)

            self._validate_embedding_dimension(summary_embedding_arr)
            self._validate_embedding_dimension(kpi_embedding_arr)

            if summary_embedding_arr.shape != kpi_embedding_arr.shape:
                raise ProviderException(
                    "Summary and KPI embeddings must have the same dimension."
                )

            weighted_embedding = (
                summary_weight * summary_embedding_arr +
                kpi_weight * kpi_embedding_arr
            )

            norm = np.linalg.norm(weighted_embedding)

            if norm > 0:
                weighted_embedding = weighted_embedding / norm

            weighted_embedding = weighted_embedding.astype(np.float32)
            self._validate_embedding_dimension(weighted_embedding)

            return weighted_embedding.tolist()

        except ProviderException:
            raise

        except Exception as error:
            raise ProviderException(
                f"Failed to generate weighted embedding: {error}"
            )

    # -------------------------------------------------
    # Response Parsing
    # -------------------------------------------------

    def parse_response(self, response):
        """
        Standardize embedding response.
        """
        try:
            embedding = self._to_float_list(response)

            return {
                "embedding": embedding,
                "dimension": len(embedding),
                "model": settings.embedding_model,
            }

        except ProviderException:
            raise

        except Exception as error:
            raise ProviderException(
                f"Failed to parse HuggingFace response: {error}"
            )

    # -------------------------------------------------
    # Disconnect
    # -------------------------------------------------

    def disconnect(self):
        """
        For local provider, there's nothing heavy to release.
        Kept for interface compatibility.
        """
        super().disconnect()
        self.client = None

    # -------------------------------------------------
    # Convenience Method
    # -------------------------------------------------

    def generate_embedding(self, text: str):
        """
        Generate embedding for text.
        """
        return self.execute(text=text)