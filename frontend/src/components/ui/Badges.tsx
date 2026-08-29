import { severityTone } from '../../lib/format'

const severityClass: Record<string, string> = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
  unknown: 'badge-unknown',
}

export function SeverityBadge({ value }: { value: string | null | undefined }) {
  const tone = severityTone(value)
  return <span className={`badge ${severityClass[tone]}`}>{value || 'Unknown'}</span>
}

const statusClass: Record<string, string> = {
  active: 'badge-active',
  investigating: 'badge-investigating',
  idle: 'badge-idle',
  offline: 'badge-offline',
  open: 'badge-high',
  approved: 'badge-active',
  rejected: 'badge-offline',
  waiting: 'badge-idle',
  'awaiting approval': 'badge-investigating',
}

export function StatusBadge({ value }: { value: string | null | undefined }) {
  const key = (value ?? 'unknown').toLowerCase()
  const cls = statusClass[key] ?? 'badge-unknown'
  return <span className={`badge ${cls}`}>{value || 'Unknown'}</span>
}
