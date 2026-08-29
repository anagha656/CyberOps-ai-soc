import { API_BASE_URL, POLL_INTERVAL_MS } from '../lib/api/config'
import { GlassCard } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'

export function SettingsPage() {
  const { health, healthError, lastUpdated, refresh } = useSoc()
  const connected = Boolean(health?.ok) && !healthError

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Configuration</p>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>
      <GlassCard title="API connection">
        <dl className="space-y-3 text-sm">
          <Row label="Base URL" value={API_BASE_URL} mono />
          <Row label="Health" value={connected ? 'Backend Connected' : 'Backend Offline'} />
          <Row label="Service" value={health?.service ?? 'Unavailable'} />
          <Row label="Poll interval" value={`${POLL_INTERVAL_MS / 1000}s`} />
          <Row label="Last sync" value={lastUpdated ?? 'Never'} />
        </dl>
        <button
          onClick={() => void refresh()}
          className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
        >
          Refresh now
        </button>
      </GlassCard>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
      <dt className="text-slate-400">{label}</dt>
      <dd className={mono ? 'font-mono text-cyan-200' : ''}>{value}</dd>
    </div>
  )
}
