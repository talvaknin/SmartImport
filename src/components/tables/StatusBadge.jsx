import { chipClass } from '../../lib/status'

// Status pill: dot + text + semantic color (never color alone)
export default function StatusBadge({ value }) {
  if (!value) return null
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${chipClass(value)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {value}
    </span>
  )
}
