import StatusBadge from './StatusBadge'
import { ChevronLeft } from 'lucide-react'
import { fmtDate, fmtMoney } from '../../lib/dates'

function val(field, v) {
  if (v == null || v === '') return '—'
  if (field.t === 'date') return fmtDate(v)
  if (field.t === 'number') return fmtMoney(v)
  return String(v)
}

// Compact tappable card for mobile — shows title + a few key fields.
export default function RecordCard({ schema, row, onOpen }) {
  const fieldMap = Object.fromEntries(schema.fields.map((f) => [f.k, f]))
  const badgeField = schema.fields.find((f) => f.badge)
  const cardFields = (schema.cardCols || schema.cols.slice(0, 4)).filter((c) => c !== badgeField?.k)
  const title = row[schema.titleField] || '—'

  return (
    <button type="button" onClick={() => onOpen(row)}
      className="flex w-full items-center gap-3 rounded-2xl border border-brand-border bg-white p-4 text-right shadow-card transition-transform active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="truncate text-sm font-bold text-brand-text">{title}</span>
          {badgeField && <StatusBadge value={row[badgeField.k]} />}
        </div>
        <div className="flex flex-col gap-0.5">
          {cardFields.map((c) => {
            const f = fieldMap[c]
            const v = val(f, row[c])
            if (v === '—') return null
            return (
              <div key={c} className="flex justify-between gap-3 text-xs">
                <span className="text-brand-muted">{f.l}</span>
                <span className="truncate text-brand-text" dir={f.t === 'number' || f.t === 'date' ? 'ltr' : 'rtl'}>{v}</span>
              </div>
            )
          })}
        </div>
      </div>
      <ChevronLeft size={18} className="shrink-0 text-slate-300" />
    </button>
  )
}
