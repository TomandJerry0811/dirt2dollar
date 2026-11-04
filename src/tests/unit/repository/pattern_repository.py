from src.repositories.pattern_repository import (
    PatternRepository
)

repository = PatternRepository()


print(repository.find_all())