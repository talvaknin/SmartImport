// Date & number helpers — ported unchanged from the v1 app (business logic preserved)
export const fmtMoney = (v) =>
  v == null || v === '' ? '' : Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })

export const fmtDate = (v) => {
  if (!v) return ''
  const d = new Date(v)
  return isNaN(d) ? '' : d.toLocaleDateString('he-IL')
}

export const daysTo = (v) => {
  if (!v) return null
  return Math.round((new Date(v) - new Date().setHours(0, 0, 0, 0)) / 864e5)
}

// Value converters (used by the record drawer when saving form fields)
export function exDate(v) {
  if (v == null || v === '') return null
  if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10)
  if (typeof v === 'number' && v > 20000 && v < 60000)
    return new Date(Math.round((v - 25569) * 864e5)).toISOString().slice(0, 10)
  const d = new Date(v)
  return isNaN(d) ? null : d.toISOString().slice(0, 10)
}
export const exNum = (v) => {
  if (v == null || v === '') return null
  const n = Number(String(v).replace(/[, ]/g, ''))
  return isNaN(n) ? null : n
}
export const exTxt = (v) => (v == null ? null : String(v).trim() || null)
