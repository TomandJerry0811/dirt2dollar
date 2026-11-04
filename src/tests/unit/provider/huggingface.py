from src.providers.embeddings.huggingface_provider import (
    HuggingFaceProvider
)


def main():

    provider = HuggingFaceProvider()

    text = """
    Yardworx Land Management continues to make
    progress with their marketing campaign.
    Multiple leads have been generated and
    customer satisfaction remains high.
    """

    print("\n========== HUGGINGFACE PROVIDER TEST ==========\n")

    response = provider.generate_embedding(
        text=text
    )

    print("Model")
    print("-" * 50)
    print(response["model"])

    print("\nDimension")
    print("-" * 50)
    print(response["dimension"])

    print("\nFirst 10 Values")
    print("-" * 50)
    print(response["embedding"][:10])

    print("\nEmbedding Length")
    print("-" * 50)
    print(len(response["embedding"]))

    print("\nProvider Test Successful")


if __name__ == "__main__":

    main()