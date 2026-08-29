def detect_threat(event):
    event_type = event.get("event_type", "").lower()

    threat_map = {
        "failed login": "Brute Force Attack",
        "port scan": "Port Scanning",
        "suspicious login": "Suspicious Login",
        "unusual data transfer": "Data Exfiltration",
        "malware": "Malware Activity"
    }

    for pattern, threat_type in threat_map.items():
        if pattern in event_type:
            return {
                "threat_detected": True,
                "threat_type": threat_type
            }

    return {
        "threat_detected": False,
        "threat_type": "Unknown"
    }