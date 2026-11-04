from src.base.base_provider import BaseProvider


class DummyProvider(
    BaseProvider
):

    def __init__(self):
        super().__init__(
            provider_name="Dummy"
        )

    def send_request(self):

        return {
            "message": "Success"
        }


provider = DummyProvider()

result = provider.execute()

print(result)