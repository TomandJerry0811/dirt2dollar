from src.repositories.campaign_stage_repository import (
    CampaignStageRepository
)

repository = CampaignStageRepository()

response = repository.find_all()

print(response)