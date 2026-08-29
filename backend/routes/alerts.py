from fastapi import APIRouter
from models.schemas import Alert
from data.sample_events import sample_events

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)

alerts = [
    Alert(
        id=1,
        title="Multiple Failed Login Attempts",
        severity="High",
        source="Authentication System",
        description="Multiple failed login attempts detected.",
        status="open"
    ),
    Alert(
        id=2,
        title="Suspicious Login",
        severity="Medium",
        source="Authentication System",
        description="Login detected from an unusual location.",
        status="investigating"
    ),
    Alert(
        id=3,
        title="Port Scan Detected",
        severity="Critical",
        source="Network Monitor",
        description="Multiple ports were scanned.",
        status="open"
    )
]


@router.get("/")
def get_alerts():
    return {
        "count": len(alerts),
        "alerts": alerts
    }


@router.post("/")
def create_alert(alert: Alert):
    alerts.append(alert)

    return {
        "message": "Alert created successfully",
        "alert": alert
    }


@router.get("/events")
def get_security_events():
    return {
        "count": len(sample_events),
        "events": sample_events
    }