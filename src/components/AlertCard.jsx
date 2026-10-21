import { X, AlertTriangle, Info, Activity } from 'lucide-react'
import { acknowledgeAlert } from '../services/api.js'
const sev = { high: ['bg-coral/70', AlertTriangle], medium: ['bg-peach', Activity], low: ['bg-white/80', Info] }
export default function AlertCard({ alert, onDismiss }) {
  const [bg, Icon] = sev[alert.severity]
  return (<div className={`flex gap-3 rounded-2xl p-4 transition ${bg}`}><Icon size={18} className="mt-0.5 shrink-0" aria-hidden />
    <div className="flex-1 text-sm"><p className="font-semibold">{alert.title}</p><p className="opacity-80">{alert.detail}</p><p className="mt-1 text-xs opacity-60">{alert.time}</p></div>
    {alert.status && alert.status !== 'active' ? <span className="text-xs font-semibold">{alert.status}</span> : <div className="flex gap-1"><button onClick={async () => { try { await acknowledgeAlert(alert.id,'acknowledge'); onDismiss(alert.id) } catch(e) { window.alert(e.message) } }} className="rounded-full px-2 py-1 text-xs hover:bg-ink/10">Acknowledge</button><button onClick={async () => { try { await acknowledgeAlert(alert.id,'dismiss'); onDismiss(alert.id) } catch(e) { window.alert(e.message) } }} aria-label="Dismiss alert" className="self-start rounded-full p-1 hover:bg-ink/10"><X size={16} /></button></div>}</div>)
}
