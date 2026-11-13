import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  AlertTriangle,
  Flame,
  Info,
  CheckCircle2,
  X,
  Filter,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react'

export default function AlertsPage({ campus }) {
  const { allAlerts, alerts, dismissedAlertIds, dismissAlert, runIntervention, selectRegion } = campus
  const [filterSeverity, setFilterSeverity] = useState('all') // 'all' | 'high' | 'medium' | 'low'
  const [actionNotice, setActionNotice] = useState(null)

  const activeAlerts = (allAlerts || []).filter((a) => !dismissedAlertIds.includes(a.id))
  const filteredAlerts = activeAlerts.filter((a) => {
    if (filterSeverity === 'all') return true
    return a.severity === filterSeverity
  })

  const handleQuickDispatch = (alert) => {
    if (alert.suggestedScenario) {
      campus.runIntervention(alert.suggestedScenario, `Dispatched from Alert: ${alert.title}`)
      setActionNotice(`Action dispatched for ${alert.title}`)
      setTimeout(() => setActionNotice(null), 3500)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/85">
            <span className="inline-block size-2 rounded-full bg-coral animate-pulse" />
            <span>Alerts & Incident Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink mt-0.5">
            Active Campus Incident Alerts ({activeAlerts.length})
          </h1>
          <p className="text-xs font-medium text-ink/85 mt-1">
            Real-time notifications for capacity exceedance, arrival surges, sensor anomalies, and network cascades
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-ink/5 p-1 rounded-2xl">
          {['all', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                filterSeverity === sev
                  ? 'bg-ink text-cream shadow-xs'
                  : 'text-ink/70 hover:text-ink hover:bg-white/60'
              }`}
            >
              {sev === 'all' ? 'All Alerts' : `${sev} Severity`}
            </button>
          ))}
        </div>
      </header>

      {actionNotice && (
        <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-3 text-sm text-emerald-900 font-semibold flex items-center justify-between">
          <span>✓ {actionNotice}</span>
          <span className="text-xs opacity-75">Check Orchestration page for active dispatch</span>
        </div>
      )}

      {/* Alert Feed */}
      <section className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isHigh = alert.severity === 'high'
          const isMed = alert.severity === 'medium'

          return (
            <div
              key={alert.id}
              className={`rounded-3xl p-5 border transition-all duration-200 flex flex-wrap items-start justify-between gap-4 ${
                isHigh
                  ? 'bg-coral/30 border-coral text-ink shadow-xs'
                  : isMed
                  ? 'bg-peach/50 border-ink/10 text-ink'
                  : 'bg-white/80 border-ink/10 text-ink'
              }`}
            >
              <div className="flex items-start gap-3.5 max-w-2xl">
                <div
                  className={`size-10 rounded-2xl grid place-items-center shrink-0 ${
                    isHigh ? 'bg-ink text-coral' : isMed ? 'bg-coral text-ink' : 'bg-ink/10 text-ink'
                  }`}
                >
                  {isHigh ? <AlertTriangle size={20} /> : isMed ? <Flame size={20} /> : <Info size={20} />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isHigh ? 'bg-ink text-cream' : 'bg-ink/10 text-ink'
                      }`}
                    >
                      {alert.severity} priority
                    </span>
                    <span className="text-xs font-bold text-ink/75">· {alert.time}</span>
                  </div>

                  <h3 className="font-extrabold text-base text-ink mt-1">{alert.title}</h3>
                  <p className="text-xs font-medium text-ink/90 mt-1 leading-relaxed">{alert.detail}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-center sm:self-start">
                {alert.actionable && (
                  <button
                    onClick={() => handleQuickDispatch(alert)}
                    className="btn bg-ink text-cream hover:bg-ink/85 text-xs py-1.5 px-3.5 rounded-full shadow-xs"
                  >
                    <Send size={12} /> Dispatch Action
                  </button>
                )}
                {alert.regionId && (
                  <Link
                    to="/counterfactual"
                    onClick={() => selectRegion(alert.regionId)}
                    className="btn bg-white border border-ink/20 text-ink hover:bg-peach/40 text-xs py-1.5 px-3 rounded-full"
                  >
                    Simulate
                  </Link>
                )}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  aria-label="Dismiss alert"
                  className="rounded-full p-1.5 hover:bg-ink/10 text-ink/70"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )
        })}

        {filteredAlerts.length === 0 && (
          <div className="rounded-3xl bg-white/70 p-12 text-center border border-ink/10 shadow-soft">
            <CheckCircle2 size={40} className="mx-auto text-emerald-600 mb-2" />
            <h3 className="text-lg font-bold text-ink">All Clear in this Category</h3>
            <p className="text-xs font-medium text-ink/80 mt-1">
              No active warnings or threshold exceedances matching the selected filter.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
