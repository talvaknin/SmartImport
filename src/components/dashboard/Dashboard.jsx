import { useMemo } from 'react'
import { Card, CardBody, Skeleton } from '@heroui/react'
import { motion } from 'framer-motion'
import {
  Ship, Clock, AlertTriangle, CreditCard, Factory, Package, ChevronLeft,
} from 'lucide-react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, CartesianGrid,
} from 'recharts'
import StatusBadge from '../tables/StatusBadge'
import { useCountUp } from '../../hooks/useCountUp'
import { fmtDate, fmtMoney, daysTo } from '../../lib/dates'
import { PIPELINE } from '../../lib/status'

/* ---------- KPI card ---------- */
const TONE = {
  info:  { bar: 'bg-brand-blue', icon: 'bg-brand-blue/10 text-brand-blue' },
  warn:  { bar: 'bg-amber-500',  icon: 'bg-amber-100 text-amber-700' },
  danger:{ bar: 'bg-red-600',    icon: 'bg-red-100 text-red-700' },
  ok:    { bar: 'bg-green-600',  icon: 'bg-green-100 text-green-700' },
}

function KpiCard({ icon: Icon, value, money, label, helper, tone, onClick, urgent }) {
  const n = useCountUp(value)
  const t = TONE[tone] || TONE.info
  return (
    <motion.button
      type="button" onClick={onClick}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
      className="relative overflow-hidden rounded-2xl border border-brand-border bg-white text-right shadow-card outline-none transition-shadow hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand-blue"
      aria-label={label}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${t.bar}`} />
      <div className="flex items-center gap-3 p-4">
        <div className={`rounded-xl p-2.5 ${t.icon}`}><Icon size={20} /></div>
        <div className="min-w-0">
          <div className="text-2xl font-extrabold tabular-nums" dir="ltr">
            {money ? `$${fmtMoney(n)}` : n}
          </div>
          <div className="truncate text-[13px] font-medium text-gray-700">{label}</div>
          {helper && <div className="truncate text-[11px] text-gray-400">{helper}</div>}
        </div>
        {urgent ? (
          <span className="ms-auto inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" aria-hidden />
        ) : (
          <ChevronLeft size={16} className="ms-auto text-gray-300" />
        )}
      </div>
    </motion.button>
  )
}

/* ---------- Attention item ---------- */
function AttentionItem({ icon: Icon, tone, title, sub, badge, onClick }) {
  const t = TONE[tone] || TONE.warn
  return (
    <button type="button" onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-brand-blue">
      <div className={`rounded-lg p-2 ${t.icon}`}><Icon size={16} /></div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="truncate text-xs text-gray-500">{sub}</div>
      </div>
      {badge && <StatusBadge value={badge} />}
    </button>
  )
}

/* ---------- Dashboard ---------- */
export default function Dashboard({ ships, pays, sups, prods, loading, openModule, openRecord }) {
  const m = useMemo(() => {
    const open = ships.filter((r) => r.order_status === 'פתוח')
    const arriving = open
      .filter((r) => r.eta && daysTo(r.eta) >= 0 && daysTo(r.eta) <= 21)
      .sort((a, b) => new Date(a.eta) - new Date(b.eta))
    const delayed = open
      .filter((r) => r.eta && daysTo(r.eta) < 0)
      .sort((a, b) => new Date(a.eta) - new Date(b.eta))
    const due = pays.filter((r) => r.status === 'יש לבצע תשלום')
    const dueSum = due.reduce((s, r) => s + (+r.advance_amount || 0), 0)
    const transitVal = open.reduce((s, r) => s + (+r.goods_cost || 0), 0)
    const pipeline = PIPELINE.map((st) => ({ st, count: open.filter((r) => r.status === st).length }))
    const byMonth = {}
    ships.forEach((r) => { if (r.eta) { const k = String(r.eta).slice(0, 7); byMonth[k] = (byMonth[k] || 0) + 1 } })
    const months = Object.keys(byMonth).sort().slice(-9)
      .map((k) => ({ month: `${k.slice(5, 7)}.${k.slice(2, 4)}`, count: byMonth[k] }))
    const payByMonth = {}
    pays.forEach((r) => {
      if (r.advance_date) {
        const k = String(r.advance_date).slice(0, 7)
        payByMonth[k] = (payByMonth[k] || 0) + (+r.invoice_total || 0)
      }
    })
    const payMonths = Object.keys(payByMonth).sort().slice(-9)
      .map((k) => ({ month: `${k.slice(5, 7)}.${k.slice(2, 4)}`, total: Math.round(payByMonth[k]) }))
    return { open, arriving, delayed, due, dueSum, transitVal, pipeline, months, payMonths }
  }, [ships, pays])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  const attention = [
    ...m.delayed.map((r) => ({
      key: 's' + r.id, icon: AlertTriangle, tone: 'danger',
      title: `${r.product} — באיחור ${Math.abs(daysTo(r.eta))} ימים`,
      sub: `${r.supplier_name || ''} · ETA ${fmtDate(r.eta)} · ${r.destination || ''}`,
      badge: r.status, onClick: () => openRecord('shipments', r),
    })),
    ...m.arriving.filter((r) => daysTo(r.eta) <= 7).map((r) => ({
      key: 'a' + r.id, icon: Ship, tone: 'warn',
      title: `${r.product} — מגיע בעוד ${daysTo(r.eta)} ימים`,
      sub: `${r.supplier_name || ''} · ETA ${fmtDate(r.eta)} · ${r.destination || ''}`,
      badge: r.status, onClick: () => openRecord('shipments', r),
    })),
    ...m.due.map((r) => ({
      key: 'p' + r.id, icon: CreditCard, tone: 'danger',
      title: `${r.details} — $${fmtMoney(r.advance_amount)} לתשלום`,
      sub: `${r.manufacturer || ''} · מקדמה ${fmtDate(r.advance_date)} · הזמנה ${r.order_no || ''}`,
      badge: r.status, onClick: () => openRecord('payments', r),
    })),
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* KPI cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <KpiCard icon={Ship} value={m.open.length} label="משלוחים פתוחים"
          helper={`$${fmtMoney(m.transitVal)} שווי סחורה`} tone="info"
          onClick={() => openModule('shipments', { order_status: 'פתוח' })} />
        <KpiCard icon={Clock} value={m.arriving.length} label="מגיעים תוך 21 יום"
          helper="לפי ETA" tone="warn"
          onClick={() => openModule('shipments', { order_status: 'פתוח' })} />
        <KpiCard icon={AlertTriangle} value={m.delayed.length} label="משלוחים באיחור"
          helper="ETA עבר וההזמנה פתוחה" tone={m.delayed.length ? 'danger' : 'ok'} urgent={m.delayed.length > 0}
          onClick={() => openModule('shipments', { order_status: 'פתוח' })} />
        <KpiCard icon={CreditCard} value={m.dueSum} money label={`לתשלום מיידי (${m.due.length})`}
          helper="תשלומים פתוחים" tone={m.due.length ? 'danger' : 'ok'} urgent={m.due.length > 0}
          onClick={() => openModule('payments', { status: 'יש לבצע תשלום' })} />
        <KpiCard icon={Factory} value={sups.length} label="ספקים" helper="כולל מקומי וחו״ל" tone="info"
          onClick={() => openModule('suppliers')} />
        <KpiCard icon={Package} value={prods.length} label="מקטים בקטלוג" helper="אביזרי רכב" tone="info"
          onClick={() => openModule('products')} />
      </div>

      {/* Today's attention */}
      <Card className="rounded-2xl border border-brand-border shadow-card">
        <CardBody className="gap-1 p-4">
          <div className="mb-1 flex items-baseline gap-2">
            <h3 className="text-base font-bold">דורש טיפול היום</h3>
            <span className="text-xs text-gray-400">Today's Attention · {attention.length} פריטים</span>
          </div>
          {attention.length ? (
            <div className="flex max-h-72 flex-col gap-0.5 overflow-auto">
              {attention.map((a) => <AttentionItem {...a} key={a.key} />)}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-gray-400">אין פריטים שדורשים טיפול — הכול בשליטה 🎉</div>
          )}
        </CardBody>
      </Card>

      {/* Pipeline */}
      <Card className="rounded-2xl border border-brand-border shadow-card">
        <CardBody className="p-4">
          <h3 className="mb-3 text-base font-bold">צינור משלוחים — הזמנות פתוחות</h3>
          <div className="flex items-stretch gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {m.pipeline.map((p, i) => (
              <button key={p.st} type="button"
                onClick={() => openModule('shipments', { order_status: 'פתוח', status: p.st })}
                className={`flex min-w-[110px] flex-1 flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all hover:-translate-y-0.5 hover:shadow hover:border-brand-blue/40 ${p.count ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'}`}>
                <span className="text-xl font-extrabold tabular-nums">{p.count}</span>
                <StatusBadge value={p.st} />
                {i < m.pipeline.length - 1 && <span className="sr-only">→</span>}
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border border-brand-border shadow-card">
          <CardBody className="p-4">
            <h3 className="mb-2 text-base font-bold">הגעות משלוחים לפי חודש (ETA)</h3>
            <div dir="ltr" className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.months}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis allowDecimals={false} fontSize={11} width={26} />
                  <ChartTooltip formatter={(v) => [v, 'משלוחים']} />
                  <Bar dataKey="count" fill="#1F4E9D" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
        <Card className="rounded-2xl border border-brand-border shadow-card">
          <CardBody className="p-4">
            <h3 className="mb-2 text-base font-bold">היקף חשבוניות לפי חודש ($)</h3>
            <div dir="ltr" className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={m.payMonths}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" fontSize={11} />
                  <YAxis fontSize={11} width={44} tickFormatter={(v) => '$' + fmtMoney(v)} />
                  <ChartTooltip formatter={(v) => ['$' + fmtMoney(v), 'חשבוניות']} />
                  <Bar dataKey="total" fill="#e8842c" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
