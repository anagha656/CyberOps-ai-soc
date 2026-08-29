import { useMemo } from 'react'
import { GlassCard } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'
import { isActiveIncidentStatus, normalizeSeverity } from '../lib/format'

export function ReportsPage() {
  const { alerts, incidents, events, agents } = useSoc()

  const summary = useMemo(
    () => ({
      alerts: alerts.length,
      critical: alerts.filter((item) => normalizeSeverity(item.severity) === 'Critical').length,
      incidents: incidents.length,
      active: incidents.filter((item) => isActiveIncidentStatus(item.status)).length,
      events: events.length,
      agents: agents.length,
    }),
    [agents, alerts, events, incidents],
  )

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Reporting</p>
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard title="Alert volume">
          <p className="text-3xl font-semibold">{summary.alerts}</p>
          <p className="mt-1 text-sm text-slate-400">{summary.critical} critical</p>
        </GlassCard>
        <GlassCard title="Incident caseload">
          <p className="text-3xl font-semibold">{summary.incidents}</p>
          <p className="mt-1 text-sm text-slate-400">{summary.active} still active</p>
        </GlassCard>
        <GlassCard title="Coverage">
          <p className="text-3xl font-semibold">{summary.events}</p>
          <p className="mt-1 text-sm text-slate-400">{summary.agents} AI agents reporting</p>
        </GlassCard>
      </div>
      <GlassCard title="Executive summary">
        <p className="text-sm leading-7 text-slate-300">
          This report is generated from live CyberOps API data. Alert volume, incident status, security events, and
          agent health are pulled from the backend rather than static demo figures.
        </p>
      </GlassCard>
    </div>
  )
}
