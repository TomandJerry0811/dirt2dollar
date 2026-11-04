from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.repositories.client_repository import ClientRepository
from src.core.exceptions import ValidationException, ServiceException, RepositoryException


class ResultPersistenceNode(BaseService):
    """
    Persists the final workflow output into the
    client_updates table.

    - Updates an existing record if the client already exists.
    - Creates a new record otherwise.
    """

    def __init__(self):

        super().__init__(
            service_name="Result Persistence Service",
            service_type="PERSISTENCE"
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

        if not context.updated_summary:
            raise ValidationException(
                "Updated summary is required."
            )

        if context.recommendations is None:
            raise ValidationException(
                "Recommendations are required."
            )

        return True

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:

        data = {

            "client_id": context.client_id,

            "client_name": context.client_name,

            "summary": context.updated_summary,

            "bottlenecks": context.final_bottlenecks,

            "flags": context.final_red_flags,

            "action_items": context.recommendations,

            "sentiment": context.risk_level,

            "satisfaction_score":
                context.updated_satisfaction_score,

            "churn_probability":
                context.final_probability

        }

        # ------------------------------------------
        # Check Existing Client
        # ------------------------------------------

        try:
            existing = self.client_repository.find_by_client_id(
                context.client_id
            )
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to check for existing client '{context.client_id}' before persisting result: {error}"
            )

        # ------------------------------------------
        # Update Existing / Create New
        # ------------------------------------------

        try:
            if existing:

                self.client_repository.update(

                    existing["id"],

                    data

                )

                context.previous_record = existing

            else:

                self.client_repository.save(

                    data

                )
        except RepositoryException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Failed to persist final result for client '{context.client_id}': {error}"
            )

        return context