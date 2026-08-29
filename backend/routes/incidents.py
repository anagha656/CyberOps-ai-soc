from fastapi import APIRouter, HTTPException

from models.schemas import SecurityEvent, ApprovalRequest
from services.detection import detect_threat
from services.investigation import investigate
from services.risk import calculate_risk
from services.response import recommend_response

router = APIRouter(
    prefix="/incidents",
    tags=["Incidents"]
)

incidents = []


@router.post("/analyze")
def analyze_event(event: SecurityEvent):

    detection = detect_threat(event.model_dump())

    if not detection["threat_detected"]:
        return {
            "threat_detected": False,
            "message": "No significant threat detected."
        }

    threat_type = detection["threat_type"]

    investigation = investigate(
        event.model_dump(),
        threat_type
    )

    risk = calculate_risk(
        threat_type,
        len(investigation["evidence"])
    )

    response = recommend_response(threat_type)

    incident = {
        "id": len(incidents) + 1,
        "title": f"{threat_type} Detected",
        "threat_type": threat_type,
        "source_ip": event.source_ip,
        "severity": risk["severity"],
        "risk_score": risk["risk_score"],
        "status": "Awaiting Approval",
        "evidence": investigation["evidence"],
        "recommended_response": response,
        "explanation": (
            f"CyberOps detected activity consistent with "
            f"{threat_type} from {event.source_ip}."
        )
    }

    incidents.append(incident)

    return incident


@router.get("/")
def get_incidents():
    return {
        "count": len(incidents),
        "incidents": incidents
    }


@router.get("/{incident_id}")
def get_incident(incident_id: int):

    for incident in incidents:
        if incident["id"] == incident_id:
            return incident

    raise HTTPException(
        status_code=404,
        detail="Incident not found"
    )


@router.post("/{incident_id}/approval")
def approve_incident(
    incident_id: int,
    request: ApprovalRequest
):

    for incident in incidents:

        if incident["id"] == incident_id:

            incident["status"] = (
                "Approved" if request.approved
                else "Rejected"
            )

            return {
                "message": "Decision recorded",
                "incident": incident
            }

    raise HTTPException(
        status_code=404,
        detail="Incident not found"
    )