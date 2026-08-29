from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.alerts import router as alerts_router
from routes.incidents import router as incidents_router
from routes.agents import router as agents_router


app = FastAPI(
    title="CyberOps API",
    description="Autonomous AI Security Operations Center",
    version="1.0.0"
)

# Allow Lovable frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "CyberOps backend is running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CyberOps API"
    }


app.include_router(alerts_router)
app.include_router(incidents_router)
app.include_router(agents_router)