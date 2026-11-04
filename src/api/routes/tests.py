from fastapi import APIRouter

from src.api.controllers.tests_controller import TestsController
from src.api.schemas.tests_schema import (
    AvailableTestsResponse,
    ClientExtractionTestResponse,
    ClientDataRetrievalTestResponse,
    AllTestsResponse,
)

router = APIRouter(
    prefix="/api/v1/tests",
    tags=["Existing Tests Output"]
)

controller = TestsController()


@router.get(
    "",
    response_model=AvailableTestsResponse
)
def list_available_tests():
    return controller.get_available_tests()


@router.post(
    "/client-name-extraction",
    response_model=ClientExtractionTestResponse
)
def run_client_name_extraction_test_endpoint():
    return controller.run_client_name_extraction()


@router.post(
    "/client-data-retrieval",
    response_model=ClientDataRetrievalTestResponse
)
def run_client_data_retrieval_test_endpoint():
    return controller.run_client_data_retrieval()


@router.post(
    "/run-all",
    response_model=AllTestsResponse
)
def run_all_tests_endpoint():
    return controller.run_all_tests()
