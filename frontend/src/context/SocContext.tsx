import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { POLL_INTERVAL_MS } from '../lib/api/config'
import {
  createAlert as createAlertRequest,
  getAgents,
  getAlerts,
  getHealth,
  getIncident,
  getIncidents,
  getSecurityEvents,
  submitIncidentApproval,
} from '../lib/api/api'
import type {
  AgentRecord,
  AlertRecord,
  CreateAlertInput,
  HealthRecord,
  IncidentRecord,
  SecurityEventRecord,
} from '../lib/api/types'

export interface SocSnapshot {
  health: HealthRecord | null
  healthError: string | null
  alerts: AlertRecord[]
  events: SecurityEventRecord[]
  incidents: IncidentRecord[]
  agents: AgentRecord[]
  alertsError: string | null
  eventsError: string | null
  incidentsError: string | null
  agentsError: string | null
  loading: boolean
  lastUpdated: string | null
}

interface SocContextValue extends SocSnapshot {
  refresh: () => Promise<void>
  createAlert: (input: CreateAlertInput) => Promise<void>
  loadIncident: (id: number) => Promise<IncidentRecord>
  approveIncident: (id: number, approved: boolean) => Promise<IncidentRecord | null>
}

const emptySnapshot: SocSnapshot = {
  health: null,
  healthError: null,
  alerts: [],
  events: [],
  incidents: [],
  agents: [],
  alertsError: null,
  eventsError: null,
  incidentsError: null,
  agentsError: null,
  loading: true,
  lastUpdated: null,
}

const SocContext = createContext<SocContextValue | null>(null)

async function settled<T>(promise: Promise<T>): Promise<{ value: T | null; error: string | null }> {
  try {
    return { value: await promise, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed'
    return { value: null, error: message }
  }
}

export function SocProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SocSnapshot>(emptySnapshot)
  const inFlight = useRef(false)

  const refresh = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true

    try {
      const [health, alerts, events, incidents, agents] = await Promise.all([
        settled(getHealth()),
        settled(getAlerts()),
        settled(getSecurityEvents()),
        settled(getIncidents()),
        settled(getAgents()),
      ])

      setState({
        health: health.value,
        healthError: health.error,
        alerts: alerts.value ?? [],
        events: events.value ?? [],
        incidents: incidents.value ?? [],
        agents: agents.value ?? [],
        alertsError: alerts.error,
        eventsError: events.error,
        incidentsError: incidents.error,
        agentsError: agents.error,
        loading: false,
        lastUpdated: new Date().toISOString(),
      })
    } finally {
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      void refresh()
    }, POLL_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [refresh])

  const createAlert = useCallback(
    async (input: CreateAlertInput) => {
      const nextId = Math.max(0, ...state.alerts.map((alert) => alert.id)) + 1
      await createAlertRequest(input, nextId)
      await refresh()
    },
    [refresh, state.alerts],
  )

  const loadIncident = useCallback(async (id: number) => {
    return getIncident(id)
  }, [])

  const approveIncident = useCallback(
    async (id: number, approved: boolean) => {
      const updated = await submitIncidentApproval(id, approved)
      await refresh()
      return updated
    },
    [refresh],
  )

  const value = useMemo<SocContextValue>(
    () => ({
      ...state,
      refresh,
      createAlert,
      loadIncident,
      approveIncident,
    }),
    [state, refresh, createAlert, loadIncident, approveIncident],
  )

  return <SocContext.Provider value={value}>{children}</SocContext.Provider>
}

export function useSoc() {
  const value = useContext(SocContext)
  if (!value) {
    throw new Error('useSoc must be used within SocProvider')
  }
  return value
}
