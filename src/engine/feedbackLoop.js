/**
 * Closed-Loop Feedback & Recalibration Engine
 * Evaluates forecast accuracy, computes residual error E(t) = Actual(t) - Predicted(t),
 * computes MAE/RMSE across horizons, assesses intervention efficacy, and manages recalibration logs.
 */

export const INITIAL_OBSERVATION_HISTORY = [
  { timestamp: '12:30', regionId: 'canteen-a', actual: 24, predicted: 26, error: -2, horizon: 10 },
  { timestamp: '12:35', regionId: 'canteen-a', actual: 28, predicted: 30, error: -2, horizon: 10 },
  { timestamp: '12:40', regionId: 'canteen-a', actual: 33, predicted: 35, error: -2, horizon: 10 },
  { timestamp: '12:45', regionId: 'canteen-a', actual: 38, predicted: 39, error: -1, horizon: 10 },
  { timestamp: '12:50', regionId: 'canteen-a', actual: 42, predicted: 44, error: -2, horizon: 10 }
]

export const RECALIBRATION_LOGS = [
  {
    id: 'cal-01',
    timestamp: '12:20 PM',
    trigger: 'Scheduled 30-min rolling batch calibration',
    adjustment: 'Adjusted base arrival smoothing weight alpha from 0.75 to 0.78',
    maeBefore: 4.2,
    maeAfter: 3.1,
    status: 'Applied'
  },
  {
    id: 'cal-02',
    timestamp: '12:46 PM',
    trigger: 'Feedback residual threshold: consecutive negative bias detected (E(t) < -1.5)',
    adjustment: 'Offset arrival surge dampening factor by -4% for Canteen A lunch corridor',
    maeBefore: 3.4,
    maeAfter: 2.8,
    status: 'Applied'
  }
]

/**
 * Calculate MAE, RMSE, and bias from observation series
 */
export function calculateErrorMetrics(history) {
  if (!history || history.length === 0) {
    return { mae: 0, rmse: 0, meanBias: 0, sampleCount: 0 }
  }

  let absSum = 0
  let sqSum = 0
  let biasSum = 0

  history.forEach((h) => {
    const err = h.error ?? (h.actual - h.predicted)
    absSum += Math.abs(err)
    sqSum += Math.pow(err, 2)
    biasSum += err
  })

  const n = history.length
  return {
    mae: Number((absSum / n).toFixed(2)),
    rmse: Number(Math.sqrt(sqSum / n).toFixed(2)),
    meanBias: Number((biasSum / n).toFixed(2)),
    sampleCount: n
  }
}

/**
 * Record a new observation and compute its residual
 */
export function logObservation(history, { regionId, actual, predicted, horizon = 10, timeStr }) {
  const error = actual - predicted
  const newEntry = {
    timestamp: timeStr || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    regionId,
    actual,
    predicted,
    error,
    horizon
  }

  const updatedHistory = [...history, newEntry].slice(-15) // keep last 15 steps
  const metrics = calculateErrorMetrics(updatedHistory)

  return {
    updatedHistory,
    latestError: error,
    metrics
  }
}

/**
 * Evaluate completed intervention outcome vs counterfactual baseline
 */
export function evaluateInterventionOutcome(actualOccupancy, baselineCounterfactualOccupancy, capacity) {
  const preventedSurge = baselineCounterfactualOccupancy - actualOccupancy
  const percentSaved = baselineCounterfactualOccupancy > 0
    ? Math.round((preventedSurge / baselineCounterfactualOccupancy) * 100)
    : 0

  const capacitySavedPct = Math.round((preventedSurge / capacity) * 100)
  const success = actualOccupancy < capacity * 0.85

  return {
    actualOccupancy,
    baselineCounterfactualOccupancy,
    preventedSurge: Math.max(0, preventedSurge),
    percentSaved: Math.max(0, percentSaved),
    capacitySavedPct: Math.max(0, capacitySavedPct),
    success,
    verdict: success
      ? `Intervention successful: kept occupancy ${actualOccupancy}/${capacity} below 85% threshold, preventing estimated surge of ${preventedSurge} students.`
      : `Intervention partially mitigated surge by ${preventedSurge} students, but demand exceeded initial forecast.`
  }
}
