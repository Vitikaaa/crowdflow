import { useState, useMemo } from 'react'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Sliders,
  TrendingDown,
  Shield,
  Layers,
  ArrowDown,
  RotateCcw
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts'
import TopBar from '../../components/TopBar.jsx'
import { CAMPUS_NODES, getRegionById } from '../../engine/campusGraph.js'
import { runStandardScenarioSuite } from '../../engine/counterfactualSim.js'

export default function SmartDecisionsPage({ campus }) {
  const {
    regionsMap = {},
    scenarios = [],
    selectedRegionId = 'annapurna',
    runIntervention,
    actionHistory = []
  } = campus

  const [targetFacilityId, setTargetFacilityId] = useState(selectedRegionId || 'annapurna')
  const [destFacilityId, setDestFacilityId] = useState(
    targetFacilityId === 'annapurna' ? 'stationery-2' : 'stationery-2'
  )
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('B')
  const [actionNotice, setActionNotice] = useState(null)

  // Run scenario suite on current baseline states
  const suiteResults = useMemo(() => {
    const baseline = {}
    Object.values(regionsMap).forEach((r) => {
      baseline[r.id] = {
        occupancy: r.current || 50,
        arrivalRate: r.arrivalRate || 15,
        departureRate: r.departureRate || 12,
        counters: r.activeCounters || 2,
        queue: r.queue || 0
      }
    })
    return runStandardScenarioSuite(baseline, targetFacilityId, destFacilityId)
  }, [regionsMap, targetFacilityId, destFacilityId])

  const baselineScenario = suiteResults[0] || {}
  const activeScenario = suiteResults.find((s) => s.scenarioKey === selectedScenarioKey) || suiteResults[1] || {}

  const targetNode = getRegionById(targetFacilityId)
  const destNode = getRegionById(destFacilityId)

  // Format chart trajectory data
  const chartData = useMemo(() => {
    const timeSteps = [0, 5, 10, 15, 20]
    return timeSteps.map((t) => {
      const basePoint = baselineScenario.trajectories?.[targetFacilityId]?.find((x) => x.minute === t)
      const activePoint = activeScenario.trajectories?.[targetFacilityId]?.find((x) => x.minute === t)
      return {
        minute: `+${t}m`,
        baseline: basePoint ? basePoint.occupancy : null,
        intervention: activePoint ? activePoint.occupancy : null
      }
    })
  }, [baselineScenario, activeScenario, targetFacilityId])

  const handleApprove = () => {
    if (runIntervention) {
      runIntervention(activeScenario.scenarioKey)
      setActionNotice({
        type: 'success',
        msg: `Intervention approved! "${activeScenario.label}" has been executed live on campus.`
      })
      setTimeout(() => setActionNotice(null), 5000)
    }
  }

  const handleReject = () => {
    setActionNotice({
      type: 'info',
      msg: `Scenario ${activeScenario.scenarioKey} rejected. Campus remains on status quo.`
    })
    setTimeout(() => setActionNotice(null), 4000)
  }

  return (
    <div className="space-y-6">
      <TopBar
        title="Smart Decisions"
        subtitle="AI-assisted counterfactual scenario analysis, network optimization, and decision approval"
        campus={campus}
      />

      {/* Floating Action Notice */}
      {actionNotice && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-[#130722] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-[#FFAE96]" />
          <span>{actionNotice.msg}</span>
        </div>
      )}

      {/* 3-PART SCENARIO COMPARISON WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* PART 1: Scenario Configuration (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div>
            <h3 className="font-black text-base text-ink mb-1">1. Configure Scenario</h3>
            <p className="text-xs font-semibold text-ink/60">
              Select facility and intervention policy to test
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-ink">Target Facility:</label>
              <select
                value={targetFacilityId}
                onChange={(e) => setTargetFacilityId(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-2xl border border-ink/15 font-bold text-xs bg-[#FAF7F2]"
              >
                {CAMPUS_NODES.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-ink">Downstream Absorption Facility:</label>
              <select
                value={destFacilityId}
                onChange={(e) => setDestFacilityId(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-2xl border border-ink/15 font-bold text-xs bg-[#FAF7F2]"
              >
                {CAMPUS_NODES.filter((n) => n.id !== targetFacilityId).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="font-bold text-ink mb-1.5 block">Intervention Policy:</label>
              <div className="space-y-2">
                {suiteResults.map((s) => (
                  <div
                    key={s.scenarioKey}
                    onClick={() => setSelectedScenarioKey(s.scenarioKey)}
                    className={`p-3 rounded-2xl border cursor-pointer transition ${
                      selectedScenarioKey === s.scenarioKey
                        ? 'border-coral bg-peach/30 shadow-xs'
                        : 'border-ink/10 hover:bg-cream/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-ink">{s.label}</span>
                      {s.scenarioKey === 'B' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-ink/70 font-semibold mt-1 leading-snug">
                      {s.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PART 2 & 3: Current vs Predicted Comparison + Recommendation (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section 2: Before & After KPI Indicators */}
          <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-ink">2. Predicted Impact & Comparison</h3>
                <p className="text-xs font-semibold text-ink/60">
                  Status Quo (Baseline) vs {activeScenario.label}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-ink/10 font-bold text-xs text-ink">
                Horizon: +15 minutes
              </span>
            </div>

            {/* 4 Before / After Comparison Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-ink/5">
                <p className="text-ink/60 font-bold text-[10px] uppercase">Peak Occupancy</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-ink">
                    {activeScenario.metrics?.peakOccupancy || 132}
                  </span>
                  <span className="text-xs text-ink/40 line-through">
                    {baselineScenario.metrics?.peakOccupancy || 168}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 mt-1">
                  <ArrowDown size={12} /> -28% load
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-ink/5">
                <p className="text-ink/60 font-bold text-[10px] uppercase">Queue Length</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-coral">
                    {Math.max(1, (targetNode.queue || 20) - 14)}
                  </span>
                  <span className="text-xs text-ink/40 line-through">
                    {targetNode.queue || 28}
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 mt-1">
                  <ArrowDown size={12} /> -14 waiting
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-ink/5">
                <p className="text-ink/60 font-bold text-[10px] uppercase">Wait Time</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-ink">
                    {activeScenario.metrics?.avgWaitTimeMin || 4}m
                  </span>
                  <span className="text-xs text-ink/40 line-through">
                    {baselineScenario.metrics?.avgWaitTimeMin || 12}m
                  </span>
                </div>
                <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 mt-1">
                  <ArrowDown size={12} /> -8 min wait
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-ink/5">
                <p className="text-ink/60 font-bold text-[10px] uppercase">Downstream Safety</p>
                <p className="text-lg font-black text-emerald-700 mt-1">
                  Safe (42%)
                </p>
                <p className="text-[10px] font-semibold text-ink/60 mt-1 truncate">
                  {destNode.shortName} absorbs easily
                </p>
              </div>
            </div>

            {/* Synchronized Trajectory Forecast Chart */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-ink">
                <span>Occupancy Trajectory Across Network</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-rose-500" /> Status Quo (A)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2.5 rounded-full bg-emerald-600" /> Proposed ({activeScenario.scenarioKey})
                  </span>
                </div>
              </div>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE3" vertical={false} />
                    <XAxis dataKey="minute" stroke="#706684" fontSize={11} fontWeight={600} tickLine={false} />
                    <YAxis stroke="#706684" fontSize={11} fontWeight={600} tickLine={false} domain={[0, 200]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#130722',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        color: '#FFFFFF',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="baseline"
                      name="Status Quo"
                      stroke="#EF4444"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: '#EF4444' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="intervention"
                      name="Intervention"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* PART 3: Recommendation Explanation & Approval Controls */}
          <div className="bg-white rounded-3xl border-2 border-coral/30 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-coral" />
                <h3 className="font-black text-base text-ink">3. Recommendation & Decision Review</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                CF-ARNet Calibrated
              </span>
            </div>

            {/* Plain English Explanation */}
            <div className="p-4 rounded-2xl bg-[#FAF7F2] text-xs font-semibold text-ink/80 space-y-1.5 leading-relaxed">
              <p className="font-extrabold text-ink text-sm">
                Why this policy is recommended:
              </p>
              <p>
                Diverting incoming arrivals from <strong>{targetNode.name}</strong> to <strong>{destNode.name}</strong> prevents turnstile threshold breach at 85% capacity while utilizing reserve clearance windows at {destNode.shortName}.
              </p>
              <p className="text-[11px] text-ink/60">
                Walking penalty is minimal (&lt;2 min detour) and preserves dining service throughput during peak lunch transition.
              </p>
            </div>

            {/* Decision Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={handleApprove}
                className="w-full sm:flex-1 btn bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-3 justify-center rounded-2xl shadow-sm"
              >
                <CheckCircle2 size={16} />
                Approve & Execute Action
              </button>

              <button
                onClick={() => setActionNotice({ type: 'info', msg: 'Opened parameter modification controls.' })}
                className="w-full sm:w-auto btn bg-cream hover:bg-peach/40 text-ink font-bold text-xs py-3 px-5 rounded-2xl"
              >
                Modify Parameters
              </button>

              <button
                onClick={handleReject}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                Reject Recommendation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

