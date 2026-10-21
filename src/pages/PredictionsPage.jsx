import { useState } from 'react'
import LocationSelector from '../components/LocationSelector.jsx'
import PredictionChart from '../components/PredictionChart.jsx'
export default function PredictionsPage({ campus }) {
  const [id, setId] = useState('canteen-a')
  if (campus.loading) return <div className="skeleton h-64" />
  if (campus.error) return <div role="alert" className="card">Could not load predictions: {campus.error}</div>
  const region = campus.regions.find(r => r.id === id) || campus.regions[0]
  return <div className="space-y-6"><header><h1 className="text-3xl font-black">Short-term predictions</h1><p className="mt-2 text-sm opacity-70">Deterministic illustrative projection · not a trained or validated forecast</p></header><LocationSelector regions={campus.regions} value={region.id} onChange={setId}/><section className="card"><h2 className="text-xl font-bold">{region.name}: current and projected occupancy</h2><p className="mt-1">Current: {region.current} / {region.capacity}</p><div className="mt-4 overflow-x-auto"><PredictionChart region={region}/></div><div className="grid grid-cols-3 gap-3">{[5,10,15].map(h=>{const n=region.pred[h]; return <div key={h} className="rounded-xl bg-peach/50 p-3"><b>+{h} min</b><p>{n} people · {Math.round(n/region.capacity*100)}%</p>{n >= region.capacity && <p role="alert">Capacity exceedance</p>}</div>})}</div><p className="mt-4 text-xs opacity-70">Assumption: configured mock net arrival/departure trend is extended to each horizon and clipped to 0–capacity. Data source: {campus.source === 'mock' ? 'synthetic demo dataset' : 'prototype backend'}; no confidence score is available.</p></section></div>
}
