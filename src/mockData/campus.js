// VNR VJIET Mock Campus Telemetry
export const THRESHOLDS = { moderate: 50, high: 70, critical: 85 }

const times = ['12:30','12:35','12:40','12:45','12:50','12:55','13:00','13:05']
const NOW = 4
const mk = (a, p) => times.map((t, i) => ({ time: t, actual: i <= NOW ? a[i] : null, predicted: i >= NOW ? p[i - NOW] : null }))

export const regions = [
  { id: 'annapurna', name: 'Annapurna Canteen', capacity: 180, current: 144, approaching: 28, avg: 130, peak: 172, peakTime: '1:10 PM', pred: { 5: 156, 10: 172, 15: 178 }, confidence: 0.89, series: mk([110,122,134,140,144],[144,156,172,178]) },
  { id: 'stationery-1', name: 'Stationery 1 (ABC Block)', capacity: 35, current: 31, approaching: 15, avg: 22, peak: 34, peakTime: '1:30 PM', pred: { 5: 33, 10: 35, 15: 36 }, confidence: 0.88, series: mk([18,22,26,29,31],[31,33,35,36]) },
  { id: 'stationery-2', name: 'Stationery 2 (Behind A Block)', capacity: 30, current: 11, approaching: 4, avg: 14, peak: 22, peakTime: '2:15 PM', pred: { 5: 12, 10: 14, 15: 16 }, confidence: 0.91, series: mk([8,9,10,10,11],[11,12,14,16]) },
  { id: 'library', name: 'Central Library', capacity: 200, current: 118, approaching: 14, avg: 110, peak: 165, peakTime: '3:30 PM', pred: { 5: 122, 10: 128, 15: 134 }, confidence: 0.85, series: mk([105,108,112,115,118],[118,122,128,134]) },
  { id: 'block-abc', name: 'ABC Block', capacity: 350, current: 235, approaching: 24, avg: 210, peak: 310, peakTime: '12:45 PM', pred: { 5: 242, 10: 250, 15: 258 }, confidence: 0.87, series: mk([210,218,225,230,235],[235,242,250,258]) },
  { id: 'block-a', name: 'A Block', capacity: 250, current: 165, approaching: 18, avg: 150, peak: 215, peakTime: '1:45 PM', pred: { 5: 170, 10: 178, 15: 185 }, confidence: 0.86, series: mk([145,150,158,162,165],[165,170,178,185]) },
  { id: 'block-b', name: 'B Block', capacity: 230, current: 150, approaching: 15, avg: 140, peak: 200, peakTime: '1:45 PM', pred: { 5: 155, 10: 162, 15: 168 }, confidence: 0.88, series: mk([130,135,142,146,150],[150,155,162,168]) },
  { id: 'block-c', name: 'C Block', capacity: 210, current: 110, approaching: 10, avg: 105, peak: 175, peakTime: '2:00 PM', pred: { 5: 114, 10: 118, 15: 122 }, confidence: 0.9, series: mk([98,102,105,108,110],[110,114,118,122]) },
  { id: 'block-d', name: 'D Block', capacity: 240, current: 175, approaching: 20, avg: 160, peak: 220, peakTime: '1:50 PM', pred: { 5: 182, 10: 190, 15: 198 }, confidence: 0.86, series: mk([150,158,165,170,175],[175,182,190,198]) },
  { id: 'block-e', name: 'E Block', capacity: 260, current: 140, approaching: 12, avg: 135, peak: 205, peakTime: '2:30 PM', pred: { 5: 144, 10: 148, 15: 152 }, confidence: 0.89, series: mk([125,130,132,136,140],[140,144,148,152]) },
  { id: 'sports-court', name: 'Sports Court', capacity: 130, current: 48, approaching: 8, avg: 45, peak: 95, peakTime: '4:30 PM', pred: { 5: 50, 10: 55, 15: 60 }, confidence: 0.84, series: mk([35,38,42,45,48],[48,50,55,60]) },
  { id: 'main-gate', name: 'Main Campus Gate', capacity: 200, current: 72, approaching: 26, avg: 80, peak: 150, peakTime: '12:50 PM', pred: { 5: 75, 10: 80, 15: 82 }, confidence: 0.92, series: mk([60,64,68,70,72],[72,75,80,82]) }
]

export const counterfactual = {
  regionId: 'stationery-1',
  horizon: 10,
  selected: 'B',
  scenarios: [
    { key: 'A', label: 'No intervention (Status Quo)', predicted: 35, downstream: 'Stationery 2 remains at 14' },
    { key: 'B', label: 'Redirect 40% to Stationery 2', predicted: 24, downstream: 'Stationery 2 rises to 18 (60%)' },
    { key: 'C', label: 'Activate +1 reserve counter', predicted: 22, downstream: 'No downstream impact' },
    { key: 'D', label: 'Deploy 2 queue marshals', predicted: 26, downstream: 'Corridor cleared smoothly' }
  ]
}

export const alerts = [
  { id: 1, severity: 'high', title: 'Queue Bottleneck: Stationery 1', detail: 'Queue length is 12; Stationery 2 behind A Block has zero wait.', time: '2 min ago' },
  { id: 2, severity: 'high', title: 'Approaching Lunch Peak at Annapurna Canteen', detail: 'Occupancy is 144/180 (80%), forecast predicts 172 in 10 mins.', time: '4 min ago' },
  { id: 3, severity: 'medium', title: 'Corridor Surge: D Block Walkway', detail: 'IT lab transition flow is +35% above normal.', time: '12 min ago' }
]

export const feedback = { lastError: -1.8, mae: 2.9, note: 'Model parameters updated 3 min ago' }
