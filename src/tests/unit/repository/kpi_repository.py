from src.repositories.kpi_repository import KPIRepository


repository = KPIRepository()

response = repository.find_all()

print(response)