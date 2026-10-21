import { useEffect, useState, useCallback } from 'react'
import { getRegions, getCounterfactual, getAlerts, getFeedback } from './services/api.js'
export function useCampus() {
  const [s, setS] = useState({ loading: true })
  const load = useCallback(async () => {
    setS((p) => ({ ...p, loading: true, error: null }))
    try {
      const [r, c, a, f] = await Promise.all([getRegions(), getCounterfactual(), getAlerts(), getFeedback()])
      setS({ loading: false, regions: r.data, cf: c.data, alerts: a.data, feedback: f.data, source: r.source })
    } catch (error) { setS((p) => ({ ...p, loading: false, error: error.message })) }
  }, [])
  useEffect(() => { load() }, [load])
  return { ...s, refresh: load }
}
