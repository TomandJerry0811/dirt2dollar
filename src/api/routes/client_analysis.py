from fastapi import APIRouter

from src.api.controllers.client_analysis_controller import (
    ClientAnalysisController
)

from src.api.schemas.client_analysis_schema import (
    ClientAnalysisRequest
)

from src.api.schemas.client_analysis_response import (
    ClientAnalysisResponse
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Client Analysis"]
)

controller = ClientAnalysisController()


@router.post(
    "/client-analysis",
    response_model=ClientAnalysisResponse
)
def client_analysis(
    request: ClientAnalysisRequest
):

    return controller.analyze(
        request.text_query
    )
    