import { useEffect, useState } from 'react'
import DataTable from '../components/tables/DataTable'
import RecordDrawer from '../components/drawers/RecordDrawer'
import { SCHEMAS } from '../lib/schemas'

// Generic module page: table + drawer. `preset` may carry drill-through
// filters from the dashboard and/or a record to open immediately.
export default function EntityPage({ entity, data, preset }) {
  const schema = SCHEMAS[entity]
  const { rows, loading, error, reload } = data
  const [drawer, setDrawer] = useState({ open: false, record: null, isNew: false })

  useEffect(() => {
    if (preset?.openRecord) setDrawer({ open: true, record: preset.openRecord, isNew: false })
  }, [preset])

  return (
    <>
      <DataTable
        key={entity + JSON.stringify(preset?.filters || {})}
        schema={schema} rows={rows} loading={loading} error={error} onReload={reload}
        initialFilters={preset?.filters}
        onRowOpen={(r) => setDrawer({ open: true, record: r, isNew: false })}
        onAdd={() => setDrawer({ open: true, record: null, isNew: true })}
      />
      <RecordDrawer
        schema={schema} record={drawer.record} isOpen={drawer.open} startInEdit={drawer.isNew}
        onClose={() => setDrawer((d) => ({ ...d, open: false }))}
        onSaved={reload}
      />
    </>
  )
}
