from typing import Dict, Any

from fastapi import HTTPException

from src.services.agent_service import AgentService
from src.core.exceptions import FrameworkException


class AgentController:

    def __init__(self):
        self.agent_service = AgentService()

    def chat(self, message: str) -> Dict[str, Any]:
        try:
            return self.agent_service.chat(message)

        except FrameworkException:
            raise

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"AI Agent failed: {error}"
            )