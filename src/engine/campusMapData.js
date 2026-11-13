/**
 * VNR VJIET Dynamic Synthetic Campus Map Geometry & Spatial Layout
 * High-fidelity top-down 2D coordinate blueprint for the digital twin.
 * Dimensions: 1200 x 800 (viewBox)
 */

export const MAP_DIMENSIONS = {
  width: 1200,
  height: 800
}

// Visual theme palette for the synthetic campus environment
export const MAP_THEME = {
  ground: '#EDE8DF',
  groundBorder: '#D8D1C5',
  grass: '#C8E2B8',
  grassDark: '#B2D39E',
  plaza: '#E5DCCF',
  plazaBorder: '#D3C8B7',
  road: '#374151',
  roadMarking: '#F3F4F6',
  curb: '#FBBF24',
  pathway: '#DFD6C7',
  pathwayBorder: '#C9BDAA',
  buildingWall: '#CBD5E1',
  buildingRoof: '#FFFFFF',
  buildingRoofSecondary: '#F8FAFC',
  buildingBorder: '#94A3B8',
  sportsCourt: '#2563EB',
  sportsOuter: '#1E40AF',
  sportsLines: '#FFFFFF'
}

// Academic & Facility Buildings with realistic architectural footprints
export const CAMPUS_BUILDINGS = [
  {
    id: 'block-abc',
    code: 'ABC',
    name: 'ABC Block',
    subtitle: 'Vignana Jyothi Administrative & Academic Complex',
    category: 'academic',
    x: 210,
    y: 430,
    width: 250,
    height: 180,
    shape: 'composite', // L-shaped footprint with central atrium
    polygon: [
      [210, 430],
      [460, 430],
      [460, 520],
      [400, 520],
      [400, 610],
      [210, 610]
    ],
    entrance: { x: 340, y: 615, side: 'south', label: 'Main Entrance' },
    floors: 4,
    color: '#F8FAFC',
    accentColor: '#6366F1',
    description: 'Central flagship block housing the Central Library, Stationery 1, Dean offices, and auditorium.'
  },
  {
    id: 'library',
    code: 'LIB',
    name: 'Central Library',
    subtitle: 'Inside ABC Block (West Wing)',
    category: 'study',
    parentBuildingId: 'block-abc',
    x: 220,
    y: 440,
    width: 140,
    height: 90,
    polygon: [
      [220, 440],
      [360, 440],
      [360, 530],
      [220, 530]
    ],
    entrance: { x: 290, y: 535, side: 'east', label: 'Library Turnstiles' },
    floors: 2,
    color: '#EEF2FF',
    accentColor: '#4F46E5',
    description: 'Central Library with reference stacks, quiet study halls, and digital learning lab.'
  },
  {
    id: 'stationery-1',
    code: 'ST-1',
    name: 'Stationery 1',
    subtitle: 'Inside ABC Block (Ground Floor South)',
    category: 'service',
    parentBuildingId: 'block-abc',
    x: 375,
    y: 530,
    width: 75,
    height: 70,
    polygon: [
      [375, 530],
      [450, 530],
      [450, 600],
      [375, 600]
    ],
    entrance: { x: 412, y: 605, side: 'south', label: 'Store Counter' },
    floors: 1,
    color: '#FEF3C7',
    accentColor: '#D97706',
    description: 'Primary campus bookstore, printing kiosk, and academic stationery store.'
  },
  {
    id: 'block-a',
    code: 'A',
    name: 'A Block',
    subtitle: 'Department of Electrical & Mechanical Sciences',
    category: 'academic',
    x: 540,
    y: 450,
    width: 150,
    height: 150,
    polygon: [
      [540, 450],
      [690, 450],
      [690, 600],
      [540, 600]
    ],
    entrance: { x: 615, y: 605, side: 'south', label: 'A-Block Foyer' },
    floors: 4,
    color: '#F8FAFC',
    accentColor: '#3B82F6',
    description: 'Smart classrooms, computational laboratories, and faculty departments.'
  },
  {
    id: 'block-b',
    code: 'B',
    name: 'B Block',
    subtitle: 'Department of Electronics & Communications',
    category: 'academic',
    x: 740,
    y: 450,
    width: 140,
    height: 150,
    polygon: [
      [740, 450],
      [880, 450],
      [880, 600],
      [740, 600]
    ],
    entrance: { x: 810, y: 605, side: 'south', label: 'B-Block Foyer' },
    floors: 4,
    color: '#F8FAFC',
    accentColor: '#0EA5E9',
    description: 'Advanced telecom labs, VLSI design studios, and seminar halls.'
  },
  {
    id: 'block-d',
    code: 'D',
    name: 'D Block',
    subtitle: 'Department of Computer Science & IT',
    category: 'academic',
    x: 540,
    y: 240,
    width: 150,
    height: 140,
    polygon: [
      [540, 240],
      [690, 240],
      [690, 380],
      [540, 380]
    ],
    entrance: { x: 615, y: 385, side: 'south', label: 'D-Block Portico' },
    floors: 4,
    color: '#F8FAFC',
    accentColor: '#10B981',
    description: 'High-density IT labs, cloud computing suites, and software project rooms.'
  },
  {
    id: 'stationery-2',
    code: 'ST-2',
    name: 'Stationery 2',
    subtitle: 'Behind A Block, near D Block',
    category: 'service',
    x: 440,
    y: 330,
    width: 70,
    height: 60,
    polygon: [
      [440, 330],
      [510, 330],
      [510, 390],
      [440, 390]
    ],
    entrance: { x: 475, y: 395, side: 'south', label: 'Service Window' },
    floors: 1,
    color: '#FEF3C7',
    accentColor: '#D97706',
    description: 'Express stationery kiosk, laser printing, and project binding unit.'
  },
  {
    id: 'block-c',
    code: 'C',
    name: 'C Block',
    subtitle: 'Civil Engineering & Research Wings',
    category: 'academic',
    x: 740,
    y: 240,
    width: 140,
    height: 140,
    polygon: [
      [740, 240],
      [880, 240],
      [880, 380],
      [740, 380]
    ],
    entrance: { x: 810, y: 385, side: 'south', label: 'C-Block Entrance' },
    floors: 3,
    color: '#F8FAFC',
    accentColor: '#14B8A6',
    description: 'Materials testing labs, CAD/CAM suites, and structural engineering models.'
  },
  {
    id: 'block-e',
    code: 'E',
    name: 'E Block',
    subtitle: 'Advanced AI & PG Research Hub',
    category: 'academic',
    x: 230,
    y: 170,
    width: 170,
    height: 140,
    polygon: [
      [230, 170],
      [400, 170],
      [400, 310],
      [230, 310]
    ],
    entrance: { x: 315, y: 315, side: 'south', label: 'E-Block Atrium' },
    floors: 5,
    color: '#F8FAFC',
    accentColor: '#8B5CF6',
    description: 'Cutting-edge AI research labs, data center, and executive conference center.'
  },
  {
    id: 'annapurna',
    code: 'ANN',
    name: 'Annapurna Canteen',
    subtitle: 'Central Food Court & Dining Pavilion',
    category: 'dining',
    x: 950,
    y: 380,
    width: 190,
    height: 180,
    polygon: [
      [950, 380],
      [1140, 380],
      [1140, 560],
      [950, 560]
    ],
    entrance: { x: 950, y: 470, side: 'west', label: 'Food Court Plaza' },
    floors: 2,
    color: '#FFF1F2',
    accentColor: '#F43F5E',
    description: 'The sole central dining pavilion at VNR VJIET with meal counters, snacks, juice bar, and shaded outdoor dining.'
  },
  {
    id: 'sports-court',
    code: 'SPT',
    name: 'Sports Court & Arena',
    subtitle: 'Outdoor Basketball & Athletic Complex',
    category: 'recreation',
    x: 650,
    y: 90,
    width: 250,
    height: 110,
    polygon: [
      [650, 90],
      [900, 90],
      [900, 200],
      [650, 200]
    ],
    entrance: { x: 775, y: 205, side: 'south', label: 'Courtside Gate' },
    floors: 0,
    color: '#2563EB',
    accentColor: '#3B82F6',
    description: 'Hardwood basketball court, badminton facilities, and athletic practice grounds.'
  },
  {
    id: 'main-gate',
    code: 'GATE',
    name: 'Main Campus Gate & Plaza',
    subtitle: 'VNR VJIET Gateway & Transit Hub',
    category: 'transit',
    x: 280,
    y: 690,
    width: 200,
    height: 70,
    polygon: [
      [280, 690],
      [480, 690],
      [480, 760],
      [280, 760]
    ],
    entrance: { x: 380, y: 690, side: 'north', label: 'Security Turnstiles' },
    floors: 1,
    color: '#F1F5F9',
    accentColor: '#64748B',
    description: 'Primary vehicular entrance, student turnstile checkpoints, and transit drop-off.'
  }
]

