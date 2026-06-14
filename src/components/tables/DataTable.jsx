import { useMemo, useState } from 'react'
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Select, SelectItem, Button, Pagination, Skeleton,
} from '@heroui/react'
import { Search, FilterX, Plus, ChevronLeft } from 'lucide-react'
import StatusBadge from './StatusBadge'
import RecordCard from './RecordCard'
import EmptyState from '../feedback/EmptyState'
import ErrorState from '../feedback/ErrorState'
import { fmtDate, fmtMoney } from '../../lib/dates'

const PAGE_SIZE = 25

function cellValue(field, v) {
  if (v == null || v === '') return <span className="text-gray-300">—</span>
  if (field.badge) return <StatusBadge value={v} />
  if (field.t === 'date') return <span className="tabular-nums" dir="ltr">{fmtDate(v)}</span>
  if (field.t === 'number') return <span className="tabular-nums" dir="ltr">{fmtMoney(v)}</span>
  return <span className="block max-w-[260px] truncate">{String(v)}</span>
}

export default function DataTable({ schema, rows, loading, error, onReload, onRowOpen, onAdd, initialFilters }) {
  const fieldMap = useMemo(() => Object.fromEntries(schema.fields.map((f) => [f.k, f])), [schema])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters || {})
  const [sort, setSort] = useState(schema.defaultSort)
  const [page, setPage] = useState(1)

  const hasActiveFilters = search.trim() !== '' || Object.values(filters).some(Boolean)

  const view = useMemo(() => {
    const q = search.trim().toLowerCase()
    let v = rows.filter((r) => {
      for (const [k, val] of Object.entries(filters)) if (val && r[k] !== val) return false
      if (!q) return true
      return Object.values(r).some((x) => String(x ?? '').toLowerCase().includes(q))
    })
    if (sort?.column) {
      const fd = fieldMap[sort.column] || {}
      const dir = sort.direction === 'descending' ? -1 : 1
      v = [...v].sort((a, b) => {
        const x = a[sort.column], y = b[sort.column]
        if (x == null || x === '') return 1
        if (y == null || y === '') return -1
        let r
        if (fd.t === 'number') r = Number(x) - Number(y)
        else if (fd.t === 'date') r = new Date(x) - new Date(y)
        else r = String(x).localeCompare(String(y), 'he')
        return r * dir
      })
    }
    return v
  }, [rows, search, filters, sort, fieldMap])

  const pages = Math.max(1, Math.ceil(view.length / PAGE_SIZE))
  const safePage = Math.min(page, pages)
  const pageRows = view.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const clearFilters = () => { setSearch(''); setFilters({}); setPage(1) }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button color="primary" size="md" className="font-semibold shadow-sm" startContent={<Plus size={18} />} onPress={onAdd}>הוספה</Button>
        <Input
          size="md" className="w-56" isClearable value={search}
          onValueChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="חיפוש חופשי…" startContent={<Search size={16} className="text-gray-400" />}
          aria-label="חיפוש"
        />
        {schema.filters.map((f) => (
          <Select
            key={f.k} aria-label={f.l} placeholder={f.l} size="md" className="w-44"
            selectedKeys={filters[f.k] ? [filters[f.k]] : []}
            onChange={(e) => { setFilters((s) => ({ ...s, [f.k]: e.target.value })); setPage(1) }}
          >
            {f.opts.map((o) => <SelectItem key={o}>{o}</SelectItem>)}
          </Select>
        ))}
        {hasActiveFilters && (
          <Button variant="flat" size="md" startContent={<FilterX size={16} />} onPress={clearFilters}>
            ניקוי סינונים
          </Button>
        )}
        <span className="ms-auto text-xs text-gray-500">מציג {view.length} מתוך {rows.length} רשומות</span>
      </div>

      {/* Table / states */}
      {error ? (
        <ErrorState message={error} onRetry={onReload} />
      ) : loading ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-9 rounded-lg" />)}
        </div>
      ) : view.length === 0 ? (
        <div className="rounded-2xl bg-white shadow-card"><EmptyState filtered={hasActiveFilters} title={`אין עדיין ${schema.title}`} /></div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {pageRows.map((r) => <RecordCard key={r.id} schema={schema} row={r} onOpen={onRowOpen} />)}
          </div>
          {/* Desktop: table */}
          <div className="hidden md:block">
          <Table
            aria-label={schema.title}
            isHeaderSticky removeWrapper
            sortDescriptor={sort} onSortChange={setSort}
            onRowAction={(key) => onRowOpen(rows.find((r) => String(r.id) === String(key)))}
            classNames={{
              base: 'rounded-2xl bg-white shadow-sm p-2 overflow-auto max-h-[65vh]',
              tr: 'cursor-pointer transition-colors hover:bg-brand-blue/5',
              th: 'text-xs',
            }}
          >
            <TableHeader>
              {schema.cols.map((c) => (
                <TableColumn key={c} allowsSorting>{fieldMap[c].l}</TableColumn>
              ))}
            </TableHeader>
            <TableBody items={pageRows} emptyContent={<EmptyState filtered={hasActiveFilters} title={`אין עדיין ${schema.title}`} />}>
              {(r) => (
                <TableRow key={r.id}>
                  {schema.cols.map((c) => <TableCell key={c}>{cellValue(fieldMap[c], r[c])}</TableCell>)}
                </TableRow>
              )}
            </TableBody>
          </Table>
          </div>
          {pages > 1 && (
            <div className="flex justify-center">
              <Pagination total={pages} page={safePage} onChange={setPage} color="primary" showControls size="sm" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
