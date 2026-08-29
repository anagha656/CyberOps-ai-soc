def calculate_risk(threat_type, evidence_count):
    base_scores = {
        "Brute Force Attack": 85,
        "Port Scanning": 60,
        "Suspicious Login": 65,
        "Data Exfiltration": 90,
        "Malware Activity": 95
    }

    score = base_scores.get(threat_type, 40)

    score += min(evidence_count * 3, 10)
    score = min(score, 100)

    if score >= 90:
        severity = "Critical"
    elif score >= 70:
        severity = "High"
    elif score >= 40:
        severity = "Medium"
    else:
        severity = "Low"

    return {
        "risk_score": score,
        "severity": severity
    }