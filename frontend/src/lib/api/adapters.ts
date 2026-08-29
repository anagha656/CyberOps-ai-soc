import type {
  AgentRecord,
  AgentUiStatus,
  AlertRecord,
  CreateAlertInput,
  CreateAlertPayload,
  HealthRecord,
  IncidentRecord,
  SecurityEventRecord,
} from './types'

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function str(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return fallback
}

function strOrNull(value: unknown): string | null {
  const next = str(value).trim()
  return next ? next : null
}

function num(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function extractList(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload
  const record = asRecord(payload)
  if (!record) return []
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as unknown[]
  }
  return []
}

const IP_PATTERN = /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/

function extractIp(...values: Array<string | null>): string | null {
  for (const value of values) {
    if (!value) continue
    const match = value.match(IP_PATTERN)
    if (match) return match[0]
  }
  return null
}

export function normalizeHealth(payload: unknown): HealthRecord {
  const record = asRecord(payload)
  const status = str(record?.status, 'unknown')
  const ok = status.toLowerCase() === 'healthy' || status.toLowerCase() === 'ok'
  return {
    ok,
    status,
    service: strOrNull(record?.service),
  }
}

export function extractAlerts(payload: unknown): unknown[] {
  return extractList(payload, ['alerts', 'data', 'items', 'results'])
}

export function extractEvents(payload: unknown): unknown[] {
  return extractList(payload, ['events', 'data', 'items', 'results'])
}

export function extractIncidents(payload: unknown): unknown[] {
  return extractList(payload, ['incidents', 'data', 'items', 'results'])
}

export function extractAgents(payload: unknown): unknown[] {
  return extractList(payload, ['agents', 'data', 'items', 'results'])
}

export function normalizeAlert(raw: unknown): AlertRecord | null {
  const record = asRecord(raw)
  if (!record) return null

  const id = num(record.id)
  const title = strOrNull(record.title) ?? strOrNull(record.name)
  if (id === null || !title) return null

  const source = strOrNull(record.source) ?? strOrNull(record.asset)
  const description = strOrNull(record.description) ?? strOrNull(record.message)
  const threatType =
    strOrNull(record.threat_type) ??
    strOrNull(record.threatType) ??
    strOrNull(record.event_type)
  const asset = strOrNull(record.asset) ?? source

  return {
    id,
    title,
    description,
    source,
    source_ip:
      strOrNull(record.source_ip) ??
      strOrNull(record.sourceIp) ??
      extractIp(source, description),
    severity: str(record.severity, 'Unknown'),
    threat_type: threatType,
    asset,
    status: str(record.status, 'open'),
    timestamp:
      strOrNull(record.timestamp) ??
      strOrNull(record.created_at) ??
      strOrNull(record.createdAt),
  }
}

export function normalizeEvent(raw: unknown): SecurityEventRecord | null {
  const record = asRecord(raw)
  if (!record) return null

  const eventType =
    strOrNull(record.event_type) ??
    strOrNull(record.eventType) ??
    strOrNull(record.title) ??
    strOrNull(record.type)
  if (!eventType) return null

  const description = strOrNull(record.description) ?? strOrNull(record.message)
  const source = strOrNull(record.source) ?? strOrNull(record.asset)
  const sourceIp =
    strOrNull(record.source_ip) ??
    strOrNull(record.sourceIp) ??
    extractIp(source, description)

  const idValue = record.id
  const id =
    typeof idValue === 'number' || typeof idValue === 'string' ? idValue : num(idValue)

  return {
    id: id ?? null,
    timestamp:
      strOrNull(record.timestamp) ??
      strOrNull(record.time) ??
      strOrNull(record.created_at),
    source,
    source_ip: sourceIp,
    event_type: eventType,
    severity: strOrNull(record.severity),
    message: strOrNull(record.message) ?? description,
    description,
    status: strOrNull(record.status),
    username: strOrNull(record.username),
  }
}

export function normalizeIncident(raw: unknown): IncidentRecord | null {
  const record = asRecord(raw)
  if (!record) return null

  const id = num(record.id)
  if (id === null) return null

  const evidenceRaw = record.evidence
  const evidence = Array.isArray(evidenceRaw)
    ? evidenceRaw.map((item) => str(item)).filter(Boolean)
    : []

  return {
    id,
    title: str(record.title, `Incident ${id}`),
    threat_type: str(record.threat_type ?? record.threatType, 'Unknown'),
    source_ip: str(record.source_ip ?? record.sourceIp, '—'),
    severity: str(record.severity, 'Unknown'),
    risk_score: num(record.risk_score ?? record.riskScore),
    status: str(record.status, 'Unknown'),
    explanation: str(record.explanation ?? record.analysis, ''),
    evidence,
    recommended_response: strOrNull(
      record.recommended_response ?? record.recommendedResponse,
    ),
    asset: strOrNull(record.asset),
    timestamp: strOrNull(record.timestamp ?? record.created_at ?? record.createdAt),
  }
}

function mapAgentStatus(raw: string): AgentUiStatus {
  const value = raw.toLowerCase()
  if (value.includes('offline') || value.includes('down') || value.includes('error')) {
    return 'Offline'
  }
  if (value.includes('investigat') || value.includes('working') || value.includes('busy')) {
    return 'Investigating'
  }
  if (value.includes('active') || value.includes('running') || value.includes('online')) {
    return 'Active'
  }
  return 'Idle'
}

export function normalizeAgent(raw: unknown): AgentRecord | null {
  const record = asRecord(raw)
  if (!record) return null

  const name = strOrNull(record.name) ?? strOrNull(record.agent) ?? strOrNull(record.id)
  if (!name) return null

  const rawStatus = str(record.status, 'Idle')

  return {
    name,
    status: mapAgentStatus(rawStatus),
    rawStatus,
    currentTask: str(record.task ?? record.current_task ?? record.currentTask, 'No task reported'),
    lastActivity: strOrNull(record.last_activity ?? record.lastActivity ?? record.updated_at),
    threatsHandled: num(record.threats_handled ?? record.threatsHandled),
    actionsPerformed: num(record.actions_performed ?? record.actionsPerformed),
  }
}

export function toAlertPayload(
  input: CreateAlertInput,
  nextId: number,
): CreateAlertPayload {
  const source = input.asset.trim() || input.source_ip.trim() || input.threat_type.trim() || 'SOC Console'
  const details = [
    input.description.trim(),
    input.threat_type.trim() ? `Threat type: ${input.threat_type.trim()}` : '',
    input.source_ip.trim() ? `Source IP: ${input.source_ip.trim()}` : '',
    input.asset.trim() ? `Asset: ${input.asset.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    id: nextId,
    title: input.title.trim(),
    severity: input.severity,
    source,
    description: details || null,
    status: 'open',
  }
}

export function unwrapIncident(payload: unknown): unknown {
  const record = asRecord(payload)
  if (record?.incident) return record.incident
  return payload
}
