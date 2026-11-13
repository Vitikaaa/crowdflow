import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function StatCard({ label, value, unit, trend, hint, Icon, accent }) {
  const up = trend > 0
  return (
    <div className={`card ${accent ? 'bg-peach/70' : ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-ink/85">{label}</p>
        {Icon && <Icon size={18} className="text-ink/85" aria-hidden />}
      </div>
      <p className="mt-3 text-4xl font-black leading-none text-ink">
        {value}
        {unit && <span className="ml-1 text-sm font-semibold text-ink/80">{unit}</span>}
      </p>
      <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-ink/90">
        {trend != null && (up ? <ArrowUpRight size={14} className="text-coral" /> : <ArrowDownRight size={14} />)}
        {hint}
      </p>
    </div>
  )
}

