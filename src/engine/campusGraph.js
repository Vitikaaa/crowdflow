/**
 * Campus Graph Digital Twin – VNR VJIET
 * Accurate spatial model of VNR VJIET campus facilities, academic blocks, single canteen (Annapurna),
 * dual stationery hubs, central library, sports court, PG block, and pedestrian corridors.
 */

export const CAMPUS_NODES = [
  {
    id: 'annapurna',
    name: 'Annapurna Canteen',
    shortName: 'Annapurna',
    type: 'Dining',
    category: 'dining',
    capacity: 200,
    serviceRate: 36,
    baseCounters: 3,
    maxCounters: 6,
    avgDwellMin: 22,
    x: 820,
    y: 340,
    description: 'The sole central student & faculty dining pavilion at VNR VJIET with multi-cuisine food counters, juice stalls, and shaded outdoor seating.',
    sensorCoverage: { cctv: 6, wifiAPs: 5, turnstiles: 2 },
    openHours: '8:00 AM – 7:30 PM',
    floors: 2
  },
  {
    id: 'stationery-1',
    name: 'Stationery 1 (ABC Block)',
    shortName: 'Stationery 1',
    type: 'Service',
    category: 'service',
    capacity: 35,
    serviceRate: 14,
    baseCounters: 2,
    maxCounters: 4,
    avgDwellMin: 8,
    x: 520,
    y: 430,
    description: 'First stationery store located on the ground floor of ABC Block. Handles record sheets, notebooks, rapid printing, and binding.',
    sensorCoverage: { cctv: 2, wifiAPs: 2, turnstiles: 0 },
    openHours: '8:30 AM – 5:30 PM',
    floors: 1
  },
  {
    id: 'stationery-2',
    name: 'Stationery 2 (Behind A Block)',
    shortName: 'Stationery 2',
    type: 'Service',
    category: 'service',
    capacity: 30,
    serviceRate: 12,
    baseCounters: 2,
    maxCounters: 3,
    avgDwellMin: 7,
    x: 580,
    y: 200,
    description: 'Second stationery unit situated behind A Block, near PG Block. Fast-track express reprographics, spiral binding, and project stationary.',
    sensorCoverage: { cctv: 2, wifiAPs: 1, turnstiles: 0 },
    openHours: '9:00 AM – 5:00 PM',
    floors: 1
  },
  {
    id: 'library',
    name: 'Central Library',
    shortName: 'Central Library',
    type: 'Study',
    category: 'study',
    capacity: 200,
    serviceRate: 45,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 65,
    x: 390,
    y: 430,
    description: 'Central Library inside ABC Block with automated circulation turnstiles, reference stacks, digital research pods, and air-conditioned reading halls.',
    sensorCoverage: { cctv: 8, wifiAPs: 6, turnstiles: 4 },
    openHours: '8:00 AM – 8:00 PM',
    floors: 2
  },
  {
    id: 'block-abc',
    name: 'ABC Block',
    shortName: 'ABC Block',
    type: 'Academic',
    category: 'academic',
    capacity: 350,
    serviceRate: 65,
    baseCounters: 4,
    maxCounters: 6,
    avgDwellMin: 45,
    x: 440,
    y: 410,
    description: 'Flagship academic and administrative block of VNR VJIET. Houses Dean offices, Central Library, Stationery 1, and central seminar halls.',
    sensorCoverage: { cctv: 6, wifiAPs: 6, turnstiles: 4 },
    openHours: '7:30 AM – 6:30 PM',
    floors: 4
  },
  {
    id: 'block-a',
    name: 'A Block',
    shortName: 'A Block',
    type: 'Academic',
    category: 'academic',
    capacity: 250,
    serviceRate: 45,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 50,
    x: 440,
    y: 260,
    description: 'Core engineering classrooms, computational laboratories, and Department of Mechanical & Electrical Engineering.',
    sensorCoverage: { cctv: 5, wifiAPs: 4, turnstiles: 2 },
    openHours: '8:00 AM – 6:00 PM',
    floors: 4
  },
  {
    id: 'block-pg',
    name: 'PG Block',
    shortName: 'PG Block',
    type: 'Academic',
    category: 'academic',
    capacity: 220,
    serviceRate: 40,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 50,
    x: 440,
    y: 130,
    description: 'Postgraduate department, advanced research suites, and faculty seminar halls located behind A Block.',
    sensorCoverage: { cctv: 4, wifiAPs: 4, turnstiles: 2 },
    openHours: '8:00 AM – 6:00 PM',
    floors: 4
  },
  {
    id: 'block-d',
    name: 'D Block',
    shortName: 'D Block',
    type: 'Academic',
    category: 'academic',
    capacity: 240,
    serviceRate: 45,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 50,
    x: 230,
    y: 160,
    description: 'Computer Science and Information Technology academic wing, AI accelerators, and coding arena.',
    sensorCoverage: { cctv: 5, wifiAPs: 5, turnstiles: 2 },
    openHours: '8:00 AM – 6:30 PM',
    floors: 4
  },
  {
    id: 'block-e',
    name: 'E Block',
    shortName: 'E Block',
    type: 'Academic',
    category: 'academic',
    capacity: 260,
    serviceRate: 45,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 50,
    x: 230,
    y: 330,
    description: 'Advanced engineering research center, lecture halls, and executive auditorium.',
    sensorCoverage: { cctv: 5, wifiAPs: 5, turnstiles: 2 },
    openHours: '8:00 AM – 7:00 PM',
    floors: 5
  },
  {
    id: 'sports-court',
    name: 'Sports Court & Complex',
    shortName: 'Sports Court',
    type: 'Recreation',
    category: 'recreation',
    capacity: 120,
    serviceRate: 25,
    baseCounters: 2,
    maxCounters: 3,
    avgDwellMin: 40,
    x: 820,
    y: 520,
    description: 'Outdoor acrylic basketball court, badminton facilities, and athletic practice grounds.',
    sensorCoverage: { cctv: 3, wifiAPs: 2, turnstiles: 0 },
    openHours: '6:00 AM – 7:30 PM',
    floors: 0
  },
  {
    id: 'main-gate',
    name: 'Main Campus Gate & Plaza',
    shortName: 'Main Gate',
    type: 'Transit',
    category: 'transit',
    capacity: 200,
    serviceRate: 70,
    baseCounters: 4,
    maxCounters: 6,
    avgDwellMin: 5,
    x: 380,
    y: 530,
    description: 'Main campus security entrance, student RFID turnstile barriers, and arrival avenue.',
    sensorCoverage: { cctv: 4, wifiAPs: 4, turnstiles: 6 },
    openHours: '24 Hours',
    floors: 1
  }
]

