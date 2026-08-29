import { useMemo } from 'react'
import { EmptyState, GlassCard } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'

export function ThreatIntelPage() {
  const { events, incidents, alerts } = useSoc()

  const indicators = useMemo(() => {
    const ips = new Map<string, { sources: Set<string>; count: number }>()
    const add = (ip: string | null, source: string) => {
      if (!ip) return
      const current = ips.get(ip) ?? { sources: new Set<string>(), count: 0 }
      current.sources.add(source)
      current.count += 1
      ips.set(ip, current)
    }
    for (const event of events) add(event.source_ip, event.event_type)
    for (const incident of incidents) add(incident.source_ip, incident.threat_type)
    for (const alert of alerts) add(alert.source_ip, alert.title)
    return [...ips.entries()].map(([ip, meta]) => ({
      ip,
      count: meta.count,
      sources: [...meta.sources],
    }))
  }, [alerts, events, incidents])

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Intel</p>
        <h1 className="text-2xl font-semibold">Threat Intelligence</h1>
      </div>
      <GlassCard title="Observed indicators">
        {indicators.length === 0 ? (
          <EmptyState
            title="No indicators available"
            detail="Source IPs will appear here when alerts, events, or incidents include them."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="pb-2">Indicator</th>
                  <th className="pb-2">Sightings</th>
                  <th className="pb-2">Related activity</th>
                </tr>
              </thead>
              <tbody>
                {indicators.map((item) => (
                  <tr key={item.ip} className="border-t border-white/5">
                    <td className="py-3 font-mono text-cyan-300">{item.ip}</td>
                    <td>{item.count}</td>
                    <td className="text-slate-400">{item.sources.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
