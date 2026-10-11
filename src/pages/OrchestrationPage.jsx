import { useState } from 'react'
import {
  Compass,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Radio,
  Smartphone,
  ShieldCheck,
  Send,
  XCircle,
  Users,
  Layers,
  ChevronRight
} from 'lucide-react'
import { getRegionById } from '../engine/campusGraph.js'

export default function OrchestrationPage({ campus }) {
  const {
    rankedRecommendations,
    activeInterventions,
    interventionHistory,
    runIntervention,
    advanceStep,
    simulationClock
  } = campus

  const [selectedScenarioForModal, setSelectedScenarioForModal] = useState(null)
  const [operatorNotes, setOperatorNotes] = useState('')
  const [successToast, setSuccessToast] = useState(null)

  const handleOpenDispatchModal = (scenario) => {
    setSelectedScenarioForModal(scenario)
    setOperatorNotes('')
  }

  const handleConfirmDispatch = () => {
    if (!selectedScenarioForModal) return
    campus.runIntervention(selectedScenarioForModal.key, operatorNotes || 'Approved by Operator')
    setSuccessToast(`Dispatched: ${selectedScenarioForModal.label}`)
    setSelectedScenarioForModal(null)
    setTimeout(() => setSuccessToast(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/70">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Constrained Optimization Engine</span>
            <span>·</span>
            <span>Virtual Clock: {simulationClock}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink mt-0.5">
            Network-Aware Decision Orchestration
          </h1>
          <p className="text-xs text-ink/70 mt-1 max-w-2xl">
            Ranks interventions by mathematical objective function J(a), enforces operational constraints
            (staff ceilings & downstream safety limits), and synthesizes multi-channel campus dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink bg-peach px-3 py-1.5 rounded-full">
            Operator Confirmation Required
          </span>
        </div>
      </header>

      {successToast && (
        <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-3 text-sm text-emerald-900 font-semibold flex items-center justify-between">
          <span>✓ {successToast}</span>
          <span className="text-xs opacity-75">Multi-channel packages simulated</span>
        </div>
      )}

      {/* Ranked Candidate Interventions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Sparkles size={20} className="text-coral" />
            Ranked Interventions (Constrained Multi-Objective J)
          </h2>
          <span className="text-xs font-semibold text-ink/70">
            Sorted by Lowest Loss (Optimal Network Balance)
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rankedRecommendations.map((sc, idx) => {
            const isTop = idx === 0
            const m = sc.metrics
            const isFeasible = sc.isFeasible !== false
            const pkg = sc.dispatchPackage

            return (
              <div
                key={sc.key}
                className={`card flex flex-col justify-between transition-all duration-200 ${
                  isTop
                    ? 'bg-ink text-cream border-2 border-coral shadow-lg'
                    : isFeasible
                    ? 'bg-white/80 border border-ink/10'
                    : 'bg-red-50/50 border border-red-200 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isTop
                          ? 'bg-coral text-ink'
                          : isFeasible
                          ? 'bg-ink/10 text-ink'
                          : 'bg-red-200 text-red-900'
                      }`}
                    >
                      {isTop ? '★ Top Recommendation' : `Rank #${idx + 1}`}
                    </span>
                    <span className={isTop ? 'text-cream/80' : 'text-ink/60 font-semibold'}>
                      J Score: {sc.objectiveScore}
                    </span>
                  </div>

                  <h3 className={`mt-3 text-lg font-black ${isTop ? 'text-cream' : 'text-ink'}`}>
                    {sc.label}
                  </h3>
                  <p className={`mt-1 text-xs ${isTop ? 'text-cream/75' : 'text-ink/70'}`}>
                    {sc.reasoning}
                  </p>

                  {/* Objective Breakdown */}
                  {sc.objectiveBreakdown && (
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-[10px] opacity-80">
                      <div className="rounded-lg bg-black/10 p-1.5">
                        <span className="block opacity-70">Exceedance</span>
                        <span className="font-bold">{sc.objectiveBreakdown.capacityPenalty}</span>
                      </div>
                      <div className="rounded-lg bg-black/10 p-1.5">
                        <span className="block opacity-70">Downstream</span>
                        <span className="font-bold">{sc.objectiveBreakdown.downstreamPenalty}</span>
                      </div>
                      <div className="rounded-lg bg-black/10 p-1.5">
                        <span className="block opacity-70">Cost</span>
                        <span className="font-bold">{sc.objectiveBreakdown.costPenalty}</span>
                      </div>
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="opacity-70">Target Peak Occ:</span>
                      <span className="font-extrabold">{m.peakOccupancy} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Downstream Load:</span>
                      <span className="font-semibold">{m.downstreamDetails || `${m.downstreamPeakOcc} pax`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Required Staff:</span>
                      <span className="font-semibold">{m.requiredStaff} personnel</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">Downstream Risk:</span>
                      <span
                        className={`font-bold ${
                          m.downstreamRisk === 'Critical'
                            ? 'text-red-400'
                            : m.downstreamRisk === 'High'
                            ? 'text-coral'
                            : isTop
                            ? 'text-emerald-300'
                            : 'text-emerald-700'
                        }`}
                      >
                        {m.downstreamRisk}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-ink/10 flex items-center justify-between">
                  <span className="text-[11px] font-semibold opacity-75">
                    {isFeasible ? 'Constraints Passed' : 'Infeasible Violation'}
                  </span>
                  <button
                    onClick={() => handleOpenDispatchModal(sc)}
                    disabled={!isFeasible || sc.key === 'A'}
                    className={`btn text-xs py-1.5 px-4 rounded-full font-bold ${
                      isTop
                        ? 'bg-coral text-ink hover:bg-peach shadow-md'
                        : isFeasible && sc.key !== 'A'
                        ? 'bg-ink text-cream hover:bg-ink/85'
                        : 'bg-ink/10 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    Review & Dispatch
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Multi-Channel Preview Cards (Digital Signage, Staff Order, Mobile Push) */}
      <section className="card bg-white/90">
        <h2 className="text-lg font-black text-ink mb-1">
          Active Multi-Channel Dispatch Packages (Simulated Preview)
        </h2>
        <p className="text-xs text-ink/70 mb-4">
          Synchronized actuation across physical campus LED displays, marshal radios, and student mobile apps
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Digital Signage LED Screen */}
          <div className="rounded-2xl bg-black p-4 text-cream font-mono shadow-md border-2 border-yellow-500/50">
            <div className="flex items-center justify-between text-[11px] text-yellow-400 mb-2 border-b border-yellow-500/30 pb-1">
              <span>LED DISPLAY SCREEN #01</span>
              <span>LIVE BROADCAST</span>
            </div>
            <div className="bg-yellow-400 text-black font-extrabold text-xs px-2 py-1 rounded text-center mb-2 animate-pulse">
              CAMPUS FLOW ADVISORY
            </div>
            <p className="text-xs text-yellow-200 leading-relaxed min-h-[48px]">
              {rankedRecommendations[0]?.dispatchPackage?.digitalSignage?.text ||
                'Normal Campus Flow: All service counters operating smoothly.'}
            </p>
            <div className="mt-3 text-[10px] text-gray-400 flex justify-between">
              <span>Location: South Vestibule</span>
              <span>Mode: Dynamic Metering</span>
            </div>
          </div>

          {/* Staff Dispatch Slip */}
          <div className="rounded-2xl bg-peach/40 border border-ink/15 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-2 border-b border-ink/10 pb-1">
                <span className="flex items-center gap-1.5">
                  <Radio size={14} /> Marshal Radio Slip
                </span>
                <span className="bg-coral text-ink px-2 py-0.5 rounded-full text-[10px] font-black">
                  PRIORITY: HIGH
                </span>
              </div>
              <p className="text-xs font-bold text-ink">
                Team: Campus Security & Student Ushers
              </p>
              <p className="text-xs text-ink/80 mt-1 leading-relaxed">
                {rankedRecommendations[0]?.dispatchPackage?.staffInstructions?.order ||
                  'Maintain standard perimeter monitoring.'}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-ink/10 text-[11px] text-ink/60 flex justify-between">
              <span>Radio: Channel 4 (CrowdOps)</span>
              <span>Ack: Required</span>
            </div>
          </div>

          {/* Mobile Student App Push */}
          <div className="rounded-2xl bg-cream border border-ink/15 p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-ink mb-2 border-b border-ink/10 pb-1">
                <span className="flex items-center gap-1.5">
                  <Smartphone size={14} /> Student Mobile App Push
                </span>
                <span className="text-[10px] bg-ink text-cream px-2 py-0.5 rounded-full">
                  Opt-In Geo
                </span>
              </div>
              <div className="rounded-xl bg-white p-2.5 shadow-xs border border-ink/10">
                <p className="text-xs font-extrabold text-ink">
                  {rankedRecommendations[0]?.dispatchPackage?.studentMobileNotification?.title ||
                    'CrowdFlow Transit Update'}
                </p>
                <p className="text-[11px] text-ink/80 mt-1">
                  {rankedRecommendations[0]?.dispatchPackage?.studentMobileNotification?.body ||
                    'All campus zones currently within safe capacity levels.'}
                </p>
                <span className="text-[10px] font-bold text-coral block mt-1.5">
                  {rankedRecommendations[0]?.dispatchPackage?.studentMobileNotification?.eta || 'No detour needed'}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-ink/60 text-right">
              Delivered via Campus Life App API
            </div>
          </div>
        </div>
      </section>

      {/* Intervention Execution Pipeline & History */}
      <section className="card">
        <h2 className="text-lg font-black text-ink mb-1">Intervention History & Execution Audit</h2>
        <p className="text-xs text-ink/70 mb-4">
          Time-stamped audit log of proposed, dispatched, active, and completed interventions
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-bold text-ink/60 uppercase tracking-wider">
                <th className="py-2.5 px-3">Intervention</th>
                <th className="py-2.5 px-3">Target Zone</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Outcome Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {activeInterventions.map((inv) => (
                <tr key={inv.id} className="bg-coral/10 font-medium">
                  <td className="py-3 px-3 font-extrabold text-ink">{inv.label}</td>
                  <td className="py-3 px-3">{getRegionById(inv.targetRegionId).name}</td>
                  <td className="py-3 px-3 text-xs">{inv.dispatchedAt}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-xs font-black animate-pulse">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-xs text-ink/80">
                    Intervention active in field; gathering post-intervention observations…
                  </td>
                </tr>
              ))}

              {interventionHistory.map((inv) => (
                <tr key={inv.id} className="hover:bg-peach/20 transition">
                  <td className="py-2.5 px-3 font-bold text-ink">{inv.label}</td>
                  <td className="py-2.5 px-3">{getRegionById(inv.regionId || inv.targetRegionId).name}</td>
                  <td className="py-2.5 px-3 text-xs text-ink/70">{inv.dispatchedAt}</td>
                  <td className="py-2.5 px-3">
                    <span className="rounded-full bg-ink/10 text-ink px-2.5 py-0.5 text-xs font-bold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-xs text-ink/80">
                    {inv.outcomeEvaluation || 'Completed as scheduled.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Operator Consequential Confirmation Modal */}
      {selectedScenarioForModal && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-cream rounded-3xl p-6 max-w-xl w-full border border-ink/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div className="flex items-center gap-2 text-ink">
                <ShieldCheck size={22} className="text-coral" />
                <h3 className="text-xl font-black">Operator Dispatch Authorization</h3>
              </div>
              <button
                onClick={() => setSelectedScenarioForModal(null)}
                className="text-ink/60 hover:text-ink text-sm font-bold"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-ink/70">
              You are about to authorize an operational intervention across interconnected campus regions.
              Review the constraints and simulated dispatch package before confirming.
            </p>

            <div className="rounded-2xl bg-white p-4 space-y-2 text-sm border border-ink/10">
              <p className="font-extrabold text-ink text-base">{selectedScenarioForModal.label}</p>
              <p className="text-xs text-ink/80">{selectedScenarioForModal.description}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-ink/10 text-xs">
                <div>
                  <span className="opacity-70">Target Peak Occ:</span>{' '}
                  <span className="font-bold">{selectedScenarioForModal.metrics.peakOccupancy} pax</span>
                </div>
                <div>
                  <span className="opacity-70">Downstream Load:</span>{' '}
                  <span className="font-bold">{selectedScenarioForModal.metrics.downstreamPeakOcc} pax</span>
                </div>
                <div>
                  <span className="opacity-70">Staff Required:</span>{' '}
                  <span className="font-bold">{selectedScenarioForModal.metrics.requiredStaff} staff</span>
                </div>
                <div>
                  <span className="opacity-70">Resource Cost:</span>{' '}
                  <span className="font-bold">{selectedScenarioForModal.metrics.resourceCost} pts</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                Operator Shift Log Notes:
              </label>
              <input
                type="text"
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="e.g. Authorized to alleviate peak 13:00 rush; security alerted."
                className="w-full rounded-xl bg-white border border-ink/20 p-2.5 text-xs text-ink"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/10">
              <button
                onClick={() => setSelectedScenarioForModal(null)}
                className="btn bg-white border border-ink/20 text-ink text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="btn bg-ink text-cream hover:bg-ink/85 font-extrabold text-xs py-2 px-5 shadow-md"
              >
                Confirm Consequential Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
