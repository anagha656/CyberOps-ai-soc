import {
  Activity,
  Bot,
  FileBarChart,
  LayoutDashboard,
  Radar,
  Search,
  Server,
  Settings,
  ShieldAlert,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/incidents', label: 'Incidents', icon: ShieldAlert },
  { to: '/investigations', label: 'Investigations', icon: Search },
  { to: '/agents', label: 'AI Agents', icon: Bot },
  { to: '/intelligence', label: 'Threat Intelligence', icon: Radar },
  { to: '/assets', label: 'Assets', icon: Server },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10">
          <Activity className="h-5 w-5 text-cyan-300" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide">CyberOps</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">AI SOC</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onNavigate}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{link.label}</span>
            </NavLink>
          )
        })}
      </nav>
      <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
        Autonomous detection, investigation, and response console.
      </div>
    </aside>
  )
}
