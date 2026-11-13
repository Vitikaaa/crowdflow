import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Users,
  Clock,
  Compass,
  ArrowRight,
  Shield,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Ticket,
  Utensils,
  BookOpen,
  ShoppingBag,
  GraduationCap,
  Trophy,
  Navigation,
  Sparkles,
  Info,
  Maximize2,
  ChevronRight,
  X,
  Volume2
} from 'lucide-react'
import {
  MAP_DIMENSIONS,
  MAP_THEME,
  CAMPUS_BUILDINGS,
  CAMPUS_GREENS,
  CAMPUS_TREES,
  CAMPUS_ROADS,
  PEDESTRIAN_WALKWAYS
} from '../engine/campusMapData.js'
import { THRESHOLDS, findCampusRoute, getRegionById } from '../engine/campusGraph.js'

// Helper to determine crowd status color
function getCrowdStatus(utilizationPct) {
  if (utilizationPct >= THRESHOLDS.critical) {
    return { level: 'critical', label: 'Critical', bg: '#EF4444', text: '#991B1B', lightBg: '#FEE2E2', ring: '#DC2626' }
  }
  if (utilizationPct >= THRESHOLDS.high) {
    return { level: 'high', label: 'High', bg: '#F97316', text: '#C2410C', lightBg: '#FFEDD5', ring: '#EA580C' }
  }
  if (utilizationPct >= THRESHOLDS.moderate) {
    return { level: 'moderate', label: 'Moderate', bg: '#F59E0B', text: '#B45309', lightBg: '#FEF3C7', ring: '#D97706' }
  }
  return { level: 'normal', label: 'Normal', bg: '#10B981', text: '#065F46', lightBg: '#D1FAE5', ring: '#059669' }
}

