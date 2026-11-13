import { useEffect, useState, useCallback } from 'react'
import { CampusStore } from './engine/stateStore.js'
import { resolveRegionId, getRegionById } from './engine/campusGraph.js'

export function useCampus() {
  const [state, setState] = useState(() => CampusStore.getState())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = CampusStore.subscribe((next) => {
      setState(next)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const refresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setState({ ...CampusStore.getState() })
      setLoading(false)
    }, 200)
  }, [])

  const selectRegion = useCallback((id) => {
    CampusStore.selectRegion(id)
  }, [])

  const setUserRole = useCallback((role) => {
    CampusStore.setUserRole(role)
  }, [])

  const login = useCallback((role, credentials) => {
    return CampusStore.login(role, credentials)
  }, [])

  const logout = useCallback(() => {
    CampusStore.logout()
  }, [])

  const generateToken = useCallback((facilityId, serviceType) => {
    return CampusStore.generateToken(facilityId, serviceType)
  }, [])

  const cancelToken = useCallback((tokenId) => {
    CampusStore.cancelToken(tokenId)
  }, [])

  const callNextToken = useCallback((facilityId) => {
    return CampusStore.callNextToken(facilityId)
  }, [])

  const updateFacilitySettings = useCallback((facilityId, patch, actionLabel) => {
    CampusStore.updateFacilitySettings(facilityId, patch, actionLabel)
  }, [])

  const broadcastAnnouncement = useCallback((announcement) => {
    CampusStore.broadcastAnnouncement(announcement)
  }, [])

  const redirectCrowd = useCallback((sourceId, destId, fraction) => {
    CampusStore.redirectCrowd(sourceId, destId, fraction)
  }, [])

  const dismissAlert = useCallback((id) => {
    CampusStore.dismissAlert(id)
  }, [])

  const advanceStep = useCallback(() => {
    CampusStore.advanceSimulationStep()
  }, [])

  const resetAll = useCallback(() => {
    CampusStore.resetToDefault()
  }, [])

  const runIntervention = useCallback((scenarioKey) => {
    return CampusStore.executeIntervention(scenarioKey)
  }, [])

  const regionsArray = Object.values(state.regions || {})
  const activeAlerts = (state.alerts || []).filter(
    (a) => !state.dismissedAlertIds?.includes(a.id)
  )

  const resolvedSelectedId = resolveRegionId(state.selectedRegionId)
  const selectedRegion = state.regions?.[resolvedSelectedId] || regionsArray[0]

  return {
    loading,
    state,
    regions: regionsArray,
    regionsMap: state.regions,
    selectedRegionId: resolvedSelectedId,
    selectedRegion,
    edges: state.edges,
    forecasts: state.forecasts,
    scenarios: state.scenarios,
    rankedRecommendations: state.rankedRecommendations,
    alerts: activeAlerts,
    allAlerts: state.alerts,
    observationHistory: state.observationHistory,
    errorMetrics: state.errorMetrics,
    recalibrationLogs: state.recalibrationLogs,
    activeInterventions: state.activeInterventions,
    simulationClock: state.simulationClock,
    stepCount: state.stepCount,
    objectiveWeights: state.objectiveWeights,
    operationalLimits: state.operationalLimits,
    userRole: state.userRole || 'admin',
    isAuthenticated: state.isAuthenticated !== false,
    currentUser: state.currentUser || {
      id: 'usr-admin',
      name: 'Admin (Lalit)',
      email: 'admin@vnrvjiet.in',
      role: 'admin'
    },
    tokens: state.tokens || [],
    tokenHistory: state.tokenHistory || [],
    actionHistory: state.actionHistory || [],
    announcements: state.announcements || [],
    facilitySettings: state.facilitySettings || {},
    refresh,
    selectRegion,
    setUserRole,
    login,
    logout,
    generateToken,
    cancelToken,
    callNextToken,
    updateFacilitySettings,
    broadcastAnnouncement,
    redirectCrowd,
    dismissAlert,
    advanceStep,
    resetAll,
    runIntervention
  }
}
