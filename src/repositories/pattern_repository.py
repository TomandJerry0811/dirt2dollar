from src.base.base_repository import BaseRepository
from src.core.exceptions import RepositoryException


class PatternRepository(BaseRepository):
    """
    Repository responsible for reading KPI
    patterns and their interpretations.
    """

    def __init__(self):
        super().__init__(
            repository_name="Pattern Repository",
            table_name="kpi_patterns"
        )

    # -------------------------------------------------
    # Read
    # -------------------------------------------------

    def find_all(self):
        """
        Retrieve all KPI patterns.
        """
        try:
            return self.provider.execute(
                operation="select",
                table=self.table_name
            )
        except Exception as error:
            raise RepositoryException(
                f"Failed to fetch KPI patterns: {error}"
            )

    # -------------------------------------------------
    # Business Methods
    # -------------------------------------------------

    def find_by_pattern_key(
        self,
        pattern_key: str
    ):
        """
        Retrieve a KPI pattern by its pattern name.

        The method keeps its existing name for compatibility,
        while the database filter uses the actual column
        `pattern_name`.
        """
        try:
            result = self.provider.execute(
                operation="select",
                table=self.table_name,
                filters={
                    "pattern_key": pattern_key
                }
            )

            if result and len(result) > 0:
                return result[0]

            return None

        except Exception as error:
            raise RepositoryException(
                f"Failed to find pattern '{pattern_key}': {error}"
            )