export default function CampusMap({
  campus,
  height = '620px',
  allowRoleSwitch = true,
  onNavigateToOrchestration,
  initialViewMode = 'crowd'
}) {
  const {
    regionsMap = {},
    selectedRegionId,
    selectRegion,
    scenarios = [],
    userRole = 'admin',
    setUserRole,
    generateToken,
    updateFacilitySettings,
    facilitySettings = {},
    runIntervention
  } = campus

  // Map View Mode: 'normal' | 'crowd' | 'pedestrian' | 'facilities'
  const [viewMode, setViewMode] = useState(initialViewMode)
  // Student vs Administrator mode
  const [role, setRole] = useState(userRole || 'admin')
  // Category filter in Student Mode
  const [studentCategory, setStudentCategory] = useState('all')

  // Pan and Zoom State
  const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const svgRef = useRef(null)

  // Hovered building tooltip
  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  // Active highlighted route (e.g., student directions or admin redirection)
  const [activeRoute, setActiveRoute] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)

  // Student Navigation Picker State
  const [studentRouteFrom, setStudentRouteFrom] = useState('block-a')
  const [studentRouteTo, setStudentRouteTo] = useState('annapurna')

  // Generated Token Modal/Notification
  const [activeTokenTicket, setActiveTokenTicket] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)

  // Scenario Before/After Simulation
  const [activeScenarioKey, setActiveScenarioKey] = useState(null)
  const [scenarioCompareMode, setScenarioCompareMode] = useState('after') // 'before' | 'after'

  // Selected building details
  const activeBuildingId = selectedRegionId || 'annapurna'
  const activeBuildingGeom = CAMPUS_BUILDINGS.find((b) => b.id === activeBuildingId) || CAMPUS_BUILDINGS[0]
  const activeRegionData = regionsMap[activeBuildingId] || getRegionById(activeBuildingId)
  const activeFacilityConfig = facilitySettings[activeBuildingId] || {
    isOpen: true,
    isEntryRestricted: false,
    capacityLimit: activeRegionData.capacity || 100,
    activeCounters: activeRegionData.activeCounters || 2,
    assignedStaff: 1,
    tokensPaused: false
  }

  // Active scenario details
  const currentScenario = useMemo(() => {
    if (!activeScenarioKey) return null
    return scenarios.find((s) => s.scenarioKey === activeScenarioKey) || scenarios[1]
  }, [activeScenarioKey, scenarios])

  // Compute effective region occupancy and status depending on Scenario Simulation
  const getEffectiveRegionState = (bldgId) => {
    const raw = regionsMap[bldgId] || getRegionById(bldgId)
    if (!currentScenario || scenarioCompareMode === 'before') {
      const occ = raw.current ?? Math.round(raw.capacity * 0.5)
      const cap = raw.capacity || 100
      const pct = Math.round((occ / cap) * 100)
      return {
        occupancy: occ,
        capacity: cap,
        utilizationPct: pct,
        queue: raw.queue ?? 0,
        status: getCrowdStatus(pct)
      }
    }

    // After intervention: lookup trajectory minute 10
    const traj = currentScenario.trajectories?.[bldgId]
    const step10 = traj?.find((t) => t.minute === 10) || traj?.[traj.length - 1]
    const occ = step10 ? step10.occupancy : (raw.current ?? 50)
    const cap = raw.capacity || 100
    const pct = Math.round((occ / cap) * 100)
    return {
      occupancy: occ,
      capacity: cap,
      utilizationPct: pct,
      queue: step10 ? step10.queue : 0,
      status: getCrowdStatus(pct),
      isSimulated: true
    }
  }

  // Zoom handlers
  const handleZoomIn = () => {
    setViewTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.25, 2.8)
    }))
  }

  const handleZoomOut = () => {
    setViewTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.25, 0.75)
    }))
  }

  const handleResetZoom = () => {
    setViewTransform({ scale: 1, x: 0, y: 0 })
    setActiveRoute(null)
    setRouteInfo(null)
  }

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    setViewTransform((prev) => ({
      ...prev,
      scale: Math.max(0.75, Math.min(prev.scale * zoomFactor, 2.8))
    }))
  }

  // Drag to Pan
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    setIsPanning(true)
    setStartPan({ x: e.clientX - viewTransform.x, y: e.clientY - viewTransform.y })
  }

  const handleMouseMove = (e) => {
    if (!isPanning) return
    setViewTransform((prev) => ({
      ...prev,
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y
    }))
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Calculate and display student walking directions
  const handleCalculateDirections = (fromId, toId) => {
    const route = findCampusRoute(fromId, toId)
    setActiveRoute(route)
    setRouteInfo({
      fromName: getRegionById(fromId).name,
      toName: getRegionById(toId).name,
      distanceM: route.totalDistanceM,
      timeMin: route.totalMinutes
    })
  }

  // One-click smart alternative: Stationery 1 -> Stationery 2
  const handleRerouteToStationery2 = () => {
    selectRegion('stationery-2')
    const route = findCampusRoute('stationery-1', 'stationery-2')
    setActiveRoute(route)
    setRouteInfo({
      fromName: 'Stationery 1 (ABC Block)',
      toName: 'Stationery 2 (Behind A Block)',
      distanceM: route.totalDistanceM,
      timeMin: route.totalMinutes,
      isAlternativeRecommendation: true
    })
  }

  // Admin trigger redirection scenario preview
  const handlePreviewRedirectionScenario = () => {
    setActiveScenarioKey('B')
    setScenarioCompareMode('after')
    const route = findCampusRoute('stationery-1', 'stationery-2')
    setActiveRoute(route)
    setRouteInfo({
      fromName: 'Stationery 1',
      toName: 'Stationery 2',
      distanceM: 140,
      timeMin: 2.2,
      isRedirectionCorridor: true
    })
  }

  // Execute scenario
  const handleApproveScenario = (key) => {
    if (runIntervention) {
      runIntervention(key)
      setActionFeedback({
        type: 'success',
        msg: `Intervention approved! Campus traffic redirected. Trajectories updated live.`
      })
      setTimeout(() => setActionFeedback(null), 5000)
    }
  }

  // Generate Digital Token
  const handleGetToken = (facilityId) => {
    if (generateToken) {
      const ticket = generateToken(facilityId)
      setActiveTokenTicket(ticket)
    }
  }

  // Clear route
  const handleClearRoute = () => {
    setActiveRoute(null)
    setRouteInfo(null)
  }

  // Category Icon Resolver
  const getCategoryIcon = (category, size = 16) => {
    switch (category) {
      case 'dining':
        return <Utensils size={size} className="text-coral" />
      case 'study':
        return <BookOpen size={size} className="text-indigo-600" />
      case 'service':
        return <ShoppingBag size={size} className="text-amber-600" />
      case 'recreation':
        return <Trophy size={size} className="text-blue-600" />
      case 'transit':
        return <Navigation size={size} className="text-slate-600" />
      default:
        return <GraduationCap size={size} className="text-slate-700" />
    }
  }

  return (
    <div className="relative flex flex-col xl:flex-row bg-white rounded-3xl shadow-soft border border-ink/10 overflow-hidden font-sans">
      {/* Top Map Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Role Switcher & Map View Layers */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-ink/10">
          {allowRoleSwitch && (
            <div className="flex items-center bg-cream/80 p-1 rounded-xl mr-2">
              <button
                onClick={() => {
                  setRole('student')
                  if (setUserRole) setUserRole('student')
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  role === 'student'
                    ? 'bg-coral text-ink shadow-sm'
                    : 'text-ink/70 hover:text-ink hover:bg-white/50'
                }`}
              >
                <Users size={14} />
                Student View
              </button>
              <button
                onClick={() => {
                  setRole('admin')
                  if (setUserRole) setUserRole('admin')
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                  role === 'admin'
                    ? 'bg-ink text-cream shadow-sm'
                    : 'text-ink/70 hover:text-ink hover:bg-white/50'
                }`}
              >
                <Shield size={14} />
                Admin View
              </button>
            </div>
          )}

          {/* View Mode Layers */}
          <div className="hidden sm:flex items-center gap-1 text-xs font-bold">
            <span className="text-ink/50 text-[11px] uppercase mr-1 tracking-wider">Layer:</span>
            {[
              { id: 'crowd', label: 'Live Crowd' },
              { id: 'pedestrian', label: 'Pedestrian Flow' },
              { id: 'facilities', label: 'Facilities' },
              { id: 'normal', label: 'Campus Blueprint' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  viewMode === m.id
                    ? 'bg-ink text-white font-bold shadow-xs'
                    : 'text-ink/75 hover:bg-ink/5'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Map Zoom & Pan Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-ink/10">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-ink/80 hover:bg-cream hover:text-ink transition"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={17} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-ink/80 hover:bg-cream hover:text-ink transition"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={17} />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-2 rounded-xl text-ink/80 hover:bg-cream hover:text-ink transition"
            title="Reset View"
            aria-label="Reset view"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Floating Status & Feedback Toast */}
      {actionFeedback && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-emerald-900 text-cream px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold animate-bounce border border-emerald-500/30">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{actionFeedback.msg}</span>
        </div>
      )}

      {/* MAP CANVAS CONTAINER */}
      <div
        className="relative flex-1 bg-[#ECE7DE] cursor-grab active:cursor-grabbing select-none overflow-hidden"
        style={{ height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_DIMENSIONS.width} ${MAP_DIMENSIONS.height}`}
          className="w-full h-full transform-gpu transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
            transformOrigin: '50% 50%'
          }}
        >
          <defs>
            {/* Filters for 3D Building Depth and Drop Shadows */}
            <filter id="building-elevation" x="-10%" y="-10%" width="130%" height="130%">
              <feDropShadow dx="4" dy="7" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.22" />
            </filter>
            <filter id="facility-halo" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Subtle Textured Ground Patterns */}
            <pattern id="paver-pattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M 0 16 L 16 0 M 0 0 L 16 16" fill="none" stroke="#DCD3C4" strokeWidth="0.8" opacity="0.6" />
            </pattern>
            <pattern id="sports-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="#2563EB" />
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#60A5FA" strokeWidth="0.5" opacity="0.4" />
            </pattern>

            {/* Radial Glow Gradients for Crowd Heatmap Overlays */}
            <radialGradient id="glow-critical" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#EF4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-high" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#F97316" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-moderate" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="glow-normal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#10B981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>

            {/* Marker for Route Arrows */}
            <marker id="route-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#EA580C" />
            </marker>
          </defs>

          {/* 1. TERRAIN & GREEN LAWNS */}
          <rect width={MAP_DIMENSIONS.width} height={MAP_DIMENSIONS.height} fill={MAP_THEME.ground} />

          {/* Landscaped Green Spaces */}
          {CAMPUS_GREENS.map((green) => (
            <polygon
              key={green.id}
              points={green.points}
              fill={MAP_THEME.grass}
              stroke={MAP_THEME.grassDark}
              strokeWidth="2"
              className="transition duration-300"
            />
          ))}

          {/* Sports Field Acrylic Court */}
          <g>
            <rect
              x="650"
              y="90"
              width="250"
              height="110"
              rx="6"
              fill="url(#sports-grid)"
              stroke="#1E40AF"
              strokeWidth="3"
            />
            {/* Court Markings */}
            <rect x="660" y="100" width="230" height="90" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="775" y1="100" x2="775" y2="190" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="775" cy="145" r="22" fill="none" stroke="#FFFFFF" strokeWidth="2" />
            <rect x="660" y="125" width="35" height="40" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <rect x="855" y="125" width="35" height="40" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
            <text x="775" y="80" textAnchor="middle" fill="#1E3A8A" fontSize="11" fontWeight="800" letterSpacing="1">
              SPORTS COURT & ATHLETIC COMPLEX
            </text>
          </g>

          {/* 2. CAMPUS STREETS & ROADS */}
          {CAMPUS_ROADS.map((road) => (
            <g key={road.id}>
              {/* Road Asphalt */}
              <path
                d={road.d}
                fill="none"
                stroke={MAP_THEME.road}
                strokeWidth={road.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dashed Center White Line */}
              <path
                d={road.d}
                fill="none"
                stroke={MAP_THEME.roadMarking}
                strokeWidth="1.8"
                strokeDasharray="8 8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </g>
          ))}

          {/* 3. PEDESTRIAN WALKWAYS & PROMENADES */}
          {PEDESTRIAN_WALKWAYS.map((walk) => {
            const isHighlighted = activeRoute?.edges?.some((e) => e.id === walk.id)
            return (
              <g key={walk.id}>
                {/* Walkway paver stone */}
                <path
                  d={walk.d}
                  fill="none"
                  stroke={MAP_THEME.pathway}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={walk.d}
                  fill="none"
                  stroke={MAP_THEME.pathwayBorder}
                  strokeWidth="1"
                  strokeDasharray="4 6"
                  opacity="0.7"
                />

                {/* Animated Pedestrian Flow Particles */}
                {viewMode === 'pedestrian' && (
                  <circle r="3" fill="#0284C7">
                    <animateMotion
                      path={walk.d}
                      dur={`${Math.max(2.5, walk.transitMin * 2)}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Special Highlight on Stationery 1 -> Stationery 2 Redirection Path */}
                {walk.isRedirectionCorridor && (
                  <path
                    d={walk.d}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="3.5"
                    strokeDasharray="6 6"
                    opacity={currentScenario?.scenarioKey === 'B' ? '1' : '0.4'}
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;-24"
                      dur="1.5s"
                      repeatCount="indefinite"
                    />
                  </path>
                )}
              </g>
            )
          })}

          {/* 4. ACTIVE HIGHLIGHTED ROUTE (Student Directions or Admin Redirection) */}
          {activeRoute && activeRoute.edges && (
            <g>
              {activeRoute.edges.map((e, idx) => {
                const geomWalk = PEDESTRIAN_WALKWAYS.find((w) => w.id === e.id)
                if (!geomWalk) return null
                return (
                  <g key={`hl-${idx}`}>
                    {/* Glowing underlay */}
                    <path
                      d={geomWalk.d}
                      fill="none"
                      stroke="#FFEDD5"
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                    {/* Animated Route Line */}
                    <path
                      d={geomWalk.d}
                      fill="none"
                      stroke="#EA580C"
                      strokeWidth="4"
                      strokeDasharray="8 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#route-arrow)"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;-28"
                        dur="1.2s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </g>
                )
              })}
            </g>
          )}

          {/* 5. TREE CANOPIES (Top-Down Shaded Foliage) */}
          {CAMPUS_TREES.map((tree, i) => (
            <g key={i} className="pointer-events-none">
              {/* Tree Drop Shadow */}
              <circle cx={tree.x + 3} cy={tree.y + 4} r={tree.r} fill="#0F172A" opacity="0.15" />
              {/* Dark base canopy */}
              <circle cx={tree.x} cy={tree.y} r={tree.r} fill="#15803D" />
              {/* Middle crown */}
              <circle cx={tree.x - 1} cy={tree.y - 1} r={tree.r * 0.8} fill="#22C55E" />
              {/* Sunlit top foliage */}
              <circle cx={tree.x - 2} cy={tree.y - 2} r={tree.r * 0.45} fill="#86EFAC" opacity="0.75" />
            </g>
          ))}

          {/* 6. DYNAMIC CROWD HEATMAP / RADIAL GLOW ZONES (ViewMode 'crowd' or 'pedestrian') */}
          {(viewMode === 'crowd' || viewMode === 'pedestrian' || activeScenarioKey) && (
            <g className="pointer-events-none">
              {CAMPUS_BUILDINGS.map((bldg) => {
                const eff = getEffectiveRegionState(bldg.id)
                const glowRadius = Math.max(70, Math.min(130, bldg.width * 0.7))
                const centerX = bldg.x + bldg.width / 2
                const centerY = bldg.y + bldg.height / 2
                const glowId =
                  eff.status.level === 'critical'
                    ? 'glow-critical'
                    : eff.status.level === 'high'
                    ? 'glow-high'
                    : eff.status.level === 'moderate'
                    ? 'glow-moderate'
                    : 'glow-normal'

                return (
                  <g key={`glow-${bldg.id}`}>
                    <circle
                      cx={centerX}
                      cy={centerY}
                      r={glowRadius}
                      fill={`url(#${glowId})`}
                      className={eff.status.level === 'critical' ? 'animate-pulse' : ''}
                    />
                  </g>
                )
              })}
            </g>
          )}

          {/* 7. ARCHITECTURAL BUILDINGS & FACILITIES */}
          {CAMPUS_BUILDINGS.map((bldg) => {
            const isSelected = activeBuildingId === bldg.id
            const eff = getEffectiveRegionState(bldg.id)
            const isHovered = hoveredBuilding === bldg.id

            // Check if dimmed in facility view or category filter
            const isCategoryDimmed =
              role === 'student' &&
              studentCategory !== 'all' &&
              bldg.category !== studentCategory

            const isFacilityViewDimmed =
              viewMode === 'facilities' &&
              bldg.category === 'academic' &&
              !['block-abc'].includes(bldg.id)

            const opacityClass = isCategoryDimmed || isFacilityViewDimmed ? 'opacity-35' : 'opacity-100'

            const pointsStr = bldg.polygon.map(([px, py]) => `${px},${py}`).join(' ')

            return (
              <g
                key={bldg.id}
                className={`transition-all duration-200 cursor-pointer ${opacityClass}`}
                onClick={(e) => {
                  e.stopPropagation()
                  selectRegion(bldg.id)
                }}
                onMouseEnter={(e) => {
                  setHoveredBuilding(bldg.id)
                  setTooltipPos({ x: e.clientX, y: e.clientY })
                }}
                onMouseMove={(e) => {
                  setTooltipPos({ x: e.clientX, y: e.clientY })
                }}
                onMouseLeave={() => setHoveredBuilding(null)}
              >
                {/* 3D Wall Extrusion & Ground Shadow */}
                <polygon
                  points={pointsStr}
                  fill="#94A3B8"
                  transform="translate(4, 7)"
                  opacity="0.4"
                />

                {/* Building Base / Walls */}
                <polygon
                  points={pointsStr}
                  fill="#CBD5E1"
                  stroke="#64748B"
                  strokeWidth="2"
                  filter="url(#building-elevation)"
                />

                {/* Roof Surface */}
                <polygon
                  points={pointsStr}
                  fill={isSelected ? '#FEF9C3' : bldg.color || '#FFFFFF'}
                  stroke={isSelected ? '#E11D48' : isHovered ? '#0284C7' : '#94A3B8'}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                />

                {/* Building Architectural Details (Skylights / HVAC / Borders) */}
                {bldg.id === 'annapurna' && (
                  <g pointerEvents="none">
                    {/* Hexagonal Kitchen Skylight */}
                    <rect x="1000" y="420" width="70" height="60" rx="4" fill="#FFE4E6" stroke="#FB7185" strokeWidth="1.5" />
                    {/* Outdoor Umbrella Tables */}
                    <circle cx="975" cy="405" r="7" fill="#F43F5E" />
                    <circle cx="975" cy="435" r="7" fill="#F43F5E" />
                    <circle cx="975" cy="510" r="7" fill="#F43F5E" />
                    <circle cx="975" cy="535" r="7" fill="#F43F5E" />
                    <text x="1035" y="455" textAnchor="middle" fill="#9F1239" fontSize="10" fontWeight="800">
                      FOOD COURT
                    </text>
                  </g>
                )}

                {bldg.id === 'library' && (
                  <g pointerEvents="none">
                    {/* Reading Hall Skylight Glass */}
                    <rect x="240" y="455" width="100" height="50" rx="4" fill="#E0E7FF" stroke="#818CF8" strokeWidth="1.2" />
                    <line x1="265" y1="455" x2="265" y2="505" stroke="#C7D2FE" strokeWidth="1" />
                    <line x1="290" y1="455" x2="290" y2="505" stroke="#C7D2FE" strokeWidth="1" />
                    <line x1="315" y1="455" x2="315" y2="505" stroke="#C7D2FE" strokeWidth="1" />
                    <text x="290" y="485" textAnchor="middle" fill="#3730A3" fontSize="10" fontWeight="800">
                      READING HALL
                    </text>
                  </g>
                )}

                {bldg.id === 'stationery-1' && (
                  <g pointerEvents="none">
                    <rect x="385" y="540" width="55" height="40" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2" />
                    <text x="412" y="565" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="800">
                      ST-1
                    </text>
                  </g>
                )}

                {bldg.id === 'stationery-2' && (
                  <g pointerEvents="none">
                    <rect x="450" y="340" width="50" height="35" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="1.2" />
                    <text x="475" y="362" textAnchor="middle" fill="#92400E" fontSize="9" fontWeight="800">
                      ST-2
                    </text>
                  </g>
                )}

                {/* Building Entrance Portico */}
                {bldg.entrance && (
                  <circle
                    cx={bldg.entrance.x}
                    cy={bldg.entrance.y}
                    r="4"
                    fill="#E11D48"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                )}

                {/* Building Title & Code Label */}
                <text
                  x={bldg.x + bldg.width / 2}
                  y={bldg.y + (bldg.height > 80 ? 24 : 18)}
                  textAnchor="middle"
                  fill="#0F172A"
                  fontSize="12"
                  fontWeight="900"
                  letterSpacing="0.5"
                  pointerEvents="none"
                >
                  {bldg.name.toUpperCase()}
                </text>

                {/* Dynamic Occupancy Status Badge on Building */}
                <g transform={`translate(${bldg.x + bldg.width / 2 - 36}, ${bldg.y + bldg.height - 28})`}>
                  <rect
                    width="72"
                    height="20"
                    rx="10"
                    fill={eff.status.bg}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    filter="url(#building-elevation)"
                  />
                  <text
                    x="36"
                    y="14"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="800"
                  >
                    {eff.utilizationPct}% ({eff.occupancy})
                  </text>
                </g>
              </g>
            )
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredBuilding && (
          <div
            className="fixed pointer-events-none z-50 bg-ink/95 text-cream px-3 py-2 rounded-xl shadow-2xl text-xs backdrop-blur-md border border-white/20 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{ left: tooltipPos.x, top: tooltipPos.y - 12 }}
          >
            {(() => {
              const b = CAMPUS_BUILDINGS.find((x) => x.id === hoveredBuilding)
              const eff = getEffectiveRegionState(hoveredBuilding)
              return (
                <div>
                  <p className="font-extrabold text-sm text-coral">{b?.name}</p>
                  <p className="text-[11px] text-cream/70 mb-1">{b?.subtitle}</p>
                  <div className="flex items-center gap-3 pt-1 border-t border-white/10 text-[11px]">
                    <span className="font-bold">
                      Occupancy: <span className="text-white font-black">{eff.occupancy}/{eff.capacity}</span>
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded-md font-bold text-[10px]"
                      style={{ backgroundColor: eff.status.bg, color: '#FFFFFF' }}
                    >
                      {eff.status.label}
                    </span>
                    {eff.queue > 0 && (
                      <span className="text-amber-300 font-bold">Queue: {eff.queue}</span>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {/* Active Route Floating Card */}
        {routeInfo && (
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-ink/10 max-w-sm flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-coral/20 text-coral">
                <Navigation size={18} />
              </span>
              <div>
                <p className="font-bold text-ink flex items-center gap-1">
                  <span>{routeInfo.fromName}</span>
                  <ArrowRight size={13} className="text-ink/40" />
                  <span className="text-coral">{routeInfo.toName}</span>
                </p>
                <p className="text-ink/65 text-[11px]">
                  Walking: <strong className="text-ink">{routeInfo.timeMin} min</strong> ({routeInfo.distanceM}m)
                </p>
              </div>
            </div>
            <button
              onClick={handleClearRoute}
              className="p-1 rounded-lg text-ink/40 hover:text-ink hover:bg-cream"
              title="Clear Route"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Bottom Legend */}
        <div className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-ink/10 text-[11px] font-semibold text-ink/80">
          <span className="text-[10px] text-ink/50 uppercase tracking-wider">Crowd:</span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-emerald-500" /> &lt;50%
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-amber-500" /> 50–70%
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-orange-500" /> 70–85%
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2.5 rounded-full bg-rose-500" /> &ge;85%
          </span>
        </div>
      </div>

      {/* CONTEXTUAL SIDEBAR / DRAWER PANEL */}
      <div className="w-full xl:w-96 bg-cream/30 border-t xl:border-t-0 xl:border-l border-ink/10 p-5 flex flex-col justify-between overflow-y-auto max-h-[750px]">
        <div>
          {/* Facility Header */}
          <div className="flex items-start justify-between gap-2 pb-4 border-b border-ink/10">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center size-10 rounded-2xl bg-white shadow-xs border border-ink/10">
                {getCategoryIcon(activeBuildingGeom.category, 20)}
              </span>
              <div>
                <h3 className="font-black text-lg text-ink leading-tight">
                  {activeBuildingGeom.name}
                </h3>
                <p className="text-xs text-ink/65">{activeBuildingGeom.subtitle}</p>
              </div>
            </div>
            {(() => {
              const eff = getEffectiveRegionState(activeBuildingId)
              return (
                <span
                  className="px-2.5 py-1 rounded-full text-xs font-black text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: eff.status.bg }}
                >
                  {eff.status.label}
                </span>
              )
            })()}
          </div>

          {/* STUDENT EXPERIENCE VIEW */}
          {role === 'student' && (
            <div className="mt-4 space-y-4">
              {/* Quick Facility Category Filter */}
              <div>
                <p className="text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-2">
                  Campus Guide Filter
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs font-bold">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'dining', label: 'Annapurna Canteen' },
                    { id: 'service', label: 'Stationery' },
                    { id: 'study', label: 'Library' },
                    { id: 'academic', label: 'Academic Blocks' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setStudentCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        studentCategory === cat.id
                          ? 'bg-coral text-ink shadow-xs'
                          : 'bg-white text-ink/75 hover:bg-white/80 border border-ink/5'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Facility Vital Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="card p-3 bg-white/85">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">Crowd Level</p>
                  {(() => {
                    const eff = getEffectiveRegionState(activeBuildingId)
                    return (
                      <p className="text-2xl font-black text-ink mt-0.5">
                        {eff.utilizationPct}%
                        <span className="text-xs text-ink/60 font-semibold ml-1">
                          ({eff.occupancy}/{eff.capacity})
                        </span>
                      </p>
                    )
                  })()}
                </div>

                <div className="card p-3 bg-white/85">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">Est. Wait Time</p>
                  <p className="text-2xl font-black text-ink mt-0.5 flex items-center gap-1">
                    <Clock size={16} className="text-coral" />
                    {activeRegionData.estimatedWaitMin || '2.5'}
                    <span className="text-xs text-ink/60 font-semibold">min</span>
                  </p>
                </div>
              </div>

              {/* Specific Context for Annapurna Canteen */}
              {activeBuildingId === 'annapurna' && (
                <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900">Current Queue:</span>
                    <span className="font-black text-rose-950 text-sm">
                      {activeRegionData.queue || 14} in line
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-900">Active Counters:</span>
                    <span className="font-black text-rose-950">
                      {activeFacilityConfig.activeCounters || 4} counters open
                    </span>
                  </div>
                  <button
                    onClick={() => handleGetToken('annapurna')}
                    className="w-full mt-2 btn bg-coral hover:bg-coral/90 text-ink shadow-sm justify-center py-2.5 font-bold"
                  >
                    <Ticket size={16} />
                    Get Digital Token Ticket
                  </button>
                </div>
              )}

              {/* Specific Context for Stationery 1 & 2 */}
              {(activeBuildingId === 'stationery-1' || activeBuildingId === 'stationery-2') && (
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Queue Length:</span>
                    <span className="font-black text-amber-950 text-sm">
                      {activeRegionData.queue || (activeBuildingId === 'stationery-1' ? 12 : 2)} waiting
                    </span>
                  </div>

                  {/* Smart Alternative Recommendation */}
                  {activeBuildingId === 'stationery-1' && (
                    <div className="p-2.5 rounded-xl bg-amber-100/80 border border-amber-300/60 text-xs text-amber-950">
                      <p className="font-bold flex items-center gap-1.5 text-amber-900">
                        <Sparkles size={14} className="text-amber-700" />
                        Stationery 2 is Less Crowded!
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Located behind A Block (near D Block). Only ~2 min wait vs 14 min here.
                      </p>
                      <button
                        onClick={handleRerouteToStationery2}
                        className="mt-2 text-xs font-black text-coral underline hover:text-ink flex items-center gap-1"
                      >
                        Highlight Walking Route to Stationery 2
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleGetToken(activeBuildingId)}
                    className="w-full btn bg-amber-500 hover:bg-amber-600 text-white shadow-sm justify-center py-2 font-bold"
                  >
                    <Ticket size={16} />
                    Get Queue Token
                  </button>
                </div>
              )}

              {/* Specific Context for Central Library */}
              {activeBuildingId === 'library' && (
                <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900">Available Study Seats:</span>
                    <span className="font-black text-indigo-950 text-sm">
                      {Math.max(0, (activeRegionData.capacity || 200) - (activeRegionData.current || 118))} seats open
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900">Atmosphere:</span>
                    <span className="font-semibold text-indigo-800">Quiet Study / High WiFi Coverage</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 pt-1 border-t border-indigo-200/50">
                    Forecast: Expected to reach 70% capacity around 3:30 PM.
                  </p>
                </div>
              )}

              {/* Student Campus Direction Finder */}
              <div className="card p-3.5 bg-white/90 space-y-2.5">
                <p className="text-[11px] font-bold text-ink/70 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass size={14} className="text-coral" />
                  Get Walking Directions
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-ink/60">From:</label>
                    <select
                      value={studentRouteFrom}
                      onChange={(e) => setStudentRouteFrom(e.target.value)}
                      className="w-full mt-0.5 rounded-lg border border-ink/15 bg-cream/40 p-1.5 font-semibold text-xs"
                    >
                      {CAMPUS_BUILDINGS.map((b) => (
                        <option key={`from-${b.id}`} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-ink/60">To:</label>
                    <select
                      value={studentRouteTo}
                      onChange={(e) => setStudentRouteTo(e.target.value)}
                      className="w-full mt-0.5 rounded-lg border border-ink/15 bg-cream/40 p-1.5 font-semibold text-xs"
                    >
                      {CAMPUS_BUILDINGS.map((b) => (
                        <option key={`to-${b.id}`} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => handleCalculateDirections(studentRouteFrom, studentRouteTo)}
                  className="w-full btn bg-ink text-white hover:bg-ink/90 text-xs py-2 justify-center font-bold"
                >
                  <Navigation size={14} />
                  Show Route on Map
                </button>
              </div>
            </div>
          )}

          {/* ADMINISTRATOR CONTROLS VIEW */}
          {role === 'admin' && (
            <div className="mt-4 space-y-4">
              {/* Telemetry Snapshot */}
              <div className="grid grid-cols-2 gap-2">
                <div className="card p-3 bg-white/90">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">Occupancy</p>
                  {(() => {
                    const eff = getEffectiveRegionState(activeBuildingId)
                    return (
                      <p className="text-2xl font-black text-ink mt-0.5">
                        {eff.occupancy}
                        <span className="text-xs text-ink/60 font-semibold ml-1">/ {eff.capacity}</span>
                      </p>
                    )
                  })()}
                </div>
                <div className="card p-3 bg-white/90">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60">Queue Length</p>
                  <p className="text-2xl font-black text-coral mt-0.5">
                    {activeRegionData.queue || 0}
                    <span className="text-xs text-ink/60 font-semibold ml-1">waiting</span>
                  </p>
                </div>
              </div>

              {/* Administrator Actions on Selected Facility */}
              <div className="card p-4 bg-white/95 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-ink/10">
                  <span className="text-xs font-black uppercase text-ink flex items-center gap-1.5">
                    <Sliders size={14} className="text-coral" />
                    Facility Management
                  </span>
                  <span className="text-[11px] font-bold text-ink/60">
                    ID: {activeBuildingId}
                  </span>
                </div>

                {/* Open / Restrict Facility Controls */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">Operational Status:</span>
                  <button
                    onClick={() =>
                      updateFacilitySettings(activeBuildingId, {
                        isOpen: !activeFacilityConfig.isOpen
                      })
                    }
                    className={`px-3 py-1 rounded-full font-black text-[11px] transition ${
                      activeFacilityConfig.isOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeFacilityConfig.isOpen ? 'Open' : 'Closed'}
                  </button>
                </div>

                {/* Entry Restriction Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-ink">Entry Restriction:</span>
                  <button
                    onClick={() =>
                      updateFacilitySettings(activeBuildingId, {
                        isEntryRestricted: !activeFacilityConfig.isEntryRestricted
                      })
                    }
                    className={`px-3 py-1 rounded-full font-black text-[11px] transition ${
                      activeFacilityConfig.isEntryRestricted
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeFacilityConfig.isEntryRestricted ? 'Restricted' : 'Normal Flow'}
                  </button>
                </div>

                {/* Active Counters Controller */}
                {['annapurna', 'stationery-1', 'stationery-2', 'library'].includes(activeBuildingId) && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-ink">Active Counters:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateFacilitySettings(activeBuildingId, {
                            activeCounters: Math.max(1, (activeFacilityConfig.activeCounters || 2) - 1)
                          })
                        }
                        className="size-6 rounded-md bg-cream text-ink font-bold grid place-items-center hover:bg-coral transition"
                      >
                        -
                      </button>
                      <span className="font-black text-sm text-ink w-4 text-center">
                        {activeFacilityConfig.activeCounters || 2}
                      </span>
                      <button
                        onClick={() =>
                          updateFacilitySettings(activeBuildingId, {
                            activeCounters: Math.min(8, (activeFacilityConfig.activeCounters || 2) + 1)
                          })
                        }
                        className="size-6 rounded-md bg-cream text-ink font-bold grid place-items-center hover:bg-coral transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* One-Click Student Redirection (Stationery 1 -> Stationery 2) */}
                {activeBuildingId === 'stationery-1' && (
                  <button
                    onClick={handlePreviewRedirectionScenario}
                    className="w-full btn bg-amber-500 hover:bg-amber-600 text-white text-xs py-2 justify-center font-bold"
                  >
                    <ArrowRight size={14} />
                    Simulate Redirection to Stationery 2
                  </button>
                )}
              </div>

              {/* SCENARIO INTERVENTION SIMULATOR & COMPARISON (Section 8) */}
              <div className="card p-4 bg-white/95 border-2 border-coral/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-ink flex items-center gap-1.5">
                    <Sparkles size={14} className="text-coral" />
                    Scenario Twin Simulator
                  </span>
                  {activeScenarioKey && (
                    <button
                      onClick={() => setActiveScenarioKey(null)}
                      className="text-[10px] text-ink/50 hover:text-ink font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Scenario Picker */}
                <select
                  value={activeScenarioKey || ''}
                  onChange={(e) => {
                    const key = e.target.value
                    setActiveScenarioKey(key || null)
                    if (key === 'B') {
                      const route = findCampusRoute('stationery-1', 'stationery-2')
                      setActiveRoute(route)
                    }
                  }}
                  className="w-full rounded-xl border border-ink/20 bg-cream/40 p-2 text-xs font-bold text-ink"
                >
                  <option value="">-- Choose Counterfactual Scenario --</option>
                  {scenarios.map((s) => (
                    <option key={s.scenarioKey} value={s.scenarioKey}>
                      {s.label}
                    </option>
                  ))}
                </select>

                {/* Scenario Before / After Controls */}
                {currentScenario && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="flex items-center justify-between bg-cream/70 p-1 rounded-xl">
                      <button
                        onClick={() => setScenarioCompareMode('before')}
                        className={`flex-1 py-1 text-center font-bold rounded-lg transition ${
                          scenarioCompareMode === 'before'
                            ? 'bg-ink text-white'
                            : 'text-ink/70 hover:text-ink'
                        }`}
                      >
                        Before (Status Quo)
                      </button>
                      <button
                        onClick={() => setScenarioCompareMode('after')}
                        className={`flex-1 py-1 text-center font-bold rounded-lg transition ${
                          scenarioCompareMode === 'after'
                            ? 'bg-coral text-ink shadow-xs'
                            : 'text-ink/70 hover:text-ink'
                        }`}
                      >
                        After (Projected)
                      </button>
                    </div>

                    <p className="text-[11px] text-ink/75 leading-relaxed">
                      {currentScenario.description}
                    </p>

                    {/* Projected Metrics Delta */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                        <p className="text-[10px] font-bold text-emerald-800 uppercase">Queue Relief</p>
                        <p className="text-base font-black text-emerald-950">
                          {currentScenario.deltas?.occupancyDelta < 0
                            ? `${currentScenario.deltas.occupancyDelta} people`
                            : '-8 people'}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200">
                        <p className="text-[10px] font-bold text-indigo-800 uppercase">Wait Time</p>
                        <p className="text-base font-black text-indigo-950">
                          {currentScenario.deltas?.waitTimeDeltaMin < 0
                            ? `${currentScenario.deltas.waitTimeDeltaMin} min`
                            : '-3.5 min'}
                        </p>
                      </div>
                    </div>

                    {/* Approve & Execute Action Button */}
                    <button
                      onClick={() => handleApproveScenario(currentScenario.scenarioKey)}
                      className="w-full mt-2 btn bg-emerald-700 hover:bg-emerald-800 text-white text-xs py-2.5 justify-center font-bold shadow-sm"
                    >
                      <CheckCircle2 size={15} />
                      Approve & Execute Action
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-ink/10 flex items-center justify-between text-xs">
          <span className="text-ink/60 font-semibold">
            VNR VJIET Digital Twin v3.2
          </span>
          {onNavigateToOrchestration && (
            <button
              onClick={onNavigateToOrchestration}
              className="font-bold text-coral hover:text-ink flex items-center gap-1"
            >
              Full Orchestration
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* DIGITAL TOKEN TICKET MODAL */}
      {activeTokenTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border border-ink/10 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="size-14 rounded-full bg-coral/20 text-coral mx-auto grid place-items-center">
              <Ticket size={28} />
            </div>
            <div>
              <span className="px-3 py-1 rounded-full bg-peach/40 text-coral font-bold text-xs uppercase tracking-wider">
                Digital Queue Token
              </span>
              <h4 className="font-black text-3xl text-ink mt-2 tracking-tight">
                #{activeTokenTicket.tokenCode}
              </h4>
              <p className="text-sm font-bold text-ink/80 mt-1">
                {activeTokenTicket.facilityName}
              </p>
            </div>

            <div className="bg-cream/60 rounded-2xl p-4 grid grid-cols-2 gap-2 text-left text-xs">
              <div>
                <p className="text-ink/60 text-[10px] font-bold uppercase">Queue Position</p>
                <p className="text-xl font-black text-ink">{activeTokenTicket.queueNumber}</p>
              </div>
              <div>
                <p className="text-ink/60 text-[10px] font-bold uppercase">Estimated Call</p>
                <p className="text-xl font-black text-coral">~{activeTokenTicket.estimatedWaitMin} min</p>
              </div>
            </div>

            <p className="text-xs text-ink/60">
              Please present this digital token when called at the counter or turnstile.
            </p>

            <button
              onClick={() => setActiveTokenTicket(null)}
              className="w-full btn bg-ink text-white hover:bg-ink/90 font-bold py-2.5 justify-center"
            >
              Done / Add to Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

