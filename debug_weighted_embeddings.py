"""
One-off debug script: inspect the client_weighted_embeddings table
directly, bypassing the RPC similarity function, to check whether
this is a data problem (only one client has ever been embedded here)
or an RPC problem (the Postgres function is misconfigured).
"""

from src.repositories.weighted_embedding_repository import WeightedEmbeddingRepository

repo = WeightedEmbeddingRepository()

print("Fetching all rows from client_weighted_embeddings...")
all_rows = repo.find_all()

print(f"\nTotal rows: {len(all_rows)}\n")

for row in all_rows:
    metadata = row.get("metadata") or {}
    embedding = row.get("embedding")
    embedding_len = len(embedding) if embedding else 0
    print(
        f"  id={row.get('id')}  "
        f"client_id={metadata.get('client_id')}  "
        f"embedding_dims={embedding_len}"
    )

if len(all_rows) <= 1:
    print(
        "\n>>> Only one (or zero) row exists in this table. This confirms "
        "the empty result is a DATA gap, not a code bug: only one client "
        "has ever completed the full workflow far enough to write a "
        "weighted embedding, so there is nothing else to match against yet."
    )
else:
    print(
        f"\n>>> {len(all_rows)} rows exist, but the RPC search still "
        "returned nothing. This points to the match_client_update "
        "Postgres function itself being misconfigured (possibly querying "
        "a different table, or the RPC's client_id exclusion filter "
        "expecting different parameters than what BaseEmbeddingRepository "
        "sends)."
    )