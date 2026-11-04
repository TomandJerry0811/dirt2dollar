from abc import ABC, abstractmethod
from datetime import datetime
import logging
import uuid

from src.domain.enums.status_enum import NodeStatus


class BaseNode(ABC):
    """
    Base class for all executable framework components.

    Every executable component in the framework such as
    Workflows, Services, Providers, Repositories and Workers
    should inherit from this class.

    This class provides a common execution lifecycle,
    logging, status tracking and execution metadata.
    """

    def __init__(
        self,
        node_name: str,
        node_type: str
    ):
        # Unique identifier for every node instance
        self.node_id = str(uuid.uuid4())

        # Basic node information
        self.node_name = node_name
        self.node_type = node_type

        # Initial execution status
        self.status = NodeStatus.PENDING

        # Input and output handled by the node
        self.input_data = None
        self.output_data = None

        # Execution timing information
        self.start_time = None
        self.end_time = None
        self.execution_time = None

        # Logger for the current node
        self.logger = logging.getLogger(
            self.__class__.__name__
        )

    # -------------------------------------------------
    # Execution Lifecycle
    # -------------------------------------------------

    def initialize(self):
        """
        Prepare the node before execution begins.
        """

        self.start_time = datetime.now()

        self.status = NodeStatus.RUNNING

        self.logger.info(
            f"{self.node_name} execution started."
        )

    def validate_input(self):
        """
        Validate the input before execution.

        Child classes can override this method
        if custom validation is required.
        """

        return True

    @abstractmethod
    def execute(
        self,
        *args,
        **kwargs
    ):
        """
        Main execution method.

        Must be implemented by every child class.
        """
        pass

    def validate_output(self):
        """
        Validate the generated output.

        Child classes can override this method
        if output validation is required.
        """

        return True

    def complete(self):
        """
        Mark node execution as completed and
        calculate execution statistics.
        """

        self.end_time = datetime.now()

        self.execution_time = (
            self.end_time - self.start_time
        ).total_seconds()

        self.status = NodeStatus.COMPLETED

        self.log_execution()

    # -------------------------------------------------
    # Error Handling
    # -------------------------------------------------

    def handle_error(
        self,
        error: Exception
    ):
        """
        Handle execution failures.
        """

        self.status = NodeStatus.FAILED

        # logger.exception automatically logs
        # the complete stack trace.
        self.logger.exception(
            f"{self.node_name} failed."
        )

    # -------------------------------------------------
    # Logging
    # -------------------------------------------------

    def log_execution(self):
        """
        Log execution details for monitoring
        and debugging.
        """

        self.logger.info(
            f"""
            Node ID: {self.node_id}
            Node Name: {self.node_name}
            Node Type: {self.node_type}
            Status: {self.status.value}
            Start Time: {self.start_time}
            End Time: {self.end_time}
            Execution Time: {self.execution_time}
            """
        )

    # -------------------------------------------------
    # Execution Summary
    # -------------------------------------------------

    def get_execution_summary(self):
        """
        Return execution metadata for
        reporting or debugging.
        """

        return {
            "node_id": self.node_id,
            "node_name": self.node_name,
            "node_type": self.node_type,
            "status": self.status.value,
            "execution_time": self.execution_time,
            "start_time": self.start_time,
            "end_time": self.end_time
        }