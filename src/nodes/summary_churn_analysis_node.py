
import json

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.prompts.summary_churn_analysis_prompt import (
    build_summary_churn_analysis_prompt
)
from src.providers.llm.groq_provider import GroqProvider
from src.core.exceptions import ValidationException, ServiceException, ProviderException


class SummaryChurnAnalysisNode(BaseService):
    """
    Service that generates summary/update-based churn analysis.

    Input:
    - current summary/update text
    - retrieved top similar historical summary matches

    Output:
    - context.summary_probability
    - context.summary_analysis
    - context.summary_red_flags
    - context.summary_bottlenecks
    - context.summary_historical_insights
    """

    def __init__(self):
        super().__init__(
            service_name="Summary Churn Analysis Service",
            service_type="SUMMARY_CHURN_ANALYSIS"
        )

        self.groq_provider = GroqProvider()

    def validate(
        self,
        context: WorkflowContext
    ) -> bool:
        """
        Validate required inputs before LLM analysis.
        """

        current_summary = (
            context.updated_summary
        )

        if not current_summary:
            raise ValidationException(
                "Current summary/update text is required before summary churn analysis."
            )

        if not context.summary_matches:
            raise ValidationException(
                "Summary matches are required before summary churn analysis."
            )

        return True

    def _call_llm(
        self,
        prompt: str
    ) -> dict:
        """
        Call Groq in JSON mode and parse the returned JSON safely.
        """

        try:
            parsed_response = self.groq_provider.generate_response(
                prompt=prompt,
                system_prompt=(
                    "You are a churn-risk analysis assistant. "
                    "Return only valid JSON."
                ),
                temperature=0.2,
                max_tokens=1200
            )
        except ProviderException:
            raise
        except RuntimeError:
            raise
        except Exception as error:
            raise ServiceException(
                f"Summary churn analysis LLM call failed: {error}"
            )

        content = parsed_response.get("content")

        if not content:
            raise ServiceException(
                "Summary churn analysis: LLM returned an empty response."
            )

        try:
            result = json.loads(content)
        except json.JSONDecodeError as error:
            raise ValueError(
                f"Failed to parse summary churn analysis JSON: {error}"
            ) from error

        return {
            "result": result,
            "usage": parsed_response.get("usage", {}),
            "model": parsed_response.get("model")
        }

    def _validate_llm_output(
        self,
        result: dict
    ) -> dict:
        """
        Validate the structure of the LLM output.
        """

        if not isinstance(result, dict):
            raise ServiceException(
                "Summary churn analysis LLM output must be a JSON object."
            )

        required_keys = {
            "probability",
            "analysis",
            "red_flags",
            "bottlenecks",
            "historical_insights"
        }

        missing_keys = required_keys - set(result.keys())

        if missing_keys:
            raise ValueError(
                f"Summary churn analysis missing keys: {missing_keys}"
            )

        probability = result["probability"]

        if not isinstance(probability, int) or isinstance(probability, bool):
            raise ValueError(
                "Summary churn probability must be an integer."
            )

        if probability < 0 or probability > 100:
            raise ValueError(
                "Summary churn probability must be between 0 and 100."
            )

        return {
            "probability": probability,
            "analysis": str(result["analysis"]).strip(),
            "red_flags": result["red_flags"] or [],
            "bottlenecks": result["bottlenecks"] or [],
            "historical_insights": result["historical_insights"] or []
        }

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:
        """
        Build prompt, call LLM, validate JSON, and write analysis to context.
        """

        self.validate(context)

        try:
            prompt = build_summary_churn_analysis_prompt(context)
        except Exception as error:
            raise ServiceException(
                f"Failed to build summary churn analysis prompt: {error}"
            )

        llm_response = self._call_llm(prompt)
        validated_result = self._validate_llm_output(
            llm_response["result"]
        )

        context.summary_probability = validated_result["probability"]
        context.summary_analysis = validated_result["analysis"]
        context.summary_red_flags = validated_result["red_flags"]
        context.summary_bottlenecks = validated_result["bottlenecks"]
        context.summary_historical_insights = (
            validated_result["historical_insights"]
        )

        context.llm_usage["summary_prompt_tokens"] = (
            llm_response["usage"].get("prompt_tokens", 0)
        )
        context.llm_usage["summary_completion_tokens"] = (
            llm_response["usage"].get("completion_tokens", 0)
        )
        context.llm_usage["summary_total_tokens"] = (
            llm_response["usage"].get("total_tokens", 0)
        )

        context.metadata["summary_analysis_model"] = (
            llm_response["model"]
        )
        context.metadata["summary_analysis_completed"] = True

        return context
