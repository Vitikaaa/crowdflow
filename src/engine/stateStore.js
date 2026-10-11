/**
 * Campus Digital Twin Master State Store
 * Central reactive store coordinating sensor fusion, graph flow, multi-horizon forecasts,
 * counterfactual simulations, constrained orchestration, and closed-loop feedback.
 */

import { CAMPUS_NODES, CAMPUS_EDGES, THRESHOLDS, getRegionById } from './campusGraph.js'
import { generateSensorReadings, fuseSensorSignals } from './sensorFusion.js'
import { generateRegionForecast } from './forecasting.js'
import { runStandardScenarioSuite, simulateNetworkScenario } from './counterfactualSim.js'
import { rankInterventions, DEFAULT_OBJECTIVE_WEIGHTS, OPERATIONAL_LIMITS } from './orchestration.js'
import { INITIAL_OBSERVATION_HISTORY, RECALIBRATION_LOGS, calculateErrorMetrics, logObservation, evaluateInterventionOutcome } from './feedbackLoop.js'

const STORAGE_KEY = 'crowdflow_twin_state_v2'

function buildInitialCampusState() {
  const regionsMap = {}
  
  // Baseline occupancies and telemetry
  const initialData = {
    'canteen-a': { occ: 42, arr: 26, dep: 14, counters: 3, approaching: 25, peakTime: '1:05 PM' },
    'canteen-b': { occ: 22, arr: 10, dep: 12, counters: 3, approaching: 6, peakTime: '1:15 PM' },
    'library': { occ: 96, arr: 18, dep: 16, counters: 2, approaching: 12, peakTime: '3:30 PM' },
    'printing': { occ: 11, arr: 12, dep: 11, counters: 2, approaching: 4, peakTime: '4:00 PM' },
    'services': { occ: 16, arr: 9, dep: 8, counters: 3, approaching: 5, peakTime: '11:30 AM' },
    'lecture-hall': { occ: 130, arr: 28, dep: 22, counters: 4, approaching: 35, peakTime: '1:50 PM' },
    'main-entrance': { occ: 65, arr: 35, dep: 32, counters: 4, approaching: 20, peakTime: '12:55 PM' }
  }

  CAMPUS_NODES.forEach((node) => {
    const init = initialData[node.id] || { occ: 30, arr: 12, dep: 10, counters: node.baseCounters, approaching: 8, peakTime: '2:00 PM' }
    const rawSensors = generateSensorReadings(node, init.occ)
    const fused = fuseSensorSignals(rawSensors)

    regionsMap[node.id] = {
      ...node,
      current: fused.fusedOccupancy,
      capacity: node.capacity,
      approaching: init.approaching,
      arrivalRate: init.arr,
      departureRate: init.dep,
      activeCounters: init.counters,
      queue: Math.max(0, fused.fusedOccupancy > node.capacity * 0.8 ? fused.fusedOccupancy - Math.round(node.capacity * 0.8) : 0),
      peakTime: init.peakTime,
      sensorData: fused
    }
  })

  // Compute multi-horizon forecasts
  const forecasts = {}
  Object.values(regionsMap).forEach((r) => {
    forecasts[r.id] = generateRegionForecast(r)
  })

  // Compute counterfactual scenarios for Canteen A
  const baselineStates = {}
  Object.values(regionsMap).forEach((r) => {
    baselineStates[r.id] = {
      occupancy: r.current,
      arrivalRate: r.arrivalRate,
      departureRate: r.departureRate,
      counters: r.activeCounters,
      queue: r.queue
    }
  })

  const standardScenarios = runStandardScenarioSuite(baselineStates, 'canteen-a', 'canteen-b')
  const ranked = rankInterventions(standardScenarios)

  const initialAlerts = [
    {
      id: 'alt-1',
      severity: 'high',
      regionId: 'canteen-a',
      title: 'Predicted Critical Congestion at Canteen A',
      detail: 'Approaching arrivals will push Canteen A to 71/80 seats (89% utilization) within 10 minutes.',
      time: '2 min ago',
      timestamp: Date.now() - 120000,
      actionable: true,
      suggestedScenario: 'F'
    },
    {
      id: 'alt-2',
      severity: 'medium',
      regionId: 'canteen-a',
      title: 'Unexpected Inflow Surge along Lecture Corridor',
      detail: 'Corridor flow from Lecture Hall Complex increased by +42% over baseline rate.',
      time: '5 min ago',
      timestamp: Date.now() - 300000,
      actionable: true,
      suggestedScenario: 'B'
    },
    {
      id: 'alt-3',
      severity: 'low',
      regionId: 'library',
      title: 'Library Trending Above Seasonal Average',
      detail: 'Occupancy at Central Library is 96/150 (64%), higher than typical mid-day study average.',
      time: '18 min ago',
      timestamp: Date.now() - 1080000,
      actionable: false
    }
  ]

  const initialHistory = [...INITIAL_OBSERVATION_HISTORY]
  const metrics = calculateErrorMetrics(initialHistory)

  return {
    regions: regionsMap,
    edges: CAMPUS_EDGES,
    forecasts,
    scenarios: standardScenarios,
    rankedRecommendations: ranked,
    selectedRegionId: 'canteen-a',
    alerts: initialAlerts,
    dismissedAlertIds: [],
    observationHistory: initialHistory,
    errorMetrics: metrics,
    recalibrationLogs: RECALIBRATION_LOGS,
    activeInterventions: [],
    interventionHistory: [
      {
        id: 'int-hist-01',
        scenarioKey: 'C',
        label: 'Open Express Counter #4',
        regionId: 'canteen-a',
        dispatchedAt: '12:15 PM',
        completedAt: '12:35 PM',
        status: 'Completed',
        staffCount: 1,
        outcomeEvaluation: 'Successfully cleared 24 waiting students during morning tea transition.'
      }
    ],
    objectiveWeights: DEFAULT_OBJECTIVE_WEIGHTS,
    operationalLimits: OPERATIONAL_LIMITS,
    simulationClock: '12:50 PM',
    stepCount: 0
  }
}

