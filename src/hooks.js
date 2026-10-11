import { useEffect, useState, useCallback } from 'react'
import { CampusStore } from './engine/stateStore.js'

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
    }, 250)
  }, [])

  const selectRegion = useCallback((id) => {
    CampusStore.setSelectedRegion(id)
  }, [])

  const dismissAlert = useCallback((id) => {
    CampusStore.dismissAlert(id)
  }, [])

  const advanceStep = useCallback(() => {
    CampusStore.advanceSimulationStep()
  }, [])

  const triggerSpike = useCallback(() => {
    CampusStore.triggerArrivalSpike()
  }, [])

  const resetAll = useCallback(() => {
    CampusStore.resetToDefault()
  }, [])

  const runIntervention = useCallback((scenarioKey, notes) => {
    return CampusStore.executeIntervention(scenarioKey, notes)
  }, [])

  const updateWeights = useCallback((weights) => {
    CampusStore.updateObjectiveWeights(weights)
  }, [])

  // Adapt for backwards compatibility with existing components
  const regionsArray = Object.values(state.regions || {})
  const activeAlerts = (state.alerts || []).filter(
    (a) => !state.dismissedAlertIds?.includes(a.id)
  )

  const selectedRegion = state.regions?.[state.selectedRegionId] || regionsArray[0]

  return {
    loading,
    state,
    regions: regionsArray,
    regionsMap: state.regions,
    selectedRegionId: state.selectedRegionId,
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
    interventionHistory: state.interventionHistory,
    simulationClock: state.simulationClock,
    stepCount: state.stepCount,
    objectiveWeights: state.objectiveWeights,
    operationalLimits: state.operationalLimits,
    source: 'engine',
    refresh,
    selectRegion,
    dismissAlert,
    advanceStep,
    triggerSpike,
    resetAll,
    runIntervention,
    updateWeights
  }
}
