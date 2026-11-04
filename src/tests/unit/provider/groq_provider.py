from src.providers.llm.groq_provider import (
    GroqProvider
)

provider = GroqProvider()

response = provider.generate_response(
    prompt="What is Artificial Intelligence?"
)

print(response["content"])

print("\n-----------------------\n")

print(response["usage"])