import { useState } from 'react'
import {
  Radio,
  Camera,
  Wifi,
  DoorClosed,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Clock,
  Info
} from 'lucide-react'
import LocationSelector from '../components/LocationSelector.jsx'
import { status } from '../services/api.js'

export default function LiveMonitoringPage({ campus }) {
  const { regions, selectedRegionId, selectRegion, advanceStep } = campus
  const [selectedSubSensor, setSelectedSubSensor] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const selectedRegion = regions.find((r) => r.id === selectedRegionId) || regions[0]
  const sensorData = selectedRegion.sensorData || {}
  const raw = sensorData.raw || {}

  const handleSimulatePoll = () => {
    setRefreshing(true)
    advanceStep()
    setTimeout(() => setRefreshing(false), 300)
  }

  const pct = Math.round((selectedRegion.current / selectedRegion.capacity) * 100)
  const currentStatus = status(pct)

  // Simulated live event feed for multi-modal sensor changes
  const liveEvents = [
    {
      id: 'ev-1',
      time: '12:51:04',
      region: 'Canteen A',
      sensor: 'CCTV Vision',
      type: 'Threshold Crossing',
      message: 'Visual bounding box count crossed 40 students in south dining corridor.',
      severity: 'warning'
    },
    {
      id: 'ev-2',
      time: '12:50:38',
      region: 'Canteen A',
      sensor: 'Wi-Fi AP-CA-02',
      type: 'Device Surge',
      message: 'Associated MAC probes surged from 34 to 48 devices in 90 seconds (corrected ~38 pax).',
      severity: 'info'
    },
    {
      id: 'ev-3',
      time: '12:49:15',
      region: 'Lecture Hall Complex',
      sensor: 'Turnstile Bank A',
      type: 'Rapid Outflow',
      message: 'Exit gate rotation rate peaked at 18 entries/min following lecture dismissal.',
      severity: 'info'
    },
    {
      id: 'ev-4',
      time: '12:48:02',
      region: 'Central Library',
      sensor: 'Fusion Layer',
      type: 'Temporal Alignment',
      message: 'Aligned CCTV and turnstile delta timestamps; measurement uncertainty reduced to ±3.',
      severity: 'success'
    },
    {
      id: 'ev-5',
      time: '12:46:20',
      region: 'Student Services',
      sensor: 'Wi-Fi Probe RSSI',
      type: 'Signal Variance',
      message: 'Wi-Fi signal attenuation observed; auto-compensated device ratio at 1.25x.',
      severity: 'info'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 bg-white/70 p-5 rounded-3xl border border-ink/10 shadow-soft">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/85">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Multi-Modal Sensor Fusion Layer</span>
            <span>·</span>
            <span className="text-coral font-bold">Simulated Demonstration Streams</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink mt-0.5">
            Real-Time State Estimation & Sensor Health
          </h1>
        </div>

        <button
          onClick={handleSimulatePoll}
          disabled={refreshing}
          className="btn bg-ink text-cream hover:bg-ink/85 shadow-sm text-xs py-2 px-4"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          Poll Sensor Ingestion Step
        </button>
      </header>

      {/* Region Selector */}
      <LocationSelector regions={regions} value={selectedRegionId} onChange={selectRegion} />

      {/* Primary Sensor Fusion Output for Selected Region */}
      <section className="card !bg-ink card-dark text-cream">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-coral text-xs font-bold uppercase tracking-wider">
              <Layers size={16} /> Minimum-Variance State Estimator
            </div>
            <h2 className="text-2xl font-black mt-1">
              {selectedRegion.name} · Fused Occupancy Telemetry
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              Latency: ~120ms
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                currentStatus === 'Critical'
                  ? 'bg-red-500 text-white'
                  : currentStatus === 'High'
                  ? 'bg-coral text-ink'
                  : 'bg-peach text-ink'
              }`}
            >
              Status: {currentStatus}
            </span>
          </div>
        </div>

        {/* Fused Metrics Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold text-cream/80">Fused Occupancy Estimate</p>
            <p className="text-4xl font-black text-coral mt-1">
              {sensorData.fusedOccupancy ?? selectedRegion.current}
              <span className="text-sm font-bold text-cream/85 ml-1.5">
                / {selectedRegion.capacity}
              </span>
            </p>
            <p className="text-xs font-bold mt-1 text-cream/90">
              {pct}% Capacity Utilization
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold text-cream/80">95% Confidence Interval</p>
            <p className="text-3xl font-black text-cream mt-1">
              [{sensorData.confidenceInterval ? sensorData.confidenceInterval[0] : selectedRegion.current - 3} –{' '}
              {sensorData.confidenceInterval ? sensorData.confidenceInterval[1] : selectedRegion.current + 3}]
            </p>
            <p className="text-xs font-bold mt-1 text-cream/90">
              Margin of Error: ±{sensorData.marginOfError || 3} students
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold text-cream/80">Fusion Confidence</p>
            <p className="text-3xl font-black text-cream mt-1">
              {Math.round((sensorData.confidence || 0.88) * 100)}%
            </p>
            <p className="text-xs font-bold mt-1 text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={13} /> Multi-signal alignment valid
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-bold text-cream/80">Active Modalities</p>
            <p className="text-3xl font-black text-cream mt-1">
              {raw.turnstile?.available ? '3 / 3 Sources' : '2 / 3 Sources'}
            </p>
            <p className="text-xs font-bold mt-1 text-cream/90">
              CCTV + Wi-Fi {raw.turnstile?.available ? '+ Turnstiles' : ''}
            </p>
          </div>
        </div>
      </section>

      {/* Raw Sensor Streams Grid */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Stream 1: CCTV */}
        <div className="card bg-white/80">
          <div className="flex items-center justify-between pb-3 border-b border-ink/10">
            <div className="flex items-center gap-2 font-bold text-ink text-sm">
              <Camera size={18} className="text-ink" />
              <span>CCTV Vision Count</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Healthy
            </span>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Active Cameras:</span>
              <span className="font-bold text-ink">{raw.cctv?.activeCameras || 3} optical nodes</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Raw Bounding Boxes:</span>
              <span className="font-bold text-ink">{raw.cctv?.rawDetections || Math.round(selectedRegion.current * 0.7)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">FOV Extrapolated:</span>
              <span className="font-extrabold text-ink">{raw.cctv?.estimatedTotal || selectedRegion.current} pax</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Model Confidence:</span>
              <span className="font-bold text-ink">{Math.round((raw.cctv?.confidence || 0.88) * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Processing Latency:</span>
              <span className="font-bold text-xs text-ink/90">140ms (Edge TPU)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-ink/10 text-xs font-medium text-ink/80">
            Field-of-view occlusion correction active. High confidence in open seating zones.
          </div>
        </div>

        {/* Stream 2: Wi-Fi Aggregate */}
        <div className="card bg-white/80">
          <div className="flex items-center justify-between pb-3 border-b border-ink/10">
            <div className="flex items-center gap-2 font-bold text-ink text-sm">
              <Wifi size={18} className="text-ink" />
              <span>Wi-Fi Probe Density</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Healthy
            </span>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Active Access Points:</span>
              <span className="font-bold text-ink">{raw.wifi?.activeAPs || 2} Cisco APs</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Raw MAC Addresses:</span>
              <span className="font-bold text-ink">{raw.wifi?.connectedMacAddresses || Math.round(selectedRegion.current * 1.1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Device Multiplier:</span>
              <span className="font-bold text-ink">1.25x devices/pax</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Corrected People Est.:</span>
              <span className="font-extrabold text-ink">{raw.wifi?.estimatedTotal || selectedRegion.current} pax</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Sampling Latency:</span>
              <span className="font-bold text-xs text-ink/90">2.5s batch polling</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-ink/10 text-xs font-medium text-ink/80">
            Accounts for multiple devices and random MAC rotation. Higher variance than optical feeds.
          </div>
        </div>

        {/* Stream 3: Turnstile Gates */}
        <div className="card bg-white/80">
          <div className="flex items-center justify-between pb-3 border-b border-ink/10">
            <div className="flex items-center gap-2 font-bold text-ink text-sm">
              <DoorClosed size={18} className="text-ink" />
              <span>Turnstile In/Out Counters</span>
            </div>
            <span
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                raw.turnstile?.available
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-amber-700 bg-amber-100'
              }`}
            >
              {raw.turnstile?.available ? 'Available' : 'Uninstrumented'}
            </span>
          </div>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Active Turnstiles:</span>
              <span className="font-bold text-ink">{raw.turnstile?.activeGates || 0} gates</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Cumulative Differential:</span>
              <span className="font-bold text-ink">
                {raw.turnstile?.available ? `${raw.turnstile.estimatedTotal} pax` : 'N/A (Open corridor)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Measurement Drift:</span>
              <span className="font-bold text-ink">{raw.turnstile?.available ? '±1 drift / hr' : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Sensor Confidence:</span>
              <span className="font-bold text-ink">{raw.turnstile?.available ? '93%' : '0%'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-ink/80">Latency:</span>
              <span className="font-bold text-xs text-ink/90">50ms (Relay pulse)</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-ink/10 text-xs font-medium text-ink/80">
            {raw.turnstile?.available
              ? 'Discrete physical barriers provide high accuracy boundary integration.'
              : 'Zone has open architectural ingress; relying primarily on CCTV + Wi-Fi fusion.'}
          </div>
        </div>
      </section>

      {/* Network Flow & Sensor Health Summary Matrix */}
      <section className="card">
        <h2 className="text-lg font-bold text-ink mb-1">Campus-Wide Flow Rates & Sensor Status</h2>
        <p className="text-xs font-medium text-ink/80 mb-4">
          Real-time flow differential, queue accumulation, and sensor health across all 7 regions
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs font-black text-ink/80 uppercase tracking-wider">
                <th className="py-2.5 px-3">Service Region</th>
                <th className="py-2.5 px-3">Occupancy</th>
                <th className="py-2.5 px-3">Arrival Rate</th>
                <th className="py-2.5 px-3">Departure Rate</th>
                <th className="py-2.5 px-3">Net Flow (dO/dt)</th>
                <th className="py-2.5 px-3">Queue Length</th>
                <th className="py-2.5 px-3">Sensors Active</th>
                <th className="py-2.5 px-3">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {regions.map((r) => {
                const arr = r.arrivalRate || 12
                const dep = (r.departureRate || 10) + ((r.activeCounters || 2) * 6)
                const net = arr - dep
                const pctR = Math.round((r.current / r.capacity) * 100)

                return (
                  <tr key={r.id} className="hover:bg-peach/20 transition">
                    <td className="py-2.5 px-3 font-bold text-ink">
                      <button onClick={() => selectRegion(r.id)} className="hover:underline">
                        {r.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      {r.current} / {r.capacity} ({pctR}%)
                    </td>
                    <td className="py-2.5 px-3 text-ink/80">+{arr} pax / 5m</td>
                    <td className="py-2.5 px-3 text-ink/80">-{dep} pax / 5m</td>
                    <td className="py-2.5 px-3 font-bold">
                      <span className={net > 0 ? 'text-coral' : 'text-emerald-700'}>
                        {net > 0 ? `+${net}` : net} / 5m
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold">{r.queue || 0} waiting</td>
                    <td className="py-2.5 px-3 text-xs font-bold text-ink/80">
                      {r.sensorCoverage?.cctv || 3} CAM · {r.sensorCoverage?.wifiAPs || 2} AP · {r.sensorCoverage?.turnstiles || 0} GATE
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <span className="size-2 rounded-full bg-emerald-500" /> Operational
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Live Event Stream */}
      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Live Telemetry Event Log</h2>
            <p className="text-xs font-medium text-ink/80">
              Sensor threshold crossings, arrival spikes, and temporal alignment events
            </p>
          </div>
          <span className="text-xs font-bold bg-peach px-2.5 py-1 rounded-full text-ink">
            Live Stream
          </span>
        </div>

        <div className="divide-y divide-ink/10">
          {liveEvents.map((ev) => (
            <div key={ev.id} className="py-3 flex flex-wrap items-start justify-between gap-2 text-sm">
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-ink/80 mt-0.5">{ev.time}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{ev.region}</span>
                    <span className="text-xs bg-ink/10 text-ink px-2 py-0.5 rounded-full font-bold">
                      {ev.sensor}
                    </span>
                    <span className="text-xs font-black text-coral">{ev.type}</span>
                  </div>
                  <p className="text-xs font-medium text-ink/90 mt-1">{ev.message}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                Processed
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
