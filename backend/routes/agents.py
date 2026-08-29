from fastapi import APIRouter

router = APIRouter(
    prefix="/agents",
    tags=["AI Agents"]
)

agents = [
    {
        "name": "Detection Agent",
        "status": "Active",
        "task": "Monitoring security events"
    },
    {
        "name": "Investigation Agent",
        "status": "Waiting",
        "task": "Investigating suspicious incidents"
    },
    {
        "name": "Risk Agent",
        "status": "Waiting",
        "task": "Calculating incident risk"
    },
    {
        "name": "Response Agent",
        "status": "Waiting",
        "task": "Preparing response recommendations"
    }
]


@router.get("/")
def get_agents():
    return {
        "agents": agents
    }