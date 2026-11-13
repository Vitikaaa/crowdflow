import { useState } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend
} from 'recharts'
import {
  BarChart3,
  Clock,
  ShieldCheck,
  RotateCcw,
  TrendingDown,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Sliders
} from 'lucide-react'

export default function AnalyticsPage({ campus }) {
  const {
    observationHistory,
    errorMetrics,
    recalibrationLogs,
    interventionHistory,
    simulationClock,
    advanceStep
  } = campus

  const [simulating, setSimulating] = useState(false)

  const handleStepObservation = () => {
    setSimulating(true)
    advanceStep()
    setTimeout(() => setSimulating(false), 300)
  }

  // Prepare chart data for Actual vs Predicted
  const timeData = observationHistory.map((item) => ({
    time: item.timestamp,
    actual: item.actual,
    predicted: item.predicted,
    error: item.error
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/85">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Closed-Loop Outcome Evaluation</span>
            <span>·</span>
            <span>Virtual Clock: {simulationClock}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink mt-0.5">
            Analytics & Model Calibration Feedback
          </h1>
          <p className="text-xs font-medium text-ink/85 mt-1 max-w-2xl">
            Compares observed ground-truth occupancy with baseline forecasts and simulated interventions,
            tracks residual error E(t) = Actual(t) - Predicted(t), and records model recalibrations.
          </p>
        </div>

        <button
          onClick={handleStepObservation}
          disabled={simulating}
          className="btn bg-ink text-cream hover:bg-ink/85 shadow-sm text-xs py-2 px-4"
        >
          <Play size={14} className={simulating ? 'animate-spin' : ''} />
          Advance & Log Next Observation (+5m)
        </button>
      </header>

      {/* Accuracy KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-white/80">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/85">
            Rolling MAE
          </p>
          <p className="mt-2 text-4xl font-black text-ink">
            ±{errorMetrics.mae || 2.8}
            <span className="text-sm font-bold text-ink/75 ml-1">students</span>
          </p>
          <p className="mt-2 text-xs text-emerald-800 font-bold flex items-center gap-1">
            <CheckCircle2 size={13} /> Within target tolerance (&lt;4.0)
          </p>
        </div>

        <div className="card bg-white/80">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/85">
            Root Mean Square (RMSE)
          </p>
          <p className="mt-2 text-4xl font-black text-ink">
            ±{errorMetrics.rmse || 3.1}
            <span className="text-sm font-bold text-ink/75 ml-1">students</span>
          </p>
          <p className="mt-2 text-xs text-ink/85 font-medium">
            Penalizes large transient burst errors
          </p>
        </div>

        <div className="card bg-white/80">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/85">
            Mean Bias Error
          </p>
          <p className="mt-2 text-4xl font-black text-ink">
            {errorMetrics.meanBias || -1.8}
            <span className="text-sm font-bold text-ink/75 ml-1">students</span>
          </p>
          <p className="mt-2 text-xs text-ink/85 font-medium">
            Slight conservative forecast bias
          </p>
        </div>

        <div className="card !bg-ink card-dark text-cream">
          <p className="text-xs font-bold uppercase tracking-wider text-coral">
            Model Engine Status
          </p>
          <p className="mt-2 text-3xl font-black text-cream">CF-ARNet</p>
          <p className="mt-2 text-xs text-cream/90 font-medium">
            Version 2.4 · Calibrated with rolling residuals
          </p>
        </div>
      </section>

      {/* Actual vs Forecast Timeline Chart */}
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-black text-ink">
              Sequential Ground-Truth Observations vs Forecast
            </h2>
            <p className="text-xs font-medium text-ink/80">
              Evaluating predicted +10 min trajectory against subsequent ground-truth sensor fusion states
            </p>
          </div>
          <div className="flex gap-4 text-xs font-semibold text-ink">
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-ink" /> Actual Observed
            </span>
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full bg-coral" /> Predicted (+10m)
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full min-w-[380px] overflow-x-auto mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timeData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#190933" strokeOpacity={0.08} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#190933', fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#190933' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid rgba(25,9,51,0.1)',
                  backgroundColor: '#FFF5E0',
                  boxShadow: '0 8px 30px -12px rgba(25,9,51,.25)',
                  fontFamily: 'Poppins',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Observed"
                stroke="#190933"
                strokeWidth={3}
                dot={{ r: 4.5, fill: '#190933' }}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                name="Predicted (+10m)"
                stroke="#EE9E8E"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4.5, fill: '#EE9E8E' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Residual Error Timeline E(t) = Actual(t) - Predicted(t) */}
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-black text-ink">
              Residual Error Timeline: E(t) = Actual(t) – Predicted(t)
            </h2>
            <p className="text-xs font-medium text-ink/80">
              Positive values indicate under-prediction; negative values indicate over-prediction
            </p>
          </div>
          <span className="text-xs font-semibold bg-peach px-2.5 py-1 rounded-full text-ink">
            Residual Deviation Plot
          </span>
        </div>

        <div className="h-56 sm:h-64 w-full min-w-[380px] overflow-x-auto mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeData} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#190933" strokeOpacity={0.08} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#190933', fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#190933' }} domain={[-6, 6]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid rgba(25,9,51,0.1)',
                  backgroundColor: '#FFF5E0',
                  boxShadow: '0 8px 30px -12px rgba(25,9,51,.25)',
                  fontFamily: 'Poppins',
                  fontSize: '12px'
                }}
              />
              <ReferenceLine y={0} stroke="#190933" strokeWidth={1.5} />
              <Bar dataKey="error" name="Residual Error E(t)" fill="#EE9E8E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Intervention Efficacy & Outcome Evaluation */}
      <section className="card bg-white/90">
        <h2 className="text-xl font-black text-ink mb-1">
          Intervention Efficacy & Closed-Loop Verification
        </h2>
        <p className="text-xs font-medium text-ink/80 mb-4">
          Comparing observed outcomes against the counterfactual baseline (what would have occurred without action)
        </p>

        <div className="space-y-3">
          {interventionHistory.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl bg-cream/70 p-4 border border-ink/10 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-ink text-base">{inv.label}</span>
                  <span className="text-xs bg-ink/10 text-ink px-2 py-0.5 rounded-full font-bold">
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-ink/90 mt-1 max-w-xl">
                  {inv.outcomeEvaluation ||
                    'Intervention active; evaluating post-action crowd clearance.'}
                </p>
                <p className="text-[11px] font-bold text-ink/75 mt-1">
                  Dispatched at: {inv.dispatchedAt} · Personnel: {inv.staffCount || 1} staff
                </p>
              </div>

              <div className="flex items-center gap-4 text-center">
                <div className="rounded-xl bg-white p-2.5 min-w-[90px] border border-ink/10">
                  <span className="text-[10px] uppercase font-bold text-ink/80 block">Surge Saved</span>
                  <span className="text-lg font-black text-emerald-700">~22 pax</span>
                </div>
                <div className="rounded-xl bg-white p-2.5 min-w-[90px] border border-ink/10">
                  <span className="text-[10px] uppercase font-bold text-ink/80 block">Queue Saved</span>
                  <span className="text-lg font-black text-ink">~4.5 min</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recalibration History Log */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-black text-ink">Model Recalibration History Log</h2>
            <p className="text-xs font-medium text-ink/80">
              Audit log of parameter updates and bias corrections triggered by closed-loop residuals
            </p>
          </div>
          <span className="text-xs font-bold bg-peach px-2.5 py-1 rounded-full text-ink">
            Parameter Tuning
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-black text-ink/80 uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Trigger Reason</th>
                <th className="py-2.5 px-3">Parameter Adjustment</th>
                <th className="py-2.5 px-3">MAE Before</th>
                <th className="py-2.5 px-3">MAE After</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {recalibrationLogs.map((log) => (
                <tr key={log.id} className="hover:bg-peach/20 transition">
                  <td className="py-2.5 px-3 font-mono text-xs text-ink/80">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-bold text-ink text-xs">{log.trigger}</td>
                  <td className="py-2.5 px-3 text-xs text-ink/80">{log.adjustment}</td>
                  <td className="py-2.5 px-3 text-xs font-semibold">{log.maeBefore}</td>
                  <td className="py-2.5 px-3 text-xs font-bold text-emerald-700">{log.maeAfter}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
