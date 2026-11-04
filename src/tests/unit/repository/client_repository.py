from src.repositories.client_repository import (
    ClientRepository
)

repository = ClientRepository()

response = repository.find_all()

print(response)