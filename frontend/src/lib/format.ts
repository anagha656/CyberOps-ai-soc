export function normalizeSeverity(value: string | null | undefined): string {
  const raw = (value ?? '').trim().toLowerCase()
  if (raw === 'critical' || raw === 'crit') return 'Critical'
  if (raw === 'high') return 'High'
  if (raw === 'medium' || raw === 'med' || raw === 'moderate') return 'Medium'
  if (raw === 'low' || raw === 'info' || raw === 'informational') return 'Low'
  if (!raw) return 'Unknown'
  return value!.trim()
}

export function severityTone(value: string | null | undefined): 'critical' | 'high' | 'medium' | 'low' | 'unknown' {
  const severity = normalizeSeverity(value)
  if (severity === 'Critical') return 'critical'
  if (severity === 'High') return 'high'
  if (severity === 'Medium') return 'medium'
  if (severity === 'Low') return 'low'
  return 'unknown'
}

export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function isSameLocalDay(value: string | null | undefined, now = new Date()): boolean {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function hourBucket(value: string): string | null {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return `${String(date.getHours()).padStart(2, '0')}:00`
}

export function displayValue(value: string | number | null | undefined, fallback = '—'): string {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  return String(value)
}

export function isActiveIncidentStatus(status: string): boolean {
  const value = status.toLowerCase()
  return !['approved', 'rejected', 'closed', 'resolved', 'dismissed'].includes(value)
}
