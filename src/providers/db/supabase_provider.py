from typing import Any

from supabase import Client, create_client

from src.base.base_provider import BaseProvider
from src.core.settings import settings
from src.core.exceptions import ProviderException


class SupabaseProvider(BaseProvider):
    """
    Provider responsible for communicating with Supabase.

    This class contains no business logic.
    It is responsible only for database communication.
    """

    def __init__(self):

        super().__init__(
            provider_name="Supabase"
        )

        self.client: Client | None = None

    # -------------------------------------------------
    # Connection
    # -------------------------------------------------

    def connect(self):
        """
        Establish a connection to Supabase.
        """

        super().connect()

        try:

            self.client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )

        except Exception as error:

            raise ProviderException(
                f"Unable to connect to Supabase: {error}"
            )

    # -------------------------------------------------
    # Request Execution
    # -------------------------------------------------

    def send_request(
        self,
        operation: str,
        table: str = "",
        **kwargs
    ) -> Any:
        """
        Execute a database operation.

        Supported Operations:
        - select
        - insert
        - update
        - delete
        - rpc
        """

        if self.client is None:

            raise ProviderException(
                "Supabase client is not initialized."
            )

        try:

            # -----------------------------
            # SELECT
            # -----------------------------

            if operation == "select":

                query = (
                    self.client
                    .table(table)
                    .select("*")
                )

                filters = kwargs.get(
                    "filters",
                    {}
                )

                for key, value in filters.items():

                    query = query.eq(
                        key,
                        value
                    )

                order = kwargs.get("order")
                if order:
                    if isinstance(order, dict):
                        column = order.get("column", "id")
                        desc = order.get("desc", False)
                        query = query.order(column, desc=desc)
                    elif isinstance(order, str):
                        query = query.order(order)

                limit = kwargs.get("limit")
                if limit and isinstance(limit, int):
                    query = query.limit(limit)

                return query.execute()

            # -----------------------------
            # INSERT
            # -----------------------------

            elif operation == "insert":

                return (
                    self.client
                    .table(table)
                    .insert(
                        kwargs["data"]
                    )
                    .execute()
                )

            # -----------------------------
            # UPDATE
            # -----------------------------

            elif operation == "update":

                query = (
                    self.client
                    .table(table)
                    .update(
                        kwargs["data"]
                    )
                )

                filters = kwargs.get(
                    "filters",
                    {}
                )

                for key, value in filters.items():

                    query = query.eq(
                        key,
                        value
                    )

                return query.execute()

            # -----------------------------
            # DELETE
            # -----------------------------

            elif operation == "delete":

                query = (
                    self.client
                    .table(table)
                    .delete()
                )

                filters = kwargs.get(
                    "filters",
                    {}
                )

                for key, value in filters.items():

                    query = query.eq(
                        key,
                        value
                    )

                return query.execute()

            # -----------------------------
            # RPC (Stored Procedures)
            # -----------------------------

            elif operation == "rpc":

                return (
                    self.client
                    .rpc(
                        kwargs["function_name"],
                        kwargs.get(
                            "parameters",
                            {}
                        )
                    )
                    .execute()
                )

            # -----------------------------
            # Unsupported Operation
            # -----------------------------

            raise ProviderException(
                f"Unsupported operation: {operation}"
            )

        except Exception as error:

            raise ProviderException(
                str(error)
            )

    # -------------------------------------------------
    # Response Parsing
    # -------------------------------------------------

    def parse_response(
        self,
        response
    ):
        """
        Standardize the Supabase response.

        Returns only the data portion of the response.
        """

        return response.data

    # -------------------------------------------------
    # Disconnect
    # -------------------------------------------------

    def disconnect(self):
        """
        Release the Supabase client.
        """

        super().disconnect()

        self.client = None