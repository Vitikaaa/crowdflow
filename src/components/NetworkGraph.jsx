import { useMemo } from 'react'
import { status } from '../services/api.js'
import { ArrowRight, Compass, Users } from 'lucide-react'

export default function NetworkGraph({ regions, edges, selectedId, onSelect }) {
  // Map of region id to object
  const regionMap = useMemo(() => {
    const map = {}
    regions.forEach((r) => { map[r.id] = r })
    return map
  }, [regions])

  const getNodeColor = (r) => {
    const pct = Math.round((r.current / r.capacity) * 100)
    const s = status(pct)
    if (s === 'Critical') return { bg: '#190933', text: '#FFF5E0', border: '#EE9E8E', ring: '#EE9E8E' }
    if (s === 'High') return { bg: '#EE9E8E', text: '#190933', border: '#190933', ring: '#190933' }
    if (s === 'Moderate') return { bg: '#FFDBC3', text: '#190933', border: '#EE9E8E', ring: '#EE9E8E' }
    return { bg: '#FFFFFF', text: '#190933', border: '#19093320', ring: '#19093310' }
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-cream/50 border border-ink/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-ink/70" />
          <h3 className="font-extrabold text-base text-ink">Campus Digital Twin Network</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-ink/70">
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-white border border-ink/30" /> Normal (&lt;70%)</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-peach border border-coral" /> Moderate</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-coral" /> High (70-85%)</span>
          <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-ink" /> Critical (&gt;85%)</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 840 420" className="w-full min-w-[680px] h-[340px] select-none">
          <defs>
            {/* Arrow marker for directional flow */}
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#190933" fillOpacity="0.4" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EE9E8E" />
            </marker>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#190933" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Grid lines for architectural blueprint feel */}
          <g stroke="#190933" strokeOpacity="0.04" strokeWidth="1">
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 60} y1="0" x2={i * 60} y2="420" />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 60} x2="840" y2={i * 60} />
            ))}
          </g>

          {/* Pedestrian path edges */}
          {edges.map((edge) => {
            const u = regionMap[edge.source]
            const v = regionMap[edge.target]
            if (!u || !v) return null

            const isConnectedToSelected = edge.source === selectedId || edge.target === selectedId
            const isRedirectCorridor = (edge.source === 'canteen-a' && edge.target === 'canteen-b') || (edge.source === 'canteen-b' && edge.target === 'canteen-a')
            const strokeWidth = Math.max(2, Math.min(6, edge.baseFlowRate * 0.25))

            // Midpoint coordinates for transit badge
            const mx = (u.x + v.x) / 2
            const my = (u.y + v.y) / 2

            return (
              <g key={edge.id}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isConnectedToSelected ? '#190933' : '#190933'}
                  strokeOpacity={isConnectedToSelected ? 0.75 : 0.22}
                  strokeWidth={strokeWidth}
                  strokeDasharray={isRedirectCorridor ? '5 4' : 'none'}
                  markerEnd={isConnectedToSelected ? 'url(#arrow-active)' : 'url(#arrow)'}
                />
                {/* Transit time label pill */}
                <g transform={`translate(${mx}, ${my})`}>
                  <rect
                    x="-26"
                    y="-9"
                    width="52"
                    height="18"
                    rx="9"
                    fill="#FFF5E0"
                    stroke="#190933"
                    strokeOpacity="0.15"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="700"
                    fill="#190933"
                    opacity="0.8"
                  >
                    {edge.transitTimeMin}m · {edge.baseFlowRate}/5m
                  </text>
                </g>
              </g>
            )
          })}

          {/* Campus Nodes */}
          {regions.map((node) => {
            const isSelected = node.id === selectedId
            const colors = getNodeColor(node)
            const pct = Math.round((node.current / node.capacity) * 100)
            const radius = isSelected ? 32 : 28

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => onSelect(node.id)}
                className="cursor-pointer transition-transform duration-200 hover:scale-105"
                filter="url(#shadow)"
              >
                {/* Active halo */}
                {isSelected && (
                  <circle
                    r={radius + 8}
                    fill="none"
                    stroke="#EE9E8E"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                    className="animate-spin"
                    style={{ animationDuration: '10s' }}
                  />
                )}

                {/* Base circle */}
                <circle
                  r={radius}
                  fill={colors.bg}
                  stroke={colors.border}
                  strokeWidth={isSelected ? 3 : 1.5}
                />

                {/* Occupancy percentage text */}
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="900"
                  fill={colors.text}
                >
                  {pct}%
                </text>

                {/* Ratio count */}
                <text
                  x="0"
                  y="10"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill={colors.text}
                  opacity="0.8"
                >
                  {node.current}/{node.capacity}
                </text>

                {/* Node name badge below */}
                <g transform="translate(0, 42)">
                  <rect
                    x="-45"
                    y="-10"
                    width="90"
                    height="20"
                    rx="10"
                    fill={isSelected ? '#190933' : '#FFF5E0'}
                    stroke="#190933"
                    strokeOpacity={isSelected ? 1 : 0.2}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill={isSelected ? '#FFF5E0' : '#190933'}
                  >
                    {node.shortName || node.name}
                  </text>
                </g>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-ink/70 border-t border-ink/10 pt-2 px-1">
        <p className="flex items-center gap-1.5 font-medium">
          <Users size={13} /> Click any node to inspect directional network flow, queue length, and 15-min forecast.
        </p>
        <span className="font-semibold text-ink">Corridor dashed: Primary Redirection Link</span>
      </div>
    </div>
  )
}
