import { Bot } from 'lucide-react'
import { StatusBadge } from '../components/ui/Badges'
import { EmptyState, ErrorState, GlassCard, SkeletonBlock } from '../components/ui/GlassCard'
import { useSoc } from '../context/SocContext'
import { displayValue, formatTimestamp } from '../lib/format'

export function AgentsPage() {
  const { agents, agentsError, loading } = useSoc()

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Autonomy</p>
        <h1 className="text-2xl font-semibold">AI Agents</h1>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
        </div>
      ) : agentsError ? (
        <ErrorState message={agentsError} />
      ) : agents.length === 0 ? (
        <EmptyState title="No agents online" detail="GET /agents/ did not return any agents." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agents.map((agent) => (
            <GlassCard key={agent.name}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-cyan-400/10 p-2 text-cyan-300">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{agent.name}</h2>
                    <p className="text-xs text-slate-400">Raw status: {agent.rawStatus}</p>
                  </div>
                </div>
                <StatusBadge value={agent.status} />
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Current task</dt>
                  <dd className="mt-1">{agent.currentTask}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Last activity</dt>
                  <dd className="mt-1">
                    {agent.lastActivity ? formatTimestamp(agent.lastActivity) : 'Not reported by API'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Threats handled</dt>
                  <dd className="mt-1">{displayValue(agent.threatsHandled, 'Not reported')}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-400">Actions performed</dt>
                  <dd className="mt-1">{displayValue(agent.actionsPerformed, 'Not reported')}</dd>
                </div>
              </dl>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
