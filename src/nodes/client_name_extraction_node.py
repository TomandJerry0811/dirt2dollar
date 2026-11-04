
import re
from typing import Optional

from src.base.base_service import BaseService
from src.domain.entities.workflow_context import WorkflowContext
from src.providers.llm.groq_provider import GroqProvider
from src.prompts.client_name_extraction_prompt import (
    CLIENT_NAME_EXTRACTION_SYSTEM_PROMPT,
)
from src.core.exceptions import ValidationException
from src.core.logging import logger


_INSTRUCTION_WORDS = {
    "give", "show", "tell", "what", "how", "please", "need",
    "want", "get", "find", "fetch", "pull", "run", "generate",
    "analyze", "analyse", "is", "are", "does", "do", "can",
    "could", "would", "should", "report", "summary", "analysis",
    "churn", "kpi", "update", "updates", "status", "latest",
    "current", "me", "the", "a", "an", "?"
}


class ClientNameExtractionNode(BaseService):
    """
    Extract a client name from a user's query.

    Flow:
    1. Try code-based extraction.
    2. Reject candidates containing instruction words.
    3. Use AI fallback if code extraction fails.
    4. Store the result in context.client_name.
    """

    def __init__(self):
        super().__init__(
            service_name="Client Name Extraction Service",
            service_type="CLIENT_NAME_EXTRACTION"
        )

        self.groq_provider = GroqProvider()

    def validate(self, context: WorkflowContext):
        """Validate that user_query exists in context metadata."""

        user_query = context.metadata.get("user_query")

        if not user_query:
            raise ValidationException(
                "user_query is required inside context.metadata"
            )

        return True

    def _clean_extracted_name(
        self,
        extracted_name: str
    ) -> str:
        """Remove trailing instruction words from a candidate."""

        extracted_name = extracted_name.strip(" .,!?:")
        
        trailing_words_pattern = (
            r"\s+("
            r"in|on|at|with|for|from|this|that|full|details|latest|"
            r"report|summary|analysis|churn|kpi|updates|status|"
            r"current"
            r")\b.*$"
        )

        return re.sub(
            trailing_words_pattern,
            "",
            extracted_name,
            flags=re.IGNORECASE
        ).strip()

    def _is_valid_client_candidate(
        self,
        candidate: str
    ) -> bool:
        """Reject candidates containing common instruction words."""

        if not candidate:
            return False

        words = {
            word.lower().strip(".,!?:")
            for word in candidate.split()
        }

        if words & _INSTRUCTION_WORDS:
            return False

        return True

    def _looks_like_bare_name(
        self,
        user_query: str
    ) -> bool:
        """Check whether the entire query looks like a client name."""

        stripped = user_query.strip(" .,!?:")
        
        if not stripped:
            return False

        if not re.fullmatch(
            r"[a-zA-Z0-9&'.\-\s]+",
            stripped
        ):
            return False

        words = stripped.split()

        if len(words) == 0 or len(words) > 6:
            return False

        return self._is_valid_client_candidate(stripped)

    def _extract_client_name_code(
        self,
        user_query: str
    ) -> Optional[str]:
        """Extract a client name using regex-based logic."""

        try:
            # Stop capturing when instruction words appear after
            # the client name.
            stop_words = (
                r"give|show|tell|what|how|please|need|want|get|"
                r"find|fetch|pull|run|generate|analyze|analyse|"
                r"is|are|does|do|can|could|would|should|me|the|"
                r"a|an|latest|current|report|summary|analysis|"
                r"churn|kpi|update|updates|status"
            )

            patterns = [
                rf"(?:for|of|about)\s+("
                rf"[a-zA-Z][a-zA-Z0-9&'_.-]*"
                rf"(?:\s+(?!(?:{stop_words})\b)"
                rf"[a-zA-Z][a-zA-Z0-9&'_.-]*)*"
                rf")",

                r"client\s+([a-zA-Z][a-zA-Z0-9&'_.-]*(?:\s+[a-zA-Z][a-zA-Z0-9&'_.-]*)*)",

                r"([a-zA-Z][a-zA-Z0-9&'_.-]*(?:\s+[a-zA-Z][a-zA-Z0-9&'_.-]*)*)\s+(?:report|summary|analysis|churn|kpi|updates)",
            ]

            for pattern in patterns:
                match = re.search(
                    pattern,
                    user_query,
                    flags=re.IGNORECASE
                )

                if not match:
                    continue

                extracted_name = self._clean_extracted_name(
                    match.group(1).strip()
                )

                if self._is_valid_client_candidate(extracted_name):
                    return extracted_name

            if self._looks_like_bare_name(user_query):
                return user_query.strip(" .,!?:")
            
            return None

        except re.error as error:
            logger.error(
                f"Regex extraction failed unexpectedly: {error}"
            )
            return None

    def _extract_client_name_ai(
        self,
        user_query: str
    ) -> Optional[str]:
        """Use AI fallback to extract a client name."""

        prompt = f"""
Extract the client name from the following user query.

User Query:
{user_query}

Return only the client name.
If no client name is found, return UNKNOWN.
""".strip()

        try:
            response = self.groq_provider.generate_response(
                prompt=prompt,
                system_prompt=CLIENT_NAME_EXTRACTION_SYSTEM_PROMPT,
                temperature=0.0,
                max_tokens=100,
                reasoning_format="hidden",
            )

            content = response.get("content", "").strip()

            if not content or content.upper() == "UNKNOWN":
                return None

            if (
                len(content.split()) > 8
                or content.endswith(".")
                or '"' in content
            ):
                logger.warning(
                    "AI client-name extraction returned a sentence "
                    f"instead of a bare name, discarding: {content!r}"
                )
                return None

            content = self._clean_extracted_name(content)

            if not self._is_valid_client_candidate(content):
                return None

            return content

        except Exception as error:
            logger.warning(
                f"AI fallback for client name extraction failed: {error}"
            )
            return None

    def process(
        self,
        context: WorkflowContext
    ) -> WorkflowContext:
        """Extract a client name and update the workflow context."""

        user_query = context.metadata.get(
            "user_query",
            ""
        ).strip()

        # Step 1: Code-based extraction
        extracted_name = self._extract_client_name_code(
            user_query
        )

        if extracted_name:
            context.client_name = extracted_name
            context.metadata[
                "client_name_extraction_method"
            ] = "code"

            return context

        # Step 2: AI fallback
        extracted_name = self._extract_client_name_ai(
            user_query
        )

        if extracted_name:
            context.client_name = extracted_name
            context.metadata[
                "client_name_extraction_method"
            ] = "ai"
        else:
            context.client_name = None
            context.metadata[
                "client_name_extraction_method"
            ] = "not_found"

        return context


if __name__ == "__main__":
    user_query = input("Enter user query: ").strip()

    context = WorkflowContext()
    context.metadata["user_query"] = user_query

    service = ClientNameExtractionNode()

    try:
        result = service.execute(context)

        print(
            "\nExtracted Client Name:",
            result.client_name
        )

        print(
            "Extraction Method:",
            result.metadata.get(
                "client_name_extraction_method"
            )
        )

    except Exception as error:
        print(f"Extraction failed: {error}")
