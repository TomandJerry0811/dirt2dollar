from enum import Enum


class NodeStatus(str, Enum):
    """
    Execution status for framework nodes.

    Used by BaseNode and all classes that
    inherit from it.
    """

    # Waiting for execution
    PENDING = "PENDING"

    # Currently executing
    RUNNING = "RUNNING"

    # Successfully completed
    COMPLETED = "COMPLETED"

    # Execution failed
    FAILED = "FAILED"


class WorkflowStatus(str, Enum):
    """
    Execution status for workflows.

    Provides additional states specific
    to workflow execution.
    """

    # Waiting for execution
    PENDING = "PENDING"

    # Workflow is currently executing
    RUNNING = "RUNNING"

    # Workflow completed successfully
    COMPLETED = "COMPLETED"

    # Workflow execution failed
    FAILED = "FAILED"

    # Workflow rolled back after failure
    ROLLED_BACK = "ROLLED_BACK"