import { useState } from 'react'
import {
  MapPin,
  Users,
  Clock,
  Sparkles,
  Shield,
  Layers,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Ticket
} from 'lucide-react'
import CampusMap from '../components/CampusMap.jsx'
import StatCard from '../components/StatCard.jsx'

export default function CampusMapPage({ campus }) {
  const {
    regions = [],
    regionsMap = {},
    forecasts = {},
    selectedRegionId,
    selectRegion,
    advanceStep,
    triggerSpike,
    resetAll,
    simulationClock = '1:15 PM',
    stepCount = 0,
    alerts = []
  } = campus

  const totalOccupancy = regions.reduce((sum, r) => sum + (r.current || 0), 0)
  const totalCapacity = regions.reduce((sum, r) => sum + (r.capacity || 0), 0)
  const campusPct = Math.round((totalOccupancy / Math.max(1, totalCapacity)) * 100)

  // Annapurna details
  const annapurna = regionsMap['annapurna'] || {}
  const st1 = regionsMap['stationery-1'] || {}
  const st2 = regionsMap['stationery-2'] || {}
  const library = regionsMap['library'] || {}

  return (
    <div className="space-y-6">
      {/* Page Header with Real-Time Clock & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-coral/20 text-coral">
              <MapPin size={22} />
            </span>
            <h1 className="text-3xl font-black tracking-tight text-ink">
              VNR VJIET Digital Twin Map
            </h1>
          </div>
          <p className="text-sm font-semibold text-ink/75 mt-1">
            Top-down interactive spatial blueprint and dynamic crowd orchestration system.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white shadow-xs border border-ink/10 text-xs font-bold text-ink flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Clock: {simulationClock}</span>
          </div>

          <button
            onClick={advanceStep}
            className="btn bg-coral hover:bg-coral/90 text-ink shadow-sm text-xs py-2 px-3.5 font-bold"
            title="Advance +5 minutes"
          >
            <Play size={14} />
            +5m Step
          </button>

          <button
            onClick={() => triggerSpike('stationery-1')}
            className="btn bg-amber-500 hover:bg-amber-600 text-white shadow-sm text-xs py-2 px-3.5 font-bold"
            title="Trigger Queue Surge"
          >
            <Zap size={14} />
            Spike
          </button>

          <button
            onClick={resetAll}
            className="btn bg-white hover:bg-cream text-ink border border-ink/10 text-xs py-2 px-3 font-bold"
            title="Reset Campus Simulation"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Key Campus Facility Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div
          onClick={() => selectRegion('annapurna')}
          className={`card p-4 cursor-pointer transition ${
            selectedRegionId === 'annapurna' ? 'ring-2 ring-coral bg-peach/30' : 'bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-ink/70">
            <span>ANNAPURNA CANTEEN</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold">
              Dining
            </span>
          </div>
          <p className="text-2xl font-black text-ink mt-1">
            {annapurna.current || 144}
            <span className="text-xs font-semibold text-ink/60 ml-1">/ {annapurna.capacity || 180}</span>
          </p>
          <p className="text-xs text-ink/75 font-semibold mt-1">
            Queue: <strong className="text-coral">{annapurna.queue || 14}</strong> waiting (~{annapurna.estimatedWaitMin || 6} min)
          </p>
        </div>

        <div
          onClick={() => selectRegion('stationery-1')}
          className={`card p-4 cursor-pointer transition ${
            selectedRegionId === 'stationery-1' ? 'ring-2 ring-coral bg-peach/30' : 'bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-ink/70">
            <span>STATIONERY 1 (ABC)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">
              Crowded
            </span>
          </div>
          <p className="text-2xl font-black text-ink mt-1">
            {st1.current || 31}
            <span className="text-xs font-semibold text-ink/60 ml-1">/ {st1.capacity || 35}</span>
          </p>
          <p className="text-xs text-rose-700 font-bold mt-1">
            Queue: {st1.queue || 12} waiting (~14 min)
          </p>
        </div>

        <div
          onClick={() => selectRegion('stationery-2')}
          className={`card p-4 cursor-pointer transition ${
            selectedRegionId === 'stationery-2' ? 'ring-2 ring-coral bg-peach/30' : 'bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-ink/70">
            <span>STATIONERY 2 (BEHIND A)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
              Free
            </span>
          </div>
          <p className="text-2xl font-black text-ink mt-1">
            {st2.current || 11}
            <span className="text-xs font-semibold text-ink/60 ml-1">/ {st2.capacity || 30}</span>
          </p>
          <p className="text-xs text-emerald-700 font-bold mt-1">
            Queue: {st2.queue || 0} waiting (Zero Wait!)
          </p>
        </div>

        <div
          onClick={() => selectRegion('library')}
          className={`card p-4 cursor-pointer transition ${
            selectedRegionId === 'library' ? 'ring-2 ring-coral bg-peach/30' : 'bg-white/80 hover:bg-white'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-ink/70">
            <span>CENTRAL LIBRARY</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold">
              Study
            </span>
          </div>
          <p className="text-2xl font-black text-ink mt-1">
            {library.current || 118}
            <span className="text-xs font-semibold text-ink/60 ml-1">/ {library.capacity || 200}</span>
          </p>
          <p className="text-xs text-indigo-700 font-bold mt-1">
            Seats Open: {Math.max(0, (library.capacity || 200) - (library.current || 118))}
          </p>
        </div>
      </div>

      {/* Main Dynamic Synthetic Campus Map Component */}
      <CampusMap campus={campus} height="680px" />
    </div>
  )
}

