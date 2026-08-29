import {
  extractAgents,
  extractAlerts,
  extractEvents,
  extractIncidents,
  normalizeAgent,
  normalizeAlert,
  normalizeEvent,
  normalizeHealth,
  normalizeIncident,
  toAlertPayload,
  unwrapIncident,
} from './adapters'
import { apiFetch } from './client'
import type {
  AgentRecord,
  AlertRecord,
  CreateAlertInput,
  HealthRecord,
  IncidentRecord,
  SecurityEventRecord,
} from './types'

export async function getHealth(): Promise<HealthRecord> {
  const payload = await apiFetch<unknown>('/health')
  return normalizeHealth(payload)
}

export async function getAlerts(): Promise<AlertRecord[]> {
  const payload = await apiFetch<unknown>('/alerts/')
  return extractAlerts(payload)
    .map(normalizeAlert)
    .filter((item): item is AlertRecord => item !== null)
}

export async function createAlert(
  input: CreateAlertInput,
  nextId: number,
): Promise<AlertRecord | null> {
  const payload = await apiFetch<unknown>('/alerts/', {
    method: 'POST',
    body: JSON.stringify(toAlertPayload(input, nextId)),
  })
  const record =
    payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  return normalizeAlert(record?.alert ?? payload)
}

export async function getSecurityEvents(): Promise<SecurityEventRecord[]> {
  const payload = await apiFetch<unknown>('/alerts/events')
  return extractEvents(payload)
    .map(normalizeEvent)
    .filter((item): item is SecurityEventRecord => item !== null)
}

export async function getIncidents(): Promise<IncidentRecord[]> {
  const payload = await apiFetch<unknown>('/incidents/')
  return extractIncidents(payload)
    .map(normalizeIncident)
    .filter((item): item is IncidentRecord => item !== null)
}

export async function getIncident(incidentId: number): Promise<IncidentRecord> {
  const payload = await apiFetch<unknown>(`/incidents/${incidentId}`)
  const incident = normalizeIncident(unwrapIncident(payload))
  if (!incident) {
    throw new Error('Incident payload was empty')
  }
  return incident
}

export async function submitIncidentApproval(
  incidentId: number,
  approved: boolean,
): Promise<IncidentRecord | null> {
  const payload = await apiFetch<unknown>(`/incidents/${incidentId}/approval`, {
    method: 'POST',
    body: JSON.stringify({ approved }),
  })
  return normalizeIncident(unwrapIncident(payload))
}

export async function analyzeEvent(input: {
  event_type: string
  source_ip: string
  username?: string | null
  description?: string | null
}): Promise<IncidentRecord | { threatDetected: false; message: string }> {
  const payload = await apiFetch<unknown>('/incidents/analyze', {
    method: 'POST',
    body: JSON.stringify({
      event_type: input.event_type,
      source_ip: input.source_ip,
      username: input.username ?? null,
      description: input.description ?? null,
    }),
  })

  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  if (record && record.threat_detected === false) {
    return {
      threatDetected: false,
      message: typeof record.message === 'string' ? record.message : 'No significant threat detected.',
    }
  }

  const incident = normalizeIncident(payload)
  if (!incident) {
    throw new Error('Analysis did not return an incident')
  }
  return incident
}

export async function getAgents(): Promise<AgentRecord[]> {
  const payload = await apiFetch<unknown>('/agents/')
  return extractAgents(payload)
    .map(normalizeAgent)
    .filter((item): item is AgentRecord => item !== null)
}
