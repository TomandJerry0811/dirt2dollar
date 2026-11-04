from src.base.base_repository import BaseRepository
from src.core.exceptions import RepositoryException


class ClientRepository(BaseRepository):
    """
    Repository responsible for all database
    operations on the client_updates table.
    """

    def __init__(self):

        super().__init__(
            repository_name="Client Repository",
            table_name="client_updates"
        )

    # -------------------------------------------------
    # Create
    # -------------------------------------------------

    def save(
        self,
        data
    ):
        """
        Insert a new client update.
        """
        try:
            return self.provider.execute(
                operation="insert",
                table=self.table_name,
                data=data
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to save client update: {error}"
            )

    # -------------------------------------------------
    # Update
    # -------------------------------------------------

    def update(
        self,
        update_id,
        data
    ):
        """
        Update an existing client update.
        """
        try:
            return self.provider.execute(
                operation="update",
                table=self.table_name,
                data=data,
                filters={
                    "id": update_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to update client update '{update_id}': {error}"
            )

    # -------------------------------------------------
    # Delete
    # -------------------------------------------------

    def delete(
        self,
        update_id
    ):
        """
        Delete a client update.
        """
        try:
            return self.provider.execute(
                operation="delete",
                table=self.table_name,
                filters={
                    "id": update_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to delete client update '{update_id}': {error}"
            )

    # -------------------------------------------------
    # Read
    # -------------------------------------------------

    def find_by_id(
        self,
        update_id
    ):
        """
        Retrieve a client update by ID.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name,
                filters={
                    "id": update_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to find client update '{update_id}': {error}"
            )

    def find_all(self):
        """
        Retrieve all client updates.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to fetch client updates: {error}"
            )

    # -------------------------------------------------
    # Business Methods
    # -------------------------------------------------

    def find_by_client_id(
        self,
        client_id
    ):
        """
        Retrieve the client record.

        Returns a single record since each client
        has only one row in the table.
        """
        try:
            response = self.provider.execute(
                operation="select",
                table=self.table_name,
                filters={
                    "client_id": client_id
                }
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to find client by id '{client_id}': {error}"
            )

        if response:
            return response[0]

        return None

    def find_latest_update(
        self,
        client_id
    ):
        """
        Retrieve the latest update
        for a client.
        """
        return self.find_by_client_id(
            client_id
        )

    def save_summary(
        self,
        client_id,
        client_name,
        summary,
        satisfaction_score
    ):
        """
        Update the existing client summary.

        If the client does not exist,
        create a new record.
        """
        try:
            existing = self.find_by_client_id(
                client_id
            )

            if existing:

                return self.update(
                    existing["id"],
                    {
                        "summary": summary,
                        "satisfaction_score": satisfaction_score
                    }
                )

            else:

                return self.save(
                    {
                        "client_id": client_id,
                        "client_name": client_name,
                        "summary": summary,
                        "satisfaction_score": satisfaction_score
                    }
                )

        except RepositoryException:
            raise

        except Exception as error:
            raise RepositoryException(
                f"Failed to save summary for client '{client_id}': {error}"
            )

    def update_embedding_status(
        self,
        update_id,
        status=True
    ):
        """
        Mark whether embeddings have
        been generated.
        """
        return self.update(
            update_id,
            {
                "isembeddings_created": status
            }
        )

    def increment_retry_count(
        self,
        update_id,
        retry_count
    ):
        """
        Update retry count.
        """
        return self.update(
            update_id,
            {
                "retry_count": retry_count
            }
        )

    # -------------------------------------------------
    #  Utility
    # -------------------------------------------------

    def exists(
        self,
        update_id
    ):
        """
        Check whether a client update exists.
        """
        try:
            response = self.find_by_id(
                update_id
            )
            return len(response) > 0
        except RepositoryException:
            raise
        except Exception as error:
            raise RepositoryException(
                f"Failed to check existence of update '{update_id}': {error}"
            )