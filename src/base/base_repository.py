from abc import ABC

from src.base.base_node import BaseNode
from src.providers.db.supabase_provider import (
    SupabaseProvider
)


class BaseRepository(BaseNode, ABC):
    """
    Base class for all repositories.

    Repositories are responsible for all
    persistence-related database operations.

    They communicate with the database through
    providers and contain no business logic.
    """

    def __init__(
        self,
        repository_name: str,
        table_name: str
    ):

        super().__init__(
            node_name=repository_name,
            node_type="REPOSITORY"
        )

        # Repository metadata
        self.repository_name = repository_name
        self.table_name = table_name

        # Database provider
        self.provider = SupabaseProvider()

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate_input(
        self,
        *args,
        **kwargs
    ):
        """
        Validate repository input.

        Child repositories may override.
        """

        return True

    def validate_output(
        self,
        result
    ):
        """
        Validate repository output.

        Child repositories may override.
        """

        return True

    # -------------------------------------------------
    # Execution Lifecycle
    # -------------------------------------------------

    def execute(
        self,
        operation,
        *args,
        **kwargs
    ):
        """
        Execute a repository operation using
        the standard BaseNode lifecycle.
        """

        try:

            self.initialize()

            self.input_data = kwargs

            self.validate_input(
                *args,
                **kwargs
            )

            result = operation(
                *args,
                **kwargs
            )

            self.validate_output(
                result
            )

            self.output_data = result

            self.complete()

            return result

        except Exception as error:

            self.handle_error(
                error
            )

            raise