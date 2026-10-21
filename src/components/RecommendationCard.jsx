import { useEffect, useState } from 'react'
import { Sparkles, Check, Loader2, MousePointerClick } from 'lucide-react'
import { executeIntervention } from '../services/api.js'

export default function RecommendationCard({ cf, region }) {
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')
  const [selectedKey, setSelectedKey] = useState('')
  const scenarios = cf?.scenarios || []
  const base = scenarios.find(s => s.key === 'A') || scenarios[0]
  const ranked = scenarios.filter(s => s.key !== 'A' && s.feasible !== false).sort((a, b) => a.predicted - b.predicted)
  const recommended = ranked[0] || base || { key: 'A', label: 'No intervention', predicted: 0 }
  const chosen = scenarios.find(s => s.key === selectedKey) || recommended

  useEffect(() => {
    setSelectedKey(recommended.key)
    setState('idle')
    setError('')
  }, [cf, recommended.key])

  if (!region || !scenarios.length) return null

  const choose = (key) => { setSelectedKey(key); setState('idle'); setError('') }
  const run = async (decision) => {
    setState('loading')
    setError('')
    try {
      const response = await executeIntervention({ region: cf.regionId, scenario: chosen.key, decision })
      setState(decision === 'approve' ? 'approved' : 'rejected')
      if (response.source === 'mock') setError('Demo-mode simulated decision recorded in this page only.')
    } catch (e) { setState('idle'); setError(e.message) }
  }

  return <div className="card bg-ink text-cream">
    <div className="flex items-center gap-2 text-coral text-xs font-semibold uppercase tracking-wider"><Sparkles size={16} /> Counterfactual recommendation</div>
    <h3 className="mt-3 text-2xl font-extrabold">High crowd expected at {region.name} in {cf.horizon} min</h3>
    <p className="mt-2 text-sm opacity-80">Without action, the simulated estimate reaches {base.predicted} of {region.capacity}. {recommended.key !== 'A' ? `${recommended.label} ranks first by target occupancy among scenarios marked feasible (${recommended.predicted} target, ${recommended.destinationPredicted ?? 'destination not supplied'} destination). Select a scenario below to review it.` : 'No feasible intervention is available with the current configuration.'}</p>
    <p className="mt-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-70"><MousePointerClick size={14} /> Select a scenario to inspect</p>
    <ul className="mt-2 space-y-2">{scenarios.map(s => <li key={s.key}>
      <button type="button" aria-pressed={s.key === chosen.key} aria-disabled={s.feasible === false} onClick={() => choose(s.key)} className={`w-full rounded-2xl p-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-coral ${s.feasible === false ? 'opacity-60' : ''} ${s.key === chosen.key ? 'bg-coral text-ink ring-2 ring-coral' : 'bg-white/10 hover:bg-white/20'}`}>
        <div className="flex justify-between gap-3"><span className="font-semibold">{s.key}. {s.label}{s.key === recommended.key ? ' · Recommended' : ''}</span><span className="font-black">{s.predicted}</span></div>
        <p className="text-xs opacity-80">Target: {s.predicted}{s.destinationPredicted != null ? ` · destination: ${s.destinationPredicted}` : ''}{s.feasible === false ? ' · infeasible with current capacity/resources' : ''}</p>
        <p className="text-xs opacity-75">{s.downstream || 'No downstream estimate supplied'}</p>
      </button>
    </li>)}</ul>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="w-full text-sm"><span className="font-bold">Selected for review:</span> {chosen.label} · projected target {chosen.predicted}{chosen.destinationPredicted != null ? `; destination ${chosen.destinationPredicted}` : ''}</p>
      {state === 'idle' ? <div className="flex flex-wrap gap-2"><button disabled={chosen.feasible === false} onClick={() => run('approve')} className="btn bg-coral text-ink disabled:cursor-not-allowed disabled:opacity-50">Approve simulated preview</button><button onClick={() => run('reject')} className="btn bg-white/10 text-cream">Reject selected option</button></div> : <span role="status" className="btn bg-white/10">{state === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}{state === 'loading' ? 'Saving decision…' : `${chosen.label}: ${state}`}</span>}
    </div>
    <div className="mt-4 rounded-xl bg-white/10 p-3 text-sm"><b>Preview for {chosen.label}</b><p>Signage: {chosen.key === 'B' || chosen.key === 'F' ? `draft a suggestion to visit ${cf.destinationId || 'the selected neighboring destination'}` : 'no redirection message proposed'}. Staff: {chosen.key === 'D' || chosen.key === 'C' || chosen.key === 'F' ? 'prepare a draft staffing or counter prompt' : 'no staff change proposed'}. Student notice: draft only, never sent. No real dispatch or external message is sent.</p></div>
    {error && <p role="status" className="mt-2 text-xs">{error}</p>}
  </div>
}
