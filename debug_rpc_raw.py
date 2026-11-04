"""
One-off debug script: call the match_client_update RPC directly and
print the RAW response, bypassing all of our own filtering/mapping logic,
to see exactly what Supabase/Postgres is actually returning.
"""

from src.repositories.weighted_embedding_repository import WeightedEmbeddingRepository

CLIENT_ID = "182135"

repo = WeightedEmbeddingRepository()

print(f"Fetching stored embedding for client_id={CLIENT_ID}...")
own_record = repo.find_by_client_id(CLIENT_ID)

if not own_record:
    print("No embedding found for this client at all. Stopping.")
    raise SystemExit(1)

embedding = own_record["embedding"]
print(f"Found embedding. Type: {type(embedding)}")
if isinstance(embedding, str):
    print(f"First 100 chars: {embedding[:100]}")
    print(f"String length: {len(embedding)}")
elif isinstance(embedding, list):
    print(f"List length: {len(embedding)}")
    print(f"First 5 values: {embedding[:5]}")

print("\nCalling find_similar with match_threshold=0.0, match_count=10, filter={}...")

try:
    raw_result = repo.provider.execute(
        operation="rpc",
        function_name="match_client_update",
        parameters={
            "query_embedding": embedding,
            "match_count": 10,
            "match_threshold": 0.0,
            "filter": {},
        },
    )
    print(f"\nRaw result type: {type(raw_result)}")
    print(f"Raw result: {raw_result}")
except Exception as error:
    print(f"\nRPC call raised an exception: {type(error).__name__}: {error}")

print("\n--- Now trying WITHOUT the filter parameter at all (positional-style call) ---")
try:
    raw_result_2 = repo.provider.execute(
        operation="rpc",
        function_name="match_client_update",
        parameters={
            "query_embedding": embedding,
            "match_count": 10,
            "match_threshold": 0.0,
        },
    )
    print(f"Raw result type: {type(raw_result_2)}")
    print(f"Raw result: {raw_result_2}")
except Exception as error:
    print(f"RPC call raised an exception: {type(error).__name__}: {error}")