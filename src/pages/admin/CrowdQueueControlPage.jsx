import { useState, useMemo } from 'react'
import {
  Sliders,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Ticket,
  UserPlus,
  UserMinus,
  Plus,
  Minus,
  Pause,
  Play,
  ArrowRightLeft,
  Volume2,
  Lock,
  Unlock,
  Shield,
  Utensils,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  X
} from 'lucide-react'
import TopBar from '../../components/TopBar.jsx'
import { CAMPUS_NODES, getRegionById } from '../../engine/campusGraph.js'

export default function CrowdQueueControlPage({ campus }) {
  const {
    regionsMap = {},
    selectedRegionId = 'annapurna',
    selectRegion,
    facilitySettings = {},
    updateFacilitySettings,
    callNextToken,
    redirectCrowd,
    broadcastAnnouncement,
    actionHistory = []
  } = campus

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [actionFeedback, setActionFeedback] = useState(null)

  // Confirmation Modal State
  const [confirmDialog, setConfirmDialog] = useState(null)
  // Announcement Modal State
  const [showAnnounceModal, setShowAnnounceModal] = useState(false)
  const [announceTitle, setAnnounceTitle] = useState('')
  const [announceBody, setAnnounceBody] = useState('')
  // Redirect Modal State
  const [showRedirectModal, setShowRedirectModal] = useState(false)
  const [redirectDestId, setRedirectDestId] = useState('stationery-2')
  const [redirectPercent, setRedirectPercent] = useState(40)

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return CAMPUS_NODES.filter((node) => {
      const matchSearch =
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = categoryFilter === 'all' || node.category === categoryFilter
      return matchSearch && matchCat
    })
  }, [searchQuery, categoryFilter])

  const activeNode = regionsMap[selectedRegionId] || getRegionById(selectedRegionId)
  const activeConfig = facilitySettings[selectedRegionId] || {
    isOpen: true,
    isEntryRestricted: false,
    capacityLimit: activeNode.capacity || 200,
    activeCounters: activeNode.activeCounters || 2,
    assignedStaff: 2,
    tokensPaused: false
  }

  const occPct = Math.round(((activeNode.current || 0) / Math.max(1, activeConfig.capacityLimit || activeNode.capacity)) * 100)

  const showToast = (msg) => {
    setActionFeedback(msg)
    setTimeout(() => setActionFeedback(null), 4000)
  }

  // Action: Toggle Open/Close with confirmation
  const handleToggleOpen = () => {
    const nextState = !activeConfig.isOpen
    if (!nextState) {
      setConfirmDialog({
        title: `Close ${activeNode.name}?`,
        body: `Closing this facility will halt all turnstiles, pause token issuance, and notify arriving students.`,
        onConfirm: () => {
          updateFacilitySettings(selectedRegionId, { isOpen: false }, 'Closed Facility')
          setConfirmDialog(null)
          showToast(`Closed ${activeNode.name}. Entrances restricted.`)
        }
      })
    } else {
      updateFacilitySettings(selectedRegionId, { isOpen: true }, 'Opened Facility')
      showToast(`Opened ${activeNode.name}. Operations resumed.`)
    }
  }

  // Action: Toggle Entry Restriction with confirmation
  const handleToggleEntry = () => {
    const nextState = !activeConfig.isEntryRestricted
    if (nextState) {
      setConfirmDialog({
        title: `Restrict Entry at ${activeNode.name}?`,
        body: `Only students with active digital queue tokens will be admitted through turnstiles.`,
        onConfirm: () => {
          updateFacilitySettings(selectedRegionId, { isEntryRestricted: true }, 'Restricted Entry')
          setConfirmDialog(null)
          showToast(`Entry restricted at ${activeNode.name}. Turnstiles metering active.`)
        }
      })
    } else {
      updateFacilitySettings(selectedRegionId, { isEntryRestricted: false }, 'Restored Entry')
      showToast(`Normal entry restored at ${activeNode.name}.`)
    }
  }

  // Action: Adjust Active Counters
  const handleCounterChange = (delta) => {
    const curr = activeConfig.activeCounters || 2
    const next = Math.max(1, Math.min(activeNode.maxCounters || 6, curr + delta))
    updateFacilitySettings(selectedRegionId, { activeCounters: next }, delta > 0 ? 'Opened Counter' : 'Closed Counter')
    showToast(`Active counters adjusted to ${next} at ${activeNode.shortName}`)
  }

  // Action: Adjust Assigned Staff
  const handleStaffChange = (delta) => {
    const curr = activeConfig.assignedStaff || 1
    const next = Math.max(0, Math.min(10, curr + delta))
    updateFacilitySettings(selectedRegionId, { assignedStaff: next }, delta > 0 ? 'Assigned Staff' : 'Unassigned Staff')
    showToast(`Assigned staff updated to ${next} marshals at ${activeNode.shortName}`)
  }

  // Action: Toggle Token Generation
  const handleToggleTokens = () => {
    const nextState = !activeConfig.tokensPaused
    updateFacilitySettings(selectedRegionId, { tokensPaused: nextState }, nextState ? 'Paused Tokens' : 'Resumed Tokens')
    showToast(nextState ? `Paused token generation for ${activeNode.shortName}` : `Resumed token generation for ${activeNode.shortName}`)
  }

  // Action: Adjust Capacity Limit
  const handleCapacityChange = (newVal) => {
    const val = Number(newVal)
    if (isNaN(val) || val < 10) return
    updateFacilitySettings(selectedRegionId, { capacityLimit: val }, `Set Max Capacity: ${val}`)
  }

  // Action: Call Next Token
  const handleCallNextToken = () => {
    const called = callNextToken(selectedRegionId)
    if (called) {
      showToast(`Called token #${called.tokenCode} to serving counter! Queue remaining: ${activeNode.queue || 0}`)
    } else {
      showToast(`Queue line cleared at ${activeNode.shortName}`)
    }
  }

  // Action: Execute Redirection
  const handleExecuteRedirection = () => {
    redirectCrowd(selectedRegionId, redirectDestId, redirectPercent / 100)
    setShowRedirectModal(false)
    showToast(`Redirected ${redirectPercent}% queue from ${activeNode.shortName} to ${getRegionById(redirectDestId).shortName}`)
  }

  // Action: Broadcast Announcement
  const handleBroadcastAnnouncement = () => {
    if (!announceTitle.trim()) return
    broadcastAnnouncement({
      title: announceTitle,
      body: announceBody,
      severity: 'warning'
    })
    setAnnounceTitle('')
    setAnnounceBody('')
    setShowAnnounceModal(false)
    showToast(`Campus advisory broadcasted live to all students!`)
  }

  return (
    <div className="space-y-6">
      <TopBar
        title="Crowd & Queue Control"
        subtitle="Real-time facility management, entry restrictions, counters, and crowd redirection"
        campus={campus}
      />

      {/* Floating Action Toast */}
      {actionFeedback && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-[#130722] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-white/20 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 size={16} className="text-[#FFAE96]" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* 2-COLUMN OPERATIONAL INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Searchable Facility Selector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
          <div>
            <h3 className="font-black text-base text-ink mb-1">Campus Facilities</h3>
            <p className="text-xs font-semibold text-ink/60">
              Select a facility to inspect and adjust controls
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility name or block..."
              className="w-full pl-9 pr-3 py-2 rounded-2xl border border-ink/15 text-xs font-semibold text-ink placeholder:text-ink/40 focus:outline-coral"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {[
              { id: 'all', label: 'All' },
              { id: 'dining', label: 'Dining' },
              { id: 'service', label: 'Stationery' },
              { id: 'study', label: 'Library' },
              { id: 'academic', label: 'Academic' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-xl transition ${
                  categoryFilter === cat.id
                    ? 'bg-[#130722] text-white'
                    : 'bg-[#FAF7F2] text-ink/70 hover:text-ink'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Facility List */}
          <div className="divide-y divide-ink/5 max-h-[500px] overflow-y-auto space-y-1 pr-1">
            {filteredFacilities.map((node) => {
              const reg = regionsMap[node.id] || node
              const cfg = facilitySettings[node.id] || {}
              const isSelected = selectedRegionId === node.id
              const pct = Math.round(((reg.current || 0) / Math.max(1, reg.capacity || 100)) * 100)

              return (
                <div
                  key={node.id}
                  onClick={() => selectRegion(node.id)}
                  className={`p-3 rounded-2xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-peach/30 border border-coral/40 shadow-xs'
                      : 'hover:bg-cream/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-ink">{node.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        cfg.isOpen === false
                          ? 'bg-rose-100 text-rose-800'
                          : cfg.isEntryRestricted
                          ? 'bg-amber-100 text-amber-800'
                          : pct >= 80
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {cfg.isOpen === false ? 'Closed' : cfg.isEntryRestricted ? 'Restricted' : `${pct}% Full`}
                    </span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-ink/10 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        pct > 80 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-ink/60 font-semibold mt-2">
                    <span>Queue: <strong className="text-ink">{reg.queue || 0}</strong> people</span>
                    <span>Wait: ~<strong className="text-ink">{reg.estimatedWaitMin || 2}</strong>m</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Operational Control Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Facility Header */}
          <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-peach/40 text-coral">
                  {activeNode.category === 'dining' ? (
                    <Utensils size={20} />
                  ) : activeNode.category === 'study' ? (
                    <BookOpen size={20} />
                  ) : (
                    <ShoppingBag size={20} />
                  )}
                </span>
                <div>
                  <h2 className="text-xl font-black text-ink">{activeNode.name}</h2>
                  <p className="text-xs font-semibold text-ink/60">{activeNode.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRedirectModal(true)}
                className="btn bg-[#FAF7F2] hover:bg-cream text-ink text-xs font-bold py-2 px-3 border border-ink/10"
              >
                <ArrowRightLeft size={14} className="text-coral" />
                Redirect Flow
              </button>
              <button
                onClick={() => setShowAnnounceModal(true)}
                className="btn bg-coral hover:bg-coral/90 text-ink text-xs font-bold py-2 px-3"
              >
                <Volume2 size={14} />
                Announce
              </button>
            </div>
          </div>

          {/* 4 Status KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* 1. Occupancy vs Capacity */}
            <div className="bg-white p-4 rounded-3xl border border-ink/10 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-ink/60">
                <span>OCCUPANCY</span>
                <Users size={15} />
              </div>
              <p className="text-2xl font-black text-ink mt-1">
                {activeNode.current || 0}
                <span className="text-xs text-ink/60 font-semibold ml-1">/ {activeConfig.capacityLimit || activeNode.capacity}</span>
              </p>
              <p className="text-xs font-bold text-ink/70 mt-1">
                Utilization: <strong className={occPct >= 80 ? 'text-rose-600' : 'text-emerald-600'}>{occPct}%</strong>
              </p>
            </div>

            {/* 2. Queue Length & Next Token */}
            <div className="bg-white p-4 rounded-3xl border border-ink/10 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-ink/60">
                <span>QUEUE LINE</span>
                <Ticket size={15} />
              </div>
              <p className="text-2xl font-black text-coral mt-1">
                {activeNode.queue || 0}
                <span className="text-xs text-ink/60 font-semibold ml-1">waiting</span>
              </p>
              <button
                onClick={handleCallNextToken}
                className="mt-1.5 w-full btn bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1 px-2 justify-center rounded-xl"
              >
                Call Next ({activeNode.queue || 0})
              </button>
            </div>

            {/* 3. Serving Counters */}
            <div className="bg-white p-4 rounded-3xl border border-ink/10 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-ink/60">
                <span>ACTIVE COUNTERS</span>
                <Sliders size={15} />
              </div>
              <p className="text-2xl font-black text-ink mt-1">
                {activeConfig.activeCounters || 2}
                <span className="text-xs text-ink/60 font-semibold ml-1">/ {activeNode.maxCounters || 4}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  onClick={() => handleCounterChange(-1)}
                  className="flex-1 py-1 rounded-lg bg-cream font-bold text-xs hover:bg-coral text-ink"
                >
                  -
                </button>
                <button
                  onClick={() => handleCounterChange(1)}
                  className="flex-1 py-1 rounded-lg bg-cream font-bold text-xs hover:bg-coral text-ink"
                >
                  +
                </button>
              </div>
            </div>

            {/* 4. Assigned Staff */}
            <div className="bg-white p-4 rounded-3xl border border-ink/10 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-ink/60">
                <span>STAFF ON SITE</span>
                <Shield size={15} />
              </div>
              <p className="text-2xl font-black text-ink mt-1">
                {activeConfig.assignedStaff || 1}
                <span className="text-xs text-ink/60 font-semibold ml-1">marshals</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <button
                  onClick={() => handleStaffChange(-1)}
                  className="flex-1 py-1 rounded-lg bg-cream font-bold text-xs hover:bg-coral text-ink"
                >
                  -
                </button>
                <button
                  onClick={() => handleStaffChange(1)}
                  className="flex-1 py-1 rounded-lg bg-cream font-bold text-xs hover:bg-coral text-ink"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Real Operational Controls Panel */}
          <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <h3 className="font-black text-base text-ink">Operational Interventions</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
              {/* Facility Open / Close Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-ink/5 flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-ink">Facility Status</p>
                  <p className="text-ink/60 font-semibold mt-0.5">
                    {activeConfig.isOpen ? 'Facility is open and admitting visitors' : 'Facility is locked & closed'}
                  </p>
                </div>
                <button
                  onClick={handleToggleOpen}
                  className={`px-4 py-2 rounded-2xl font-black transition ${
                    activeConfig.isOpen
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                  }`}
                >
                  {activeConfig.isOpen ? 'Open' : 'Closed'}
                </button>
              </div>

              {/* Entry Restriction Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-ink/5 flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-ink">Turnstile Entry Flow</p>
                  <p className="text-ink/60 font-semibold mt-0.5">
                    {activeConfig.isEntryRestricted ? 'Restricted (Token pass required)' : 'Unrestricted open access'}
                  </p>
                </div>
                <button
                  onClick={handleToggleEntry}
                  className={`px-4 py-2 rounded-2xl font-black transition ${
                    activeConfig.isEntryRestricted
                      ? 'bg-amber-200 text-amber-950 hover:bg-amber-300'
                      : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                  }`}
                >
                  {activeConfig.isEntryRestricted ? 'Restricted' : 'Normal Flow'}
                </button>
              </div>

              {/* Token Generation Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-ink/5 flex items-center justify-between">
                <div>
                  <p className="font-black text-sm text-ink">Token Generation</p>
                  <p className="text-ink/60 font-semibold mt-0.5">
                    {activeConfig.tokensPaused ? 'Token kiosk paused for new users' : 'Accepting new queue tokens'}
                  </p>
                </div>
                <button
                  onClick={handleToggleTokens}
                  className={`px-4 py-2 rounded-2xl font-black transition ${
                    activeConfig.tokensPaused
                      ? 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                      : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
                  }`}
                >
                  {activeConfig.tokensPaused ? 'Paused' : 'Active'}
                </button>
              </div>

              {/* Maximum Capacity Slider */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-ink/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-ink">Max Capacity Limit</span>
                  <span className="text-coral font-black text-sm">{activeConfig.capacityLimit || activeNode.capacity}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="400"
                  step="5"
                  value={activeConfig.capacityLimit || activeNode.capacity}
                  onChange={(e) => handleCapacityChange(e.target.value)}
                  className="w-full accent-coral cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Operational Action History Table */}
          <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <h3 className="font-black text-base text-ink">Operational Action History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-ink/10 text-ink/50 uppercase font-bold text-[10px]">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Admin User</th>
                    <th className="pb-2">Facility</th>
                    <th className="pb-2">Action Taken</th>
                    <th className="pb-2">Details</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5 font-semibold text-ink">
                  {actionHistory.map((act) => (
                    <tr key={act.id} className="py-2.5">
                      <td className="py-2 text-ink/60">{act.timestamp}</td>
                      <td className="py-2">{act.adminUser}</td>
                      <td className="py-2 font-bold">{act.facilityName}</td>
                      <td className="py-2 text-coral">{act.actionType}</td>
                      <td className="py-2 text-ink/70">{act.details}</td>
                      <td className="py-2 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          {act.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-ink/10 space-y-4 text-center">
            <div className="size-12 rounded-full bg-rose-100 text-rose-700 mx-auto grid place-items-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-black text-lg text-ink">{confirmDialog.title}</h4>
              <p className="text-xs text-ink/70 font-semibold mt-1">{confirmDialog.body}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-2xl bg-cream text-ink font-bold text-xs hover:bg-ink/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 py-2.5 rounded-2xl bg-rose-600 text-white font-black text-xs hover:bg-rose-700 shadow-sm"
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Crowd Modal */}
      {showRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-ink/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-lg text-ink">Redirect Student Inflow</h4>
              <button onClick={() => setShowRedirectModal(false)} className="text-ink/40 hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs font-semibold text-ink/70">
              Divert a percentage of arriving students from <strong>{activeNode.name}</strong> to an alternative facility via digital signage and student app notifications.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink">Destination Facility:</label>
                <select
                  value={redirectDestId}
                  onChange={(e) => setRedirectDestId(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-ink/15 font-semibold text-xs"
                >
                  {CAMPUS_NODES.filter((n) => n.id !== selectedRegionId).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} (Current: {regionsMap[n.id]?.current || 20}/{n.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="font-bold text-ink">Redirection Percentage:</label>
                  <span className="font-black text-coral">{redirectPercent}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={redirectPercent}
                  onChange={(e) => setRedirectPercent(Number(e.target.value))}
                  className="w-full mt-1 accent-coral"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRedirectModal(false)}
                className="px-4 py-2 text-xs font-bold text-ink/70 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRedirection}
                className="btn bg-coral hover:bg-coral/90 text-ink text-xs font-black py-2.5 px-4"
              >
                Execute Redirection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Announcement Modal */}
      {showAnnounceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-ink/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-lg text-ink">Broadcast Campus Announcement</h4>
              <button onClick={() => setShowAnnounceModal(false)} className="text-ink/40 hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              value={announceTitle}
              onChange={(e) => setAnnounceTitle(e.target.value)}
              placeholder="Announcement Title (e.g. Lunch Queue Advisory)"
              className="w-full rounded-2xl border border-ink/15 p-3 text-xs font-bold text-ink focus:outline-coral"
            />
            <textarea
              value={announceBody}
              onChange={(e) => setAnnounceBody(e.target.value)}
              placeholder="Message details sent to student portal..."
              rows={3}
              className="w-full rounded-2xl border border-ink/15 p-3 text-xs font-semibold text-ink focus:outline-coral"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAnnounceModal(false)}
                className="px-4 py-2 text-xs font-bold text-ink/70 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcastAnnouncement}
                className="btn bg-coral hover:bg-coral/90 text-ink text-xs font-black py-2.5 px-5"
              >
                Send to All Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

