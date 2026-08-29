import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { IncidentDetail } from '../components/IncidentDetail'
import { SeverityBadge, StatusBadge } from '../components/ui/Badges'
import { EmptyState, GlassCard } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'
import { analyzeEvent } from '../lib/api/api'
import { displayValue, formatTimestamp } from '../lib/format'

export function InvestigationsPage() {
  const { incidentId } = useParams()
  const { incidents, events, alerts, refresh } = useSoc()
  const selectedId = incidentId ? Number(incidentId) : incidents[0]?.id ?? null
  const incident = incidents.find((item) => item.id === selectedId) ?? null
  const [analyzing, setAnalyzing] = useState(false)

  const relatedEvents = useMemo(() => {
    if (!incident) return events.slice(0, 8)
    return events.filter(
      (event) =>
        event.source_ip === incident.source_ip ||
        event.event_type.toLowerCase().includes(incident.threat_type.toLowerCase()),
    )
  }, [events, incident])

  const relatedAssets = useMemo(() => {
    const values = new Set<string>()
    if (incident?.asset) values.add(incident.asset)
    for (const alert of alerts) {
      if (alert.asset) values.add(alert.asset)
      if (alert.source) values.add(alert.source)
    }
    return [...values]
  }, [alerts, incident])

  async function runAnalysis() {
    const event = events.find((item) => item.source_ip)
    if (!event?.source_ip) {
      toast.error('No analyzable event with a source IP is available')
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
      } else {
        toast.success('Investigation case opened from backend analysis')
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
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Forensics</p>
          <h1 className="text-2xl font-semibold">Investigations</h1>
        </div>
        <button
          onClick={() => void runAnalysis()}
          disabled={analyzing}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {analyzing ? 'Running analysis…' : 'Start from latest event'}
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[240px_1fr]">
        <GlassCard title="Cases">
          {incidents.length === 0 ? (
            <EmptyState title="No open investigations" detail="Analyze an event to create an incident case." />
          ) : (
            <ul className="space-y-2">
              {incidents.map((item) => (
                <li key={item.id}>
                  <Link
                    to={`/investigations/${item.id}`}
                    className={`block rounded-lg px-3 py-2 text-sm hover:bg-white/5 ${item.id === selectedId ? 'bg-cyan-400/10' : ''}`}
                  >
                    <p className="font-mono text-xs text-cyan-300">INC-{item.id}</p>
                    <p>{item.title}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard title="Incident information">
            {incident ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono text-cyan-300">INC-{incident.id}</span>
                <span>{incident.title}</span>
                <SeverityBadge value={incident.severity} />
                <StatusBadge value={incident.status} />
              </div>
            ) : (
              <EmptyState title="No incident selected" detail="Create or select an incident to begin investigation." />
            )}
          </GlassCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard title="Timeline">
              {relatedEvents.length === 0 ? (
                <EmptyState title="No timeline events" detail="Security events related to this case were not returned." />
              ) : (
                <ol className="space-y-3">
                  {relatedEvents.map((event, index) => (
                    <li key={String(event.id ?? index)} className="border-l border-cyan-400/30 pl-3">
                      <p className="text-xs text-slate-400">{formatTimestamp(event.timestamp)}</p>
                      <p className="text-sm">{event.event_type}</p>
                      <p className="text-xs text-slate-400">{displayValue(event.message ?? event.description)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </GlassCard>
            <GlassCard title="Security events">
              {relatedEvents.length === 0 ? (
                <EmptyState title="No linked events" detail="The events API did not include matching records." />
              ) : (
                <ul className="space-y-2 text-sm">
                  {relatedEvents.map((event, index) => (
                    <li key={`evt-${String(event.id ?? index)}`} className="rounded-lg bg-black/20 px-3 py-2">
                      {event.event_type} · {displayValue(event.source_ip)}
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <GlassCard title="Source IP">
              <p className="font-mono text-lg">{incident?.source_ip ?? '—'}</p>
            </GlassCard>
            <GlassCard title="Related assets">
              {relatedAssets.length === 0 ? (
                <p className="text-sm text-slate-400">No asset names were provided by the API.</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {relatedAssets.map((asset) => (
                    <li key={asset}>{asset}</li>
                  ))}
                </ul>
              )}
            </GlassCard>
            <GlassCard title="Investigation status">
              <StatusBadge value={incident?.status ?? 'Idle'} />
            </GlassCard>
          </div>

          <GlassCard title="AI analysis">
            <IncidentDetail incidentId={selectedId} />
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
