from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.repositories.client_repository import ClientRepository
from src.core.exceptions import ValidationException, ServiceException, RepositoryException


class FinalClientSummaryNode(BaseService):
    """
    Saves the latest generated summary.

    If the client already has a record in the
    client_updates table, it updates the latest one.
    Otherwise, it creates a new record.
    """

    def __init__(self):

        super().__init__(
            service_name="Final Client Summary Service",
            service_type="SUMMARY"
        )

        self.client_repository = ClientRepository()

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(
        self,
        context: WorkflowContext
    ):

        if not context.client_id:
            raise ValidationException(
                "Client ID is required."
            )

        if not context.client_name:
            raise ValidationException(
                "Client name is required."
            )

        if context.updated_summary is None:
            raise ValidationException(
                "Updated summary is missing."
            )

        return True

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:

        try:
            self.client_repository.save_summary(

                client_id=context.client_id,

                client_name=context.client_name,

                summary=context.updated_summary,

                satisfaction_score=context.updated_satisfaction_score

            )
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to save final client summary for '{context.client_id}': {error}"
            )

        return context