from typing import Optional
from pydantic import BaseModel, Field, AliasChoices


class ClientAnalysisRequest(BaseModel):
    user_query: str = Field(
        description="User query for client analysis",
        json_schema_extra={"example": "Give me churn analysis for Yardworx Land Management"}
    )
    query: Optional[str] = None  # Add this just in case frontend sends query instead

    @property
    def text_query(self) -> str:
        return self.user_query or self.query or ""



