from src.repositories.llm_usage_repository import (
    LLMUsageRepository
)

repository = LLMUsageRepository()

logs = repository.find_all()
print(f"Found {len(logs)} logs")

summary = repository.get_token_consumption_summary()
print("Token consumption summary:")
print("  Per Day:", summary["perDay"]["totalTokens"], f"({summary['perDay']['periodLabel']})")
print("  Per Week:", summary["perWeek"]["totalTokens"], f"({summary['perWeek']['periodLabel']})")
print("  Per Month:", summary["perMonth"]["totalTokens"], f"({summary['perMonth']['periodLabel']})")
print("  Total Lifetime Tokens:", summary["totalTokens"])
print("  Table Name:", summary["tableName"])

assert "perDay" in summary
assert "perWeek" in summary
assert "perMonth" in summary
assert summary["totalTokens"] >= 0
print("ALL ASSERTIONS PASSED!")