// Shaded Green Spaces & Parklands
export const CAMPUS_GREENS = [
  // Central quad park between ABC, A, and D blocks
  {
    id: 'central-quad',
    name: 'Central Quadrangle Lawn',
    points: '470,440 530,440 530,600 470,600'
  },
  // Academic corridor lawn between A, B, D, and C
  {
    id: 'academic-green',
    name: 'Science Garden',
    points: '700,240 730,240 730,600 700,600'
  },
  // Annapurna outdoor patio lawn
  {
    id: 'annapurna-garden',
    name: 'Canteen Shaded Grove',
    points: '900,380 940,380 940,560 900,560'
  },
  // Sports complex green buffer
  {
    id: 'sports-turf',
    name: 'Athletic Field Turf',
    points: '620,80 930,80 930,210 620,210'
  },
  // West campus tree buffer
  {
    id: 'west-grove',
    name: 'Library Quiet Garden',
    points: '120,400 190,400 190,630 120,630'
  },
  // Entrance avenue parkland
  {
    id: 'entrance-park',
    name: 'Welcome Greenery',
    points: '500,690 850,690 850,760 500,760'
  }
]

// Tree canopy clusters (top-down view)
export const CAMPUS_TREES = [
  // Avenue leading from Main Gate
  { x: 300, y: 660, r: 14 },
  { x: 350, y: 655, r: 12 },
  { x: 420, y: 660, r: 15 },
  { x: 470, y: 655, r: 13 },
  // Central Quad trees
  { x: 500, y: 460, r: 14 },
  { x: 500, y: 520, r: 16 },
  { x: 500, y: 580, r: 14 },
  // Between A and D Block
  { x: 580, y: 415, r: 12 },
  { x: 650, y: 415, r: 13 },
  // Between B and C Block
  { x: 780, y: 415, r: 13 },
  { x: 840, y: 415, r: 14 },
  // Around Stationery 2
  { x: 430, y: 310, r: 11 },
  { x: 525, y: 315, r: 13 },
  // Annapurna Canteen garden trees
  { x: 920, y: 400, r: 15 },
  { x: 920, y: 460, r: 16 },
  { x: 920, y: 520, r: 15 },
  { x: 970, y: 350, r: 14 },
  { x: 1050, y: 350, r: 14 },
  { x: 1120, y: 350, r: 13 },
  // North Campus & Sports area
  { x: 620, y: 150, r: 15 },
  { x: 930, y: 140, r: 16 },
  { x: 930, y: 180, r: 14 },
  // E Block surroundings
  { x: 210, y: 220, r: 14 },
  { x: 210, y: 270, r: 15 },
  { x: 420, y: 210, r: 13 },
  { x: 420, y: 270, r: 14 }
]

