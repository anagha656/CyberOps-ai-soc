from pydantic import BaseModel, Field
from typing import Optional


class Alert(BaseModel):
    id: int
    title: str
    severity: str
    source: str
    description: Optional[str] = None
    status: str = "open"


class SecurityEvent(BaseModel):
    event_type: str
    source_ip: str
    username: Optional[str] = None
    description: Optional[str] = None


class Incident(BaseModel):
    id: int
    title: str
    threat_type: str
    source_ip: str
    severity: str
    risk_score: int = Field(ge=0, le=100)
    status: str
    explanation: str
    evidence: list[str] = []
    recommended_response: Optional[str] = None


class ApprovalRequest(BaseModel):
    approved: bool