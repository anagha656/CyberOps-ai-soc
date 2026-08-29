import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useSoc } from '../context/SocContext'

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low']

export function CreateAlertModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { createAlert } = useSoc()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    source_ip: '',
    severity: 'High',
    threat_type: '',
    asset: '',
  })

  if (!open) return null

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    setSubmitting(true)
    try {
      await createAlert(form)
      toast.success('Alert created')
      setForm({
        title: '',
        description: '',
        source_ip: '',
        severity: 'High',
        threat_type: '',
        asset: '',
      })
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create alert')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-lg rounded-2xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create alert</h3>
          <button type="button" className="text-slate-400 hover:text-white" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="grid gap-3">
          <Field label="Title">
            <input
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Source IP">
              <input
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono"
                value={form.source_ip}
                onChange={(e) => setForm((f) => ({ ...f, source_ip: e.target.value }))}
              />
            </Field>
            <Field label="Severity">
              <select
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              >
                {SEVERITIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Threat type">
              <input
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                value={form.threat_type}
                onChange={(e) => setForm((f) => ({ ...f, threat_type: e.target.value }))}
              />
            </Field>
            <Field label="Asset">
              <input
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2"
                value={form.asset}
                onChange={(e) => setForm((f) => ({ ...f, asset: e.target.value }))}
              />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="rounded-lg px-4 py-2 text-slate-300 hover:bg-white/5" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-cyan-400 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
          >
            {submitting ? 'Creating…' : 'Create alert'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs text-slate-400">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  )
}
