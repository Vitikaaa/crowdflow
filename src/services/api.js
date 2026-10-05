import * as mock from '../mockData/campus.js'
const BASE = import.meta.env.VITE_API_URL || ''
async function get(path, fallback) {
  if (!BASE) return { data: fallback, source: 'mock' }
  try { const r = await fetch(BASE + path); if (!r.ok) throw new Error(r.status); return { data: await r.json(), source: 'live' } }
  catch { return { data: fallback, source: 'mock' } }
}
const wait = (v) => new Promise((r) => setTimeout(() => r(v), 450))
// Expected endpoints: GET /api/regions, /api/counterfactual, /api/alerts, /api/feedback ; POST /api/interventions
export const getRegions = async () => wait(await get('/api/regions', mock.regions))
export const getCounterfactual = () => get('/api/counterfactual', mock.counterfactual)
export const getAlerts = () => get('/api/alerts', mock.alerts)
export const getFeedback = () => get('/api/feedback', mock.feedback)
export const executeIntervention = async (body) => {
  if (!BASE) return wait({ ok: true, source: 'mock' })
  const r = await fetch(BASE + '/api/interventions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  return { ok: r.ok, source: 'live' }
}
export const status = (pct) => pct >= mock.THRESHOLDS.critical ? 'Critical' : pct >= mock.THRESHOLDS.high ? 'High' : pct >= mock.THRESHOLDS.moderate ? 'Moderate' : 'Low'
