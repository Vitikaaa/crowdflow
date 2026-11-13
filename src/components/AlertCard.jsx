import { X, AlertTriangle, Info, Activity } from 'lucide-react'
const sev = { high: ['bg-coral/70', AlertTriangle], medium: ['bg-peach', Activity], low: ['bg-white/80', Info] }
export default function AlertCard({ alert, onDismiss }) {
  const [bg, Icon] = sev[alert?.severity] || sev.low
  return (<div className={`flex gap-3 rounded-2xl p-4 transition ${bg}`}><Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
    <div className="flex-1 text-sm">
      <p className="font-bold text-ink">{alert.title}</p>
      <p className="text-ink/90 font-medium text-xs mt-0.5 leading-relaxed">{alert.detail}</p>
      <p className="mt-1.5 text-xs font-bold text-ink/75">{alert.time}</p>
    </div>
    <button onClick={() => onDismiss(alert.id)} aria-label="Dismiss alert" className="self-start rounded-full p-1 hover:bg-ink/10 text-ink"><X size={16} /></button></div>)

}
