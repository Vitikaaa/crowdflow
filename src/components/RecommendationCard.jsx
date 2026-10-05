import { useState } from 'react'
import { Sparkles, Check, Loader2 } from 'lucide-react'
import { executeIntervention } from '../services/api.js'
export default function RecommendationCard({ cf, region }) {
  const [state, setState] = useState('idle')
  const best = cf.scenarios.find((s) => s.key === cf.selected); const base = cf.scenarios[0]
  const cut = Math.round(((base.predicted - best.predicted) / base.predicted) * 100)
  const run = async () => { setState('loading'); const r = await executeIntervention({ region: cf.regionId, scenario: best.key }); setState(r.ok ? 'done' : 'idle') }
  return (<div className="card bg-ink text-cream">
    <div className="flex items-center gap-2 text-coral text-xs font-semibold uppercase tracking-wider"><Sparkles size={16} /> Counterfactual recommendation</div>
    <h3 className="mt-3 text-2xl font-extrabold">High crowd expected at {region.name} in {cf.horizon} min</h3>
    <p className="mt-2 text-sm opacity-80">{region.approaching} students are approaching. Without action, occupancy reaches {base.predicted} of {region.capacity} ({Math.round(base.predicted / region.capacity * 100)}%).</p>
    <p className="mt-5 text-xs font-semibold uppercase tracking-wider opacity-60">Scenarios simulated before acting</p>
    <ul className="mt-2 space-y-2">{cf.scenarios.map((s) => (<li key={s.key} className={`rounded-2xl p-3 text-sm ${s.key === cf.selected ? 'bg-coral text-ink' : 'bg-white/10'}`}>
      <div className="flex justify-between gap-3"><span className="font-semibold">{s.label}</span><span className="font-black">{s.predicted}</span></div>
      <p className="text-xs opacity-75">{s.downstream}</p></li>))}</ul>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm"><span className="font-bold">Recommended:</span> {best.label} <span className="opacity-70">· ~{cut}% lower peak</span></p>
      <button onClick={run} disabled={state !== 'idle'} className="btn bg-coral text-ink hover:bg-peach disabled:opacity-80">
        {state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : state === 'done' ? <Check size={16} /> : null}{state === 'done' ? 'Executed' : state === 'loading' ? 'Executing…' : 'Execute'}</button></div></div>)
}
