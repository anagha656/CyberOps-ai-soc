def investigate(event, threat_type):
    evidence = []

    if threat_type == "Brute Force Attack":
        evidence = [
            "Multiple failed authentication attempts",
            "Target account identified",
            "Repeated SSH login activity detected"
        ]

    elif threat_type == "Port Scanning":
        evidence = [
            "Multiple network ports accessed",
            "Network reconnaissance pattern detected",
            "Single source IP contacted multiple ports"
        ]

    elif threat_type == "Suspicious Login":
        evidence = [
            "Login from unusual location",
            "Unusual authentication pattern detected"
        ]

    elif threat_type == "Data Exfiltration":
        evidence = [
            "Large outbound data transfer detected",
            "Transfer volume exceeds normal behavior",
            "Unusual destination detected"
        ]

    elif threat_type == "Malware Activity":
        evidence = [
            "Suspicious file activity detected",
            "Potential malicious behavior identified"
        ]

    return {
        "investigation_status": "completed",
        "evidence": evidence
    }