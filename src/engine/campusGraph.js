/**
 * Campus Graph Digital Twin
 * Represents the 7 interconnected service regions as a directed, weighted graph.
 * Nodes represent physical campus zones with capacity and service rates.
 * Edges represent feasible pedestrian paths with transit duration (minutes) and flow capacity.
 */

export const CAMPUS_NODES = [
  {
    id: 'canteen-a',
    name: 'Canteen A',
    shortName: 'Canteen A',
    type: 'Dining',
    capacity: 80,
    serviceRate: 18, // people served per 5 mins with standard counters
    baseCounters: 3,
    maxCounters: 6,
    avgDwellMin: 22,
    x: 420,
    y: 260,
    description: 'Primary student dining hall with fast-food and hot meal counters.',
    sensorCoverage: { cctv: 4, wifiAPs: 3, turnstiles: 2 }
  },
  {
    id: 'canteen-b',
    name: 'Canteen B',
    shortName: 'Canteen B',
    type: 'Dining',
    capacity: 90,
    serviceRate: 20,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 24,
    x: 640,
    y: 280,
    description: 'Secondary food court with grab-and-go options and outdoor seating.',
    sensorCoverage: { cctv: 3, wifiAPs: 2, turnstiles: 0 }
  },
  {
    id: 'library',
    name: 'Central Library',
    shortName: 'Library',
    type: 'Study',
    capacity: 150,
    serviceRate: 35,
    baseCounters: 2,
    maxCounters: 4,
    avgDwellMin: 65,
    x: 520,
    y: 110,
    description: 'Multi-level library with quiet study spaces and collaborative pods.',
    sensorCoverage: { cctv: 6, wifiAPs: 5, turnstiles: 4 }
  },
  {
    id: 'printing',
    name: 'Printing Centre',
    shortName: 'Printing',
    type: 'Service',
    capacity: 35,
    serviceRate: 14,
    baseCounters: 2,
    maxCounters: 4,
    avgDwellMin: 8,
    x: 740,
    y: 130,
    description: 'Express document printing, binding, and stationery hub.',
    sensorCoverage: { cctv: 2, wifiAPs: 1, turnstiles: 0 }
  },
  {
    id: 'services',
    name: 'Student Services',
    shortName: 'Services',
    type: 'Administrative',
    capacity: 45,
    serviceRate: 10,
    baseCounters: 3,
    maxCounters: 5,
    avgDwellMin: 18,
    x: 200,
    y: 150,
    description: 'Academic registrar, student finance, and counseling desks.',
    sensorCoverage: { cctv: 3, wifiAPs: 2, turnstiles: 1 }
  },
  {
    id: 'lecture-hall',
    name: 'Lecture Hall Complex',
    shortName: 'Lecture Complex',
    type: 'Academic',
    capacity: 220,
    serviceRate: 45,
    baseCounters: 4,
    maxCounters: 6,
    avgDwellMin: 50,
    x: 230,
    y: 340,
    description: 'Tiered auditoriums and primary interchange for hourly class transitions.',
    sensorCoverage: { cctv: 5, wifiAPs: 6, turnstiles: 3 }
  },
  {
    id: 'main-entrance',
    name: 'Main Entrance & Plaza',
    shortName: 'Main Entrance',
    type: 'Transit',
    capacity: 180,
    serviceRate: 60,
    baseCounters: 4,
    maxCounters: 6,
    avgDwellMin: 6,
    x: 80,
    y: 260,
    description: 'Primary campus gateway connecting transit stops and pedestrian avenue.',
    sensorCoverage: { cctv: 4, wifiAPs: 4, turnstiles: 6 }
  }
]

export const CAMPUS_EDGES = [
  {
    id: 'edge-me-lh',
    source: 'main-entrance',
    target: 'lecture-hall',
    transitTimeMin: 3.0,
    distanceMeters: 180,
    baseFlowRate: 14, // people per 5 min
    bidirectional: true
  },
  {
    id: 'edge-me-ss',
    source: 'main-entrance',
    target: 'services',
    transitTimeMin: 2.0,
    distanceMeters: 120,
    baseFlowRate: 8,
    bidirectional: true
  },
  {
    id: 'edge-lh-ca',
    source: 'lecture-hall',
    target: 'canteen-a',
    transitTimeMin: 2.0,
    distanceMeters: 130,
    baseFlowRate: 22, // Heavy corridor during lunch
    bidirectional: true
  },
  {
    id: 'edge-lh-lib',
    source: 'lecture-hall',
    target: 'library',
    transitTimeMin: 3.5,
    distanceMeters: 210,
    baseFlowRate: 11,
    bidirectional: true
  },
  {
    id: 'edge-ca-cb',
    source: 'canteen-a',
    target: 'canteen-b',
    transitTimeMin: 2.5,
    distanceMeters: 150,
    baseFlowRate: 9, // Key redirection corridor
    bidirectional: true
  },
  {
    id: 'edge-lib-cb',
    source: 'library',
    target: 'canteen-b',
    transitTimeMin: 3.0,
    distanceMeters: 175,
    baseFlowRate: 12,
    bidirectional: true
  },
  {
    id: 'edge-lib-pr',
    source: 'library',
    target: 'printing',
    transitTimeMin: 1.5,
    distanceMeters: 90,
    baseFlowRate: 8,
    bidirectional: true
  },
  {
    id: 'edge-ss-ca',
    source: 'services',
    target: 'canteen-a',
    transitTimeMin: 3.0,
    distanceMeters: 170,
    baseFlowRate: 6,
    bidirectional: true
  }
]

export const THRESHOLDS = {
  normal: 50,    // < 50% capacity
  moderate: 70,  // 50% - 70%
  high: 85,      // 70% - 85%
  critical: 90   // >= 85% (Critical breach warning >= 90%)
}

export function getRegionById(id) {
  return CAMPUS_NODES.find((n) => n.id === id) || CAMPUS_NODES[0]
}

export function getConnectedEdges(regionId) {
  return CAMPUS_EDGES.filter((e) => e.source === regionId || e.target === regionId)
}

export function getConnectedRegions(regionId) {
  const edges = getConnectedEdges(regionId)
  return edges.map((e) => {
    const isOut = e.source === regionId
    const targetId = isOut ? e.target : e.source
    return {
      region: getRegionById(targetId),
      edge: e,
      direction: isOut ? 'outgoing' : 'incoming',
      transitTimeMin: e.transitTimeMin,
      distanceMeters: e.distanceMeters,
      flowRate: e.baseFlowRate
    }
  })
}
