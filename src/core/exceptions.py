class FrameworkException(Exception):
    """
    Base exception for the framework.

    All custom framework exceptions
    should inherit from this class.
    """

    def __init__(
        self,
        message: str
    ):
        # Store exception message
        self.message = message

        super().__init__(
            self.message
        )


class ValidationException(
    FrameworkException
):
    """
    Raised when validation fails.
    """

    pass


class WorkflowException(
    FrameworkException
):
    """
    Raised when a workflow
    execution fails.
    """

    pass


class ServiceException(
    FrameworkException
):
    """
    Raised when a service
    execution fails.
    """

    pass


class ProviderException(
    FrameworkException
):
    """
    Raised when a provider
    execution fails.
    """

    pass


class RepositoryException(
    FrameworkException
):
    """
    Raised when a repository
    operation fails.
    """

    pass


class ConfigurationException(
    FrameworkException
):
    """
    Raised when the framework
    configuration is invalid.
    """

    pass