
from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.core.constants import SUMMARY_BATCH_SIZE
from src.core.exceptions import ServiceException


class SummaryBatchPreparationNode(BaseService):
    """
    Prepares batches of client updates for
    summary generation.

    Updates are never split across batches.
    """

    def __init__(self):
        super().__init__(
            service_name="Summary Batch Preparation Service",
            service_type="SUMMARY_BATCH_PREPARATION"
        )

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(self, context: WorkflowContext):

        if not context.client_updates:
            raise ValueError(
                "No client updates available."
            )

        return True

    # -------------------------------------------------
    # Utility
    # -------------------------------------------------

    def format_update(self, update):
        try:
            return f"""
Date : {update.get("created_at")}

Created By : {update.get("creator_name")}

Update :

{update.get("body")}
""".strip()
        except AttributeError as error:
            raise ServiceException(
                f"Malformed client update entry (expected a dict): {error}"
            )

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(self, context: WorkflowContext):

        batches = []
        current_batch = ""
        current_update_count = 0

        separator = "\n\n----------------------------------------\n\n"

        # Build batches
        for update in context.client_updates:

            formatted_update = self.format_update(update)

            if (
                len(current_batch)
                + len(formatted_update)
                + len(separator)
                > SUMMARY_BATCH_SIZE
                and current_batch
            ):
                batches.append({
                    "update_count": current_update_count,
                    "text": current_batch
                })

                current_batch = ""
                current_update_count = 0

            if current_batch:
                current_batch += separator

            current_batch += formatted_update
            current_update_count += 1

        # Last batch
        if current_batch:
            batches.append({
                "update_count": current_update_count,
                "text": current_batch
            })

        # Add metadata
        total_batches = len(batches)

        context.summary_batches = [
            {
                "batch_index": index + 1,
                "batch_count": total_batches,
                "update_count": batch["update_count"],
                "text": batch["text"]
            }
            for index, batch in enumerate(batches)
        ]

        return context
