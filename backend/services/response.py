def recommend_response(threat_type):
    responses = {
        "Brute Force Attack":
            "Block the source IP and temporarily lock the affected account.",

        "Port Scanning":
            "Block the source IP and monitor related network activity.",

        "Suspicious Login":
            "Require additional authentication and review account activity.",

        "Data Exfiltration":
            "Isolate the affected asset and investigate outbound traffic.",

        "Malware Activity":
            "Isolate the affected asset and start malware investigation."
    }

    return responses.get(
        threat_type,
        "Investigate the incident manually."
    )