import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts'
import {
  FlaskConical,
  Sliders,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Users,
  Footprints,
  Coins,
  Send,
  Sparkles,
  Info
} from 'lucide-react'
import { runStandardScenarioSuite, simulateNetworkScenario } from '../engine/counterfactualSim.js'
import { getRegionById } from '../engine/campusGraph.js'

const SCENARIO_COLORS = {
  A: '#190933', // Baseline - Navy
  B: '#3B82F6', // Blue
  C: '#10B981', // Green
  D: '#8B5CF6', // Purple
  E: '#F59E0B', // Amber
  F: '#EE9E8E'  // Coral (Hybrid)
}

export default function CounterfactualLab({ campus }) {
  const { regions, selectedRegionId, selectRegion, runIntervention } = campus

  // Interactive Parameter State
  const [targetId, setTargetId] = useState('canteen-a')
  const [destId, setDestId] = useState('canteen-b')
  const [redirectPct, setRedirectPct] = useState(35)
  const [additionalCounters, setAdditionalCounters] = useState(1)
  const [availableStaff, setAvailableStaff] = useState(2)
  const [durationMin, setDurationMin] = useState(15)

  // Chart view toggle: Target Region (A) vs Downstream Region (B)
  const [chartFocus, setChartFocus] = useState('target') // 'target' | 'destination'

  // Multi-scenario selection for synchronized charting
  const [selectedScenarios, setSelectedScenarios] = useState(['A', 'B', 'C', 'F'])
  const [actionNotice, setActionNotice] = useState(null)

  // Build baseline states from current campus telemetry
  const baselineStates = useMemo(() => {
    const map = {}
    regions.forEach((r) => {
      map[r.id] = {
        occupancy: r.current,
        arrivalRate: r.arrivalRate,
        departureRate: r.departureRate,
        counters: r.activeCounters,
        queue: r.queue
      }
    })
    return map
  }, [regions])

  // Run dynamic suite with current interactive parameters
  const scenarios = useMemo(() => {
    const rawSuite = runStandardScenarioSuite(baselineStates, targetId, destId)

    // Apply live tuned parameters to Scenario B, C, F
    return rawSuite.map((sc) => {
      if (sc.scenarioKey === 'B') {
        return simulateNetworkScenario(baselineStates, {
          key: 'B',
          label: `Scenario B: Redirect to ${getRegionById(destId).name}`,
          description: `Redirect ${redirectPct}% of arriving students via signage & app to ${getRegionById(destId).name}.`,
          targetRegionId: targetId,
          destinationRegionId: destId,
          redirectFraction: redirectPct / 100,
          additionalCounters: 0,
          additionalStaff: 0
        })
      }
      if (sc.scenarioKey === 'C') {
        return simulateNetworkScenario(baselineStates, {
          key: 'C',
          label: `Scenario C: Open +${additionalCounters} Counter(s)`,
          description: `Activate +${additionalCounters} service counter(s) at ${getRegionById(targetId).name}.`,
          targetRegionId: targetId,
          destinationRegionId: destId,
          redirectFraction: 0,
          additionalCounters: additionalCounters,
          additionalStaff: 0
        })
      }
      if (sc.scenarioKey === 'F') {
        return simulateNetworkScenario(baselineStates, {
          key: 'F',
          label: `Scenario F: Hybrid Orchestration`,
          description: `Redirect ${Math.round(redirectPct * 0.6)}% to ${getRegionById(destId).name} + Open ${additionalCounters} counter.`,
          targetRegionId: targetId,
          destinationRegionId: destId,
          redirectFraction: (redirectPct * 0.6) / 100,
          additionalCounters: additionalCounters,
          additionalStaff: Math.min(availableStaff, 1)
        })
      }
      return sc
    })
  }, [baselineStates, targetId, destId, redirectPct, additionalCounters, availableStaff])

  const baseline = scenarios.find((s) => s.scenarioKey === 'A') || scenarios[0]

  // Add deltas relative to baseline
  const evaluatedScenarios = useMemo(() => {
    return scenarios.map((res) => {
      const occDelta = res.metrics.occupancyAt10m - baseline.metrics.occupancyAt10m
      const pctReduction = baseline.metrics.occupancyAt10m > 0
        ? Math.round(((baseline.metrics.occupancyAt10m - res.metrics.occupancyAt10m) / baseline.metrics.occupancyAt10m) * 100)
        : 0

      return {
        ...res,
        deltas: {
          occupancyDelta: occDelta,
          occupancyPercentReduction: Math.max(0, pctReduction),
          waitTimeDeltaMin: Number((res.metrics.avgWaitTimeMin - baseline.metrics.avgWaitTimeMin).toFixed(1)),
          exceedanceDelta: res.metrics.regionsExceedingThreshold - baseline.metrics.regionsExceedingThreshold
        }
      }
    })
  }, [scenarios, baseline])

  // Prepare synchronized multi-trajectory chart data
  const chartData = useMemo(() => {
    const timeSteps = [0, 5, 10, 15, 20]
    const activeRegionId = chartFocus === 'target' ? targetId : destId

    return timeSteps.map((t) => {
      const point = { time: `+${t}m` }
      evaluatedScenarios.forEach((sc) => {
        const traj = sc.trajectories[activeRegionId]
        const stepPt = traj?.find((x) => x.minute === t)
        point[sc.scenarioKey] = stepPt ? stepPt.occupancy : null
      })
      return point
    })
  }, [evaluatedScenarios, chartFocus, targetId, destId])

  const targetNode = getRegionById(targetId)
  const destNode = getRegionById(destId)
  const focusedNode = chartFocus === 'target' ? targetNode : destNode

  const toggleScenario = (key) => {
    if (selectedScenarios.includes(key)) {
      if (selectedScenarios.length > 1) {
        setSelectedScenarios(selectedScenarios.filter((k) => k !== key))
      }
    } else {
      setSelectedScenarios([...selectedScenarios, key])
    }
  }

  const handleSendToOrchestration = (sc) => {
    campus.runIntervention(sc.scenarioKey, `Dispatched via Counterfactual Lab simulation`)
    setActionNotice(`Intervention '${sc.label}' approved and dispatched to orchestration pipeline.`)
    setTimeout(() => setActionNotice(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-coral font-bold">
            <FlaskConical size={16} /> Core Research Innovation · What-If Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink mt-0.5">
            Counterfactual Intervention Laboratory
          </h1>
          <p className="text-xs text-ink/70 mt-1 max-w-2xl">
            Simulate alternative future trajectories before taking action. Models pedestrian flow propagation,
            network transit lags, and downstream capacity ripple effects across connected campus zones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-ink bg-peach px-3 py-1.5 rounded-full">
            Network Flow Conserved
          </span>
        </div>
      </header>

      {actionNotice && (
        <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-3 text-sm text-emerald-900 font-semibold flex items-center justify-between">
          <span>✓ {actionNotice}</span>
          <span className="text-xs opacity-75">Check Orchestration page for active dispatch</span>
        </div>
      )}

      {/* Downstream Ripple Effect Notice */}
      <div className="rounded-2xl bg-white/80 border border-ink/10 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-peach grid place-items-center text-ink shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="text-xs">
            <p className="font-extrabold text-ink text-sm">
              Network Flow Conservation & Downstream Coupling
            </p>
            <p className="text-ink/75">
              Redirecting crowd from <span className="font-bold">{targetNode.name}</span> transfers demand to{' '}
              <span className="font-bold">{destNode.name}</span> after transit walking delay (2.5m). The simulator
              verifies whether {destNode.name} has sufficient headroom ({destNode.capacity} max capacity).
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-ink/5 p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => setChartFocus('target')}
            className={`px-3 py-1 rounded-full transition ${
              chartFocus === 'target' ? 'bg-ink text-cream' : 'text-ink hover:text-coral'
            }`}
          >
            Target Zone: {targetNode.shortName}
          </button>
          <button
            onClick={() => setChartFocus('destination')}
            className={`px-3 py-1 rounded-full transition ${
              chartFocus === 'destination' ? 'bg-coral text-ink' : 'text-ink hover:text-coral'
            }`}
          >
            Downstream Zone: {destNode.shortName}
          </button>
        </div>
      </div>

      {/* Interactive Scenario Parameter Tuner */}
      <section className="card bg-white/90">
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={18} className="text-ink" />
          <h2 className="text-base font-extrabold text-ink">Scenario Parameter Controls</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Target Region */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/70 block mb-1.5">
              Target Congested Region
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-2xl bg-peach/40 border border-ink/15 p-2.5 text-sm font-bold text-ink"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.capacity} seats)
                </option>
              ))}
            </select>
          </div>

          {/* Destination Region */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-ink/70 block mb-1.5">
              Eligible Destination Region
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full rounded-2xl bg-peach/40 border border-ink/15 p-2.5 text-sm font-bold text-ink"
            >
              {regions
                .filter((r) => r.id !== targetId)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.capacity} seats)
                  </option>
                ))}
            </select>
          </div>

          {/* Redirection Fraction Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-ink/70 mb-1.5">
              <span className="uppercase tracking-wider">Demand Redirect Ratio</span>
              <span className="text-coral font-black text-sm">{redirectPct}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={redirectPct}
              onChange={(e) => setRedirectPct(Number(e.target.value))}
              className="w-full accent-coral cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Diverts incoming pedestrian arrivals</p>
          </div>

          {/* Additional Counters */}
          <div>
            <div className="flex justify-between text-xs font-bold text-ink/70 mb-1.5">
              <span className="uppercase tracking-wider">Extra Service Counters</span>
              <span className="text-ink font-black text-sm">+{additionalCounters}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={additionalCounters}
              onChange={(e) => setAdditionalCounters(Number(e.target.value))}
              className="w-full accent-ink cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Adds +6 pax/5min clearance capacity each</p>
          </div>
        </div>
      </section>

      {/* Multi-Scenario Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/60 p-3 rounded-2xl border border-ink/10">
        <span className="text-xs font-extrabold text-ink uppercase tracking-wider">
          Scenarios Plotted on Chart:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {evaluatedScenarios.map((sc) => {
            const isChecked = selectedScenarios.includes(sc.scenarioKey)
            const color = SCENARIO_COLORS[sc.scenarioKey]
            return (
              <button
                key={sc.scenarioKey}
                onClick={() => toggleScenario(sc.scenarioKey)}
                className={`btn text-xs py-1.5 px-3 rounded-full border transition ${
                  isChecked ? 'bg-ink text-cream border-ink' : 'bg-white text-ink border-ink/20 hover:bg-peach/30'
                }`}
              >
                <span
                  className="size-2 rounded-full inline-block mr-1"
                  style={{ backgroundColor: color }}
                />
                {sc.label.split(':')[0]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Synchronized Multi-Trajectory Chart */}
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div>
            <h2 className="text-xl font-black text-ink">
              Synchronized Trajectory Comparison · Focus:{' '}
              <span className="text-coral">{focusedNode.name}</span>
            </h2>
            <p className="text-xs text-ink/70">
              {chartFocus === 'target'
                ? `Simulated crowd occupancy at ${targetNode.name} across competing counterfactual interventions`
                : `Downstream impact at ${destNode.name}: verifying whether redirected flow safely absorbs or causes cascade`}
            </p>
          </div>
          <span className="text-xs font-semibold bg-peach px-2.5 py-1 rounded-full text-ink">
            Capacity Limit: {focusedNode.capacity} seats
          </span>
        </div>

        <div className="h-72 sm:h-80 w-full min-w-[420px] overflow-x-auto mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 16, left: -14, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#190933" strokeOpacity={0.08} />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#190933', fontWeight: 600 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: '#190933' }}
                domain={[0, Math.round(focusedNode.capacity * 1.25)]}
              />
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
              <Legend verticalAlign="top" height={36} iconType="circle" />

              {/* Critical Safety Limit Reference Line */}
              <ReferenceLine
                y={Math.round(focusedNode.capacity * 0.88)}
                stroke="#190933"
                strokeDasharray="4 4"
                label={{
                  value: `Threshold 88% (${Math.round(focusedNode.capacity * 0.88)})`,
                  fontSize: 10,
                  fill: '#190933',
                  fontWeight: 700
                }}
              />

              {/* Lines for each selected scenario */}
              {evaluatedScenarios
                .filter((s) => selectedScenarios.includes(s.scenarioKey))
                .map((s) => (
                  <Line
                    key={s.scenarioKey}
                    type="monotone"
                    dataKey={s.scenarioKey}
                    name={s.label}
                    stroke={SCENARIO_COLORS[s.scenarioKey]}
                    strokeWidth={s.scenarioKey === 'F' ? 4 : s.scenarioKey === 'A' ? 3 : 2.5}
                    strokeDasharray={s.scenarioKey === 'A' ? '5 5' : 'none'}
                    dot={{ r: 4, strokeWidth: 1.5, fill: SCENARIO_COLORS[s.scenarioKey] }}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Comprehensive Side-by-Side Comparison Matrix */}
      <section className="card">
        <h2 className="text-xl font-black text-ink mb-1">
          Counterfactual Comparison Matrix (Scenarios A through F)
        </h2>
        <p className="text-xs text-ink/70 mb-4">
          Side-by-side evaluation of target reduction, downstream load, queue wait, resource costs, and feasibility
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-bold text-ink/60 uppercase tracking-wider">
                <th className="py-2.5 px-3">Scenario</th>
                <th className="py-2.5 px-3">Peak @ Target</th>
                <th className="py-2.5 px-3">Reduction vs Base</th>
                <th className="py-2.5 px-3">Avg Wait Time</th>
                <th className="py-2.5 px-3">Downstream Peak ({destNode.shortName})</th>
                <th className="py-2.5 px-3">Downstream Risk</th>
                <th className="py-2.5 px-3">Walking Detour</th>
                <th className="py-2.5 px-3">Resource Cost</th>
                <th className="py-2.5 px-3 text-right">Dispatch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {evaluatedScenarios.map((sc) => {
                const isBaseline = sc.scenarioKey === 'A'
                const m = sc.metrics
                const d = sc.deltas

                return (
                  <tr key={sc.scenarioKey} className="hover:bg-peach/20 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 rounded-full shrink-0"
                          style={{ backgroundColor: SCENARIO_COLORS[sc.scenarioKey] }}
                        />
                        <div>
                          <p className="font-extrabold text-ink">{sc.label}</p>
                          <p className="text-[11px] text-ink/70">{sc.description}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-extrabold text-ink">
                      {m.peakOccupancy} / {targetNode.capacity} ({m.peakUtilizationPct}%)
                    </td>

                    <td className="py-3 px-3 font-bold">
                      {isBaseline ? (
                        <span className="text-xs text-ink/60">Baseline</span>
                      ) : (
                        <span className="text-emerald-700 flex items-center gap-0.5">
                          <TrendingDown size={14} /> -{d.occupancyPercentReduction}% ({d.occupancyDelta} pax)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-medium text-ink/80">
                      {m.avgWaitTimeMin} min
                    </td>

                    <td className="py-3 px-3 font-semibold text-ink">
                      {m.downstreamPeakOcc} / {destNode.capacity} ({m.downstreamPeakUtil}%)
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          m.downstreamRisk === 'Critical'
                            ? 'bg-red-500 text-white'
                            : m.downstreamRisk === 'High'
                            ? 'bg-coral text-ink'
                            : m.downstreamRisk === 'Moderate'
                            ? 'bg-peach text-ink'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {m.downstreamRisk}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-xs text-ink/70">
                      {m.walkingDistanceImpactMeters > 0
                        ? `+${m.walkingDistanceImpactMeters}m (+${m.additionalWalkingTimeMin}m)`
                        : '0m'}
                    </td>

                    <td className="py-3 px-3 font-bold text-ink">
                      {m.resourceCost} pts ({m.requiredStaff} staff)
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleSendToOrchestration(sc)}
                        disabled={isBaseline}
                        className={`btn text-xs py-1.5 px-3.5 rounded-full ${
                          isBaseline
                            ? 'bg-ink/10 opacity-50 cursor-not-allowed'
                            : 'bg-ink text-cream hover:bg-ink/85 shadow-sm'
                        }`}
                      >
                        <Send size={12} /> Dispatch
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
