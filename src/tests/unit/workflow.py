from src.base.base_service import BaseService
from src.base.base_workflow import BaseWorkflow
from src.domain.entities.workflow_context import WorkflowContext


class ServiceA(BaseService):

    def __init__(self):
        super().__init__(
            "Service A",
            "TEST"
        )

    def process(
        self,
        context
    ):
        context.metadata["A"] = True
        return context


class ServiceB(BaseService):

    def __init__(self):
        super().__init__(
            "Service B",
            "TEST"
        )

    def process(
        self,
        context
    ):
        context.metadata["B"] = True
        return context


class TestWorkflow(
    BaseWorkflow
):

    def __init__(self):
        super().__init__(
            "Test Workflow"
        )

    def build_workflow(self):

        self.add_service(
            ServiceA()
        )

        self.add_service(
            ServiceB()
        )


context = WorkflowContext()

workflow = TestWorkflow()

result = workflow.execute(
    context
)

print(result.metadata)