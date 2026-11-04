from abc import abstractmethod
import time

from src.base.base_node import BaseNode


class BaseProvider(BaseNode):
    """
    Base class for all external providers.

    Providers handle communication with external
    APIs and third-party services.
    """

    def __init__(
        self,
        provider_name: str,
        base_url: str = "",
        timeout: int = 30,
        retry_count: int = 3
    ):
        super().__init__(
            node_name=provider_name,
            node_type="PROVIDER"
        )

        self.provider_name = provider_name
        self.base_url = base_url

        self.timeout = timeout
        self.retry_count = retry_count

    # -------------------------------------------------
    # Connection Lifecycle
    # -------------------------------------------------

    def connect(self):
        """
        Establish connection with the provider.

        Child providers may override.
        """

        self.logger.info(
            f"Connecting to {self.provider_name}"
        )

    @abstractmethod
    def send_request(
        self,
        *args,
        **kwargs
    ):
        """
        Send request to the provider.

        Must be implemented by child providers.
        """
        pass

    def parse_response(
        self,
        response
    ):
        """
        Parse the provider response.

        Child providers can override this method
        to normalize provider-specific responses.
        """

        return response

    def disconnect(self):
        """
        Release provider resources.

        Child providers may override.
        """

        self.logger.info(
            f"Disconnecting from {self.provider_name}"
        )

    # -------------------------------------------------
    # Retry Logic
    # -------------------------------------------------

    def retry(
        self,
        function,
        *args,
        **kwargs
    ):
        """
        Retry failed provider requests.
        """

        last_exception = None

        for attempt in range(
            self.retry_count
        ):

            try:

                return function(
                    *args,
                    **kwargs
                )

            except Exception as error:

                last_exception = error

                self.logger.warning(
                    f"Retry {attempt + 1} failed."
                )

                time.sleep(1)

        raise last_exception

    # -------------------------------------------------
    # Execution Lifecycle
    # -------------------------------------------------

    def execute(
        self,
        *args,
        **kwargs
    ):
        """
        Standard execution flow for every provider.
        """

        try:

            self.initialize()

            # Store provider input
            self.input_data = kwargs

            self.connect()

            response = self.retry(
                self.send_request,
                *args,
                **kwargs
            )

            parsed_response = (
                self.parse_response(
                    response
                )
            )

            # Store provider output
            self.output_data = (
                parsed_response
            )

            self.complete()

            return parsed_response

        except Exception as error:

            self.handle_error(
                error
            )

            raise

        finally:

            # Always release provider resources
            self.disconnect()