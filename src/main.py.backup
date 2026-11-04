from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes.client_analysis import router as client_analysis_router
from src.api.routes.tests import router as tests_router
from src.api.routes.clients import router as clients_router
from src.api.routes.dashboard import router as dashboard_router
from src.api.routes.workflows import router as workflows_router
from src.api.routes.reports import router as reports_router
from src.api.routes.recommendations import router as recommendations_router


app = FastAPI(
    title="Dirt2Dollar Framework",
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


app.include_router(
    client_analysis_router
)

app.include_router(
    tests_router
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
    reports_router
)

app.include_router(
    recommendations_router
)




@app.get("/")
def root():
    return {
        "message": "Dirt2Dollar Framework Running Successfully"
    }