import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass,
  Search,
  Navigation,
  Clock,
  Users,
  Ticket,
  Sparkles,
  ArrowRight,
  Utensils,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  Trophy,
  CheckCircle2,
  X
} from 'lucide-react'
import TopBar from '../../components/TopBar.jsx'
import VnrCampusMap from '../../components/VnrCampusMap.jsx'
import { CAMPUS_NODES, getRegionById, findCampusRoute } from '../../engine/campusGraph.js'

export default function ExploreCampusPage({ campus }) {
  const navigate = useNavigate()
  const {
    regionsMap = {},
    selectedRegionId = 'annapurna',
    selectRegion,
    generateToken
  } = campus

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Route navigation
  const [routeFrom, setRouteFrom] = useState('block-a')
  const [routeTo, setRouteTo] = useState('annapurna')
  const [activeRouteInfo, setActiveRouteInfo] = useState({
    distanceM: 150,
    timeMin: 2.0
  })

  // Token Modal
  const [generatedTicket, setGeneratedTicket] = useState(null)
  const [toast, setToast] = useState(null)

  const activeBuilding = regionsMap[selectedRegionId] || getRegionById(selectedRegionId)
  const occPct = Math.round(((activeBuilding.current || 0) / Math.max(1, activeBuilding.capacity || 100)) * 100)

  // Filter facilities
  const filteredNodes = useMemo(() => {
    return CAMPUS_NODES.filter((n) => {
      const matchSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchCat = selectedCategory === 'all' || n.category === selectedCategory
      return matchSearch && matchCat
    })
  }, [searchQuery, selectedCategory])

  const handleRouteCalculate = (from, to) => {
    const route = findCampusRoute(from, to)
    setActiveRouteInfo({
      distanceM: route.totalDistanceM,
      timeMin: route.totalMinutes
    })
    selectRegion(to)
  }

  const handleQuickGetToken = (facilityId) => {
    if (generateToken) {
      const ticket = generateToken(facilityId)
      setGeneratedTicket(ticket)
    }
  }

  return (
    <div className="space-y-6">
      <TopBar
        title="Explore Campus"
        subtitle="Live crowd conditions, walking navigation, and estimated wait times at VNR VJIET"
        campus={campus}
      />

      {/* Floating Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-[#130722] text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold border border-white/20">
          <CheckCircle2 size={16} className="text-[#FFAE96]" />
          <span>{toast}</span>
        </div>
      )}

      {/* SMART ALTERNATIVE ADVISORY BANNER */}
      {regionsMap['stationery-1']?.queue > 8 && (
        <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
              <Sparkles size={18} />
            </span>
            <div>
              <p className="font-extrabold text-amber-950 text-sm">
                Stationery 1 is Busy &middot; Try Stationery 2!
              </p>
              <p className="text-amber-800 font-semibold mt-0.5">
                Stationery 2 (behind A Block) has only 1 min wait compared to 14 min at ABC Block.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setRouteFrom('stationery-1')
              setRouteTo('stationery-2')
              handleRouteCalculate('stationery-1', 'stationery-2')
            }}
            className="btn bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2 px-4 shrink-0 shadow-xs"
          >
            Show Walking Route
          </button>
        </div>
      )}

      {/* SEARCH BAR & CATEGORY CHIPS */}
      <div className="bg-white rounded-3xl border border-ink/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buildings, Central Library, Annapurna Canteen, Stationery..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-ink/15 text-xs font-semibold text-ink placeholder:text-ink/40 focus:outline-coral bg-[#FAF7F2]"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { id: 'all', label: 'All Facilities' },
            { id: 'dining', label: 'Annapurna Canteen', icon: Utensils },
            { id: 'service', label: 'Stationery 1 & 2', icon: ShoppingBag },
            { id: 'study', label: 'Central Library', icon: BookOpen },
            { id: 'academic', label: 'Academic Blocks', icon: GraduationCap },
            { id: 'recreation', label: 'Sports Court', icon: Trophy }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-2xl transition flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-coral text-ink shadow-xs font-extrabold'
                  : 'bg-[#FAF7F2] text-ink/70 hover:text-ink'
              }`}
            >
              {cat.icon && <cat.icon size={13} />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MAP & STUDENT EXPLORER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Campus Map (8 cols) */}
        <div className="lg:col-span-8">
          <VnrCampusMap
            campus={campus}
            selectedId={selectedRegionId}
            onSelect={selectRegion}
            mode="student"
            height="530px"
          />
        </div>

        {/* Selected Facility Details & Route Helper (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Facility Info Card */}
          <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-ink/10">
              <div>
                <h3 className="font-black text-lg text-ink leading-tight">
                  {activeBuilding.name}
                </h3>
                <p className="text-xs font-semibold text-ink/60">
                  {activeBuilding.description}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                  occPct >= 80
                    ? 'bg-rose-100 text-rose-800'
                    : occPct >= 60
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {occPct}% Full
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF7F2]">
                <p className="text-ink/60 font-bold text-[10px] uppercase">Est. Wait Time</p>
                <p className="text-xl font-black text-ink mt-0.5 flex items-center gap-1">
                  <Clock size={15} className="text-coral" />
                  {activeBuilding.estimatedWaitMin || 2} min
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF7F2]">
                <p className="text-ink/60 font-bold text-[10px] uppercase">Current Queue</p>
                <p className="text-xl font-black text-ink mt-0.5">
                  {activeBuilding.queue || 0} people
                </p>
              </div>
            </div>

            {/* Quick Action Buttons for Students */}
            <div className="space-y-2 pt-1">
              {['annapurna', 'stationery-1', 'stationery-2', 'library'].includes(selectedRegionId) && (
                <button
                  onClick={() => handleQuickGetToken(selectedRegionId)}
                  className="w-full btn bg-coral hover:bg-coral/90 text-ink text-xs font-extrabold py-2.5 justify-center rounded-2xl shadow-xs"
                >
                  <Ticket size={16} />
                  Get Digital Queue Token
                </button>
              )}

              <button
                onClick={() => {
                  setRouteTo(selectedRegionId)
                  handleRouteCalculate(routeFrom, selectedRegionId)
                }}
                className="w-full btn bg-[#130722] hover:bg-ink/90 text-white text-xs font-bold py-2.5 justify-center rounded-2xl"
              >
                <Navigation size={15} />
                Get Directions Here
              </button>
            </div>
          </div>

          {/* Walking Route Navigation Card */}
          <div className="bg-white rounded-3xl border border-ink/10 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
            <div className="flex items-center gap-2">
              <Navigation size={16} className="text-coral" />
              <h4 className="font-black text-sm text-ink">Campus Route Navigation</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-ink/60">From:</label>
                <select
                  value={routeFrom}
                  onChange={(e) => {
                    setRouteFrom(e.target.value)
                    handleRouteCalculate(e.target.value, routeTo)
                  }}
                  className="w-full mt-1 p-2 rounded-xl border border-ink/15 font-semibold text-xs bg-[#FAF7F2]"
                >
                  {CAMPUS_NODES.map((n) => (
                    <option key={`from-${n.id}`} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-ink/60">To:</label>
                <select
                  value={routeTo}
                  onChange={(e) => {
                    setRouteTo(e.target.value)
                    handleRouteCalculate(routeFrom, e.target.value)
                  }}
                  className="w-full mt-1 p-2 rounded-xl border border-ink/15 font-semibold text-xs bg-[#FAF7F2]"
                >
                  {CAMPUS_NODES.map((n) => (
                    <option key={`to-${n.id}`} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAF7F2] flex items-center justify-between text-xs font-bold text-ink">
              <span>Walking Time: <strong className="text-coral">{activeRouteInfo.timeMin} min</strong></span>
              <span>Distance: <strong>{activeRouteInfo.distanceM} meters</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Token Modal */}
      {generatedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-ink/10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-14 rounded-full bg-peach/40 text-coral mx-auto grid place-items-center">
              <Ticket size={28} />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-[#FAF7F2] text-ink font-bold text-xs uppercase tracking-wider">
                Digital Queue Pass
              </span>
              <h4 className="font-black text-3xl text-ink mt-2 tracking-tight">
                #{generatedTicket.tokenCode}
              </h4>
              <p className="text-sm font-bold text-ink/80 mt-1">
                {generatedTicket.facilityName}
              </p>
            </div>

            <div className="bg-[#FAF7F2] rounded-2xl p-4 grid grid-cols-2 gap-2 text-left text-xs font-bold">
              <div>
                <p className="text-ink/60 text-[10px] uppercase">Queue Spot</p>
                <p className="text-xl font-black text-ink">{generatedTicket.queueNumber}</p>
              </div>
              <div>
                <p className="text-ink/60 text-[10px] uppercase">Est. Wait</p>
                <p className="text-xl font-black text-coral">~{generatedTicket.estimatedWaitMin} min</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setGeneratedTicket(null)}
                className="flex-1 py-2.5 rounded-2xl bg-cream text-ink font-bold text-xs hover:bg-ink/10"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setGeneratedTicket(null)
                  navigate('/student/queues')
                }}
                className="flex-1 py-2.5 rounded-2xl bg-coral text-ink font-black text-xs hover:bg-coral/90 shadow-xs"
              >
                View in My Queues
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

