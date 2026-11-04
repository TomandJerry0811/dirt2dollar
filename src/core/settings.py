from pydantic_settings import (
    BaseSettings,
    SettingsConfigDict
)

from src.core.exceptions import ConfigurationException


class Settings(BaseSettings):
    """
    Central application configuration.

    All configuration values are loaded from
    the .env file using Pydantic BaseSettings.
    """

    # -------------------------------------------------
    # Application
    # -------------------------------------------------

    app_name: str = "Customer Churn Predictor"

    app_version: str = "1.0.0"

    # -------------------------------------------------
    # Supabase
    # -------------------------------------------------

    supabase_url: str = ""

    supabase_key: str = ""

    # -------------------------------------------------
    # Groq
    # -------------------------------------------------

    groq_api_key: str = ""

    groq_model: str = (
        "llama-3.3-70b-versatile"
    )

    # -------------------------------------------------
    # HuggingFace
    # -------------------------------------------------

    huggingface_api_key: str = ""

    embedding_model: str = (
        "sentence-transformers/all-mpnet-base-v2"
    )

    # -------------------------------------------------
    # Google Sheets
    # -------------------------------------------------

    google_sheet_id: str = ""

    google_sheet_name: str = ""

    google_credentials_file: str = (
        "credentials/google_service_account.json"
    )

    # -------------------------------------------------
    # Environment Configuration
    # -------------------------------------------------

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


# Singleton settings object used
# throughout the application.
#
# Wrapped because a malformed .env file (bad encoding,
# invalid types for a future non-string field, etc.) would
# otherwise crash the app at import time with a raw, unclear
# pydantic traceback instead of a readable startup error.
try:
    settings = Settings()
except Exception as error:
    raise ConfigurationException(
        f"Failed to load application settings from .env: {error}"
    )