export const CAMPUS_EDGES = [
  {
    id: 'edge-gate-abc',
    source: 'main-gate',
    target: 'block-abc',
    transitTimeMin: 1.5,
    distanceMeters: 90,
    baseFlowRate: 25,
    bidirectional: true
  },
  {
    id: 'edge-gate-ann',
    source: 'main-gate',
    target: 'annapurna',
    transitTimeMin: 2.0,
    distanceMeters: 150,
    baseFlowRate: 30,
    bidirectional: true
  },
  {
    id: 'edge-abc-ann',
    source: 'block-abc',
    target: 'annapurna',
    transitTimeMin: 1.5,
    distanceMeters: 100,
    baseFlowRate: 35,
    bidirectional: true
  },
  {
    id: 'edge-abc-lib',
    source: 'block-abc',
    target: 'library',
    transitTimeMin: 0.5,
    distanceMeters: 20,
    baseFlowRate: 15,
    bidirectional: true
  },
  {
    id: 'edge-abc-st1',
    source: 'block-abc',
    target: 'stationery-1',
    transitTimeMin: 0.5,
    distanceMeters: 20,
    baseFlowRate: 12,
    bidirectional: true
  },
  {
    id: 'edge-abc-a',
    source: 'block-abc',
    target: 'block-a',
    transitTimeMin: 1.2,
    distanceMeters: 80,
    baseFlowRate: 22,
    bidirectional: true
  },
  {
    id: 'edge-a-pg',
    source: 'block-a',
    target: 'block-pg',
    transitTimeMin: 1.0,
    distanceMeters: 70,
    baseFlowRate: 18,
    bidirectional: true
  },
  {
    id: 'edge-a-st2',
    source: 'block-a',
    target: 'stationery-2',
    transitTimeMin: 0.8,
    distanceMeters: 50,
    baseFlowRate: 12,
    bidirectional: true
  },
  {
    id: 'edge-pg-st2',
    source: 'block-pg',
    target: 'stationery-2',
    transitTimeMin: 0.6,
    distanceMeters: 40,
    baseFlowRate: 10,
    bidirectional: true
  },
  {
    id: 'edge-st1-st2',
    source: 'stationery-1',
    target: 'stationery-2',
    transitTimeMin: 2.0,
    distanceMeters: 130,
    baseFlowRate: 10,
    bidirectional: true,
    isRedirectionCorridor: true
  },
  {
    id: 'edge-e-abc',
    source: 'block-e',
    target: 'block-abc',
    transitTimeMin: 1.2,
    distanceMeters: 85,
    baseFlowRate: 20,
    bidirectional: true
  },
  {
    id: 'edge-e-d',
    source: 'block-e',
    target: 'block-d',
    transitTimeMin: 1.0,
    distanceMeters: 65,
    baseFlowRate: 18,
    bidirectional: true
  },
  {
    id: 'edge-d-a',
    source: 'block-d',
    target: 'block-a',
    transitTimeMin: 1.5,
    distanceMeters: 95,
    baseFlowRate: 16,
    bidirectional: true
  },
  {
    id: 'edge-ann-sports',
    source: 'annapurna',
    target: 'sports-court',
    transitTimeMin: 1.0,
    distanceMeters: 60,
    baseFlowRate: 15,
    bidirectional: true
  }
]

