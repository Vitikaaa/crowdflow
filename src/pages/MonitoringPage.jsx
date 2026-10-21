import { useState } from 'react'
import { status } from '../services/api.js'
export default function MonitoringPage({ campus }) {
  const [selected, setSelected] = useState('canteen-a')
  if (campus.loading) return <div className="skeleton h-64" />
  if (campus.error) return <div role="alert" className="card">Could not load monitoring data: {campus.error} <button className="btn bg-peach" onClick={campus.refresh}>Retry</button></div>
  const region = campus.regions.find(r => r.id === selected) || campus.regions[0]
  const neighbors = { 'canteen-a': ['canteen-b','student-hub'], 'canteen-b': ['canteen-a','library'], library: ['canteen-b','printing'], printing: ['library','services'], services: ['printing','student-hub'], 'main-gate': ['student-hub','canteen-a'], 'student-hub': ['canteen-a','services','main-gate'] }
  return <div className="space-y-6"><header><h1 className="text-3xl font-black">Live Monitoring</h1><p className="mt-2 text-sm opacity-70">{campus.source === 'mock' ? 'Simulated demo data' : 'Backend data'} · {new Date().toLocaleString()} · no physical sensors connected</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{campus.regions.map(r => { const pct = Math.round(r.current/r.capacity*100); return <button onClick={() => setSelected(r.id)} key={r.id} className={`card text-left ${selected === r.id ? 'ring-2 ring-coral' : ''}`}><div className="flex justify-between gap-2"><b>{r.name}</b><span className="rounded-full bg-peach px-3 py-1 text-xs">{status(pct,r.thresholds)}</span></div><p className="mt-4 text-3xl font-black">{r.current} <small className="text-sm font-normal">/ {r.capacity}</small></p><p className="text-sm">{pct}% occupied</p><div className="mt-3 h-2 rounded bg-ink/10"><div className="h-2 rounded bg-coral" style={{width:`${Math.min(100,pct)}%`}} /></div></button>})}</div>
    {region && <section className="card"><h2 className="text-xl font-bold">{region.name} details</h2><p className="mt-2">Connections: {(neighbors[region.id] || []).map(id => campus.regions.find(r => r.id === id)?.name).filter(Boolean).join(', ') || 'No configured connections'}</p><p className="mt-2 text-sm opacity-70">Source: {campus.source === 'mock' ? 'synthetic demo values' : 'prototype API'} · Updated at page load · observations are not sensor validated.</p></section>}</div>
}
