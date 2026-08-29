import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { IncidentDetail } from '../components/IncidentDetail'
import { SeverityBadge, StatusBadge } from '../components/ui/Badges'
import { EmptyState, ErrorState, GlassCard, SkeletonBlock } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'
import { analyzeEvent } from '../lib/api/api'
import { displayValue, formatTimestamp } from '../lib/format'

export function IncidentsPage() {
  const { incidents, loading, incidentsError, events, refresh } = useSoc()
  const [params, setParams] = useSearchParams()
  const [severity, setSeverity] = useState('all')
  const [status, setStatus] = useState('all')
  const [selected, setSelected] = useState<number | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const query = params.get('q') ?? ''

  const filtered = useMemo(() => {
    return incidents.filter((incident) => {
      const haystack = [
        String(incident.id),
        incident.title,
        incident.threat_type,
        incident.source_ip,
        incident.asset ?? '',
        incident.status,
      ]
        .join(' ')
        .toLowerCase()
      const matchesQuery = query.trim() === '' || haystack.includes(query.toLowerCase())
      const matchesSeverity = severity === 'all' || incident.severity.toLowerCase() === severity
      const matchesStatus = status === 'all' || incident.status.toLowerCase() === status.toLowerCase()
      return matchesQuery && matchesSeverity && matchesStatus
    })
  }, [incidents, query, severity, status])

  const statuses = [...new Set(incidents.map((item) => item.status))]

  async function runAnalysis() {
    const event = events.find((item) => item.source_ip)
    if (!event?.source_ip) {
      toast.error('No security event with a source IP is available to analyze')
      return
    }
    setAnalyzing(true)
    try {
      const result = await analyzeEvent({
        event_type: event.event_type,
        source_ip: event.source_ip,
        username: event.username,
        description: event.description ?? event.message,
      })
      if ('threatDetected' in result && result.threatDetected === false) {
        toast.message(result.message)
      } else if ('id' in result) {
        toast.success(`Incident INC-${result.id} created`)
        setSelected(result.id)
      }
      await refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Case management</p>
          <h1 className="text-2xl font-semibold">Incidents</h1>
        </div>
        <button
          onClick={() => void runAnalysis()}
          disabled={analyzing}
          className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-400/20 disabled:opacity-60"
        >
          {analyzing ? 'Analyzing…' : 'Analyze latest event'}
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            if (e.target.value) next.set('q', e.target.value)
            else next.delete('q')
            setParams(next, { replace: true })
          }}
          placeholder="Search incidents"
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
        >
          <option value="all">All statuses</option>
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <GlassCard>
          {loading ? (
            <SkeletonBlock className="h-72" />
          ) : incidentsError ? (
            <ErrorState message={incidentsError} />
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No incidents match"
              detail="The incident store is empty until analysis creates one, or your filters excluded all rows."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="pb-2">Incident ID</th>
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Source IP</th>
                    <th className="pb-2">Threat Type</th>
                    <th className="pb-2">Asset</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((incident) => (
                    <tr
                      key={incident.id}
                      onClick={() => setSelected(incident.id)}
                      className={`table-row cursor-pointer border-t border-white/5 ${selected === incident.id ? 'bg-cyan-400/5' : ''}`}
                    >
                      <td className="py-3 font-mono text-cyan-300">INC-{incident.id}</td>
                      <td>{incident.title}</td>
                      <td>
                        <SeverityBadge value={incident.severity} />
                      </td>
                      <td>
                        <StatusBadge value={incident.status} />
                      </td>
                      <td className="font-mono text-xs">{incident.source_ip}</td>
                      <td>{incident.threat_type}</td>
                      <td>{displayValue(incident.asset)}</td>
                      <td className="text-slate-400">{formatTimestamp(incident.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
        <GlassCard title="Incident detail">
          <IncidentDetail incidentId={selected} compact />
        </GlassCard>
      </div>
    </div>
  )
}
