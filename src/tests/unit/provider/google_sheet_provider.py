from src.providers.external.google_sheet_provider import (
    GoogleSheetsProvider
)

provider = GoogleSheetsProvider()

print(provider.get_headers())

print("--------------------------------")

print(provider.get_all_records())