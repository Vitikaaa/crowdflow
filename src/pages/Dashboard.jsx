import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  ShieldAlert,
  Compass,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import CampusMap from '../components/CampusMap.jsx'
import NetworkGraph from '../components/NetworkGraph.jsx'
import LocationSelector from '../components/LocationSelector.jsx'
import PredictionChart from '../components/PredictionChart.jsx'
import OccupancyCard from '../components/OccupancyCard.jsx'
import AlertCard from '../components/AlertCard.jsx'
import { status } from '../services/api.js'

export default function Dashboard({ campus }) {
  const {
    loading,
    regions,
    edges,
    selectedRegionId,
    selectedRegion,
    forecasts,
    rankedRecommendations,
    alerts,
    observationHistory,
    errorMetrics,
    activeInterventions,
    simulationClock,
    selectRegion,
    dismissAlert,
    advanceStep,
    triggerSpike,
    resetAll
  } = campus

  const [executing, setExecuting] = useState(false)
  const [successNote, setSuccessNote] = useState(null)

  if (loading || !selectedRegion) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-36" />
        ))}
        <div className="skeleton h-80 sm:col-span-2 xl:col-span-4" />
      </div>
    )
  }

  // Calculate Campus-Wide KPIs
  const totalOccupancy = regions.reduce((sum, r) => sum + r.current, 0)
  const totalCapacity = regions.reduce((sum, r) => sum + r.capacity, 0)
  const totalInflow = regions.reduce((sum, r) => sum + (r.arrivalRate || 0), 0)
  const campusPct = Math.round((totalOccupancy / totalCapacity) * 100)

  // Regions at risk (utilization >= 70%)
  const atRiskRegions = regions.filter((r) => {
    const pct = Math.round((r.current / r.capacity) * 100)
    return pct >= 70
  })

  // Highest predicted capacity utilization across all regions
  let highestUtilRegion = selectedRegion
  let highestUtilPct = 0
  regions.forEach((r) => {
    const f = forecasts[r.id]
    const p10 = f?.predictions?.[10] ?? r.current
    const u = Math.round((p10 / r.capacity) * 100)
    if (u > highestUtilPct) {
      highestUtilPct = u
      highestUtilRegion = r
    }
  })

  // Selected region forecast
  const rForecast = forecasts[selectedRegionId] || {
    predictions: { 5: selectedRegion.current, 10: selectedRegion.current, 15: selectedRegion.current }
  }
  const pct = Math.round((selectedRegion.current / selectedRegion.capacity) * 100)
  const p10 = rForecast.predictions[10] || selectedRegion.current
  const p10Pct = Math.round((p10 / selectedRegion.capacity) * 100)

  // Next congestion event
  const nextCongestion = highestUtilPct >= 80
    ? `${highestUtilRegion.shortName || highestUtilRegion.name} reaches ${highestUtilPct}% in +10m`
    : 'No critical breach within 15 min'

  // Top recommended intervention
  const topRec = rankedRecommendations?.[0] || null

  const handleQuickExecute = async () => {
    if (!topRec) return
    setExecuting(true)
    campus.runIntervention(topRec.key, 'Direct dispatch from Dashboard Overview')
    setSuccessNote(`Dispatched: ${topRec.label}`)
    setExecuting(false)
    setTimeout(() => setSuccessNote(null), 4000)
  }

  return (
    <div className="space-y-6">
      {/* Header and Simulation Sandbox Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 backdrop-blur-xs p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/85">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Digital Twin Active</span>
            <span>·</span>
            <span>Virtual Clock: {simulationClock}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-ink mt-0.5">
            Campus Crowd Flow Orchestration
          </h1>
        </div>

        {/* Action Controls for Interactive Demonstration */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={advanceStep}
            className="btn bg-ink text-cream hover:bg-ink/85 shadow-sm text-xs py-2 px-3.5"
            title="Advance virtual clock by 5 minutes, evaluate actual observations against forecasts"
          >
            <Play size={14} className="fill-current" /> Advance +5 Min
          </button>
          <button
            onClick={triggerSpike}
            className="btn bg-coral text-ink hover:bg-coral/80 shadow-sm text-xs py-2 px-3.5"
            title="Simulate class dismissal surge directing crowd towards Canteen A"
          >
            <Zap size={14} /> Simulate Surge
          </button>
          <button
            onClick={resetAll}
            className="btn bg-white text-ink border border-ink/15 hover:bg-peach/30 text-xs py-2 px-3"
            title="Reset system state to clean baseline"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </header>

      {successNote && (
        <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-3 text-sm text-emerald-900 font-semibold flex items-center justify-between">
          <span>✓ {successNote}</span>
          <span className="text-xs opacity-75">Simulated dispatch active</span>
        </div>
      )}

      {/* 7 Research KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7" aria-label="Campus KPIs">
        <StatCard
          label="Total Occupancy"
          value={totalOccupancy}
          unit={`/ ${totalCapacity}`}
          Icon={Users}
          hint={`${campusPct}% campus capacity`}
        />
        <StatCard
          label="Total Inflow"
          value={totalInflow}
          unit="pax / 5m"
          Icon={TrendingUp}
          trend={1}
          hint="Across 7 zones"
        />
        <StatCard
          label="Zones at Risk"
          value={atRiskRegions.length}
          unit={`/ ${regions.length}`}
          Icon={AlertTriangle}
          trend={atRiskRegions.length > 0 ? 1 : 0}
          hint="≥70% capacity threshold"
          accent={atRiskRegions.length > 0}
        />
        <StatCard
          label="Peak Projected"
          value={`${highestUtilPct}%`}
          Icon={Flame}
          hint={`${highestUtilRegion.shortName}`}
          accent={highestUtilPct >= 85}
        />
        <StatCard
          label="Next Surge Event"
          value={highestUtilPct >= 80 ? '+10m' : 'Clear'}
          Icon={Clock}
          hint={highestUtilPct >= 80 ? highestUtilRegion.shortName : 'No breach in 15m'}
        />
        <StatCard
          label="Interventions"
          value={activeInterventions.length}
          unit="active"
          Icon={Compass}
          hint={activeInterventions.length > 0 ? 'Orchestration in progress' : 'Standby mode'}
        />
        <StatCard
          label="Model Accuracy"
          value={`±${errorMetrics.mae || 2.8}`}
          unit="MAE"
          Icon={ShieldAlert}
          hint={`RMSE: ${errorMetrics.rmse || 3.1}`}
        />
      </section>

      {/* Interactive Dynamic Synthetic Campus Map */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-ink">VNR VJIET Dynamic Campus Map</h2>
            <p className="text-xs font-semibold text-ink/75">
              Interactive top-down digital twin. Click buildings to manage crowd flow, get student directions, and test scenarios.
            </p>
          </div>
          <Link
            to="/map"
            className="btn bg-white hover:bg-cream text-ink text-xs font-bold py-2 px-3.5 border border-ink/10 shadow-xs flex items-center gap-1.5 transition"
          >
            Open Fullscreen Map <ArrowRight size={14} />
          </Link>
        </div>

        <CampusMap campus={campus} height="580px" />
      </section>

      {/* Regional Selector & Detailed Telemetry */}
      <LocationSelector regions={regions} value={selectedRegionId} onChange={selectRegion} />

      {/* Regional Forecast & Occupancy Grid */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="card xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {selectedRegion.name}: Observed & Multi-Horizon Forecast
              </h2>
              <p className="text-xs font-medium text-ink/80">
                Autoregressive network-lag model with 95% calibrated confidence envelope
              </p>
            </div>
            <div className="flex gap-4 text-xs font-semibold text-ink">
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-ink" /> Observed
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-coral" /> Forecast (+5, +10, +15m)
              </span>
              <span className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full bg-coral/30" /> 95% Confidence Band
              </span>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <PredictionChart region={selectedRegion} forecast={rForecast} />
          </div>

          {/* Multi-horizon prediction summary cards */}
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[5, 10, 15].map((m) => {
              const val = rForecast.predictions[m] || selectedRegion.current
              const p = Math.round((val / selectedRegion.capacity) * 100)
              const isCrit = p >= 85
              return (
                <div
                  key={m}
                  className={`rounded-2xl p-3 border ${
                    isCrit ? 'bg-coral/30 border-coral text-ink' : 'bg-peach/50 border-ink/10'
                  }`}
                >
                  <p className="text-xs font-bold text-ink/85">+{m} min Horizon</p>
                  <p className="text-2xl font-black mt-0.5">{val}</p>
                  <p className="text-[11px] font-bold text-ink/80">{p}% Capacity</p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between text-xs font-semibold text-ink/85 border-t border-ink/10 pt-3">
            <p className="flex items-center gap-1.5">
              <Clock size={13} />
              Recent residual error: E(t) = {observationHistory.slice(-1)[0]?.error ?? -2} · Rolling MAE: {errorMetrics.mae || 2.8}
            </p>
            <Link to="/counterfactual" className="font-bold text-ink hover:underline">
              Run Counterfactual Lab for this zone →
            </Link>
          </div>
        </div>

        {/* All Regions Quick List */}
        <OccupancyCard regions={regions} selected={selectedRegionId} onSelect={selectRegion} />
      </section>

      {/* Regional Risk Ranking Table */}
      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Regional Congestion Risk Ranking</h2>
            <p className="text-xs font-medium text-ink/80">
              Ranked by predicted capacity exceedance, time to threshold breach, queue growth, and downstream impact
            </p>
          </div>
          <span className="text-xs font-bold bg-peach px-2.5 py-1 rounded-full text-ink">
            Evaluated for Horizon +10 min
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-black text-ink/80 uppercase tracking-wider">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Service Region</th>
                <th className="py-2.5 px-3">Current</th>
                <th className="py-2.5 px-3">Forecast (+10m)</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Time to Threshold</th>
                <th className="py-2.5 px-3">Downstream Path</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {regions
                .map((r) => {
                  const f = forecasts[r.id]
                  const p10Val = f?.predictions?.[10] ?? r.current
                  const p10Util = Math.round((p10Val / r.capacity) * 100)
                  return {
                    region: r,
                    p10Val,
                    p10Util,
                    timeToBreach: f?.timeToThresholdMin != null ? `${f.timeToThresholdMin} min` : '>20 min',
                    risk: p10Util >= 85 ? 'Critical' : p10Util >= 70 ? 'High' : p10Util >= 50 ? 'Moderate' : 'Low'
                  }
                })
                .sort((a, b) => b.p10Util - a.p10Util)
                .map((row, idx) => (
                  <tr key={row.region.id} className="hover:bg-peach/20 transition">
                    <td className="py-2.5 px-3 font-bold text-ink/70">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-ink">
                      <button
                        onClick={() => selectRegion(row.region.id)}
                        className="hover:text-coral transition text-left"
                      >
                        {row.region.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      {row.region.current} / {row.region.capacity} ({Math.round((row.region.current / row.region.capacity) * 100)}%)
                    </td>
                    <td className="py-2.5 px-3 font-extrabold">
                      {row.p10Val} ({row.p10Util}%)
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          row.risk === 'Critical'
                            ? 'bg-ink text-cream'
                            : row.risk === 'High'
                            ? 'bg-coral text-ink'
                            : row.risk === 'Moderate'
                            ? 'bg-peach text-ink'
                            : 'bg-white border border-ink/20 text-ink'
                        }`}
                      >
                        {row.risk}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-xs font-semibold text-ink/90">
                      {row.timeToBreach}
                    </td>
                    <td className="py-2.5 px-3 text-xs font-medium text-ink/85">
                      {row.region.id === 'canteen-a' ? 'Corridor to Canteen B' : 'Local catchment'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to="/counterfactual"
                        onClick={() => selectRegion(row.region.id)}
                        className="btn bg-ink/10 hover:bg-ink hover:text-cream text-xs py-1 px-3 rounded-full"
                      >
                        Simulate
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Decision Summary & Alerts Grid */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recommended Intervention Card */}
        {topRec ? (
          <div className="card !bg-ink card-dark text-cream relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-coral text-xs font-bold uppercase tracking-wider">
                <Sparkles size={16} /> Recommended Decision · Horizon +10m
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-cream">
                Objective Score: {topRec.objectiveScore}
              </span>
            </div>

            <h3 className="mt-3 text-2xl font-black">{topRec.label}</h3>
            <p className="mt-1.5 text-sm text-cream/90 font-medium">{topRec.reasoning}</p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-cream/80 font-bold text-[11px]">Target Peak</p>
                <p className="text-base font-extrabold mt-0.5">{topRec.metrics.peakOccupancy} students</p>
                <p className="text-[11px] text-coral font-bold">~{topRec.deltas?.occupancyPercentReduction || 22}% reduction</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-cream/80 font-bold text-[11px]">Downstream Risk</p>
                <p className="text-base font-extrabold mt-0.5">{topRec.metrics.downstreamRisk}</p>
                <p className="text-[11px] text-cream/85 font-medium">{topRec.metrics.downstreamPeakOcc} pax at dest</p>
              </div>
              <div className="rounded-xl bg-white/10 p-2.5">
                <p className="text-cream/80 font-bold text-[11px]">Staff Cost</p>
                <p className="text-base font-extrabold mt-0.5">{topRec.metrics.requiredStaff} staff</p>
                <p className="text-[11px] text-cream/85 font-medium">Cost: {topRec.metrics.resourceCost} pts</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
              <Link
                to="/orchestration"
                className="text-xs text-coral hover:underline font-bold flex items-center gap-1"
              >
                Inspect All 6 Scenarios & Dispatch Packages →
              </Link>
              <button
                onClick={handleQuickExecute}
                disabled={executing}
                className="btn bg-coral text-ink hover:bg-peach shadow-md font-extrabold text-xs py-2 px-4"
              >
                {executing ? 'Dispatching…' : 'Approve & Dispatch'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card">No recommendation available.</div>
        )}

        {/* Live Alerts Panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-ink">Active System Alerts</h2>
              <p className="text-xs font-medium text-ink/80">Threshold crossings, inflow spikes, and cascade alerts</p>
            </div>
            <Link to="/alerts" className="text-xs font-bold text-coral hover:underline">
              View All ({alerts.length})
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((a) => (
              <AlertCard key={a.id} alert={a} onDismiss={dismissAlert} />
            ))}
            {alerts.length === 0 && (
              <div className="rounded-2xl bg-white/60 p-6 text-center text-sm font-semibold text-ink/80">
                All clear. No active alerts across campus service zones.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
