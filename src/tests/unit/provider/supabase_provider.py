from src.providers.db.supabase_provider import (
    SupabaseProvider
)

provider = SupabaseProvider()

response = provider.execute(
    operation="select",
    table="client_kpi"
)

print(response)