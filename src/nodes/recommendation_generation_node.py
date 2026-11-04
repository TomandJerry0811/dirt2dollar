import json
import re

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext

from src.prompts.recommendation_generation_prompt import (
    RECOMMENDATION_SYSTEM_PROMPT,
    RECOMMENDATION_USER_PROMPT,
)

from src.providers.llm.groq_provider import GroqProvider
from src.core.exceptions import ValidationException, ServiceException, ProviderException
from src.core.logging import logger


class RecommendationGenerationNode(BaseService):

    def __init__(self):
        super().__init__(
            service_name="Recommendation Generation Service",
            service_type="LLM",
        )

        self.groq_provider = GroqProvider()

    def validate(
        self,
        context: WorkflowContext,
    ):
        if context.final_probability is None:
            raise ValidationException(
                "Final churn probability is required."
            )

        if context.risk_level is None:
            raise ValidationException(
                "Risk level is required."
            )

        if not context.final_analysis:
            raise ValidationException(
                "Final analysis is required."
            )

        return True

    def build_prompt(
        self,
        context: WorkflowContext,
    ):
        try:
            current_kpis = (
                context.kpi_dataset.get(
                    "current_kpis",
                    {},
                )
                if context.kpi_dataset
                else {}
            )

            kpis = "\n".join(
                f"{key}: {value}"
                for key, value in current_kpis.items()
            ) or "No KPI data available."

            red_flags = "\n".join(
                f"- {item}"
                for item in (
                    context.final_red_flags
                    or []
                )
            ) or "No red flags identified."

            bottlenecks = "\n".join(
                f"- {item}"
                for item in (
                    context.final_bottlenecks
                    or []
                )
            ) or "No bottlenecks identified."

            historical_insights = "\n".join(
                f"- {item}"
                for item in (
                    context.final_historical_insights
                    or []
                )
            ) or "No historical insights available."

            return RECOMMENDATION_USER_PROMPT.format(
                client_name=context.client_name or "N/A",
                program_stage=context.program_stage or "N/A",
                campaign_status=context.campaign_status or "N/A",
                kpis=kpis,
                final_probability=context.final_probability,
                risk_level=context.risk_level,
                analysis=context.final_analysis,
                red_flags=red_flags,
                bottlenecks=bottlenecks,
                historical_insights=historical_insights,
            )
        except (KeyError, AttributeError) as error:
            raise ServiceException(
                f"Failed to build recommendation prompt: {error}"
            )

    def call_llm(
        self,
        prompt: str,
    ):
        try:
            return self.groq_provider.generate_response(
                prompt=prompt,
                system_prompt=RECOMMENDATION_SYSTEM_PROMPT,
                temperature=0.2,
                max_tokens=800,
            )
        except ProviderException:
            raise
        except Exception as error:
            raise ServiceException(
                f"Recommendation LLM call failed: {error}"
            )

    @staticmethod
    def parse_json_response(
        content: str,
    ) -> dict:
        """
        Parse JSON returned by the LLM.

        Handles:
        - Normal JSON.
        - JSON inside Markdown code fences.
        - Explanatory text before or after a JSON object.
        """

        content = (
            str(content or "")
            .replace("\ufeff", "")
            .strip()
        )

        if not content:
            raise ServiceException(
                "Recommendation LLM returned empty content."
            )

        logger.info(
            "Recommendation raw LLM content: %r" % content
        )

        fenced_match = re.search(
            r"```(?:json)?\s*(.*?)\s*```",
            content,
            flags=re.IGNORECASE | re.DOTALL,
        )

        if fenced_match:
            content = fenced_match.group(1).strip()

        try:
            result = json.loads(content)

        except json.JSONDecodeError:
            object_start = content.find("{")
            object_end = content.rfind("}")

            if (
                object_start == -1
                or object_end == -1
                or object_end <= object_start
            ):
                raise ServiceException(
                    "Recommendation LLM returned invalid JSON. "
                    f"Raw content: {content[:1000]!r}"
                )

            json_content = content[
                object_start:object_end + 1
            ]

            try:
                result = json.loads(json_content)

            except json.JSONDecodeError as error:
                raise ServiceException(
                    "Recommendation LLM returned invalid JSON. "
                    f"Raw content: {content[:1000]!r}"
                ) from error

        if not isinstance(result, dict):
            raise ServiceException(
                "Recommendation LLM response must be a JSON object."
            )

        return result

    def process(
        self,
        context: WorkflowContext,
    ) -> WorkflowContext:
        prompt = self.build_prompt(context)

        response = self.call_llm(prompt)

        if not isinstance(response, dict):
            raise ServiceException(
                "Unexpected response format from Groq provider."
            )

        context.llm_usage = response.get("usage", {})

        content = response.get(
            "content",
            "",
        )

        result = self.parse_json_response(content)

        recommendations = result.get(
            "recommendations",
        )

        if not isinstance(recommendations, list):
            raise ServiceException(
                "Recommendations field missing or invalid."
            )

        context.recommendations = recommendations

        return context