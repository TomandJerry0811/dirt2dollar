from src.repositories.workflow_error_repository import (
    WorkflowErrorRepository
)

repository = WorkflowErrorRepository()

print(repository.find_all())