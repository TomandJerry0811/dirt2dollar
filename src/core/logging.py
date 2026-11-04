import logging

from src.core.constants import (
    DEFAULT_LOG_LEVEL,
    DEFAULT_LOG_FORMAT
)


def setup_logger():
    """
    Configure the framework logger.

    Creates a centralized logger used
    across the entire application.
    """

    logging.basicConfig(
        level=DEFAULT_LOG_LEVEL,
        format=DEFAULT_LOG_FORMAT,
        force=True
    )

    return logging.getLogger(
        "Dirt2Dollar"
    )


# Singleton framework logger
logger = setup_logger()