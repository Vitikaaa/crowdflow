import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Ticket,
  Clock,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Sliders,
  Sparkles,
  Utensils,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  X,
  Plus,
  UserPlus,
  Pause,
  Play,
  ArrowRightLeft,
  Volume2,
  CheckCircle2,
  ChevronRight
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
import VnrCampusMap from '../../components/VnrCampusMap.jsx'

export default function CampusOverviewPage({ campus }) {
  const navigate = useNavigate()
  const {
    regionsMap = {},
    selectedRegionId = 'annapurna',
    selectRegion,
    updateFacilitySettings,
    facilitySettings = {},
    callNextToken,
    redirectCrowd,
    alerts = []
  } = campus

  const [activeTab, setActiveTab] = useState('status') // 'status' | 'controls'
  const [actionToast, setActionToast] = useState(null)
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [noticeText, setNoticeText] = useState('')

  const activeBuilding = regionsMap[selectedRegionId] || regionsMap['annapurna'] || {}
  const activeSettings = facilitySettings[selectedRegionId] || {
    isOpen: true,
    isEntryRestricted: false,
    activeCounters: activeBuilding.activeCounters || 2,
    capacityLimit: activeBuilding.capacity || 200,
    tokensPaused: false
  }

  // Calculate live occupancy percentage
  const occPct = Math.round(((activeBuilding.current || 164) / Math.max(1, activeBuilding.capacity || 200)) * 100)

  // Show transient toast for quick actions
  const triggerFeedback = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 3500)
  }

  // Quick Action handlers matching image
  const handleOpenCounter = () => {
    const nextCounters = Math.min(activeBuilding.maxCounters || 4, (activeSettings.activeCounters || 2) + 1)
    updateFacilitySettings(selectedRegionId, { activeCounters: nextCounters }, 'Opened Additional Counter')
    triggerFeedback(`Activated Counter #${nextCounters} at ${activeBuilding.shortName || 'Facility'}`)
  }

  const handleAssignStaff = () => {
    updateFacilitySettings(selectedRegionId, { assignedStaff: (activeSettings.assignedStaff || 1) + 1 }, 'Assigned Queue Marshal')
    triggerFeedback(`Assigned +1 crowd marshal to ${activeBuilding.shortName || 'Facility'}`)
  }

  const handleToggleTokens = () => {
    const nextState = !activeSettings.tokensPaused
    updateFacilitySettings(selectedRegionId, { tokensPaused: nextState }, nextState ? 'Paused Token Issuance' : 'Resumed Token Issuance')
    triggerFeedback(nextState ? `Paused token issuance for ${activeBuilding.shortName}` : `Resumed token generation for ${activeBuilding.shortName}`)
  }

  const handleRedirectCrowd = () => {
    redirectCrowd('stationery-1', 'stationery-2', 0.45)
    triggerFeedback('Diverted 45% incoming crowd to Stationery 2. Signage updated.')
  }

  const handleSendNoticeSubmit = () => {
    if (!noticeText.trim()) return
    campus.broadcastAnnouncement({
      title: `${activeBuilding.name}: Operational Notice`,
      body: noticeText,
      severity: 'warning'
    })
    setNoticeText('')
    setShowNoticeModal(false)
    triggerFeedback('Campus advisory broadcasted to student app.')
  }

  // Forecast data matching the line chart in image
  const forecastData = [
    { time: '12:45', observed: 108, forecast: null },
    { time: '12:50', observed: 136, forecast: null },
    { time: '12:55', observed: 164, forecast: 164 },
    { time: '+5m', observed: null, forecast: 148 },
    { time: '+10m', observed: null, forecast: 132 },
    { time: '+15m', observed: null, forecast: 118 }
  ]

  return (
    <div className="space-y-6">
      {/* Top Bar Header matching image */}
      <TopBar
        title="Campus Overview"
        subtitle="Live crowd conditions, queues and facility status across VNR VJIET"
        campus={campus}
      />

      {/* Floating Action Feedback Toast */}
      {actionToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-[#130722] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-[#FFAE96]" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* 4 TOP-LEVEL KPI CARDS MATCHING IMAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Campus Occupancy */}
        <div className="bg-white p-5 rounded-3xl border border-ink/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-600 grid place-items-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink/65 uppercase tracking-wider">
              Campus Occupancy
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-ink">62%</span>
              <span className="text-xs font-extrabold text-emerald-600 flex items-center">
                <ArrowDown size={12} /> -5% (15m)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Queues */}
        <div className="bg-white p-5 rounded-3xl border border-ink/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 grid place-items-center shrink-0">
            <Ticket size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink/65 uppercase tracking-wider">
              Active Queues
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-ink">3</span>
              <span className="text-[11px] font-semibold text-ink/60 truncate">
                (Canteen, Stationery 1, Stationery 2)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Avg. Waiting Time */}
        <div className="bg-white p-5 rounded-3xl border border-ink/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-amber-50 text-amber-600 grid place-items-center shrink-0">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink/65 uppercase tracking-wider">
              Avg. Waiting Time
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-ink">6 min</span>
              <span className="text-xs font-extrabold text-emerald-600 flex items-center">
                <ArrowDown size={12} /> -2 min
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Critical Facilities */}
        <div className="bg-white p-5 rounded-3xl border border-ink/5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-ink/65 uppercase tracking-wider">
              Critical Facilities
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-ink">1</span>
              <span className="text-[11px] font-bold text-rose-600">
                (Annapurna – High)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: 3D CAMPUS MAP + FACILITY ACTION PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive 3D Isometric Campus Map (8 cols) */}
        <div className="lg:col-span-8">
          <VnrCampusMap
            campus={campus}
            selectedId={selectedRegionId}
            onSelect={selectRegion}
            height="530px"
          />
        </div>

        {/* Right: Facility Status & Action Panel matching image (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-ink/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5 flex flex-col justify-between">
          <div>
            {/* Header: Icon, Name, Category, Status pill, Close button */}
            <div className="flex items-start justify-between pb-4 border-b border-ink/10">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-rose-50 text-rose-600 grid place-items-center shrink-0">
                  <Utensils size={22} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-ink leading-tight">
                    {activeBuilding.name || 'Annapurna Canteen'}
                  </h3>
                  <p className="text-xs font-semibold text-ink/60">
                    {activeBuilding.category === 'dining' ? 'Food & Beverages' : activeBuilding.type || 'Campus Facility'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-black">
                  {occPct >= 80 ? 'High Crowd' : occPct >= 60 ? 'Moderate' : 'Normal'}
                </span>
                <button
                  onClick={() => selectRegion('annapurna')}
                  className="p-1 rounded-lg text-ink/40 hover:text-ink hover:bg-cream"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Tab Pills: Live Status | Controls */}
            <div className="flex items-center bg-[#FAF7F2] p-1 rounded-2xl mt-4">
              <button
                onClick={() => setActiveTab('status')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === 'status'
                    ? 'bg-[#130722] text-white shadow-xs'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                Live Status
              </button>
              <button
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  activeTab === 'controls'
                    ? 'bg-[#130722] text-white shadow-xs'
                    : 'text-ink/70 hover:text-ink'
                }`}
              >
                Controls
              </button>
            </div>

            {activeTab === 'status' ? (
              <div className="mt-4 space-y-4">
                {/* Circular Percentage Ring + 4 Metrics Grid */}
                <div className="flex items-center gap-4">
                  {/* Circular Progress Gauge */}
                  <div className="relative size-20 rounded-full flex items-center justify-center shrink-0">
                    <svg className="size-20 -rotate-90">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#F1ECE3" strokeWidth="6" />
                      <circle
                        cx="40"
                        cy="40"
                        r="32"
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="6"
                        strokeDasharray={2 * Math.PI * 32}
                        strokeDashoffset={2 * Math.PI * 32 * (1 - occPct / 100)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-black text-lg text-ink">
                      {occPct}%
                    </span>
                  </div>

                  {/* 4 Details Grid matching image */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs flex-1">
                    <div>
                      <p className="text-ink/50 text-[10px] font-bold uppercase">Occupancy</p>
                      <p className="font-black text-ink text-sm">
                        {activeBuilding.current || 164} / {activeBuilding.capacity || 200}
                      </p>
                    </div>
                    <div>
                      <p className="text-ink/50 text-[10px] font-bold uppercase">Queue Length</p>
                      <p className="font-black text-ink text-sm">
                        {activeBuilding.queue || 28} people
                      </p>
                    </div>
                    <div>
                      <p className="text-ink/50 text-[10px] font-bold uppercase">Est. Waiting Time</p>
                      <p className="font-black text-ink text-sm">
                        {activeBuilding.estimatedWaitMin || 12} min
                      </p>
                    </div>
                    <div>
                      <p className="text-ink/50 text-[10px] font-bold uppercase">Active Counters</p>
                      <p className="font-black text-ink text-sm">
                        {activeSettings.activeCounters || 2} / {activeBuilding.maxCounters || 3}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions (3x2 Grid matching image) */}
                <div>
                  <p className="text-xs font-black text-ink uppercase tracking-wider mb-2">
                    Quick Actions
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleOpenCounter}
                      className="p-2.5 rounded-2xl border border-ink/10 hover:border-coral hover:bg-cream transition flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <Plus size={16} className="text-ink" />
                      <span className="text-[10px] font-bold text-ink leading-tight">Open Counter</span>
                    </button>
                    <button
                      onClick={handleAssignStaff}
                      className="p-2.5 rounded-2xl border border-ink/10 hover:border-coral hover:bg-cream transition flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <UserPlus size={16} className="text-ink" />
                      <span className="text-[10px] font-bold text-ink leading-tight">Assign Staff</span>
                    </button>
                    <button
                      onClick={handleToggleTokens}
                      className="p-2.5 rounded-2xl border border-ink/10 hover:border-coral hover:bg-cream transition flex flex-col items-center justify-center gap-1 text-center"
                    >
                      {activeSettings.tokensPaused ? <Play size={16} className="text-emerald-600" /> : <Pause size={16} className="text-ink" />}
                      <span className="text-[10px] font-bold text-ink leading-tight">
                        {activeSettings.tokensPaused ? 'Resume Tokens' : 'Pause Tokens'}
                      </span>
                    </button>
                    <button
                      onClick={handleRedirectCrowd}
                      className="p-2.5 rounded-2xl border border-ink/10 hover:border-coral hover:bg-cream transition flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <ArrowRightLeft size={16} className="text-ink" />
                      <span className="text-[10px] font-bold text-ink leading-tight">Redirect Crowd</span>
                    </button>
                    <button
                      onClick={() => navigate('/admin/control')}
                      className="p-2.5 rounded-2xl border border-ink/10 hover:border-coral hover:bg-cream transition flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <Sliders size={16} className="text-ink" />
                      <span className="text-[10px] font-bold text-ink leading-tight">Set Limit</span>
                    </button>
                    <button
                      onClick={() => setShowNoticeModal(true)}
                      className="p-2.5 rounded-2xl border border-ink/10 hover:border-coral hover:bg-cream transition flex flex-col items-center justify-center gap-1 text-center"
                    >
                      <Volume2 size={16} className="text-ink" />
                      <span className="text-[10px] font-bold text-ink leading-tight">Send Notice</span>
                    </button>
                  </div>
                </div>

                {/* Predicted Impact (Next 15 min) matching image */}
                <div className="bg-[#FAF7F2] p-3 rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-extrabold text-ink">Predicted Impact <span className="text-ink/60 font-semibold">(Next 15 min)</span></span>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-emerald-600 flex items-center gap-0.5">
                      <ArrowDown size={13} /> Queue -38%
                    </span>
                    <span className="font-black text-emerald-600 flex items-center gap-0.5">
                      <ArrowDown size={13} /> Wait -5 min
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Direct Operational Controls Tab */
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2]">
                  <span className="font-bold text-ink">Operational Status</span>
                  <button
                    onClick={() =>
                      updateFacilitySettings(selectedRegionId, { isOpen: !activeSettings.isOpen }, 'Toggled Facility Status')
                    }
                    className={`px-3 py-1 rounded-full font-black ${
                      activeSettings.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeSettings.isOpen ? 'Open' : 'Closed'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2]">
                  <span className="font-bold text-ink">Entry Restriction</span>
                  <button
                    onClick={() =>
                      updateFacilitySettings(selectedRegionId, { isEntryRestricted: !activeSettings.isEntryRestricted }, 'Toggled Entry Restriction')
                    }
                    className={`px-3 py-1 rounded-full font-black ${
                      activeSettings.isEntryRestricted ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeSettings.isEntryRestricted ? 'Restricted' : 'Normal Flow'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2]">
                  <span className="font-bold text-ink">Serving Counters</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateFacilitySettings(selectedRegionId, { activeCounters: Math.max(1, (activeSettings.activeCounters || 2) - 1) }, 'Reduced Counter')
                      }
                      className="size-7 rounded-lg bg-white border border-ink/10 font-bold grid place-items-center hover:bg-cream"
                    >
                      -
                    </button>
                    <span className="font-black text-sm text-ink w-4 text-center">
                      {activeSettings.activeCounters || 2}
                    </span>
                    <button
                      onClick={() =>
                        updateFacilitySettings(selectedRegionId, { activeCounters: Math.min(activeBuilding.maxCounters || 4, (activeSettings.activeCounters || 2) + 1) }, 'Added Counter')
                      }
                      className="size-7 rounded-lg bg-white border border-ink/10 font-bold grid place-items-center hover:bg-cream"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const called = callNextToken(selectedRegionId)
                    triggerFeedback(called ? `Called token #${called.tokenCode}` : 'Next token called in line')
                  }}
                  className="w-full btn bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 justify-center rounded-2xl shadow-xs"
                >
                  <Ticket size={15} />
                  Call Next Token ({activeBuilding.queue || 0} waiting)
                </button>
              </div>
            )}
          </div>

          {/* Bottom Purple Button: "Run Scenario Comparison →" */}
          <button
            onClick={() => navigate('/admin/decisions')}
            className="w-full mt-4 py-3 px-4 rounded-2xl bg-[#4A1D8A] hover:bg-[#3B1570] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Sparkles size={15} className="text-[#FFAE96]" />
            <span>Run Scenario Comparison</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: CROWD FORECAST CHART + ACTIVE ALERTS MATCHING IMAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Crowd Forecast – Annapurna Canteen (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-ink" />
              <h3 className="font-black text-base text-ink">
                Crowd Forecast – Annapurna Canteen
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-ink">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#1E293B]" /> Observed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#F97316]" /> Forecast
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE3" vertical={false} />
                <XAxis dataKey="time" stroke="#706684" fontSize={11} fontWeight={600} tickLine={false} />
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
                  dataKey="observed"
                  stroke="#1E293B"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1E293B' }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#F97316' }}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Active Alerts matching image (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-ink" />
              <h3 className="font-black text-base text-ink">
                Active Alerts
              </h3>
            </div>

            <div className="space-y-2.5">
              {/* Alert 1: Red Critical Alert */}
              <div
                onClick={() => selectRegion('annapurna')}
                className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/60 cursor-pointer hover:bg-rose-50 transition flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                    <AlertTriangle size={15} />
                  </span>
                  <div>
                    <p className="font-extrabold text-xs text-rose-950">
                      High crowd at Annapurna Canteen
                    </p>
                    <p className="text-[11px] font-semibold text-rose-800 mt-0.5">
                      Occupancy at 82% &middot; Wait time ~12 min
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-rose-400 shrink-0 mt-1" />
              </div>

              {/* Alert 2: Yellow Warning Alert */}
              <div
                onClick={() => selectRegion('stationery-1')}
                className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 cursor-pointer hover:bg-amber-50 transition flex items-start justify-between gap-2"
              >
                <div className="flex items-start gap-2.5">
                  <span className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                    <AlertTriangle size={15} />
                  </span>
                  <div>
                    <p className="font-extrabold text-xs text-amber-950">
                      Stationery 1 nearing capacity
                    </p>
                    <p className="text-[11px] font-semibold text-amber-800 mt-0.5">
                      89% occupancy &middot; Consider redistribution
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-amber-400 shrink-0 mt-1" />
              </div>
            </div>
          </div>

          <p className="text-[11px] font-semibold text-ink/50 pt-2 text-right">
            Auto-refreshed via CF-ARNet
          </p>
        </div>
      </div>

      {/* Broadcast Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-ink/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-lg text-ink">Broadcast Campus Advisory</h4>
              <button onClick={() => setShowNoticeModal(false)} className="text-ink/40 hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <textarea
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="e.g. Annapurna counters are currently experiencing peak lines. Please consider Grab-and-Go or Stationery 2."
              rows={4}
              className="w-full rounded-2xl border border-ink/15 p-3 text-xs font-semibold text-ink focus:outline-coral"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowNoticeModal(false)}
                className="px-4 py-2 text-xs font-bold text-ink/70 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNoticeSubmit}
                className="btn bg-coral hover:bg-coral/90 text-ink text-xs font-extrabold py-2 px-5"
              >
                Dispatch to Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

