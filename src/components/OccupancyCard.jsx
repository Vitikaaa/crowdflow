import { status } from '../services/api.js'
const tone = { Low: 'bg-peach text-ink', Moderate: 'bg-peach text-ink', High: 'bg-coral text-ink', Critical: 'bg-ink text-cream' }
export default function OccupancyCard({ regions, selected, onSelect }) {
  return (<div className="card"><h3 className="font-bold text-lg mb-4">All service regions</h3>
    <ul className="space-y-4">{regions.map((r) => { const pct = Math.round((r.current / r.capacity) * 100); const s = status(pct)
      return (<li key={r.id}><button onClick={() => onSelect(r.id)} className={`w-full text-left rounded-2xl p-2 -m-2 transition ${selected === r.id ? 'bg-peach/60' : 'hover:bg-peach/30'}`}>
        <div className="flex justify-between items-center text-sm"><span className="font-semibold">{r.name}</span><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${tone[s] || 'bg-peach text-ink'}`}>{s}</span></div>
        <div className="mt-2 h-2 rounded-full bg-ink/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${r.name} occupancy`}><div className="h-2 rounded-full bg-ink transition-all duration-300" style={{ width: pct + '%' }} /></div>
        <p className="mt-1 text-xs font-semibold text-ink/85">{r.current} / {r.capacity} · {pct}%</p></button></li>) })}</ul></div>)
}

