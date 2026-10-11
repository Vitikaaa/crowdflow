import { useState } from 'react'
import {
  Settings,
  Sliders,
  Database,
  Radio,
  RotateCcw,
  Save,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles
} from 'lucide-react'
import { DEFAULT_OBJECTIVE_WEIGHTS, OPERATIONAL_LIMITS } from '../engine/orchestration.js'
import { WIFI_DEVICE_RATIO } from '../engine/sensorFusion.js'

export default function SettingsPage({ campus }) {
  const { regions, objectiveWeights, updateWeights, resetAll, triggerSpike, advanceStep } = campus

  const [weights, setWeights] = useState({ ...objectiveWeights })
  const [wifiRatio, setWifiRatio] = useState(WIFI_DEVICE_RATIO)
  const [cctvConfCutoff, setCctvConfCutoff] = useState(70)
  const [savedNote, setSavedNote] = useState(null)

  const handleWeightChange = (key, val) => {
    setWeights((prev) => ({ ...prev, [key]: Number(val) }))
  }

  const handleSaveWeights = () => {
    updateWeights(weights)
    setSavedNote('Objective weights updated and applied to orchestration engine.')
    setTimeout(() => setSavedNote(null), 3500)
  }

  const handleReset = () => {
    resetAll()
    setSavedNote('Reset all campus twin states to default baseline.')
    setTimeout(() => setSavedNote(null), 3500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink/70">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            <span>Campus Digital Twin Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink mt-0.5">
            System Settings & Model Parameters
          </h1>
          <p className="text-xs text-ink/70 mt-1">
            Configure regional physical limits, multi-objective optimization weights, sensor fusion coefficients, and demo sandbox
          </p>
        </div>

        <button
          onClick={handleSaveWeights}
          className="btn bg-ink text-cream hover:bg-ink/85 shadow-sm text-xs py-2 px-4"
        >
          <Save size={14} /> Save Active Settings
        </button>
      </header>

      {savedNote && (
        <div className="rounded-2xl bg-emerald-100 border border-emerald-300 p-3 text-sm text-emerald-900 font-semibold flex items-center justify-between">
          <span>✓ {savedNote}</span>
          <span className="text-xs opacity-75">Saved to local state</span>
        </div>
      )}

      {/* Objective Function Weights Tuning */}
      <section className="card bg-white/90">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-ink flex items-center gap-2">
              <Sliders size={18} className="text-coral" />
              Multi-Objective Function Weights J(a)
            </h2>
            <p className="text-xs text-ink/70">
              Tune optimization penalties for ranking candidate interventions. Lower loss = preferred decision.
            </p>
          </div>
          <span className="text-xs font-bold bg-peach px-2.5 py-1 rounded-full text-ink">
            Configurable Policy
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Capacity Exceedance Weight */}
          <div className="rounded-2xl bg-peach/30 p-4 border border-ink/10">
            <div className="flex justify-between text-xs font-bold text-ink mb-1">
              <span>w_exceed (Safety Exceedance)</span>
              <span className="text-coral font-black text-sm">{weights.capacityExceedance}</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={weights.capacityExceedance}
              onChange={(e) => handleWeightChange('capacityExceedance', e.target.value)}
              className="w-full accent-coral cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Heavy penalty for exceeding safety room limits</p>
          </div>

          {/* Downstream Risk Weight */}
          <div className="rounded-2xl bg-peach/30 p-4 border border-ink/10">
            <div className="flex justify-between text-xs font-bold text-ink mb-1">
              <span>w_downstream (Transfer Risk)</span>
              <span className="text-coral font-black text-sm">{weights.downstreamRisk}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.downstreamRisk}
              onChange={(e) => handleWeightChange('downstreamRisk', e.target.value)}
              className="w-full accent-coral cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Prevents interventions that overload destination zones</p>
          </div>

          {/* Wait Time Weight */}
          <div className="rounded-2xl bg-peach/30 p-4 border border-ink/10">
            <div className="flex justify-between text-xs font-bold text-ink mb-1">
              <span>w_wait (Queue Delay)</span>
              <span className="text-coral font-black text-sm">{weights.waitTime}</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={weights.waitTime}
              onChange={(e) => handleWeightChange('waitTime', e.target.value)}
              className="w-full accent-coral cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Penalizes long queue wait times</p>
          </div>

          {/* Operational Cost Weight */}
          <div className="rounded-2xl bg-peach/30 p-4 border border-ink/10">
            <div className="flex justify-between text-xs font-bold text-ink mb-1">
              <span>w_cost (Staff & Resources)</span>
              <span className="text-coral font-black text-sm">{weights.operationalCost}</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.operationalCost}
              onChange={(e) => handleWeightChange('operationalCost', e.target.value)}
              className="w-full accent-coral cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Considers staff budget and counter activation cost</p>
          </div>

          {/* Walking Distance Penalty */}
          <div className="rounded-2xl bg-peach/30 p-4 border border-ink/10">
            <div className="flex justify-between text-xs font-bold text-ink mb-1">
              <span>w_walk (Detour Inconvenience)</span>
              <span className="text-coral font-black text-sm">{weights.walkingImpact}</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={weights.walkingImpact}
              onChange={(e) => handleWeightChange('walkingImpact', e.target.value)}
              className="w-full accent-coral cursor-pointer"
            />
            <p className="text-[11px] text-ink/60 mt-1">Penalizes student walking distance detour</p>
          </div>

          {/* Reset weights */}
          <div className="rounded-2xl bg-white p-4 border border-ink/10 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold text-ink">Restore Factory Weights</p>
              <p className="text-[11px] text-ink/70 mt-1">
                Revert objective coefficients to baseline research configuration.
              </p>
            </div>
            <button
              onClick={() => setWeights({ ...DEFAULT_OBJECTIVE_WEIGHTS })}
              className="btn bg-ink/10 text-ink text-xs py-1.5 px-3 rounded-full mt-2 self-start"
            >
              Reset Weights
            </button>
          </div>
        </div>
      </section>

      {/* Sensor Fusion Calibration */}
      <section className="card bg-white/90">
        <h2 className="text-lg font-black text-ink mb-1">Sensor Fusion Parameters</h2>
        <p className="text-xs text-ink/70 mb-4">
          Calibration factors for CCTV optical detection, Wi-Fi device attenuation, and Turnstiles
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl bg-cream p-4 border border-ink/10">
            <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
              Wi-Fi Device Multiplier
            </label>
            <p className="text-xs text-ink/70 mb-2">Devices per human student (smartphones, laptops):</p>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="2.0"
              value={wifiRatio}
              onChange={(e) => setWifiRatio(Number(e.target.value))}
              className="w-full rounded-xl bg-white border border-ink/20 p-2 text-sm font-bold text-ink"
            />
          </div>

          <div className="rounded-2xl bg-cream p-4 border border-ink/10">
            <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
              CCTV Min. Confidence Cutoff
            </label>
            <p className="text-xs text-ink/70 mb-2">Rejection threshold for optical detections (%):</p>
            <input
              type="number"
              min="50"
              max="95"
              value={cctvConfCutoff}
              onChange={(e) => setCctvConfCutoff(Number(e.target.value))}
              className="w-full rounded-xl bg-white border border-ink/20 p-2 text-sm font-bold text-ink"
            />
          </div>

          <div className="rounded-2xl bg-cream p-4 border border-ink/10 flex flex-col justify-between">
            <div>
              <label className="text-xs font-bold text-ink uppercase tracking-wider block mb-1">
                Sensor State
              </label>
              <p className="text-xs text-emerald-800 font-bold flex items-center gap-1 mt-2">
                <CheckCircle2 size={16} /> All 3 Modalities Synchronized
              </p>
            </div>
            <p className="text-[11px] text-ink/60 mt-2">Temporal Kalman alignment active.</p>
          </div>
        </div>
      </section>

      {/* Demonstration Sandbox Controls */}
      <section className="card bg-ink text-cream">
        <div className="flex items-center gap-2 text-coral text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles size={16} /> Demonstration & Research Sandbox
        </div>
        <h2 className="text-xl font-black text-cream">Demonstration Controls</h2>
        <p className="text-xs text-cream/70 mb-5">
          Simulate real-time operational events, class dismissals, and full data resets for live walk-throughs
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={advanceStep}
            className="btn bg-coral text-ink hover:bg-peach font-bold text-xs py-2 px-4 shadow-sm"
          >
            Advance Time (+5 Min)
          </button>
          <button
            onClick={triggerSpike}
            className="btn bg-white/20 text-cream hover:bg-white/30 font-bold text-xs py-2 px-4"
          >
            Trigger Canteen A Lunch Surge
          </button>
          <button
            onClick={handleReset}
            className="btn bg-white/10 text-cream hover:bg-white/20 font-bold text-xs py-2 px-4"
          >
            <RotateCcw size={14} /> Reset Twin to Baseline
          </button>
        </div>
      </section>
    </div>
  )
}
