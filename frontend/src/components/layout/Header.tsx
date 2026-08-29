import { Bell, Menu, Search, UserRound } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSoc } from '../../context/SocContext'
import { formatTimestamp } from '../../lib/format'

export function Header({ onMenu }: { onMenu: () => void }) {
  const { health, healthError, alerts, lastUpdated } = useSoc()
  const connected = Boolean(health?.ok) && !healthError
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  const notifications = useMemo(
    () =>
      alerts.filter((alert) => {
        const severity = alert.severity.toLowerCase()
        return severity === 'critical' || severity === 'high'
      }),
    [alerts],
  )

  function submitSearch(event: FormEvent) {
    event.preventDefault()
    const next = query.trim()
    if (!next) return
    void navigate(`/incidents?q=${encodeURIComponent(next)}`)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050814]/80 px-4 py-3 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 hover:bg-white/5 lg:hidden" onClick={onMenu} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden min-w-[140px] md:block">
          <p className="text-sm font-semibold">CyberOps AI SOC</p>
          <p className="text-[11px] text-slate-400">Security operations center</p>
        </div>
        <form onSubmit={submitSearch} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search incidents, IPs, threat types…"
            className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pr-3 pl-10 text-sm outline-none ring-cyan-400/30 focus:ring-2"
          />
        </form>
        <div className="relative">
          <button
            className="relative rounded-xl border border-white/10 bg-black/20 p-2 hover:bg-white/5"
            onClick={() => setShowNotes((v) => !v)}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 ? (
              <span className="absolute -top-1 -right-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold">
                {notifications.length}
              </span>
            ) : null}
          </button>
          {showNotes ? (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-[#0b1220] p-3 shadow-2xl">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Critical / high alerts</p>
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-400">No high-severity alerts from the backend.</p>
              ) : (
                <ul className="space-y-2">
                  {notifications.slice(0, 6).map((alert) => (
                    <li key={alert.id} className="rounded-lg bg-white/5 px-3 py-2 text-sm">
                      {alert.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 sm:flex">
          <span className={`pulse-dot ${connected ? '' : 'off'}`} />
          <div>
            <p className="text-xs font-medium">{connected ? 'Backend Connected' : 'Backend Offline'}</p>
            <p className="text-[10px] text-slate-400">{lastUpdated ? `Synced ${formatTimestamp(lastUpdated)}` : 'Waiting'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-200">
            <UserRound className="h-4 w-4" />
          </div>
          <div className="hidden pr-2 md:block">
            <p className="text-xs font-medium">SOC Analyst</p>
            <p className="text-[10px] text-slate-400">Tier 1</p>
          </div>
        </div>
      </div>
    </header>
  )
}
