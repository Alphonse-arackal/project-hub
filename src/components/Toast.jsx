import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export default function Toast({ toast }) {
  if (!toast) return null
  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2
  return (
    <div className={`toast toast-${toast.type || 'success'}`} role="status" aria-live="polite">
      <Icon size={17} strokeWidth={2} />
      <span>{toast.message}</span>
    </div>
  )
}