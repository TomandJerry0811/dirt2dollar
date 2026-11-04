import sys
from src.repositories.client_update_embedding_repository import ClientUpdateEmbeddingRepository
from src.repositories.kpi_embedding_repository import KPIEmbeddingRepository

# Mock 768-dimension embedding list
emb = [0.0] * 768

print("Testing match_historical_clients...")
try:
    repo = ClientUpdateEmbeddingRepository()
    res = repo.match_historical_clients(emb, match_threshold=0.01, match_count=3)
    print("SUCCESS: matches =", len(res))
    if len(res) > 0:
        print("Sample:", res[0])
except Exception as e:
    print("FAILED client matching:", str(e))
    import traceback
    traceback.print_exc()

print("\nTesting match_historical_kpis...")
try:
    repo2 = KPIEmbeddingRepository()
    res2 = repo2.match_historical_kpis(emb, match_threshold=0.01, match_count=3)
    print("SUCCESS: matches =", len(res2))
    if len(res2) > 0:
        print("Sample:", res2[0])
except Exception as e:
    print("FAILED kpi matching:", str(e))
    import traceback
    traceback.print_exc()
