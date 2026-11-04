from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext


class DummyService(BaseService):

    def __init__(self):
        super().__init__(
            service_name="Dummy Service",
            service_type="TEST"
        )

    def validate(
        self,
        context
    ):
        print("Validation Passed")

    def process(
        self,
        context
    ):

        context.metadata["message"] = (
            "Service Executed"
        )

        return context


context = WorkflowContext()

service = DummyService()

result = service.execute(
    context
)

print(result.metadata)