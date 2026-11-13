/**
 * Campus Digital Twin Master State Store – VNR VJIET
 * Central reactive store coordinating sensor fusion, graph flow, multi-horizon forecasts,
 * counterfactual simulations, constrained orchestration, and operational crowd controls.
 */

import { CAMPUS_NODES, CAMPUS_EDGES, THRESHOLDS, getRegionById, resolveRegionId } from './campusGraph.js'
import { generateSensorReadings, fuseSensorSignals } from './sensorFusion.js'
import { generateRegionForecast } from './forecasting.js'
import { runStandardScenarioSuite, simulateNetworkScenario } from './counterfactualSim.js'
import { rankInterventions, DEFAULT_OBJECTIVE_WEIGHTS, OPERATIONAL_LIMITS } from './orchestration.js'
import { INITIAL_OBSERVATION_HISTORY, RECALIBRATION_LOGS, calculateErrorMetrics, logObservation, evaluateInterventionOutcome } from './feedbackLoop.js'

const STORAGE_KEY = 'crowdflow_vnr_redesign_v4'

function buildInitialCampusState() {
  const regionsMap = {}
  
  // Exact initial telemetry calibrated to the operational image
  const initialData = {
    'annapurna': { occ: 164, cap: 200, arr: 38, dep: 24, counters: 2, maxCounters: 3, queue: 28, waitMin: 12, peakTime: '1:10 PM' },
    'stationery-1': { occ: 31, cap: 35, arr: 18, dep: 10, counters: 2, maxCounters: 4, queue: 14, waitMin: 8, peakTime: '1:30 PM' },
    'stationery-2': { occ: 10, cap: 30, arr: 6, dep: 8, counters: 2, maxCounters: 3, queue: 1, waitMin: 1, peakTime: '2:15 PM' },
    'library': { occ: 118, cap: 200, arr: 22, dep: 18, counters: 3, maxCounters: 5, queue: 0, waitMin: 0, peakTime: '3:30 PM' },
    'block-abc': { occ: 248, cap: 350, arr: 35, dep: 28, counters: 4, maxCounters: 6, queue: 0, waitMin: 0, peakTime: '12:45 PM' },
    'block-a': { occ: 170, cap: 250, arr: 25, dep: 22, counters: 3, maxCounters: 5, queue: 0, waitMin: 0, peakTime: '1:45 PM' },
    'block-pg': { occ: 92, cap: 220, arr: 15, dep: 14, counters: 3, maxCounters: 5, queue: 0, waitMin: 0, peakTime: '2:00 PM' },
    'block-d': { occ: 125, cap: 240, arr: 20, dep: 18, counters: 3, maxCounters: 5, queue: 0, waitMin: 0, peakTime: '1:50 PM' },
    'block-e': { occ: 99, cap: 260, arr: 18, dep: 16, counters: 3, maxCounters: 5, queue: 0, waitMin: 0, peakTime: '2:30 PM' },
    'sports-court': { occ: 36, cap: 120, arr: 10, dep: 8, counters: 2, maxCounters: 3, queue: 0, waitMin: 0, peakTime: '4:30 PM' },
    'main-gate': { occ: 90, cap: 200, arr: 42, dep: 38, counters: 4, maxCounters: 6, queue: 0, waitMin: 0, peakTime: '12:50 PM' }
  }

  const facilitySettingsMap = {}

  CAMPUS_NODES.forEach((node) => {
    const init = initialData[node.id] || { occ: 50, cap: node.capacity, arr: 12, dep: 10, counters: node.baseCounters, queue: 0, waitMin: 2, peakTime: '2:00 PM' }
    const rawSensors = generateSensorReadings(node, init.occ)
    const fused = fuseSensorSignals(rawSensors)

    regionsMap[node.id] = {
      ...node,
      current: init.occ,
      capacity: init.cap || node.capacity,
      approaching: Math.round(init.occ * 0.15),
      arrivalRate: init.arr,
      departureRate: init.dep,
      activeCounters: init.counters,
      maxCounters: init.maxCounters || node.maxCounters || 4,
      queue: init.queue,
      estimatedWaitMin: init.waitMin,
      peakTime: init.peakTime,
      sensorData: fused
    }

    facilitySettingsMap[node.id] = {
      isOpen: true,
      isEntryRestricted: false,
      capacityLimit: init.cap || node.capacity,
      activeCounters: init.counters,
      assignedStaff: node.id === 'annapurna' ? 3 : 1,
      tokensPaused: false
    }
  })

  // Multi-horizon forecasts
  const forecasts = {}
  Object.values(regionsMap).forEach((r) => {
    forecasts[r.id] = generateRegionForecast(r)
  })

  // Counterfactual scenarios
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

  const standardScenarios = runStandardScenarioSuite(baselineStates, 'annapurna', 'stationery-2')
  const ranked = rankInterventions(standardScenarios)

  // Initial alerts matching the image
  const initialAlerts = [
    {
      id: 'alt-1',
      severity: 'high',
      regionId: 'annapurna',
      title: 'High crowd at Annapurna Canteen',
      detail: 'Occupancy at 82% · Wait time ~12 min',
      time: 'Just now',
      timestamp: Date.now() - 60000,
      actionable: true,
      suggestedScenario: 'C'
    },
    {
      id: 'alt-2',
      severity: 'medium',
      regionId: 'stationery-1',
      title: 'Stationery 1 nearing capacity',
      detail: '89% occupancy · Consider redistribution to Stationery 2',
      time: '3 min ago',
      timestamp: Date.now() - 180000,
      actionable: true,
      suggestedScenario: 'B'
    }
  ]

  // Initial student tokens
  const initialTokens = [
    {
      id: 'tok-164',
      tokenCode: 'ANN-164',
      facilityId: 'annapurna',
      facilityName: 'Annapurna Canteen',
      serviceType: 'Hot Lunch Counter',
      queueNumber: 28,
      peopleAhead: 6,
      estimatedWaitMin: 12,
      timestamp: '12:50 PM',
      status: 'In Queue'
    },
    {
      id: 'tok-088',
      tokenCode: 'ST1-088',
      facilityId: 'stationery-1',
      facilityName: 'Stationery 1 (ABC Block)',
      serviceType: 'Laser Print & Binding',
      queueNumber: 14,
      peopleAhead: 4,
      estimatedWaitMin: 8,
      timestamp: '12:45 PM',
      status: 'In Queue'
    }
  ]

  // Action history for Administrator Portal
  const initialActionHistory = [
    {
      id: 'act-1',
      timestamp: '12:40 PM',
      adminUser: 'Admin (Lalit)',
      facilityId: 'stationery-1',
      facilityName: 'Stationery 1',
      actionType: 'Staff Assigned',
      details: 'Deployed 1 queue marshal to organize corridor entry line',
      status: 'Applied'
    },
    {
      id: 'act-2',
      timestamp: '12:45 PM',
      adminUser: 'Admin (Lalit)',
      facilityId: 'annapurna',
      facilityName: 'Annapurna Canteen',
      actionType: 'Counter Opened',
      details: 'Activated Reserve Counter #2 for express takeaway meals',
      status: 'Applied'
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
    selectedRegionId: 'annapurna',
    facilitySettings: facilitySettingsMap,
    userRole: 'admin', // 'admin' | 'student'
    isAuthenticated: true,
    currentUser: {
      id: 'usr-admin',
      name: 'Admin (Lalit)',
      email: 'admin@vnrvjiet.in',
      role: 'admin'
    },
    tokens: initialTokens,
    tokenHistory: [
      {
        id: 'tok-hist-1',
        tokenCode: 'ANN-120',
        facilityName: 'Annapurna Canteen',
        serviceType: 'Juice & Snacks',
        timestamp: 'Yesterday, 1:15 PM',
        status: 'Served'
      },
      {
        id: 'tok-hist-2',
        tokenCode: 'ST2-014',
        facilityName: 'Stationery 2',
        serviceType: 'Record Sheets',
        timestamp: '10 Nov, 11:30 AM',
        status: 'Served'
      }
    ],
    actionHistory: initialActionHistory,
    announcements: [
      {
        id: 'ann-1',
        title: 'Mid-Day Lunch Traffic Advisory',
        body: 'Annapurna Canteen experiencing peak traffic. Stationery 2 and West kiosks are currently free with zero wait.',
        time: '12:48 PM',
        severity: 'info'
      }
    ],
    alerts: initialAlerts,
    dismissedAlertIds: [],
    observationHistory: initialHistory,
    errorMetrics: metrics,
    recalibrationLogs: RECALIBRATION_LOGS,
    activeInterventions: [],
    objectiveWeights: { ...DEFAULT_OBJECTIVE_WEIGHTS },
    operationalLimits: { ...OPERATIONAL_LIMITS },
    simulationClock: '12:55 PM',
    stepCount: 0
  }
}

// Reactive store subscribers
const listeners = new Set()
let currentState = null

function loadState() {
  if (currentState) return currentState
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.regions && parsed.regions['annapurna'] && parsed.regions['block-pg']) {
        currentState = parsed
        return currentState
      }
    }
  } catch (err) {
    console.warn('[stateStore] Storage parse error, resetting state', err)
  }
  currentState = buildInitialCampusState()
  saveState(currentState)
  return currentState
}