export const THRESHOLDS = {
  normal: 60,    // <= 60%
  moderate: 75,  // 60% - 75%
  high: 90,      // 75% - 90%
  critical: 90   // > 90%
}

const LEGACY_ID_MAP = {
  'canteen-a': 'annapurna',
  'canteen-b': 'stationery-2',
  'printing': 'stationery-1',
  'lecture-hall': 'block-abc',
  'services': 'block-a',
  'main-entrance': 'main-gate'
}

export function resolveRegionId(id) {
  return LEGACY_ID_MAP[id] || id
}

export function getRegionById(id) {
  const resolved = resolveRegionId(id)
  return CAMPUS_NODES.find((n) => n.id === resolved) || CAMPUS_NODES[0]
}

export function getConnectedEdges(regionId) {
  const resolved = resolveRegionId(regionId)
  return CAMPUS_EDGES.filter((e) => e.source === resolved || e.target === resolved)
}

export function findCampusRoute(startId, endId) {
  const start = resolveRegionId(startId)
  const end = resolveRegionId(endId)
  if (start === end) return { nodes: [start], edges: [], totalDistanceM: 0, totalMinutes: 0 }

  const dist = { [start]: 0 }
  const prev = {}
  const edgeUsed = {}
  const unvisited = new Set(CAMPUS_NODES.map((n) => n.id))

  while (unvisited.size > 0) {
    let curr = null
    let minDist = Infinity
    for (const id of unvisited) {
      if ((dist[id] ?? Infinity) < minDist) {
        minDist = dist[id]
        curr = id
      }
    }

    if (curr === null || curr === end) break
    unvisited.delete(curr)

    const neighbors = getConnectedEdges(curr)
    for (const e of neighbors) {
      const neighborId = e.source === curr ? e.target : e.source
      if (!unvisited.has(neighborId)) continue
      const alt = dist[curr] + e.distanceMeters
      if (alt < (dist[neighborId] ?? Infinity)) {
        dist[neighborId] = alt
        prev[neighborId] = curr
        edgeUsed[neighborId] = e
      }
    }
  }

  const path = []
  const edgesInPath = []
  let curr = end
  while (curr) {
    path.unshift(curr)
    if (edgeUsed[curr]) edgesInPath.unshift(edgeUsed[curr])
    curr = prev[curr]
  }

  if (path[0] !== start) {
    return { nodes: [start, end], edges: [], totalDistanceM: 150, totalMinutes: 2.0 }
  }

  const totalDist = edgesInPath.reduce((acc, e) => acc + e.distanceMeters, 0)
  const totalMin = Number(edgesInPath.reduce((acc, e) => acc + e.transitTimeMin, 0).toFixed(1))

  return {
    nodes: path,
    edges: edgesInPath,
    totalDistanceM: totalDist,
    totalMinutes: totalMin
  }
}
