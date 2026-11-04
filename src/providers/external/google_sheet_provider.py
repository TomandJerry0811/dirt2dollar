import gspread
from google.oauth2.service_account import Credentials
from pathlib import Path

from src.base.base_provider import BaseProvider
from src.core.settings import settings
from src.core.exceptions import ProviderException


class GoogleSheetsProvider(BaseProvider):
    """
    Provider responsible for reading client data
    from Google Sheets.

    This provider contains no business logic.
    """

    def __init__(self):

        super().__init__(
            provider_name="Google Sheets Provider",
            base_url="https://sheets.googleapis.com"
        )

        self.client = None
        self.sheet = None

    # -------------------------------------------------
    # Connection
    # -------------------------------------------------

    def connect(self):
        """
        Establish a connection to Google Sheets.
        """

        super().connect()

        try:
            scopes = [
                "https://www.googleapis.com/auth/spreadsheets.readonly"
            ]

            credentials_path = Path(settings.google_credentials_file)
            if not credentials_path.is_file():
                credential_files = list(Path("credentials").glob("*.json"))
                if len(credential_files) == 1:
                    credentials_path = credential_files[0]
                else:
                    raise ProviderException(
                        "Google service-account JSON was not found. Set "
                        "GOOGLE_CREDENTIALS_FILE or add exactly one JSON file "
                        "to the credentials directory."
                    )

            credentials = Credentials.from_service_account_file(
                str(credentials_path),
                scopes=scopes
            )

            self.client = gspread.authorize(credentials)

            self.sheet = self.client.open_by_key(
                settings.google_sheet_id
            ).worksheet(
                settings.google_sheet_name
            )

        except ProviderException:
            raise

        except Exception as error:
            raise ProviderException(
                f"Unable to connect to Google Sheets: {error}"
            )

    # -------------------------------------------------
    # Request Execution
    # -------------------------------------------------

    def send_request(
        self,
        operation,
        **kwargs
    ):
        """
        Execute a Google Sheets read operation.
        """

        if self.sheet is None:
            raise ProviderException(
                "Google Sheet is not connected."
            )

        try:
            # -----------------------------
            # Get All Records
            # -----------------------------

            if operation == "get_all_records":
                return self.sheet.get_all_records()

            # -----------------------------
            # Get Headers
            # -----------------------------

            elif operation == "get_headers":
                return self.sheet.row_values(1)

            # -----------------------------
            # Get Row
            # -----------------------------

            elif operation == "get_row":
                return self.sheet.row_values(
                    kwargs["row_number"]
                )

            # -----------------------------
            # Get Client
            # -----------------------------

            elif operation == "get_client":
                rows = self.sheet.get_all_records()

                for row in rows:
                    if row.get("Client_name") == kwargs["client_name"]:
                        return row

                return None

            # -----------------------------
            # Unsupported Operation
            # -----------------------------

            raise ProviderException(
                f"Unsupported operation: {operation}"
            )

        except ProviderException:
            raise

        except KeyError as error:
            raise ProviderException(
                f"Missing required argument for '{operation}': {error}"
            )

        except Exception as error:
            raise ProviderException(
                f"Google Sheets request failed: {error}"
            )

    # -------------------------------------------------
    # Response Parsing
    # -------------------------------------------------

    def parse_response(
        self,
        response
    ):
        """
        Standardize the provider response.
        """

        return response

    # -------------------------------------------------
    # Disconnect
    # -------------------------------------------------

    def disconnect(self):
        """
        Release Google Sheets resources.
        """

        super().disconnect()

        self.client = None
        self.sheet = None

    # -------------------------------------------------
    # Convenience Methods
    # -------------------------------------------------

    def get_all_records(self):
        """
        Retrieve all rows from the sheet.
        """

        return self.execute(
            operation="get_all_records"
        )

    def get_headers(self):
        """
        Retrieve the sheet headers.
        """

        return self.execute(
            operation="get_headers"
        )

    def get_row(
        self,
        row_number
    ):
        """
        Retrieve a specific row.
        """

        return self.execute(
            operation="get_row",
            row_number=row_number
        )

    def get_client(
        self,
        client_name="Yardworx Land Management"
    ):
        """
        Retrieve a client by name.
        """

        return self.execute(
            operation="get_client",
            client_name=client_name
        )