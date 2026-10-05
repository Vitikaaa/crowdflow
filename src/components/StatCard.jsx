import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
export default function StatCard({ label, value, unit, trend, hint, Icon, accent }) {
  const up = trend > 0
  return (<div className={`card ${accent ? 'bg-peach/70' : ''}`}>
    <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p><Icon size={18} className="text-ink/70" aria-hidden /></div>
    <p className="mt-3 text-4xl font-black leading-none">{value}<span className="ml-1 text-sm font-medium opacity-60">{unit}</span></p>
    <p className="mt-3 flex items-center gap-1 text-xs font-medium opacity-80">
      {trend != null && (up ? <ArrowUpRight size={14} className="text-coral" /> : <ArrowDownRight size={14} />)}{hint}</p></div>)
}
