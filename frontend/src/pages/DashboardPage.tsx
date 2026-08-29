import { ShieldAlert, Siren, TriangleAlert, Zap } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CreateAlertModal } from '../components/CreateAlertModal'
import { SeverityBadge, StatusBadge } from '../components/ui/Badges'
import { EmptyState, ErrorState, GlassCard, SkeletonBlock } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'
import { displayValue, formatTimestamp, hourBucket, isActiveIncidentStatus, isSameLocalDay, normalizeSeverity } from '../lib/format'

const COLORS: Record<string, string> = {
  Critical: '#f43f5e',
  High: '#fb923c',
  Medium: '#fbbf24',
  Low: '#34d399',
  Unknown: '#64748b',
}

export function DashboardPage() {
  const {
    loading,
    alerts,
    events,
    incidents,
    agents,
    alertsError,
    eventsError,
    incidentsError,
    agentsError,
    health,
    healthError,
  } = useSoc()
  const [alertOpen, setAlertOpen] = useState(false)

  const stats = useMemo(() => {
    const critical = alerts.filter((a) => normalizeSeverity(a.severity) === 'Critical').length
    const high = alerts.filter((a) => normalizeSeverity(a.severity) === 'High').length
    const active = incidents.filter((i) => isActiveIncidentStatus(i.status)).length
    const datedEvents = events.filter((e) => isSameLocalDay(e.timestamp)).length
    const today = datedEvents > 0 ? datedEvents : alerts.length
    return { critical, high, active, today, todayFromTimestamps: datedEvents > 0 }
  }, [alerts, events, incidents])

  const activity = useMemo(() => {
    const buckets = new Map<string, number>()
    for (const event of events) {
      if (!event.timestamp) continue
      const key = hourBucket(event.timestamp)
      if (!key) continue
      buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, count]) => ({ hour, count }))
  }, [events])

  const severityData = useMemo(() => {
    const counts = new Map<string, number>()
    for (const alert of alerts) {
      const key = normalizeSeverity(alert.severity)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.entries()].map(([name, value]) => ({ name, value }))
  }, [alerts])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Live operations</p>
          <h1 className="text-2xl font-semibold">SOC Dashboard</h1>
        </div>
        <button
          onClick={() => setAlertOpen(true)}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
        >
          Create alert
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          loading={loading}
          label="Critical Threats"
          value={stats.critical}
          icon={<Siren className="h-5 w-5 text-rose-300" />}
          tone="critical"
        />
        <Stat
          loading={loading}
          label="High Threats"
          value={stats.high}
          icon={<TriangleAlert className="h-5 w-5 text-orange-300" />}
          tone="high"
        />
        <Stat
          loading={loading}
          label="Active Incidents"
          value={stats.active}
          icon={<ShieldAlert className="h-5 w-5 text-cyan-300" />}
          tone="info"
        />
        <Stat
          loading={loading}
          label="Threats Detected Today"
          value={stats.today}
          icon={<Zap className="h-5 w-5 text-emerald-300" />}
          tone="ok"
          hint={stats.todayFromTimestamps ? 'From event timestamps' : 'Event timestamps missing; showing current alert count'}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2" title="Recent Incidents" action={<Link to="/incidents" className="text-xs text-cyan-300">View all</Link>}>
          {loading ? (
            <SkeletonBlock className="h-48" />
          ) : incidentsError ? (
            <ErrorState message={incidentsError} />
          ) : incidents.length === 0 ? (
            <EmptyState title="No incidents yet" detail="Incidents appear after the backend analyzes a security event." />
          ) : (
            <IncidentTable incidents={incidents.slice(0, 6)} />
          )}
        </GlassCard>

        <GlassCard title="Severity Distribution">
          {loading ? (
            <SkeletonBlock className="h-48" />
          ) : alertsError ? (
            <ErrorState message={alertsError} />
          ) : severityData.length === 0 ? (
            <EmptyState title="No severity data" detail="Alert severity will appear when the API returns alerts." />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3}>
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name] ?? '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0b1220', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2" title="Threat Activity">
          {loading ? (
            <SkeletonBlock className="h-52" />
          ) : eventsError ? (
            <ErrorState message={eventsError} />
          ) : activity.length === 0 ? (
            <EmptyState
              title="No time-series activity"
              detail="The events API did not include usable timestamps for a timeline chart."
            />
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity}>
                  <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: '#0b1220', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 12 }}
                  />
                  <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>

        <GlassCard title="System Health">
          <div className="space-y-3 text-sm">
            <HealthRow
              label="Backend API"
              ok={Boolean(health?.ok) && !healthError}
              detail={healthError ?? health?.service ?? 'CyberOps API'}
            />
            <HealthRow label="Alert feed" ok={!alertsError} detail={alertsError ?? `${alerts.length} alerts`} />
            <HealthRow label="Event stream" ok={!eventsError} detail={eventsError ?? `${events.length} events`} />
            <HealthRow label="Incident store" ok={!incidentsError} detail={incidentsError ?? `${incidents.length} incidents`} />
            <HealthRow label="AI agents" ok={!agentsError} detail={agentsError ?? `${agents.length} agents`} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <GlassCard title="Security Events">
          {loading ? (
            <SkeletonBlock className="h-48" />
          ) : eventsError ? (
            <ErrorState message={eventsError} />
          ) : events.length === 0 ? (
            <EmptyState title="No security events" detail="GET /alerts/events returned no events." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Source</th>
                    <th className="pb-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {events.slice(0, 8).map((event, index) => (
                    <tr key={String(event.id ?? index)} className="table-row border-t border-white/5">
                      <td className="py-2.5">
                        <p>{event.event_type}</p>
                        <p className="text-xs text-slate-400">{displayValue(event.message ?? event.description)}</p>
                      </td>
                      <td>
                        {event.severity ? <SeverityBadge value={event.severity} /> : '—'}
                      </td>
                      <td className="font-mono text-xs">{displayValue(event.source_ip ?? event.source)}</td>
                      <td className="text-slate-400">{formatTimestamp(event.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        <GlassCard title="AI Agent Activity" action={<Link to="/agents" className="text-xs text-cyan-300">Manage</Link>}>
          {loading ? (
            <SkeletonBlock className="h-48" />
          ) : agentsError ? (
            <ErrorState message={agentsError} />
          ) : agents.length === 0 ? (
            <EmptyState title="No agents" detail="GET /agents/ returned no agents." />
          ) : (
            <ul className="space-y-3">
              {agents.map((agent) => (
                <li key={agent.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="text-xs text-slate-400">{agent.currentTask}</p>
                  </div>
                  <StatusBadge value={agent.status} />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <CreateAlertModal open={alertOpen} onClose={() => setAlertOpen(false)} />
    </div>
  )
}

function Stat({
  label,
  value,
  icon,
  loading,
  tone,
  hint,
}: {
  label: string
  value: number
  icon: ReactNode
  loading: boolean
  tone: 'critical' | 'high' | 'info' | 'ok'
  hint?: string
}) {
  const ring =
    tone === 'critical'
      ? 'border-rose-500/20'
      : tone === 'high'
        ? 'border-orange-400/20'
        : tone === 'ok'
          ? 'border-emerald-400/20'
          : 'border-cyan-400/20'

  return (
    <div className={`stat-card glass rounded-2xl border p-4 ${ring}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        {icon}
      </div>
      {loading ? <SkeletonBlock className="mt-3 h-10" /> : <p className="mt-3 text-3xl font-semibold">{value}</p>}
      {hint ? <p className="mt-2 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  )
}

function HealthRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-black/20 px-3 py-2">
      <div>
        <p>{label}</p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
      <span className={`badge ${ok ? 'badge-active' : 'badge-offline'}`}>{ok ? 'Healthy' : 'Issue'}</span>
    </div>
  )
}

function IncidentTable({ incidents }: { incidents: ReturnType<typeof useSoc>['incidents'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="pb-2">ID</th>
            <th className="pb-2">Title</th>
            <th className="pb-2">Severity</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Source IP</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((incident) => (
            <tr key={incident.id} className="table-row border-t border-white/5">
              <td className="py-2.5 font-mono text-cyan-300">INC-{incident.id}</td>
              <td>{incident.title}</td>
              <td>
                <SeverityBadge value={incident.severity} />
              </td>
              <td>
                <StatusBadge value={incident.status} />
              </td>
              <td className="font-mono text-xs">{incident.source_ip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
