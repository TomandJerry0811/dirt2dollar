import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from src.api.routes.client_analysis import router as client_analysis_router
from src.api.routes.clients import router as clients_router
from src.api.routes.dashboard import router as dashboard_router
from src.api.routes.workflows import router as workflows_router
from src.api.routes.workflow_errors import router as error_logs_router
from src.api.routes.reports import router as reports_router
from src.api.routes.recommendations import router as recommendations_router
from src.api.routes.agent import router as agent_router
from src.core.exceptions import (
    FrameworkException,
    ValidationException,
    ProviderException,
    RepositoryException,
    ServiceException,
    WorkflowException,
    ConfigurationException,
)
from src.core.logging import logger


app = FastAPI(
    title="Customer Churn Predictor API",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# Global Exception Handlers
# -------------------------------------------------
# These are a safety net: even if a controller forgets
# to catch something, these ensure the API never leaks
# a raw traceback to the client and always returns
# a clean, consistent JSON error shape.

@app.exception_handler(ValidationException)
async def validation_exception_handler(request: Request, exc: ValidationException):
    logger.warning(f"ValidationException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=400,
        content={"error": "validation_error", "detail": exc.message},
    )


@app.exception_handler(ConfigurationException)
async def configuration_exception_handler(request: Request, exc: ConfigurationException):
    logger.error(f"ConfigurationException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={"error": "configuration_error", "detail": exc.message},
    )


@app.exception_handler(ProviderException)
async def provider_exception_handler(request: Request, exc: ProviderException):
    logger.error(f"ProviderException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=502,
        content={"error": "upstream_provider_error", "detail": exc.message},
    )


@app.exception_handler(RepositoryException)
async def repository_exception_handler(request: Request, exc: RepositoryException):
    logger.error(f"RepositoryException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={"error": "database_error", "detail": exc.message},
    )


@app.exception_handler(ServiceException)
async def service_exception_handler(request: Request, exc: ServiceException):
    logger.error(f"ServiceException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={"error": "service_error", "detail": exc.message},
    )


@app.exception_handler(WorkflowException)
async def workflow_exception_handler(request: Request, exc: WorkflowException):
    logger.error(f"WorkflowException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={"error": "workflow_error", "detail": exc.message},
    )


@app.exception_handler(FrameworkException)
async def framework_exception_handler(request: Request, exc: FrameworkException):
    # Catch-all for any custom exception not matched above
    logger.error(f"FrameworkException on {request.url.path}: {exc.message}")
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "detail": exc.message},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Absolute last resort: anything not caught anywhere else.
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "detail": "An unexpected error occurred."},
    )


app.include_router(
    client_analysis_router
)

app.include_router(
    clients_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    workflows_router
)

app.include_router(
    error_logs_router
)

app.include_router(
    reports_router
)

app.include_router(
    recommendations_router
)

app.include_router(
    agent_router
)


@app.get("/")
def root():
    return {
        "message": "Customer Churn Predictor API Running Successfully"
    }