function saveState(newState) {
  currentState = newState
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  } catch (e) {
    console.warn('[stateStore] localStorage save failed', e)
  }
  listeners.forEach((fn) => fn(currentState))
}

export const CampusStore = {
  getState() {
    return loadState()
  },

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  setUserRole(role) {
    const state = loadState()
    saveState({ ...state, userRole: role })
  },

  login(role = 'admin', credentials = {}) {
    const state = loadState()
    const isAdm = role === 'admin'
    const user = isAdm
      ? {
          id: 'usr-admin',
          name: credentials.name || 'Admin (Lalit)',
          email: credentials.email || 'admin@vnrvjiet.in',
          role: 'admin'
        }
      : {
          id: 'usr-student',
          name: credentials.name || 'Praharshita VNR',
          email: credentials.email || 'praharshita@vnrvjiet.in',
          rollNumber: credentials.rollNumber || '21071A05XX',
          department: 'Computer Science & Engineering',
          role: 'student'
        }

    saveState({
      ...state,
      userRole: role,
      isAuthenticated: true,
      currentUser: user
    })
    return user
  },

  logout() {
    const state = loadState()
    saveState({
      ...state,
      isAuthenticated: false,
      currentUser: null
    })
  },

  selectRegion(regionId) {
    const state = loadState()
    const resolved = resolveRegionId(regionId)
    if (state.selectedRegionId !== resolved) {
      saveState({ ...state, selectedRegionId: resolved })
    }
  },

  // Operational Control Actions
  updateFacilitySettings(facilityId, patch, actionLabel) {
    const state = loadState()
    const resolved = resolveRegionId(facilityId)
    const currentSettings = state.facilitySettings[resolved] || {}
    const updatedSettings = {
      ...state.facilitySettings,
      [resolved]: { ...currentSettings, ...patch }
    }

    const updatedRegions = { ...state.regions }
    if (updatedRegions[resolved]) {
      if (patch.activeCounters !== undefined) {
        updatedRegions[resolved].activeCounters = patch.activeCounters
        // Recalculate wait time
        const q = updatedRegions[resolved].queue || 0
        updatedRegions[resolved].estimatedWaitMin = Math.max(1, Math.round((q * 1.5) / patch.activeCounters))
      }
      if (patch.capacityLimit !== undefined) {
        updatedRegions[resolved].capacity = patch.capacityLimit
      }
      if (patch.isOpen === false) {
        updatedRegions[resolved].queue = 0
        updatedRegions[resolved].estimatedWaitMin = 0
      }
    }

    const newAction = {
      id: `act-${Date.now()}`,
      timestamp: state.simulationClock || 'Just now',
      adminUser: 'Admin (Lalit)',
      facilityId: resolved,
      facilityName: updatedRegions[resolved]?.name || resolved,
      actionType: actionLabel || 'Facility Settings Modified',
      details: Object.entries(patch).map(([k, v]) => `${k}: ${v}`).join(', '),
      status: 'Applied'
    }

    saveState({
      ...state,
      regions: updatedRegions,
      facilitySettings: updatedSettings,
      actionHistory: [newAction, ...state.actionHistory]
    })
  },

  // Call Next Token in Queue
  callNextToken(facilityId) {
    const state = loadState()
    const resolved = resolveRegionId(facilityId)
    const region = state.regions[resolved]
    if (!region) return null

    const currentQ = region.queue || 0
    const newQ = Math.max(0, currentQ - 1)
    const newWait = Math.max(1, Math.round((newQ * 1.5) / Math.max(1, region.activeCounters)))

    const updatedRegions = {
      ...state.regions,
      [resolved]: {
        ...region,
        queue: newQ,
        estimatedWaitMin: newWait
      }
    }

    // Update tokens waiting for this facility
    let calledToken = null
    const updatedTokens = state.tokens.map((tok) => {
      if (tok.facilityId === resolved && tok.status === 'In Queue' && !calledToken) {
        calledToken = { ...tok, status: 'Serving' }
        return calledToken
      }
      if (tok.facilityId === resolved && tok.status === 'In Queue') {
        return {
          ...tok,
          peopleAhead: Math.max(0, tok.peopleAhead - 1),
          estimatedWaitMin: Math.max(1, tok.estimatedWaitMin - 2)
        }
      }
      return tok
    })

    const newAction = {
      id: `act-${Date.now()}`,
      timestamp: state.simulationClock || 'Just now',
      adminUser: 'Admin (Lalit)',
      facilityId: resolved,
      facilityName: region.name,
      actionType: 'Called Next Token',
      details: calledToken ? `Serving token #${calledToken.tokenCode}. Queue remaining: ${newQ}` : `Queue cleared to ${newQ}`,
      status: 'Applied'
    }

    saveState({
      ...state,
      regions: updatedRegions,
      tokens: updatedTokens,
      actionHistory: [newAction, ...state.actionHistory]
    })

    return calledToken
  },

  // Student Generate Token
  generateToken(facilityId, serviceType = 'Standard Service') {
    const state = loadState()
    const resolved = resolveRegionId(facilityId)
    const region = state.regions[resolved] || getRegionById(resolved)

    const prefix = resolved === 'annapurna' ? 'ANN' : resolved === 'stationery-1' ? 'ST1' : resolved === 'stationery-2' ? 'ST2' : 'LIB'
    const seq = Math.floor(Math.random() * 80) + 100
    const tokenCode = `${prefix}-${seq}`
    const queueNum = (region.queue || 0) + 1
    const peopleAhead = Math.max(0, queueNum - 1)
    const waitEst = Math.max(2, Math.round((queueNum * 1.5) / Math.max(1, region.activeCounters || 2)))

    const newToken = {
      id: `tok-${Date.now()}`,
      tokenCode,
      facilityId: resolved,
      facilityName: region.name || region.shortName,
      serviceType,
      queueNumber: queueNum,
      peopleAhead,
      estimatedWaitMin: waitEst,
      timestamp: state.simulationClock || '12:55 PM',
      status: 'In Queue'
    }

    // Update queue in region
    const updatedRegions = { ...state.regions }
    if (updatedRegions[resolved]) {
      updatedRegions[resolved].queue = queueNum
      updatedRegions[resolved].estimatedWaitMin = waitEst
    }

    saveState({
      ...state,
      regions: updatedRegions,
      tokens: [newToken, ...state.tokens]
    })

    return newToken
  },

  // Student Cancel Token
  cancelToken(tokenId) {
    const state = loadState()
    const tok = state.tokens.find((t) => t.id === tokenId)
    if (!tok) return

    const remainingTokens = state.tokens.filter((t) => t.id !== tokenId)
    const cancelledEntry = {
      ...tok,
      status: 'Cancelled',
      timestamp: state.simulationClock || 'Just now'
    }

    saveState({
      ...state,
      tokens: remainingTokens,
      tokenHistory: [cancelledEntry, ...state.tokenHistory]
    })
  },

  // Broadcast Announcement
  broadcastAnnouncement({ title, body, severity = 'info' }) {
    const state = loadState()
    const newAnn = {
      id: `ann-${Date.now()}`,
      title,
      body,
      time: state.simulationClock || 'Just now',
      severity
    }

    const newAction = {
      id: `act-${Date.now()}`,
      timestamp: state.simulationClock || 'Just now',
      adminUser: 'Admin (Lalit)',
      facilityId: 'all',
      facilityName: 'Campus Wide',
      actionType: 'Broadcast Announcement',
      details: title,
      status: 'Dispatched'
    }

    saveState({
      ...state,
      announcements: [newAnn, ...state.announcements],
      actionHistory: [newAction, ...state.actionHistory]
    })
  },

  // Redirect Crowd Flow
  redirectCrowd(sourceId, destId, fraction = 0.4) {
    const state = loadState()
    const src = resolveRegionId(sourceId)
    const dst = resolveRegionId(destId)
    const srcRegion = state.regions[src]
    const dstRegion = state.regions[dst]
    if (!srcRegion || !dstRegion) return

    const diverted = Math.round((srcRegion.queue || 10) * fraction)
    const newSrcQueue = Math.max(1, (srcRegion.queue || 10) - diverted)
    const newDstQueue = (dstRegion.queue || 0) + diverted

    const updatedRegions = {
      ...state.regions,
      [src]: {
        ...srcRegion,
        queue: newSrcQueue,
        estimatedWaitMin: Math.max(1, Math.round((newSrcQueue * 1.5) / Math.max(1, srcRegion.activeCounters)))
      },
      [dst]: {
        ...dstRegion,
        queue: newDstQueue,
        estimatedWaitMin: Math.max(1, Math.round((newDstQueue * 1.5) / Math.max(1, dstRegion.activeCounters)))
      }
    }

    const newAction = {
      id: `act-${Date.now()}`,
      timestamp: state.simulationClock || 'Just now',
      adminUser: 'Admin (Lalit)',
      facilityId: src,
      facilityName: srcRegion.name,
      actionType: 'Crowd Redirected',
      details: `Diverted ${Math.round(fraction * 100)}% (${diverted} people) to ${dstRegion.name}`,
      status: 'Applied'
    }

    saveState({
      ...state,
      regions: updatedRegions,
      actionHistory: [newAction, ...state.actionHistory]
    })
  },

  dismissAlert(alertId) {
    const state = loadState()
    const filtered = state.alerts.filter((a) => a.id !== alertId)
    saveState({
      ...state,
      alerts: filtered,
      dismissedAlertIds: [...state.dismissedAlertIds, alertId]
    })
  },

  executeIntervention(scenarioKey) {
    const state = loadState()
    const scenario = state.scenarios.find((s) => s.scenarioKey === scenarioKey)
    if (!scenario) return { ok: false, error: 'Scenario not found' }

    const targetRegion = state.regions[scenario.targetRegionId] || getRegionById(scenario.targetRegionId)
    const newIntervention = {
      id: `int-${Date.now()}`,
      scenarioKey,
      label: scenario.label,
      targetRegionId: scenario.targetRegionId,
      destinationRegionId: scenario.destinationRegionId,
      dispatchedAt: state.simulationClock,
      status: 'Active',
      staffCount: scenario.metrics.requiredStaff,
      countersAdded: scenario.metrics.requiredCounters,
      redirectFraction: scenario.redirectFraction || 0
    }

    const updatedRegions = { ...state.regions }
    if (updatedRegions[scenario.targetRegionId]) {
      const r = updatedRegions[scenario.targetRegionId]
      r.queue = Math.max(0, r.queue - 8)
      if (scenario.metrics.requiredCounters > 0) {
        r.activeCounters += scenario.metrics.requiredCounters
      }
    }

    const newAction = {
      id: `act-${Date.now()}`,
      timestamp: state.simulationClock || 'Just now',
      adminUser: 'Admin (Lalit)',
      facilityId: scenario.targetRegionId,
      facilityName: targetRegion.name,
      actionType: 'Intervention Executed',
      details: scenario.label,
      status: 'Applied'
    }

    saveState({
      ...state,
      regions: updatedRegions,
      activeInterventions: [...state.activeInterventions, newIntervention],
      actionHistory: [newAction, ...state.actionHistory]
    })

    return { ok: true, intervention: newIntervention }
  },

  advanceSimulationStep() {
    const state = loadState()
    const targetR = state.regions['annapurna'] || Object.values(state.regions)[0]
    const hasActiveIntervention = state.activeInterventions.some((i) => i.status === 'Active')

    const [timePart, meridiem] = (state.simulationClock || '12:55 PM').split(' ')
    const [h, m] = timePart.split(':').map(Number)
    let newM = m + 5
    let newH = h
    if (newM >= 60) {
      newM -= 60
      newH = (newH % 12) + 1
    }
    const newClock = `${newH}:${newM < 10 ? '0' + newM : newM} ${meridiem}`

    const updatedRegions = { ...state.regions }
    Object.values(updatedRegions).forEach((r) => {
      let delta = (Math.random() - 0.48) * 4
      if (r.id === 'annapurna') delta = hasActiveIntervention ? -3 : 2
      if (r.id === 'stationery-1') delta = hasActiveIntervention ? -2 : 1

      const newOcc = Math.max(4, Math.min(Math.round(r.capacity * 1.1), Math.round(r.current + delta)))
      const raw = generateSensorReadings(r, newOcc)
      const fused = fuseSensorSignals(raw)

      const queue = Math.max(0, newOcc > r.capacity * 0.8 ? newOcc - Math.round(r.capacity * 0.8) : 0)

      updatedRegions[r.id] = {
        ...r,
        current: fused.fusedOccupancy,
        queue,
        estimatedWaitMin: Math.max(1, Math.round((queue * 1.5) / Math.max(1, r.activeCounters))),
        sensorData: fused
      }
    })

    // Recompute forecasts
    const forecasts = {}
    Object.values(updatedRegions).forEach((r) => {
      forecasts[r.id] = generateRegionForecast(r)
    })

    saveState({
      ...state,
      simulationClock: newClock,
      stepCount: state.stepCount + 1,
      regions: updatedRegions,
      forecasts,
      activeInterventions: []
    })
  },

  resetToDefault() {
    localStorage.removeItem(STORAGE_KEY)
    currentState = buildInitialCampusState()
    saveState(currentState)
  }
}
