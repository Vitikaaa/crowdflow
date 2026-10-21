import * as mock from '../mockData/campus.js'
const BASE = import.meta.env.VITE_API_URL || ''
export const API_BASE = BASE

async function get(path, fallback) {
  if (!BASE) return { data: fallback, source: 'mock' }
  const response = await fetch(BASE + path)
  if (!response.ok) throw new Error(`API ${path}: HTTP ${response.status}`)
  return { data: await response.json(), source: 'backend' }
}
export const getRegions = () => {
  let settings = null
  try { settings = JSON.parse(localStorage.getItem('crowdflow-settings') || 'null') } catch {}
  const data = mock.regions.map(r => ({ ...r, capacity: settings?.capacities?.[r.id] ?? r.capacity, thresholds: settings?.thresholds }))
  return get('/api/regions', data)
}
export const getCounterfactual = () => get('/api/counterfactual', mock.counterfactual)
export const getAlerts = () => {
  let states = {}
  try { states = JSON.parse(localStorage.getItem('crowdflow-alert-states') || '{}') } catch {}
  return get('/api/alerts', mock.alerts.map(a => ({ ...a, status: states[a.id] || 'active' })))
}
export const getFeedback = () => get('/api/feedback', mock.feedback)
export const getSettings = () => get('/api/settings', JSON.parse(localStorage.getItem('crowdflow-settings') || 'null') || { thresholds: mock.THRESHOLDS, horizon: 15, resources: { counters: 2, staff: 8 }, capacities: Object.fromEntries(mock.regions.map(r => [r.id,r.capacity])) })
export const saveSettings = async (settings) => {
  if (!BASE) { localStorage.setItem('crowdflow-settings', JSON.stringify(settings)); return { ...settings, source: 'mock' } }
  const response = await fetch(BASE + '/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) })
  if (!response.ok) throw new Error(`Settings save failed: HTTP ${response.status}`)
  return response.json()
}
export const acknowledgeAlert = async (id, action = 'acknowledge') => {
  if (!BASE) { let states = {}; try { states = JSON.parse(localStorage.getItem('crowdflow-alert-states') || '{}') } catch {}; states[id]=action; localStorage.setItem('crowdflow-alert-states',JSON.stringify(states)); return { id, status: action, source: 'mock' } }
  const response = await fetch(`${BASE}/api/alerts/${id}/${action}`, { method: 'POST' })
  if (!response.ok) throw new Error(`Alert update failed: HTTP ${response.status}`)
  return response.json()
}
export const runScenario = async (payload) => {
  if (!BASE) {
    const regions=JSON.parse(localStorage.getItem('crowdflow-settings') || 'null')?.capacities
    const target=mock.regions.find(r=>r.id===payload.regionId), dest=mock.regions.find(r=>r.id===payload.destinationId)
    if (!target || !dest || payload.regionId===payload.destinationId) throw new Error('Choose two different configured regions.')
    const capacities=regions || Object.fromEntries(mock.regions.map(r=>[r.id,r.capacity]))
    const targetCap=capacities[target.id], destCap=capacities[dest.id], gross=Math.max(0,target.pred[15]-target.current), arrivalDest=Math.max(0,dest.pred[15]-dest.current), diverted=Math.round(gross*payload.ratio), labels=['No intervention','Redirect demand','Open an additional counter','Deploy response staff','Meter entry','Redirect demand + additional counter']
    const scenarios=labels.map((label,i)=>{const key='ABCDEF'[i],divertedHere=['B','F'].includes(key)?diverted:0, transit=Math.round(divertedHere*Math.min(1,5/payload.horizon)), metered=key==='E'?Math.round(gross*.6):0, service=['C','F'].includes(key)?Math.min(gross,payload.counters*.5*payload.horizon):0, staffEffect=key==='D'?Math.min(gross*.1,payload.staff*.5):0, rawTarget=Math.round(target.current+gross-divertedHere-metered-service-staffEffect), rawDest=Math.round(dest.current+arrivalDest+divertedHere-transit), predicted=Math.max(0,Math.min(targetCap,rawTarget)), destinationPredicted=Math.max(0,Math.min(destCap,rawDest)), held=metered+transit+Math.max(0,rawTarget-targetCap)+Math.max(0,rawDest-destCap), start=target.current+dest.current+gross+arrivalDest, served=Math.max(0,start-predicted-destinationPredicted-held); return {key,label,predicted,destinationPredicted,redirected:divertedHere,transit,externalQueue:held,served,resourceCost:{counters:['C','F'].includes(key)?payload.counters:0,staff:key==='D'?payload.staff:0},feasible:rawTarget<=targetCap&&rawDest<=destCap&&( !['C','F'].includes(key)||payload.counters>0)&&(key!=='D'||payload.staff>0),capacityOverflow:Math.max(0,rawTarget-targetCap)+Math.max(0,rawDest-destCap),flowBalance:{start,remaining:predicted+destinationPredicted,served,held},downstream:`${dest.name}: ${destinationPredicted}/${destCap}; five-minute illustrative transit.`} })
    return {regionId:target.id,destinationId:dest.id,horizon:payload.horizon,selected:'A',scenarios,source:'mock',assumptions:['Synthetic trend is extended across the selected horizon.','Redirected demand uses a five-minute illustrative transit delay.','Counters affect throughput, not room capacity.','Metered arrivals and transit are retained in queue accounting.','No timestamped observations validate these outputs.']}
  }
  const response = await fetch(BASE + '/api/scenarios/compare', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!response.ok) throw new Error(`Scenario comparison failed: HTTP ${response.status}`)
  return response.json()
}
export const executeIntervention = async (body) => {
  if (!BASE) return { ok: true, source: 'mock', status: 'simulated' }
  const response = await fetch(BASE + '/api/interventions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!response.ok) throw new Error(`Intervention failed: HTTP ${response.status}`)
  return response.json()
}
export const getAnalytics = () => get('/api/analytics', { sampleCount: 0, window: null, mae: null, rmse: null, residuals: [], note: 'No timestamped actual observations are available.' })
export const status = (pct, configured) => {
  let saved = null
  try { saved = JSON.parse(localStorage.getItem('crowdflow-settings') || 'null')?.thresholds } catch {}
  const t = configured || saved || mock.THRESHOLDS
  return pct >= t.critical ? 'Critical' : pct >= t.high ? 'High' : pct >= t.moderate ? 'Moderate' : 'Low'
}
