import json
from difflib import get_close_matches

from src.base.base_service import BaseService
from src.providers.external.google_sheet_provider import (
    GoogleSheetsProvider
)
from src.core.exceptions import ValidationException, ServiceException
from src.core.logging import logger


class ClientDataRetrievalNode(BaseService):
    """
    Retrieves client information from Google Sheets.

    Responsibilities
    ----------------
    1. Validate client exists.
    2. Suggest similar client names.
    3. Parse JSON stored inside Updates column.
    4. Populate WorkflowContext.
    """

    def __init__(self):

        super().__init__(
            service_name="Client Data Retrieval Service",
            service_type="CLIENT_DATA_RETRIEVAL"
        )

        self.google_provider = GoogleSheetsProvider()

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(self, context):

        if context is None:
            raise ValidationException(
                "WorkflowContext cannot be None."
            )

        if not context.client_name:
            raise ValidationException(
                "Client name is missing."
            )

        return True

    # -------------------------------------------------
    # Utility
    # -------------------------------------------------

    @staticmethod
    def to_float(value):
        """
        Convert KPI values to float.

        Returns None for invalid values.
        """

        if value in (
            None,
            "",
            "null",
            "None"
        ):
            return None

        try:
            return float(value)

        except (TypeError, ValueError):
            return None

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(self, context):

        # ---------------------------------------------
        # Retrieve Client
        # ---------------------------------------------

        client = self.google_provider.get_client(
            context.client_name
        )

        # ---------------------------------------------
        # Client Not Found
        # ---------------------------------------------

        if client is None:

            try:
                all_clients = [
                    row["Client_name"]
                    for row in self.google_provider.get_all_records()
                    if "Client_name" in row
                ]
            except Exception as error:
                raise ServiceException(
                    f"Failed to fetch client list while resolving '{context.client_name}': {error}"
                )

            suggestions = get_close_matches(
                context.client_name,
                all_clients,
                n=3,
                cutoff=0.60
            )

            if suggestions:

                raise ValidationException(
                    f"""
Client '{context.client_name}' does not exist.

Did you mean:

{chr(10).join(suggestions)}
"""
                )

            raise ValidationException(
                f"Client '{context.client_name}' does not exist."
            )

        # ---------------------------------------------
        # Parse Updates JSON
        # ---------------------------------------------

        try:

            client_json = json.loads(
                client["Updates"]
            )

        except KeyError:
            raise ServiceException(
                f"Client '{context.client_name}' has no 'Updates' column in Google Sheets."
            )

        except json.JSONDecodeError as error:

            raise ServiceException(
                f"Unable to parse Updates JSON for '{context.client_name}': {error}"
            )

        if not client_json:

            raise ServiceException(
                f"Updates JSON is empty for client '{context.client_name}'."
            )

        # Google Sheet stores JSON as a list
        try:
            client_data = client_json[0]
        except (IndexError, TypeError):
            raise ServiceException(
                f"Updates JSON for '{context.client_name}' is not a non-empty list as expected."
            )

        logger.info(f"Updates count for '{context.client_name}': {len(client_data.get('updates', []))}")

        # ---------------------------------------------
        # Client Information
        # ---------------------------------------------

        context.client_id = client_data.get(
            "clientId"
        )

        context.client_name = client_data.get(
            "clientName"
        )

        context.program_type = client_data.get(
            "programType"
        )

        context.program_duration = client_data.get(
            "programDuration"
        )

        context.program_stage = client_data.get(
            "programStage"
        )

        context.current_satisfaction = client_data.get(
            "currentSatisfaction"
        )

        context.campaign_status = client_data.get(
            "campaignStatus"
        )

        # ---------------------------------------------
        # KPI Information
        # ---------------------------------------------

        context.current_kpis = {

            "adSpend7D":
                self.to_float(
                    client_data.get("adSpend7D")
                ),

            "adSpendMTD":
                self.to_float(
                    client_data.get("adSpendMTD")
                ),

            "adSpend30D":
                self.to_float(
                    client_data.get("adSpend30D")
                ),

            "leadCost7D":
                self.to_float(
                    client_data.get("leadCost7D")
                ),

            "leadCostMTD":
                self.to_float(
                    client_data.get("leadCostMTD")
                ),

            "leadCost30D":
                self.to_float(
                    client_data.get("leadCost30D")
                ),

            "apptCost7D":
                self.to_float(
                    client_data.get("apptCost7D")
                ),

            "apptCostMTD":
                self.to_float(
                    client_data.get("apptCostMTD")
                ),

            "apptCost30D":
                self.to_float(
                    client_data.get("apptCost30D")
                )

        }

        # ---------------------------------------------
        # Client Updates
        # ---------------------------------------------

        updates = client_data.get(
            "updates",
            []
        )

        try:
            updates = sorted(
                updates,
                key=lambda x: x.get(
                    "created_at",
                    ""
                ),
                reverse=True
            )
        except (AttributeError, TypeError) as error:
            raise ServiceException(
                f"Malformed 'updates' entries for client '{context.client_name}': {error}"
            )

        context.client_updates = updates

        context.total_updates = len(
            updates
        )

        context.latest_update = (

            updates[0]

            if updates

            else None

        )

        # ---------------------------------------------
        # Store Raw JSON
        # ---------------------------------------------

        context.google_sheet_data = client_data

        return context