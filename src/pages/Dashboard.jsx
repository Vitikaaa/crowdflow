import { useState } from 'react'
import { Users, TrendingUp, Gauge, DoorOpen, RefreshCw, Clock } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import LocationSelector from '../components/LocationSelector.jsx'
import PredictionChart from '../components/PredictionChart.jsx'
import OccupancyCard from '../components/OccupancyCard.jsx'
import RecommendationCard from '../components/RecommendationCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import { status } from '../services/api.js'
export default function Dashboard({ campus }) {
  const [sel, setSel] = useState('canteen-a'); const [dismissed, setDismissed] = useState([])
  const { loading, regions, cf, alerts, feedback, source, refresh } = campus
  if (loading) return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36" />)}<div className="skeleton h-80 sm:col-span-2 xl:col-span-4" /></div>
  const r = regions.find((x) => x.id === sel); const pct = Math.round(r.current / r.capacity * 100); const p10 = Math.round(r.pred[10] / r.capacity * 100)
  const hour = new Date().getHours(); const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const cfRegion = regions.find((x) => x.id === cf.regionId)
  return (<div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-sm font-medium opacity-70">{greet} 👋</p><h1 className="text-3xl sm:text-4xl font-black">Campus Crowd Overview</h1></div>
      <div className="flex items-center gap-3">{source === 'mock' && <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold">Demo data</span>}
        <button onClick={refresh} className="btn bg-ink text-cream hover:bg-ink/85"><RefreshCw size={16} /> Refresh prediction</button></div></header>
    <LocationSelector regions={regions} value={sel} onChange={setSel} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
      <StatCard label="Current occupancy" value={r.current} unit="students" Icon={Users} trend={1} hint={`${pct}% of ${r.capacity} · +${r.approaching} approaching`} />
      <StatCard label="Predicted · next 10 min" value={r.pred[10]} unit="students" Icon={TrendingUp} trend={r.pred[10] - r.current} hint={`${p10}% capacity · ${Math.round(r.confidence * 100)}% confidence`} accent />
      <StatCard label="Crowd status" value={status(pct)} Icon={Gauge} hint={`Predicted: ${status(p10)}`} />
      <StatCard label="Available capacity" value={r.capacity - r.current} unit="seats" Icon={DoorOpen} hint={`Expected peak ${r.peakTime}`} />
    </section>
    <section className="grid gap-6 xl:grid-cols-3">
      <div className="card xl:col-span-2"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{r.name}: actual vs predicted</h2>
        <div className="flex gap-4 text-xs font-medium"><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-ink" />Actual</span><span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-coral" />Predicted</span></div></div>
        <div className="mt-4 overflow-x-auto"><PredictionChart region={r} /></div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">{[5, 10, 15].map((m) => <div key={m} className="rounded-2xl bg-peach/60 p-3"><p className="text-xs font-medium opacity-70">+{m} min</p><p className="text-2xl font-black">{r.pred[m]}</p></div>)}</div>
        <p className="mt-4 flex items-center gap-2 text-xs opacity-70"><Clock size={14} /> Last prediction error {feedback.lastError} · MAE {feedback.mae} · {feedback.note}</p></div>
      <OccupancyCard regions={regions} selected={sel} onSelect={setSel} />
    </section>
    <section className="grid gap-6 lg:grid-cols-2">
      <RecommendationCard key={cf.regionId} cf={cf} region={cfRegion} />
      <div className="card"><h2 className="text-lg font-bold mb-4">Alerts</h2><div className="space-y-3">
        {alerts.filter((a) => !dismissed.includes(a.id)).map((a) => <AlertCard key={a.id} alert={a} onDismiss={(id) => setDismissed((d) => [...d, id])} />)}
        {dismissed.length === alerts.length && <p className="text-sm opacity-70">All clear. No active alerts.</p>}</div></div>
    </section></div>)
}
