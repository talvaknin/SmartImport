import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Load all rows of a table with loading / error / reload states
export function useEntity(table) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase.from(table).select('*').range(0, 4999)
    if (error) setError(error.message)
    else setRows(data || [])
    setLoading(false)
  }, [table])

  useEffect(() => { reload() }, [reload])
  return { rows, loading, error, reload }
}
