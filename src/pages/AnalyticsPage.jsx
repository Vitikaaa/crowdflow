import { useEffect, useState } from 'react'
import { getAnalytics } from '../services/api.js'
export default function AnalyticsPage() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  useEffect(() => { getAnalytics().then(x => setData(x.data)).catch(e => setError(e.message)) }, [])
  return <div className="space-y-6"><header><h1 className="text-3xl font-black">Analytics & evaluation</h1><p className="mt-2 text-sm opacity-70">Forecast quality is reported only when timestamped predictions can be paired with observations.</p></header>{error && <div role="alert" className="card">{error}</div>}{!data && !error && <div className="skeleton h-32"/>}{data && <section className="card"><h2 className="text-xl font-bold">Forecast validation</h2><p className="mt-3">Valid prediction/observation pairs: {data.sampleCount}</p><p>Evaluation window: {data.window || 'Not available'}</p><p>MAE: {data.mae ?? 'Not yet computable'}</p><p>RMSE: {data.rmse ?? 'Not yet computable'}</p><p className="mt-3 text-sm opacity-70">{data.note || 'No actual observations are available. Mock and simulated values are excluded from accuracy metrics.'}</p></section>}</div>
}
