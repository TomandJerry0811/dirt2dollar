"""
Framework Constants
"""

import logging

# ==========================================
# Workflow Configuration
# ==========================================

# Default timeout (seconds) for provider requests
DEFAULT_TIMEOUT = 30

# Default retry attempts
DEFAULT_RETRY_COUNT = 3

# Maximum retry attempts allowed
MAX_RETRY_COUNT = 5


# ==========================================
# Churn Thresholds
# ==========================================

# Churn score thresholds
HIGH_RISK_THRESHOLD = 70

MEDIUM_RISK_THRESHOLD = 40

LOW_RISK_THRESHOLD = 20


# ==========================================
# Risk Levels
# ==========================================

RISK_HIGH = "HIGH"

RISK_MEDIUM = "MEDIUM"

RISK_LOW = "LOW"


# ==========================================
# Logging
# ==========================================

# Default framework logging configuration
DEFAULT_LOG_LEVEL = logging.INFO

DEFAULT_LOG_FORMAT = (
    "%(asctime)s - "
    "%(name)s - "
    "%(levelname)s - "
    "%(message)s"
)


# ==========================================
# Framework Metadata
# ==========================================

FRAMEWORK_NAME = "Customer Churn Predictor"

FRAMEWORK_VERSION = "1.0.0"

# ==========================================
# LLM Configuration
# ==========================================

SUMMARY_BATCH_SIZE = 10000

# ==========================================
# LLM Configuration
# ==========================================

SUMMARY_BATCH_SIZE = 10000