// Campus Street & Internal Road Network
export const CAMPUS_ROADS = [
  // Main Entrance Arterial Road
  {
    id: 'road-main-arterial',
    name: 'Campus Main Boulevard',
    d: 'M 380 770 L 380 640 L 500 640 L 920 640 L 920 360 L 610 360 L 610 220 L 920 220',
    width: 22
  },
  // East Outer Loop Road
  {
    id: 'road-east-loop',
    name: 'Annapurna Service Lane',
    d: 'M 920 640 L 1160 640 L 1160 360 L 920 360',
    width: 16
  },
  // West Research Access Road
  {
    id: 'road-west-loop',
    name: 'Academic West Drive',
    d: 'M 380 640 L 180 640 L 180 150 L 500 150 L 500 220',
    width: 16
  }
]

// Detailed Pedestrian Walkways connecting all blocks and facilities
export const PEDESTRIAN_WALKWAYS = [
  // Gate to ABC Block
  {
    id: 'walk-gate-abc',
    from: 'main-gate',
    to: 'block-abc',
    d: 'M 380 690 L 380 640 L 340 640 L 340 615',
    distanceM: 110,
    transitMin: 1.8
  },
  // ABC Block to A Block (Central Quad Promenade)
  {
    id: 'walk-abc-a',
    from: 'block-abc',
    to: 'block-a',
    d: 'M 400 565 L 500 565 L 540 565 L 615 565 L 615 605',
    distanceM: 95,
    transitMin: 1.5
  },
  // A Block to B Block
  {
    id: 'walk-a-b',
    from: 'block-a',
    to: 'block-b',
    d: 'M 690 525 L 740 525 L 810 525 L 810 605',
    distanceM: 75,
    transitMin: 1.2
  },
  // B Block to Annapurna Canteen (Dining Corridor)
  {
    id: 'walk-b-annapurna',
    from: 'block-b',
    to: 'annapurna',
    d: 'M 880 525 L 950 525 L 950 470',
    distanceM: 85,
    transitMin: 1.4
  },
  // A Block to D Block
  {
    id: 'walk-a-d',
    from: 'block-a',
    to: 'block-d',
    d: 'M 615 450 L 615 385',
    distanceM: 70,
    transitMin: 1.1
  },
  // B Block to C Block
  {
    id: 'walk-b-c',
    from: 'block-b',
    to: 'block-c',
    d: 'M 810 450 L 810 385',
    distanceM: 70,
    transitMin: 1.1
  },
  // D Block to C Block
  {
    id: 'walk-d-c',
    from: 'block-d',
    to: 'block-c',
    d: 'M 690 310 L 740 310',
    distanceM: 60,
    transitMin: 1.0
  },
  // Behind A Block to Stationery 2
  {
    id: 'walk-a-st2',
    from: 'block-a',
    to: 'stationery-2',
    d: 'M 540 460 L 500 460 L 500 395 L 475 395',
    distanceM: 55,
    transitMin: 0.9
  },
  // D Block to Stationery 2
  {
    id: 'walk-d-st2',
    from: 'block-d',
    to: 'stationery-2',
    d: 'M 540 360 L 510 360 L 475 360 L 475 395',
    distanceM: 45,
    transitMin: 0.7
  },
  // DIRECT REDIRECTION CORRIDOR: Stationery 1 -> Stationery 2
  {
    id: 'walk-st1-st2',
    from: 'stationery-1',
    to: 'stationery-2',
    d: 'M 412 605 L 412 625 L 485 625 L 485 395 L 475 395',
    distanceM: 140,
    transitMin: 2.2,
    isRedirectionCorridor: true
  },
  // D Block to E Block
  {
    id: 'walk-d-e',
    from: 'block-d',
    to: 'block-e',
    d: 'M 540 280 L 400 280 L 315 280 L 315 315',
    distanceM: 120,
    transitMin: 1.9
  },
  // ABC Block to E Block
  {
    id: 'walk-abc-e',
    from: 'block-abc',
    to: 'block-e',
    d: 'M 340 430 L 340 315 L 315 315',
    distanceM: 110,
    transitMin: 1.7
  },
  // C Block to Annapurna Canteen
  {
    id: 'walk-c-annapurna',
    from: 'block-c',
    to: 'annapurna',
    d: 'M 880 340 L 920 340 L 920 440 L 950 440 L 950 470',
    distanceM: 115,
    transitMin: 1.8
  },
  // C Block to Sports Court
  {
    id: 'walk-c-sports',
    from: 'block-c',
    to: 'sports-court',
    d: 'M 810 240 L 810 205 L 775 205',
    distanceM: 70,
    transitMin: 1.1
  },
  // D Block to Sports Court
  {
    id: 'walk-d-sports',
    from: 'block-d',
    to: 'sports-court',
    d: 'M 650 240 L 650 205 L 775 205',
    distanceM: 80,
    transitMin: 1.2
  }
]

