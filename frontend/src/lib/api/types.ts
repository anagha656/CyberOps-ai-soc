export type AgentUiStatus = 'Active' | 'Investigating' | 'Idle' | 'Offline'

export interface AlertRecord {
  id: number
  title: string
  description: string | null
  source: string | null
  source_ip: string | null
  severity: string
  threat_type: string | null
  asset: string | null
  status: string
  timestamp: string | null
}

export interface CreateAlertInput {
  title: string
  description: string
  source_ip: string
  severity: string
  threat_type: string
  asset: string
}

export interface SecurityEventRecord {
  id: number | string | null
  timestamp: string | null
  source: string | null
  source_ip: string | null
  event_type: string
  severity: string | null
  message: string | null
  description: string | null
  status: string | null
  username: string | null
}

export interface IncidentRecord {
  id: number
  title: string
  threat_type: string
  source_ip: string
  severity: string
  risk_score: number | null
  status: string
  explanation: string
  evidence: string[]
  recommended_response: string | null
  asset: string | null
  timestamp: string | null
}

export interface AgentRecord {
  name: string
  status: AgentUiStatus
  rawStatus: string
  currentTask: string
  lastActivity: string | null
  threatsHandled: number | null
  actionsPerformed: number | null
}

export interface HealthRecord {
  ok: boolean
  status: string
  service: string | null
}

export interface CreateAlertPayload {
  id: number
  title: string
  severity: string
  source: string
  description: string | null
  status: string
}
