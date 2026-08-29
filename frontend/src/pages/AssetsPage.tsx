import { useMemo } from 'react'
import { EmptyState, GlassCard } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'

export function AssetsPage() {
  const { alerts, incidents } = useSoc()

  const assets = useMemo(() => {
    const map = new Map<string, { alerts: number; incidents: number }>()
    const bump = (name: string | null, key: 'alerts' | 'incidents') => {
      if (!name) return
      const current = map.get(name) ?? { alerts: 0, incidents: 0 }
      current[key] += 1
      map.set(name, current)
    }
    for (const alert of alerts) bump(alert.asset ?? alert.source, 'alerts')
    for (const incident of incidents) bump(incident.asset, 'incidents')
    return [...map.entries()].map(([name, counts]) => ({ name, ...counts }))
  }, [alerts, incidents])

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Inventory</p>
        <h1 className="text-2xl font-semibold">Assets</h1>
      </div>
      <GlassCard>
        {assets.length === 0 ? (
          <EmptyState title="No assets reported" detail="Asset names will appear when alerts or incidents include them." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">Asset</th>
                <th className="pb-2">Alerts</th>
                <th className="pb-2">Incidents</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.name} className="border-t border-white/5">
                  <td className="py-3">{asset.name}</td>
                  <td>{asset.alerts}</td>
                  <td>{asset.incidents}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  )
}
