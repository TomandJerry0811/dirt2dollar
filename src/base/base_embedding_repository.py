from src.base.base_repository import BaseRepository


class BaseEmbeddingRepository(BaseRepository):
    """
    Base repository for all embedding repositories.

    Provides operations for storing, updating
    and retrieving vector embeddings using
    similarity search.
    """

    def __init__(
        self,
        repository_name: str,
        table_name: str
    ):

        super().__init__(
            repository_name=repository_name,
            table_name=table_name
        )
    
    def find_by_client_id(
        self,
        client_id
    ):
        """
        Retrieve an embedding record whose metadata
        contains the given client_id.
        """

        records = self.provider.execute(
            operation="select",
            table=self.table_name
        )

        if not records:
            return None

        for record in records:

            metadata = record.get("metadata")

            if not isinstance(metadata, dict):
                continue

            if str(metadata.get("client_id")) == str(client_id):
                return record

        return None


    def find_all(
        self
    ):
        """
        Retrieve all embedding records.
        """

        return self.provider.execute(
            operation="select",
            table=self.table_name
        )

    # -------------------------------------------------
    # Create
    # -------------------------------------------------
    

    def save(
        self,
        data
    ):
        """
        Insert a new embedding record.
        """

        return self.provider.execute(
            operation="insert",
            table=self.table_name,
            data=data
        )

    def save_embedding(
        self,
        content,
        embedding,
        metadata
    ):
        """
        Save a new embedding.
        """

        return self.save(
            {
                "content": content,
                "embedding": embedding,
                "metadata": metadata
            }
        )

    # -------------------------------------------------
    # Similarity Search
    # -------------------------------------------------

    def find_similar(
        self,
        query_embedding,
        match_count=5,
        match_threshold=0.75,
        filter=None
    ):
        """
        Retrieve similar embeddings using
        Supabase Vector similarity search.

        NOTE: the `filter` parameter is normalized to an empty dict
        rather than being passed through as None/null. The underlying
        Postgres RPC function (match_client_update) appears to use the
        filter in a containment check (e.g. `metadata @> filter`), and
        a raw SQL NULL there evaluates to NULL — silently excluding
        EVERY row, not just unfiltered ones. This previously caused
        every call site (HistoricalKnowledgeService's RAG matching,
        and any other caller that doesn't explicitly pass a filter) to
        always get zero similarity matches back, with no error at all —
        an empty-list result is indistinguishable from "genuinely no
        similar records exist" unless you know to suspect this.
        """

        return self.provider.execute(
            operation="rpc",
            function_name="match_client_update",
            parameters={
                "query_embedding": query_embedding,
                "match_count": match_count,
                "match_threshold": match_threshold,
                "filter": filter if filter is not None else {}
            }
        )

    # -------------------------------------------------
    # Update
    # -------------------------------------------------

    def update(
        self,
        embedding_id,
        data
    ):
        """
        Update an existing embedding.
        """

        return self.provider.execute(
            operation="update",
            table=self.table_name,
            data=data,
            filters={
                "id": embedding_id
            }
        )

    def update_embedding(
        self,
        embedding_id,
        data
    ):
        """
        Convenience wrapper for updating
        an embedding.
        """

        return self.update(
            embedding_id,
            data
        )