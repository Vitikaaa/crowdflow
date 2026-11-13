import { useState, useRef, useEffect } from 'react'
import {
  Compass,
  Check,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Pencil,
  Navigation,
  Utensils,
  ShoppingBag,
  GraduationCap
} from 'lucide-react'

export default function VnrCampusMap({
  campus,
  selectedId,
  onSelect,
  showOverlays = true,
  height = '520px',
  interactive = true,
  mode = 'admin' // 'admin' | 'student'
}) {
  const { regionsMap = {}, selectRegion } = campus
  const activeId = selectedId || campus.selectedRegionId || 'annapurna'

  // Map layer toggle states matching image
  const [layers, setLayers] = useState({
    crowdDensity: true,
    pedestrianFlow: true,
    routes: true,
    facilities: true
  })

  // Pan and Zoom
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleSelect = (id) => {
    if (onSelect) onSelect(id)
    else if (selectRegion) selectRegion(id)
  }

  // Helper for crowd status color
  const getBadgeStyle = (pct) => {
    if (pct > 90) return { dot: '#EF4444', text: '#991B1B', bg: '#FEE2E2', border: '#DC2626', label: 'Critical' }
    if (pct >= 75) return { dot: '#F97316', text: '#C2410C', bg: '#FFEDD5', border: '#EA580C', label: 'High' }
    if (pct >= 60) return { dot: '#F59E0B', text: '#B45309', bg: '#FEF3C7', border: '#D97706', label: 'Moderate' }
    return { dot: '#10B981', text: '#065F46', bg: '#D1FAE5', border: '#059669', label: 'Normal' }
  }

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.2, 2.5))
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.2, 0.75))
  const handleResetZoom = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Drag to pan
  const handleMouseDown = (e) => {
    if (!interactive || e.button !== 0) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Facility percentages
  const annapurnaPct = 82
  const stationery1Pct = 89
  const stationery2Pct = 33
  const libraryPct = 59
  const abcPct = 71
  const aBlockPct = 68
  const pgPct = 42
  const dBlockPct = 52
  const eBlockPct = 38

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden bg-[#DCE6D2] border border-ink/10 select-none shadow-xs"
      style={{ height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 3D ISOMETRIC ILLUSTRATED CAMPUS CANVAS */}
      <svg
        viewBox="0 0 1000 640"
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%'
        }}
      >
        <defs>
          {/* Radial Gradient for Annapurna Crowd Glow Zone */}
          <radialGradient id="annapurna-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#F87171" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>

          {/* Building Drop Shadow */}
          <filter id="iso-shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="8" dy="14" stdDeviation="8" floodColor="#0F172A" floodOpacity="0.25" />
          </filter>

          {/* Sports Court Grid */}
          <pattern id="court-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#2563EB" />
          </pattern>
        </defs>

        {/* 1. TERRAIN & GROUND LAWNS */}
        <rect width="1000" height="640" fill="#E2EAD9" />

        {/* Landscaped Green Grass Buffers */}
        <path d="M 0 0 L 1000 0 L 1000 640 L 0 640 Z" fill="#DDE7D4" />

        {/* 2. CAMPUS ASPHALT ROADS */}
        {/* Left North-South Arterial Road */}
        <polygon points="120,0 200,0 200,640 120,640" fill="#4B5563" />
        <line x1="160" y1="0" x2="160" y2="640" stroke="#F3F4F6" strokeWidth="2.5" strokeDasharray="14 14" opacity="0.8" />

        {/* Bottom East-West Avenue in front of ABC Block */}
        <polygon points="120,530 960,530 960,600 120,600" fill="#4B5563" />
        <line x1="160" y1="565" x2="960" y2="565" stroke="#F3F4F6" strokeWidth="2.5" strokeDasharray="14 14" opacity="0.8" />

        {/* Top Internal Connector Road */}
        <polygon points="200,100 640,100 640,150 200,150" fill="#4B5563" />

        {/* Zebra Crossing Stripes near Main Gate */}
        <g fill="#FFFFFF" opacity="0.9">
          <rect x="360" y="535" width="8" height="60" />
          <rect x="375" y="535" width="8" height="60" />
          <rect x="390" y="535" width="8" height="60" />
          <rect x="405" y="535" width="8" height="60" />
          <rect x="420" y="535" width="8" height="60" />
        </g>

        {/* Paved Pedestrian Plaza in front of ABC Block */}
        <polygon points="320,470 600,470 600,530 320,530" fill="#EDE4D5" stroke="#D8CABE" strokeWidth="1" />
        {/* Walkway from ABC Block to Annapurna */}
        <polygon points="560,470 780,470 780,530 560,530" fill="#EDE4D5" stroke="#D8CABE" strokeWidth="1" />

        {/* 3. SPORTS BASKETBALL COURT (Bottom Right) */}
        <g id="sports-court" onClick={() => handleSelect('sports-court')} className="cursor-pointer">
          <rect x="710" y="470" width="180" height="95" rx="6" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="3" />
          {/* Inner Court Boundary */}
          <rect x="720" y="478" width="160" height="79" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          {/* Half-Court Line & Circle */}
          <line x1="800" y1="478" x2="800" y2="557" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="800" cy="517.5" r="18" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          {/* Basketball Key Areas (Orange) */}
          <rect x="720" y="502" width="28" height="31" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="748" cy="517.5" r="14" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect x="852" y="502" width="28" height="31" fill="#EA580C" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="852" cy="517.5" r="14" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>

        {/* 4. ANNAPURNA CROWD GLOW ZONE (When Crowd Density Layer is Active) */}
        {layers.crowdDensity && (
          <ellipse cx="800" cy="350" rx="125" ry="95" fill="url(#annapurna-glow)" className="animate-pulse pointer-events-none" />
        )}

        {/* 5. 3D ISOMETRIC BUILDINGS */}

        {/* D BLOCK (Top Left, behind E Block) */}
        <g
          id="block-d"
          onClick={() => handleSelect('block-d')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          {/* South Facade */}
          <polygon points="210,185 300,185 300,210 210,210" fill="#94A3B8" />
          {/* East Facade */}
          <polygon points="300,185 320,170 320,195 300,210" fill="#64748B" />
          {/* Roof Surface */}
          <polygon points="210,185 230,170 320,170 300,185" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
          {/* Rooftop Parapet Inner */}
          <polygon points="218,183 234,172 312,172 296,183" fill="#CBD5E1" />
        </g>

        {/* E BLOCK (Left Foreground, in front of D Block - Tall terracotta/brick block) */}
        <g
          id="block-e"
          onClick={() => handleSelect('block-e')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          {/* South Facade (Brick with stripes) */}
          <polygon points="200,320 310,320 310,440 200,440" fill="#C2410C" />
          {/* Window Louvers */}
          <line x1="200" y1="350" x2="310" y2="350" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
          <line x1="200" y1="380" x2="310" y2="380" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
          <line x1="200" y1="410" x2="310" y2="410" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.8" />
          {/* East Facade */}
          <polygon points="310,320 335,300 335,420 310,440" fill="#9A3412" />
          {/* Roof Surface */}
          <polygon points="200,320 225,300 335,300 310,320" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <polygon points="210,317 230,303 325,303 305,317" fill="#E2E8F0" />
        </g>

        {/* PG BLOCK (Top Center, behind A Block) */}
        <g
          id="block-pg"
          onClick={() => handleSelect('block-pg')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          <polygon points="410,135 560,135 560,175 410,175" fill="#94A3B8" />
          <polygon points="560,135 585,115 585,155 560,175" fill="#64748B" />
          <polygon points="410,135 435,115 585,115 560,135" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="1.5" />
          <polygon points="420,133 440,118 575,118 555,133" fill="#E2E8F0" />
        </g>

        {/* STATIONERY 2 (Yellow/Gold Building behind A Block, right of PG Block) */}
        <g
          id="stationery-2"
          onClick={() => handleSelect('stationery-2')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          {/* South Facade */}
          <polygon points="610,195 675,195 675,235 610,235" fill="#D97706" />
          {/* East Facade */}
          <polygon points="675,195 695,180 695,220 675,235" fill="#B45309" />
          {/* Roof Surface */}
          <polygon points="610,195 630,180 695,180 675,195" fill="#FDE68A" stroke="#D97706" strokeWidth="1.5" />
          <polygon points="618,193 634,182 687,182 671,193" fill="#FBBF24" />
        </g>

        {/* A BLOCK (Behind ABC Block) */}
        <g
          id="block-a"
          onClick={() => handleSelect('block-a')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          {/* South Facade */}
          <polygon points="380,245 560,245 560,300 380,300" fill="#94A3B8" />
          <line x1="380" y1="272" x2="560" y2="272" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
          {/* East Facade */}
          <polygon points="560,245 590,220 590,275 560,300" fill="#64748B" />
          {/* Roof Surface */}
          <polygon points="380,245 410,220 590,220 560,245" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="1.5" />
          <polygon points="392,242 418,223 578,223 552,242" fill="#E2E8F0" />
        </g>

        {/* ABC BLOCK (Flagship Building in Center Foreground) */}
        <g
          id="block-abc"
          onClick={() => handleSelect('block-abc')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          {/* South Front Facade */}
          <polygon points="360,380 600,380 600,470 360,470" fill="#CBD5E1" />
          {/* White Architectural Columns / Window Mullions */}
          <line x1="360" y1="425" x2="600" y2="425" stroke="#FFFFFF" strokeWidth="3" opacity="0.9" />
          <line x1="420" y1="380" x2="420" y2="470" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
          <line x1="480" y1="380" x2="480" y2="470" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
          <line x1="540" y1="380" x2="540" y2="470" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" />
          {/* East Facade */}
          <polygon points="600,380 635,345 635,435 600,470" fill="#94A3B8" />
          {/* Main Roof Surface */}
          <polygon points="360,380 395,345 635,345 600,380" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
          {/* Roof Parapet Recess */}
          <polygon points="375,376 405,349 620,349 590,376" fill="#E2E8F0" />
          {/* Front Entrance Portico */}
          <rect x="460" y="460" width="40" height="15" fill="#F43F5E" rx="2" />
        </g>

        {/* ANNAPURNA CANTEEN (Distinctive Curved Red/Salmon Canopy Pavilion) */}
        <g
          id="annapurna"
          onClick={() => handleSelect('annapurna')}
          className="cursor-pointer group"
          filter="url(#iso-shadow)"
        >
          {/* South Facade with glass entrance */}
          <polygon points="690,370 850,370 850,440 690,440" fill="#FDA4AF" />
          <rect x="730" y="400" width="80" height="40" fill="#FFE4E6" stroke="#FB7185" strokeWidth="1.5" />
          {/* East Facade */}
          <polygon points="850,370 885,340 885,410 850,440" fill="#F43F5E" />
          {/* Distinctive Curved / Cantilevered Roof Canopy */}
          <path
            d="M 675,370 Q 770,310 870,340 L 890,355 Q 790,325 695,385 Z"
            fill="#E11D48"
            stroke="#9F1239"
            strokeWidth="1.5"
          />
          <path
            d="M 685,365 Q 775,315 865,342 L 875,347 Q 785,320 695,372 Z"
            fill="#FB7185"
          />
        </g>

        {/* MAIN GATE (Bottom Center) */}
        <g id="main-gate" onClick={() => handleSelect('main-gate')} className="cursor-pointer">
          <rect x="370" y="585" width="60" height="20" rx="3" fill="#1E293B" />
          <text x="400" y="599" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="800">
            Main Gate
          </text>
        </g>

        {/* 6. PEDESTRIAN ROUTE (Main Gate -> Annapurna Canteen) */}
        {layers.routes && (
          <g className="pointer-events-none">
            {/* Blue dashed route exactly like the image */}
            <path
              d="M 405,585 L 405,545 L 610,545 L 740,545 L 770,480 L 770,440"
              fill="none"
              stroke="#2563EB"
              strokeWidth="3.5"
              strokeDasharray="6 6"
              strokeLinecap="round"
            >
              <animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" repeatCount="indefinite" />
            </path>
            {/* Route Distance/Time Pill: "2 min (150 m)" */}
            <g transform="translate(515, 528)">
              <rect width="105" height="24" rx="12" fill="#2563EB" filter="url(#iso-shadow)" />
              <text x="52.5" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="800">
                2 min (150 m)
              </text>
            </g>
          </g>
        )}

        {/* 7. PEDESTRIAN FLOW ANIMATED DOTS */}
        {layers.pedestrianFlow && (
          <g className="pointer-events-none">
            <circle r="3.5" fill="#0284C7">
              <animateMotion
                path="M 405,585 L 405,545 L 610,545 L 740,545 L 770,480 L 770,440"
                dur="4s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3.5" fill="#0284C7">
              <animateMotion
                path="M 280,320 L 280,545 L 405,545 L 610,545 L 770,440"
                dur="5.5s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="3" fill="#D97706">
              <animateMotion
                path="M 520,380 L 520,300 L 580,240 L 640,240"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}

        {/* 8. LUSH 3D TOP-DOWN TREES (Along roads & perimeters matching image) */}
        {[
          // Along Left North-South Road
          { x: 105, y: 50, r: 16 },
          { x: 105, y: 110, r: 17 },
          { x: 105, y: 170, r: 16 },
          { x: 105, y: 230, r: 18 },
          { x: 105, y: 290, r: 17 },
          { x: 105, y: 350, r: 16 },
          { x: 105, y: 410, r: 18 },
          { x: 105, y: 470, r: 17 },
          { x: 105, y: 530, r: 16 },
          // Between D/E and A/ABC blocks
          { x: 340, y: 140, r: 15 },
          { x: 340, y: 200, r: 16 },
          { x: 345, y: 270, r: 17 },
          { x: 345, y: 340, r: 16 },
          { x: 345, y: 410, r: 15 },
          // Behind A Block and PG Block
          { x: 400, y: 60, r: 18 },
          { x: 470, y: 50, r: 17 },
          { x: 540, y: 50, r: 19 },
          { x: 610, y: 60, r: 17 },
          // Around Annapurna Canteen
          { x: 670, y: 300, r: 16 },
          { x: 740, y: 270, r: 18 },
          { x: 810, y: 250, r: 17 },
          { x: 880, y: 250, r: 18 },
          { x: 920, y: 310, r: 19 },
          { x: 920, y: 380, r: 17 },
          { x: 920, y: 440, r: 18 },
          // Bottom Avenue buffer
          { x: 230, y: 615, r: 16 },
          { x: 300, y: 615, r: 17 },
          { x: 500, y: 615, r: 16 },
          { x: 580, y: 615, r: 18 },
          { x: 660, y: 615, r: 16 }
        ].map((t, idx) => (
          <g key={`tree-${idx}`} className="pointer-events-none">
            {/* Tree Drop Shadow */}
            <circle cx={t.x + 3} cy={t.y + 5} r={t.r} fill="#0F172A" opacity="0.2" />
            {/* Base dark canopy */}
            <circle cx={t.x} cy={t.y} r={t.r} fill="#15803D" />
            {/* Mid green foliage */}
            <circle cx={t.x - 1} cy={t.y - 1} r={t.r * 0.82} fill="#22C55E" />
            {/* Sunlight highlight */}
            <circle cx={t.x - 2} cy={t.y - 2} r={t.r * 0.5} fill="#86EFAC" opacity="0.8" />
          </g>
        ))}

        {/* 9. FLOATING FACILITY & CROWD BADGES (Exact text & percentages from image) */}

        {/* D BLOCK BADGE: "D Block 52%" */}
        <g
          transform="translate(225, 145)"
          className="cursor-pointer"
          onClick={() => handleSelect('block-d')}
        >
          <rect width="90" height="24" rx="12" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="12" r="5" fill="#10B981" />
          <text x="52" y="16" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            D Block <tspan fill="#059669">52%</tspan>
          </text>
        </g>

        {/* E BLOCK BADGE: "E Block 38%" */}
        <g
          transform="translate(220, 275)"
          className="cursor-pointer"
          onClick={() => handleSelect('block-e')}
        >
          <rect width="90" height="24" rx="12" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="12" r="5" fill="#F59E0B" />
          <text x="52" y="16" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            E Block <tspan fill="#D97706">38%</tspan>
          </text>
        </g>

        {/* PG BLOCK BADGE: "PG Block 42%" */}
        <g
          transform="translate(450, 95)"
          className="cursor-pointer"
          onClick={() => handleSelect('block-pg')}
        >
          <rect width="95" height="24" rx="12" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="12" r="5" fill="#10B981" />
          <text x="55" y="16" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            PG Block <tspan fill="#059669">42%</tspan>
          </text>
        </g>

        {/* STATIONERY 2 BADGE: "Stationery 2 33%" */}
        <g
          transform="translate(595, 160)"
          className="cursor-pointer"
          onClick={() => handleSelect('stationery-2')}
        >
          <rect width="110" height="24" rx="12" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="12" r="5" fill="#10B981" />
          <text x="62" y="16" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            Stationery 2 <tspan fill="#059669">33%</tspan>
          </text>
        </g>

        {/* A BLOCK BADGE: "A Block 68%" */}
        <g
          transform="translate(440, 210)"
          className="cursor-pointer"
          onClick={() => handleSelect('block-a')}
        >
          <rect width="90" height="24" rx="12" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="12" r="5" fill="#F59E0B" />
          <text x="52" y="16" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            A Block <tspan fill="#D97706">68%</tspan>
          </text>
        </g>

        {/* ABC BLOCK MAIN BADGE: "ABC Block 71%" */}
        <g
          transform="translate(435, 335)"
          className="cursor-pointer"
          onClick={() => handleSelect('block-abc')}
        >
          <rect width="105" height="26" rx="13" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="13" r="5" fill="#F97316" />
          <text x="58" y="17" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            ABC Block <tspan fill="#EA580C">71%</tspan>
          </text>
        </g>

        {/* INSET PILL: CENTRAL LIBRARY: "Central Library 59%" */}
        <g
          transform="translate(365, 395)"
          className="cursor-pointer"
          onClick={() => handleSelect('library')}
        >
          <rect width="115" height="24" rx="12" fill="#FFFFFF" stroke="#6366F1" strokeWidth="1" filter="url(#iso-shadow)" />
          <text x="18" y="16" fill="#4F46E5" fontSize="11">📖</text>
          <text x="65" y="16" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="800">
            Library <tspan fill="#4F46E5">59%</tspan>
          </text>
        </g>

        {/* INSET PILL: STATIONERY 1: "Stationery 1 89%" */}
        <g
          transform="translate(490, 395)"
          className="cursor-pointer"
          onClick={() => handleSelect('stationery-1')}
        >
          <rect width="115" height="24" rx="12" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1" filter="url(#iso-shadow)" />
          <text x="18" y="16" fill="#D97706" fontSize="11">✏️</text>
          <text x="65" y="16" textAnchor="middle" fill="#0F172A" fontSize="10" fontWeight="800">
            Stationery 1 <tspan fill="#EA580C">89%</tspan>
          </text>
        </g>

        {/* ANNAPURNA CANTEEN BADGE: "Annapurna Canteen 82%" */}
        <g
          transform="translate(730, 375)"
          className="cursor-pointer"
          onClick={() => handleSelect('annapurna')}
        >
          <rect width="145" height="26" rx="13" fill="#FFFFFF" filter="url(#iso-shadow)" />
          <circle cx="16" cy="13" r="5" fill="#EF4444" />
          <text x="80" y="17" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="800">
            Annapurna Canteen <tspan fill="#DC2626">82%</tspan>
          </text>
        </g>
      </svg>

      {/* FLOATING OVERLAY: COMPASS (Top Left) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="size-10 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-ink/10 flex flex-col items-center justify-center">
          <Compass size={18} className="text-ink" />
          <span className="text-[9px] font-black leading-none text-ink -mt-0.5">N</span>
        </div>
      </div>

      {/* FLOATING OVERLAY: MAP LAYERS CARD (Top Right matching image) */}
      {showOverlays && (
        <div className="absolute top-4 right-4 z-10 space-y-2 pointer-events-auto">
          {/* Map Layers Checklist */}
          <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-md border border-ink/10 w-44 text-xs font-bold text-ink">
            <p className="text-[11px] font-extrabold uppercase text-ink/70 mb-2.5 tracking-wider">
              Map Layers
            </p>
            <div className="space-y-1.5">
              {[
                { id: 'crowdDensity', label: 'Crowd Density' },
                { id: 'pedestrianFlow', label: 'Pedestrian Flow' },
                { id: 'routes', label: 'Routes' },
                { id: 'facilities', label: 'Facilities' }
              ].map((layer) => (
                <label
                  key={layer.id}
                  className="flex items-center gap-2 cursor-pointer hover:text-coral transition"
                >
                  <input
                    type="checkbox"
                    checked={layers[layer.id]}
                    onChange={(e) =>
                      setLayers((prev) => ({ ...prev, [layer.id]: e.target.checked }))
                    }
                    className="size-3.5 rounded text-coral focus:ring-coral accent-coral"
                  />
                  <span>{layer.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Crowd Level Legend */}
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-md border border-ink/10 w-44 text-[11px] font-bold text-ink/80 space-y-1">
            <p className="text-[10px] font-extrabold uppercase text-ink/60 tracking-wider mb-1.5">
              Crowd Level
            </p>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" />
                Normal
              </span>
              <span className="text-ink/50 text-[10px]">(&le; 60%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-amber-500" />
                Moderate
              </span>
              <span className="text-ink/50 text-[10px]">(60–75%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-orange-500" />
                High
              </span>
              <span className="text-ink/50 text-[10px]">(75–90%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500" />
                Critical
              </span>
              <span className="text-ink/50 text-[10px]">(&gt; 90%)</span>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING OVERLAY: ZOOM & FIT CONTROLS (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-ink/10">
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-ink/80 hover:bg-cream hover:text-ink transition"
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-ink/80 hover:bg-cream hover:text-ink transition"
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2 rounded-xl text-ink/80 hover:bg-cream hover:text-ink transition"
          title="Fit / Reset View"
        >
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  )
}

