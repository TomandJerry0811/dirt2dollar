from src.core.logging import (
    setup_logger
)

logger = setup_logger()

logger.info(
    "Logging Working"
)

logger.error(
    "Test Error"
)