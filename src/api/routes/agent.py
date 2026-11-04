from typing import Dict, Any

from fastapi import APIRouter, Body

from src.api.controllers.agent_controller import AgentController


router = APIRouter(
    prefix="/api/v1/agent",
    tags=["AI Agent"]
)

controller = AgentController()


@router.post("/chat", response_model=Dict[str, Any])
def chat_with_agent(
    data: Dict[str, Any] = Body(default={})
):
    message = data.get("message", "")

    return controller.chat(message)