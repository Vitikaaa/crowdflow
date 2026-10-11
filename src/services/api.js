/**
 * CrowdFlow API & Engine Service Interface
 * Bridges frontend pages to either live REST endpoints or the local digital twin engine.
 */

import { CampusStore } from '../engine/stateStore.js'
import { THRESHOLDS } from '../engine/campusGraph.js'

const BASE = import.meta.env.VITE_API_URL || ''

async function get(path, localGetter) {
  if (!BASE) {
    return { data: localGetter(), source: 'engine' }
  }
  try {
    const r = await fetch(BASE + path)
    if (!r.ok) throw new Error(r.status)
    return { data: await r.json(), source: 'live' }
  } catch {
    return { data: localGetter(), source: 'engine' }
  }
}

export const getRegions = async () => {
  return get('/api/regions', () => Object.values(CampusStore.getState().regions))
}

export const getNetworkTwin = async () => {
  return get('/api/network', () => ({
    nodes: Object.values(CampusStore.getState().regions),
    edges: CampusStore.getState().edges
  }))
}

export const getForecasts = async () => {
  return get('/api/forecasts', () => CampusStore.getState().forecasts)
}

export const getCounterfactual = async (regionId = 'canteen-a') => {
  return get(`/api/counterfactual?region=${regionId}`, () => {
    const state = CampusStore.getState()
    return {
      regionId,
      horizon: 10,
      scenarios: state.scenarios,
      rankedRecommendations: state.rankedRecommendations
    }
  })
}

export const getAlerts = async () => {
  return get('/api/alerts', () => {
    const state = CampusStore.getState()
    return state.alerts.filter((a) => !state.dismissedAlertIds.includes(a.id))
  })
}

export const getFeedback = async () => {
  return get('/api/feedback', () => {
    const state = CampusStore.getState()
    return {
      lastError: state.observationHistory.slice(-1)[0]?.error || -2,
      mae: state.errorMetrics.mae,
      rmse: state.errorMetrics.rmse,
      meanBias: state.errorMetrics.meanBias,
      history: state.observationHistory,
      recalibrations: state.recalibrationLogs,
      note: 'Parameters synchronized with recent residual errors'
    }
  })
}

export const executeIntervention = async (body) => {
  if (!BASE) {
    const res = CampusStore.executeIntervention(body.scenario || body.scenarioKey, body.notes)
    return { ok: true, source: 'engine', ...res }
  }
  try {
    const r = await fetch(BASE + '/api/interventions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    return { ok: r.ok, source: 'live' }
  } catch {
    const res = CampusStore.executeIntervention(body.scenario || body.scenarioKey, body.notes)
    return { ok: true, source: 'engine', ...res }
  }
}

export const status = (pct) => {
  if (pct >= THRESHOLDS.critical) return 'Critical'
  if (pct >= THRESHOLDS.high) return 'High'
  if (pct >= THRESHOLDS.moderate) return 'Moderate'
  return 'Low'
}

export { THRESHOLDS }