// In-memory state with persistence
let currentState = null

function loadState() {
  if (currentState) return currentState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      currentState = JSON.parse(raw)
      return currentState
    }
  } catch {
    // fallback if localStorage not accessible
  }
  currentState = buildInitialCampusState()
  return currentState
}

function saveState(state) {
  currentState = state
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage quota
  }
  notifySubscribers()
}

const subscribers = new Set()
function notifySubscribers() {
  subscribers.forEach((cb) => cb(currentState))
}

export const CampusStore = {
  getState() {
    return loadState()
  },

  subscribe(callback) {
    subscribers.add(callback)
    callback(loadState())
    return () => subscribers.delete(callback)
  },

  setSelectedRegion(regionId) {
    const state = loadState()
    saveState({ ...state, selectedRegionId: regionId })
  },

  dismissAlert(alertId) {
    const state = loadState()
    saveState({
      ...state,
      dismissedAlertIds: [...state.dismissedAlertIds, alertId]
    })
  },

  updateObjectiveWeights(newWeights) {
    const state = loadState()
    const weights = { ...state.objectiveWeights, ...newWeights }
    const ranked = rankInterventions(state.scenarios, weights, state.operationalLimits)
    saveState({
      ...state,
      objectiveWeights: weights,
      rankedRecommendations: ranked
    })
  },

  executeIntervention(scenarioKey, operatorNotes = '') {
    const state = loadState()
    const targetScenario = state.rankedRecommendations.find((r) => r.key === scenarioKey) || state.rankedRecommendations[0]
    
    const newIntervention = {
      id: `int-${Date.now()}`,
      scenarioKey: targetScenario.key,
      label: targetScenario.label,
      targetRegionId: targetScenario.targetRegionId,
      destinationRegionId: targetScenario.destinationRegionId,
      dispatchedAt: state.simulationClock,
      status: 'Active',
      operatorNotes,
      metrics: targetScenario.metrics,
      dispatchPackage: targetScenario.dispatchPackage
    }

    // Apply immediate effect to target region
    const updatedRegions = { ...state.regions }
    const targetR = updatedRegions[targetScenario.targetRegionId]
    if (targetR) {
      if (targetScenario.key === 'C' || targetScenario.metrics.requiredCounters > 0) {
        targetR.activeCounters += targetScenario.metrics.requiredCounters || 1
      }
    }

    // Recompute forecasts
    const forecasts = {}
    Object.values(updatedRegions).forEach((r) => {
      forecasts[r.id] = generateRegionForecast(r)
    })

    const updatedInterventions = [newIntervention, ...state.activeInterventions]
    const updatedHistory = [newIntervention, ...state.interventionHistory]

    saveState({
      ...state,
      regions: updatedRegions,
      forecasts,
      activeInterventions: updatedInterventions,
      interventionHistory: updatedHistory
    })

    return { ok: true, intervention: newIntervention }
  },

  /**
   * Advance simulation time step by +5 minutes
   * Evaluates outcomes, logs residual error, and updates forecasts
   */
  advanceSimulationStep() {
    const state = loadState()
    const targetR = state.regions['canteen-a']
    const predicted10m = state.forecasts['canteen-a']?.predictions[10] || 71

    // If active intervention exists, actual occupancy reflects relief
    const hasActiveIntervention = state.activeInterventions.some((i) => i.targetRegionId === 'canteen-a' && i.status === 'Active')
    const actualObserved = hasActiveIntervention ? Math.min(62, targetR.current + 8) : targetR.current + 16

    // Update time string (e.g., 12:50 PM -> 12:55 PM)
    const [timePart, meridiem] = state.simulationClock.split(' ')
    const [h, m] = timePart.split(':').map(Number)
    let newM = m + 5
    let newH = h
    if (newM >= 60) {
      newM -= 60
      newH = (newH % 12) + 1
    }
    const newClock = `${newH}:${newM < 10 ? '0' + newM : newM} ${meridiem}`

    // Log observation and compute E(t)
    const { updatedHistory, metrics } = logObservation(state.observationHistory, {
      regionId: 'canteen-a',
      actual: actualObserved,
      predicted: predicted10m,
      horizon: 10,
      timeStr: newClock
    })

    // Advance regional states
    const updatedRegions = { ...state.regions }
    Object.values(updatedRegions).forEach((r) => {
      let delta = (Math.random() - 0.42) * 5
      if (r.id === 'canteen-a') delta = hasActiveIntervention ? 4 : 10
      if (r.id === 'canteen-b' && hasActiveIntervention) delta = 8 // absorbs redirected flow!

      const newOcc = Math.max(5, Math.min(Math.round(r.capacity * 1.2), Math.round(r.current + delta)))
      const raw = generateSensorReadings(r, newOcc)
      const fused = fuseSensorSignals(raw)

      updatedRegions[r.id] = {
        ...r,
        current: fused.fusedOccupancy,
        sensorData: fused
      }
    })

    // Recompute forecasts
    const forecasts = {}
    Object.values(updatedRegions).forEach((r) => {
      forecasts[r.id] = generateRegionForecast(r)
    })

    // Re-run counterfactuals
    const baselineStates = {}
    Object.values(updatedRegions).forEach((r) => {
      baselineStates[r.id] = {
        occupancy: r.current,
        arrivalRate: r.arrivalRate,
        departureRate: r.departureRate,
        counters: r.activeCounters,
        queue: r.queue
      }
    })
    const standardScenarios = runStandardScenarioSuite(baselineStates, 'canteen-a', 'canteen-b')
    const ranked = rankInterventions(standardScenarios, state.objectiveWeights, state.operationalLimits)

    // Complete interventions if active
    const completedInterventions = state.activeInterventions.map((inv) => ({
      ...inv,
      status: 'Completed',
      outcomeEvaluation: evaluateInterventionOutcome(actualObserved, 76, targetR.capacity).verdict
    }))

    saveState({
      ...state,
      simulationClock: newClock,
      stepCount: state.stepCount + 1,
      regions: updatedRegions,
      forecasts,
      scenarios: standardScenarios,
      rankedRecommendations: ranked,
      observationHistory: updatedHistory,
      errorMetrics: metrics,
      activeInterventions: [],
      interventionHistory: [...completedInterventions, ...state.interventionHistory]
    })
  },

  triggerArrivalSpike() {
    const state = loadState()
    const updatedRegions = { ...state.regions }
    if (updatedRegions['canteen-a']) {
      updatedRegions['canteen-a'].current = Math.min(78, updatedRegions['canteen-a'].current + 18)
      updatedRegions['canteen-a'].arrivalRate += 15
      updatedRegions['canteen-a'].approaching += 20
    }

    const baselineStates = {}
    Object.values(updatedRegions).forEach((r) => {
      baselineStates[r.id] = {
        occupancy: r.current,
        arrivalRate: r.arrivalRate,
        departureRate: r.departureRate,
        counters: r.activeCounters,
        queue: r.queue
      }
    })

    const standardScenarios = runStandardScenarioSuite(baselineStates, 'canteen-a', 'canteen-b')
    const ranked = rankInterventions(standardScenarios, state.objectiveWeights, state.operationalLimits)

    const forecasts = {}
    Object.values(updatedRegions).forEach((r) => {
      forecasts[r.id] = generateRegionForecast(r)
    })

    const spikeAlert = {
      id: `alt-spike-${Date.now()}`,
      severity: 'high',
      regionId: 'canteen-a',
      title: 'CRITICAL INFLOW SURGE: Canteen A',
      detail: 'Sudden class dismissal from Lecture Hall Complex directed +35 students to Canteen A.',
      time: 'Just now',
      timestamp: Date.now(),
      actionable: true,
      suggestedScenario: 'F'
    }

    saveState({
      ...state,
      regions: updatedRegions,
      forecasts,
      scenarios: standardScenarios,
      rankedRecommendations: ranked,
      alerts: [spikeAlert, ...state.alerts]
    })
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY)
    currentState = buildInitialCampusState()
    saveState(currentState)
  }
}
