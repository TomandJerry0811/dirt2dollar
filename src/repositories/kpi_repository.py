from src.base.base_repository import BaseRepository
from src.core.exceptions import RepositoryException


class KPIRepository(BaseRepository):
    """
    Repository responsible for all database
    operations on the client_kpi table.
    """

    def __init__(self):

        super().__init__(
            repository_name="KPI Repository",
            table_name="client_kpi"
        )

    # -------------------------------------------------
    # Create
    # -------------------------------------------------

    def save(
        self,
        data
    ):
        """
        Insert a new KPI record.
        """
        try:
            result = self.provider.execute(
                operation="insert",
                table=self.table_name,
                data=data
            )

            # Supabase clients normally return .data and .error (or dict with 'error')
            error = getattr(result, "error", None)
            if isinstance(result, dict):
                error = result.get("error")

            if error:
                raise RepositoryException(
                    f"KPIRepository.save failed: {error}"
                )

            return result

        except RepositoryException:
            raise

        except Exception as error:
            raise RepositoryException(
                f"Failed to save KPI record: {error}"
            )

    # -------------------------------------------------
    # Update
    # -------------------------------------------------

    def update(
        self,
        client_id,
        data
    ):
        """
        Update KPI data for a client.
        """
        try:
            return self.provider.execute(
                operation="update",
                table=self.table_name,
                data=data,
                filters={
                    "client_id": client_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to update KPI for client '{client_id}': {error}"
            )

    # -------------------------------------------------
    # Delete
    # -------------------------------------------------

    def delete(
        self,
        client_id
    ):
        """
        Delete KPI data for a client.
        """
        try:
            return self.provider.execute(
                operation="delete",
                table=self.table_name,
                filters={
                    "client_id": client_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to delete KPI for client '{client_id}': {error}"
            )

    # -------------------------------------------------
    # Read
    # -------------------------------------------------

    def find_by_id(
        self,
        client_id
    ):
        """
        Retrieve KPI data using the client ID.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name,
                filters={
                    "client_id": client_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to find KPI for client '{client_id}': {error}"
            )

    def find_all(self):
        """
        Retrieve all KPI records.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to fetch KPI records: {error}"
            )

    # -------------------------------------------------
    # Utility
    # -------------------------------------------------

    def exists(
        self,
        client_id
    ):
        """
        Check whether KPI data exists
        for the specified client.
        """
        try:
            response = self.find_by_id(
                client_id
            )
            return len(response) > 0
        except RepositoryException:
            raise
        except Exception as error:
            raise RepositoryException(
                f"Failed to check KPI existence for client '{client_id}': {error}"
            )

    # -------------------------------------------------
    # Business Methods
    # -------------------------------------------------

    def find_by_client_name(
        self,
        client_name
    ):
        """
        Retrieve KPI data using
        the client name.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name,
                filters={
                    "client_name": client_name
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to find KPI by client name '{client_name}': {error}"
            )

    def update_embedding_status(
        self,
        client_id,
        status=True
    ):
        """
        Mark whether KPI embeddings
        have been generated.
        """
        return self.update(
            client_id,
            {
                "isembeddings_created": status
            }
        )

    def increment_retry_count(
        self,
        client_id,
        retry_count
    ):
        """
        Update the retry count
        for a client's KPI record.
        """
        return self.update(
            client_id,
            {
                "retry_count": retry_count
            }
        )