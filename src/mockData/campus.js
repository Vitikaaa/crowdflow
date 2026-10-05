// MOCK DATA: illustrative values only (Canteen A example mirrors patent §10.7/10.11). Replace via services/api.js.
export const THRESHOLDS = { moderate: 40, high: 70, critical: 90 } // % of capacity (assumed; confirm with project doc)
const times = ['12:30','12:35','12:40','12:45','12:50','12:55','13:00','13:05']
const NOW = 4
const mk = (a, p) => times.map((t, i) => ({ time: t, actual: i <= NOW ? a[i] : null, predicted: i >= NOW ? p[i - NOW] : null }))
export const regions = [
  { id: 'canteen-a', name: 'Canteen A', capacity: 80, current: 42, approaching: 25, avg: 38, peak: 74, peakTime: '1:05 PM', pred: { 5: 55, 10: 71, 15: 76 }, confidence: 0.87, series: mk([24,28,33,38,42],[42,55,71,76]) },
  { id: 'canteen-b', name: 'Canteen B', capacity: 80, current: 22, approaching: 4, avg: 30, peak: 52, peakTime: '1:15 PM', pred: { 5: 25, 10: 29, 15: 34 }, confidence: 0.9, series: mk([14,16,18,20,22],[22,25,29,34]) },
  { id: 'library', name: 'Library', capacity: 150, current: 96, approaching: 8, avg: 88, peak: 131, peakTime: '3:30 PM', pred: { 5: 98, 10: 101, 15: 103 }, confidence: 0.84, series: mk([88,90,92,94,96],[96,98,101,103]) },
  { id: 'printing', name: 'Printing Centre', capacity: 30, current: 9, approaching: 2, avg: 11, peak: 24, peakTime: '4:00 PM', pred: { 5: 10, 10: 11, 15: 11 }, confidence: 0.8, series: mk([6,7,8,8,9],[9,10,11,11]) },
  { id: 'services', name: 'Student Services', capacity: 40, current: 15, approaching: 3, avg: 16, peak: 33, peakTime: '11:30 AM', pred: { 5: 16, 10: 17, 15: 17 }, confidence: 0.82, series: mk([11,12,13,14,15],[15,16,17,17]) },
]
// Counterfactual scenarios (patent §10.6–10.7, illustrative) for Canteen A @ +10 min
export const counterfactual = { regionId: 'canteen-a', horizon: 10, selected: 'D', scenarios: [
  { key: 'A', label: 'No intervention', predicted: 71, downstream: 'Canteen B stays near 29' },
  { key: 'B', label: 'Redirect 10 users to Canteen B', predicted: 58, downstream: 'Canteen B rises to 39 (49%)' },
  { key: 'C', label: 'Delay incoming users', predicted: 54, downstream: 'Small secondary rise at 13:10' },
  { key: 'D', label: 'Activate additional counter', predicted: 49, downstream: 'No downstream effect' } ] }
export const alerts = [
  { id: 1, severity: 'high', title: 'Predicted congestion at Canteen A', detail: '25 students approaching; occupancy expected to reach 71 (89%) by 13:00.', time: '2 min ago' },
  { id: 2, severity: 'medium', title: 'Unexpected arrival spike', detail: 'Arrival rate is well above the usual level near the Canteen A entrance.', time: '6 min ago' },
  { id: 3, severity: 'low', title: 'Library trending above average', detail: 'Occupancy is above the recent average for this hour.', time: '18 min ago' } ]
// Feedback loop (patent §10.10): E(t) = actual - predicted
export const feedback = { lastError: -2, mae: 3.1, note: 'Model parameters updated 4 min ago' }
