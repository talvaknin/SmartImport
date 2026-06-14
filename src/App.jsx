import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { SCHEMAS } from './lib/schemas'
import { useEntity } from './hooks/useEntity'
import AppShell from './components/layout/AppShell'
import Dashboard from './components/dashboard/Dashboard'
import LoginPage from './pages/LoginPage'
import EntityPage from './pages/EntityPage'
import RecordDrawer from './components/drawers/RecordDrawer'

const TITLES = {
  dashboard: 'דשבורד תפעולי', shipments: 'משלוחים', payments: 'תשלומים',
  suppliers: 'ספקים', products: 'מקטים — אביזרי רכב',
}
const VALID = Object.keys(TITLES)

export default function App() {
  const [session, setSession] = useState(undefined)
  const [page, setPage] = useState('dashboard')
  const [preset, setPreset] = useState(null)
  const [dashDrawer, setDashDrawer] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const shipments = useEntity('shipments')
  const payments = useEntity('payments')
  const suppliers = useEntity('suppliers')
  const products = useEntity('products')
  const data = { shipments, payments, suppliers, products }

  // Any unknown page (e.g. an old /import bookmark) safely lands on the dashboard
  const safePage = VALID.includes(page) ? page : 'dashboard'

  const openModule = (key, filters) => { setPreset(filters ? { filters } : null); setPage(key) }
  const openRecord = (entity, record) => setDashDrawer({ entity, record })

  if (session === undefined) return null
  if (!session) return <LoginPage />

  const loadingDash = shipments.loading || payments.loading || suppliers.loading || products.loading

  return (
    <AppShell page={safePage} onNav={(k) => { setPreset(null); setPage(k) }} email={session.user.email} title={TITLES[safePage]}>
      {safePage === 'dashboard' && (
        <Dashboard
          ships={shipments.rows} pays={payments.rows} sups={suppliers.rows} prods={products.rows}
          loading={loadingDash} openModule={openModule} openRecord={openRecord}
        />
      )}
      {['shipments', 'payments', 'suppliers', 'products'].includes(safePage) && (
        <EntityPage entity={safePage} data={data[safePage]} preset={preset} />
      )}

      {dashDrawer && (
        <RecordDrawer
          schema={SCHEMAS[dashDrawer.entity]} record={dashDrawer.record} isOpen
          onClose={() => setDashDrawer(null)}
          onSaved={() => data[dashDrawer.entity].reload()}
        />
      )}
    </AppShell>
  )
}
