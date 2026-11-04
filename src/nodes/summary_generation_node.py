
import json
from typing import Any

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext

from src.providers.llm.groq_provider import GroqProvider

from src.prompts.summary_system_prompt import (
    SUMMARY_SYSTEM_PROMPT,
)

from src.prompts.summary_user_prompt import (
    SUMMARY_USER_PROMPT,
)

from src.core.logging import setup_logger
from src.core.exceptions import (
    ValidationException,
    ServiceException,
    ProviderException,
)


logger = setup_logger()


class SummaryGenerationNode(BaseService):
    """
    Generates an updated client summary by
    iteratively processing all summary batches.

    This service does not update the database.
    """

    def __init__(self):
        super().__init__(
            service_name="Summary Service",
            service_type="SUMMARY",
        )

        self.groq_provider = GroqProvider()

    # -------------------------------------------------
    # Validation
    # -------------------------------------------------

    def validate(
        self,
        context: WorkflowContext,
    ):
        if not context.client_id:
            raise ValidationException(
                "Client ID is required."
            )

        if not context.summary_batches:
            raise ValidationException(
                "Summary batches are missing."
            )

        return True

    # -------------------------------------------------
    # Helpers
    # -------------------------------------------------

    @staticmethod
    def _truncate_text(
        value: Any,
        max_chars: int,
    ) -> str:
        if value is None:
            return ""

        text = str(value).strip()

        if len(text) <= max_chars:
            return text

        return (
            text[:max_chars].rstrip()
            + "\n[content truncated]"
        )

    # -------------------------------------------------
    # Prompt Builder
    # -------------------------------------------------

    def build_prompt(
        self,
        context: WorkflowContext,
        previous_summary: str,
        batch_text: str,
    ) -> str:
        try:
            return SUMMARY_USER_PROMPT.format(
                client_name=context.client_name or "N/A",
                client_id=str(
                    context.client_id or "N/A"
                ),
                previous_summary=self._truncate_text(
                    previous_summary,
                    max_chars=1500,
                ),
                new_updates=self._truncate_text(
                    batch_text,
                    max_chars=3000,
                ),
            )
        except (KeyError, IndexError) as error:
            raise ServiceException(
                f"Failed to build summary prompt: {error}"
            )

    # -------------------------------------------------
    # Groq Call
    # -------------------------------------------------

    def call_llm(
        self,
        user_prompt: str,
    ):
        json_system_prompt = (
            f"{SUMMARY_SYSTEM_PROMPT}\n\n"
            "Return exactly one valid JSON object. "
            "Use exactly these keys: "
            "client_name, client_id, summary, "
            "satisfaction_score. "
            "client_name must be a string. "
            "client_id must be a string. "
            "summary must be a string. "
            "satisfaction_score must be an integer "
            "between 0 and 100. "
            "Return JSON only. "
            "Do not return Markdown. "
            "Do not use code fences. "
            "Do not include explanations."
        )

        try:
            return self.groq_provider.execute(
                system_prompt=json_system_prompt,
                prompt=user_prompt,
                temperature=0.0,
                max_tokens=2500,
            )
        except ProviderException:
            raise
        except RuntimeError:
            raise
        except Exception as error:
            raise ServiceException(
                f"Summary generation LLM call failed: {error}"
            )

    # -------------------------------------------------
    # Parse Response
    # -------------------------------------------------

    def parse_response(
        self,
        response,
    ) -> dict:
        if not isinstance(response, dict):
            raise ServiceException(
                "Invalid provider response."
            )

        llm_output = (
            response.get("content")
            or response.get("text")
            or ""
        )

        if not isinstance(llm_output, str):
            llm_output = str(llm_output)

        llm_output = llm_output.strip()

        logger.info(
            "Raw LLM content length: %s",
            len(llm_output),
        )

        if not llm_output:
            logger.error(
                "Groq returned empty content. "
                "Response keys: %s",
                list(response.keys()),
            )

            raise ServiceException(
                "Groq returned empty content."
            )

        if llm_output.startswith("```"):
            lines = llm_output.splitlines()

            if (
                lines
                and lines[0].strip().lower()
                in (
                    "```",
                    "```json",
                )
            ):
                lines = lines[1:]

            if (
                lines
                and lines[-1].strip() == "```"
            ):
                lines = lines[:-1]

            llm_output = "\n".join(
                lines
            ).strip()

        try:
            result = json.loads(
                llm_output
            )

        except json.JSONDecodeError as error:
            logger.error(
                "Invalid JSON returned by Groq: %s",
                llm_output[:1000],
            )

            raise ServiceException(
                "Unable to parse JSON returned by Groq."
            ) from error

        if not isinstance(result, dict):
            raise ServiceException(
                "Expected a JSON object."
            )

        return result

    # -------------------------------------------------
    # Validate JSON
    # -------------------------------------------------

    def validate_response(
        self,
        result: dict,
    ):
        required_keys = [
            "client_name",
            "client_id",
            "summary",
            "satisfaction_score",
        ]

        for key in required_keys:
            if key not in result:
                raise ServiceException(
                    f"Missing key: {key}"
                )

        if not isinstance(
            result["client_name"],
            str,
        ):
            raise ServiceException(
                "client_name must be a string."
            )

        if not isinstance(
            result["client_id"],
            str,
        ):
            raise ServiceException(
                "client_id must be a string."
            )

        if not isinstance(
            result["summary"],
            str,
        ):
            raise ServiceException(
                "summary must be a string."
            )

        satisfaction_score = result[
            "satisfaction_score"
        ]

        if isinstance(
            satisfaction_score,
            bool,
        ):
            raise ServiceException(
                "satisfaction_score must be an integer."
            )

        if not isinstance(
            satisfaction_score,
            int,
        ):
            raise ServiceException(
                "satisfaction_score must be an integer."
            )

        if not 0 <= satisfaction_score <= 100:
            raise ServiceException(
                "satisfaction_score must be between "
                "0 and 100."
            )

    # -------------------------------------------------
    # Business Logic
    # -------------------------------------------------

    def process(
        self,
        context: WorkflowContext,
    ) -> WorkflowContext:
        current_summary = (
            context.previous_summary
            if context.previous_summary
            else "No previous summary available."
        )

        current_score = (
            context.previous_satisfaction_score
            if (
                context.previous_satisfaction_score
                is not None
            )
            else 50
        )

        total_prompt_tokens = 0
        total_completion_tokens = 0
        total_tokens = 0

        logger.info(
            "Processing %s summary batches.",
            len(context.summary_batches),
        )

        for batch in context.summary_batches:
            logger.info(
                "Batch %s of %s",
                batch["batch_index"],
                batch["batch_count"],
            )

            user_prompt = self.build_prompt(
                context=context,
                previous_summary=current_summary,
                batch_text=batch.get("text", ""),
            )

            response = self.call_llm(
                user_prompt
            )

            if not isinstance(response, dict):
                raise ServiceException(
                    "Invalid normalized Groq response."
                )

            usage = response.get(
                "usage",
                {},
            )

            total_prompt_tokens += usage.get(
                "prompt_tokens",
                0,
            )

            total_completion_tokens += usage.get(
                "completion_tokens",
                0,
            )

            total_tokens += usage.get(
                "total_tokens",
                0,
            )

            result = self.parse_response(
                response
            )

            self.validate_response(
                result
            )

            current_summary = result[
                "summary"
            ]

            current_score = result[
                "satisfaction_score"
            ]

            context.llm_output = result

        context.updated_summary = (
            current_summary
        )

        context.updated_satisfaction_score = (
            current_score
        )

        context.llm_usage = {
            "prompt_tokens": total_prompt_tokens,
            "completion_tokens": (
                total_completion_tokens
            ),
            "total_tokens": total_tokens,
        }

        return context
