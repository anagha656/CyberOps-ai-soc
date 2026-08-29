import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useSoc } from '../context/SocContext'
import { displayValue, formatTimestamp } from '../lib/format'
import type { IncidentRecord } from '../lib/api/types'
import { SeverityBadge, StatusBadge } from './ui/Badges'
import { EmptyState, ErrorState, SkeletonBlock } from './ui/GlassCard'

export function IncidentDetail({
  incidentId,
  compact = false,
}: {
  incidentId: number | null
  compact?: boolean
}) {
  const { loadIncident, approveIncident } = useSoc()
  const [incident, setIncident] = useState<IncidentRecord | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (incidentId === null) {
      setIncident(null)
      setError(null)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    void loadIncident(incidentId)
      .then((result) => {
        if (!cancelled) setIncident(result)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load incident')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [incidentId, loadIncident])

  async function decide(approved: boolean) {
    if (incidentId === null) return
    setBusy(true)
    try {
      const updated = await approveIncident(incidentId, approved)
      if (updated) setIncident(updated)
      toast.success(approved ? 'Incident approved' : 'Incident rejected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Approval failed')
    } finally {
      setBusy(false)
    }
  }

  if (incidentId === null) {
    return <EmptyState title="Select an incident" detail="Choose an incident to inspect live backend details." />
  }
  if (loading) return <SkeletonBlock className="h-64" />
  if (error) return <ErrorState message={error} />
  if (!incident) return <EmptyState title="No incident data" detail="The API did not return this incident." />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-cyan-300">INC-{incident.id}</p>
          <h3 className="text-lg font-semibold">{incident.title}</h3>
        </div>
        <div className="flex gap-2">
          <SeverityBadge value={incident.severity} />
          <StatusBadge value={incident.status} />
        </div>
      </div>

      <dl className={`grid gap-3 text-sm ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <Item label="Threat type" value={incident.threat_type} />
        <Item label="Source IP" value={incident.source_ip} mono />
        <Item label="Asset" value={displayValue(incident.asset)} />
        <Item label="Risk score" value={incident.risk_score === null ? '—' : String(incident.risk_score)} />
        <Item label="Timestamp" value={formatTimestamp(incident.timestamp)} />
        <Item label="Status" value={incident.status} />
      </dl>

      {incident.explanation ? (
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">AI analysis</p>
          <p className="text-sm leading-6 text-slate-200">{incident.explanation}</p>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Threat indicators</p>
        {incident.evidence.length === 0 ? (
          <p className="text-sm text-slate-400">No evidence fields were returned for this incident.</p>
        ) : (
          <ul className="space-y-2">
            {incident.evidence.map((item) => (
              <li key={item} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {incident.recommended_response ? (
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3 text-sm">
          <p className="mb-1 text-xs uppercase tracking-wide text-cyan-200">Recommended response</p>
          {incident.recommended_response}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => void decide(true)}
          className="rounded-lg bg-emerald-500/90 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          Approve
        </button>
        <button
          disabled={busy}
          onClick={() => void decide(false)}
          className="rounded-lg bg-rose-500/90 px-4 py-2 text-sm font-medium text-white hover:bg-rose-400 disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  )
}

function Item({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 text-slate-100 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
