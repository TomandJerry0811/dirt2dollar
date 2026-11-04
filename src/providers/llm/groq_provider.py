from typing import Optional

from groq import Groq

from src.base.base_provider import BaseProvider
from src.core.settings import settings
from src.core.exceptions import ProviderException
from src.core.logging import logger


class GroqProvider(BaseProvider):
    """
    Provider responsible for interacting with Groq.
    """

    def __init__(self):
        super().__init__(
            provider_name="Groq Provider",
            base_url="https://api.groq.com/openai/v1",
        )

        self.client = None

    # -------------------------------------------------
    # Connection
    # -------------------------------------------------

    def connect(self):
        super().connect()

        try:
            self.client = Groq(
                api_key=settings.groq_api_key
            )
        except Exception as error:
            raise ProviderException(
                f"Unable to connect to Groq: {error}"
            )

    # -------------------------------------------------
    # Request Execution
    # -------------------------------------------------

    def send_request(
        self,
        prompt: str,
        system_prompt: str = (
            "You are a helpful AI assistant."
        ),
        temperature: float = 0.2,
        max_tokens: int = 2048,
        response_format: Optional[dict] = None,
        include_reasoning: Optional[bool] = None,
        reasoning_format: Optional[str] = None,
    ):
        """
        Send a chat completion request to Groq.

        Reasoning parameters are sent only for
        supported GPT-OSS models.
        """

        if self.client is None:
            raise ProviderException(
                "Groq client is not initialized."
            )

        try:
            model = settings.groq_model

            request_payload = {
                "model": model,
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                "temperature": temperature,
                "max_completion_tokens": max_tokens,
            }

            if response_format is not None:
                request_payload["response_format"] = (
                    response_format
                )

            is_reasoning_model = model in {
                "openai/gpt-oss-20b",
                "openai/gpt-oss-120b",
            }

            if is_reasoning_model:
                if reasoning_format is not None:
                    request_payload["reasoning_format"] = reasoning_format
                elif response_format is not None:
                    request_payload["reasoning_format"] = "hidden"
                elif include_reasoning is not None:
                    request_payload["include_reasoning"] = (
                        include_reasoning
                    )

            logger.info(f"ACTUAL MODEL SENT TO GROQ: {model}")
            logger.info(
                "GROQ REQUEST OPTIONS: "
                + str({
                    key: value
                    for key, value in request_payload.items()
                    if key not in ("messages",)
                })
            )

            return self.client.chat.completions.create(
                **request_payload
            )

        except ProviderException:
            raise

        except Exception as error:
            raise ProviderException(
                f"Groq request failed: {error}"
            )

    # -------------------------------------------------
    # Response Parsing
    # -------------------------------------------------

    def parse_response(
        self,
        response,
    ):
        try:
            if not response:
                raise ProviderException(
                    "Groq returned an empty response."
                )

            if not response.choices:
                raise ProviderException(
                    "Groq response contains no choices."
                )

            choice = response.choices[0]
            message = choice.message
            usage = response.usage

            content = message.content or ""
            reasoning = getattr(message, "reasoning", None)
            if not content and reasoning:
                content = reasoning

            logger.info(f"GROQ DEBUG - content: {repr(content)}")
            logger.info(f"GROQ DEBUG - reasoning: {repr(reasoning)}")

            return {
                "content": content,
                "model": response.model,
                "usage": {
                    "prompt_tokens": (
                        usage.prompt_tokens
                        if usage
                        else 0
                    ),
                    "completion_tokens": (
                        usage.completion_tokens
                        if usage
                        else 0
                    ),
                    "total_tokens": (
                        usage.total_tokens
                        if usage
                        else 0
                    ),
                },
                "finish_reason": (
                    choice.finish_reason
                ),
            }

        except ProviderException:
            raise

        except Exception as error:
            raise ProviderException(
                f"Failed to parse Groq response: {error}"
            )

    # -------------------------------------------------
    # Disconnect
    # -------------------------------------------------

    def disconnect(self):
        super().disconnect()
        self.client = None

    # -------------------------------------------------
    # Convenience Method
    # -------------------------------------------------

    def generate_response(
        self,
        prompt: str,
        system_prompt: str = (
            "You are a helpful AI assistant."
        ),
        temperature: float = 0.2,
        max_tokens: int = 2048,
        response_format: Optional[dict] = None,
        include_reasoning: Optional[bool] = None,
        reasoning_format: Optional[str] = None,
    ):
        return self.execute(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format=response_format,
            include_reasoning=include_reasoning,
            reasoning_format=reasoning_format,
        )