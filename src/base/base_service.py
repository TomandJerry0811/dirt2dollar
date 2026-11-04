from abc import abstractmethod

from src.base.base_node import BaseNode
from src.domain.entities.workflow_context import WorkflowContext


class BaseService(BaseNode):
    """
    Base class for all business services.

    A service contains the business logic for a
    single workflow step and operates on the
    shared WorkflowContext.
    """

    def __init__(
        self,
        service_name: str,
        service_type: str
    ):
        super().__init__(
            node_name=service_name,
            node_type="SERVICE"
        )

        self.service_name = service_name
        self.service_type = service_type

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(
        self,
        context: WorkflowContext
    ):
        """
        Validate service prerequisites.

        Child services can override this method
        to perform custom validation.
        """

        return True

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    @abstractmethod
    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:
        """
        Execute the business logic.

        Must be implemented by every child service.
        """
        pass

    # -------------------------------------------------
    # Error Handling
    # -------------------------------------------------

    def handle_error(
        self,
        error: Exception
    ):
        """
        Handle service execution errors.
        """

        super().handle_error(error)

    # -------------------------------------------------
    # Execution Lifecycle
    # -------------------------------------------------

    def execute(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:
        """
        Standard execution flow for every service.
        """

        try:

            self.initialize()

            # Store service input for debugging
            self.input_data = context

            self.validate_input()

            self.validate(context)

            updated_context = self.process(
                context
            )

            # Store service output
            self.output_data = updated_context

            self.validate_output()

            self.complete()

            return updated_context

        except Exception as error:

            self.handle_error(
                error
            )

            raise error