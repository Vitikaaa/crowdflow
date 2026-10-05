import { X, AlertTriangle, Info, Activity } from 'lucide-react'
const sev = { high: ['bg-coral/70', AlertTriangle], medium: ['bg-peach', Activity], low: ['bg-white/80', Info] }
export default function AlertCard({ alert, onDismiss }) {
  const [bg, Icon] = sev[alert.severity]
  return (<div className={`flex gap-3 rounded-2xl p-4 transition ${bg}`}><Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
    <div className="flex-1 text-sm"><p className="font-semibold">{alert.title}</p><p className="opacity-80">{alert.detail}</p><p className="mt-1 text-xs opacity-60">{alert.time}</p></div>
    <button onClick={() => onDismiss(alert.id)} aria-label="Dismiss alert" className="self-start rounded-full p-1 hover:bg-ink/10"><X size={16} /></button></div>)
}
