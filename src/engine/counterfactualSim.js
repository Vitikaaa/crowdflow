/**
 * Counterfactual Intervention Simulator
 * Core research engine for simulating alternative futures across interconnected service regions.
 * Models multi-region network flow conservation, transit lag, and downstream capacity ripple effects.
 */

import { CAMPUS_NODES, CAMPUS_EDGES, getRegionById } from './campusGraph.js'

/**
 * Run a multi-region network simulation over time steps [0, 5, 10, 15, 20] min
 * @param {Object} baselineStates Map of regionId -> { occupancy, arrivalRate, departureRate, counters, queue }
 * @param {Object} interventionDef Scenario specification
 * @returns {Object} Simulation results including trajectories for all regions and summary metrics
 */
export function simulateNetworkScenario(baselineStates, interventionDef) {
  const timeSteps = [0, 5, 10, 15, 20]
  const targetId = interventionDef.targetRegionId || 'canteen-a'
  const destId = interventionDef.destinationRegionId || 'canteen-b'
  
  // Clone initial regional states
  const regionStates = {}
  CAMPUS_NODES.forEach((node) => {
    const base = baselineStates[node.id] || {}
    regionStates[node.id] = {
      id: node.id,
      name: node.name,
      capacity: node.capacity,
      occupancy: base.occupancy ?? (node.id === 'canteen-a' ? 42 : node.id === 'canteen-b' ? 22 : Math.round(node.capacity * 0.45)),
      arrivalRate: base.arrivalRate ?? (node.id === 'canteen-a' ? 26 : node.id === 'canteen-b' ? 10 : 12),
      departureRate: base.departureRate ?? 14,
      counters: base.counters ?? node.baseCounters ?? 3,
      queue: base.queue ?? 0,
      serviceRatePerCounter: 6
    }
  })

  // Trajectories store: regionId -> array of { minute, occupancy, queue, utilizationPct, arrivalRate }
  const trajectories = {}
  CAMPUS_NODES.forEach((node) => {
    trajectories[node.id] = [{
      minute: 0,
      occupancy: regionStates[node.id].occupancy,
      queue: regionStates[node.id].queue,
      utilizationPct: Math.round((regionStates[node.id].occupancy / regionStates[node.id].capacity) * 100),
      arrivalRate: regionStates[node.id].arrivalRate
    }]
  })

  // Apply scenario modifications to target parameters
  const redirectFraction = interventionDef.redirectFraction || 0 // 0 to 1
  const additionalCounters = interventionDef.additionalCounters || 0
  const additionalStaff = interventionDef.additionalStaff || 0
  const entryMeteringCap = interventionDef.entryMeteringCap || null // max arrivals/5min if metered

  let totalRedirected = 0
  let totalCostPoints = 0

  // Cost model
  totalCostPoints += additionalCounters * 15 // counter activation cost
  totalCostPoints += additionalStaff * 20    // staff personnel cost
  if (redirectFraction > 0) totalCostPoints += 10 // signage & mobile redirect push cost

  // Walking distance penalty (if redirecting from A to B: 150m, 2.5 min)
  const edgeAB = CAMPUS_EDGES.find(
    (e) => (e.source === targetId && e.target === destId) || (e.source === destId && e.target === targetId)
  )
  const walkingDistMeters = edgeAB ? edgeAB.distanceMeters : 150
  const transitLagMin = edgeAB ? edgeAB.transitTimeMin : 2.5

  // Time stepping simulation
  for (let step = 1; step < timeSteps.length; step++) {
    const t = timeSteps[step]

    CAMPUS_NODES.forEach((node) => {
      const state = regionStates[node.id]
      let inFlow = state.arrivalRate
      let outFlow = state.departureRate + (state.counters * state.serviceRatePerCounter)

      // Apply intervention effects
      if (node.id === targetId) {
        // Additional counters increase service processing
        if (additionalCounters > 0) {
          outFlow += additionalCounters * state.serviceRatePerCounter
        }
        // Additional staff reduce queue friction
        if (additionalStaff > 0) {
          outFlow += additionalStaff * 2
        }
        // Redirection diverts fraction of incoming flow
        if (redirectFraction > 0) {
          const diverted = Math.round(inFlow * redirectFraction)
          inFlow -= diverted
          totalRedirected += diverted
        }
        // Entry metering caps incoming flow
        if (entryMeteringCap != null) {
          inFlow = Math.min(inFlow, entryMeteringCap)
        }
      }

      // Downstream impact: diverted people arrive at destination after transit lag!
      if (node.id === destId && redirectFraction > 0) {
        // If t >= transitLagMin, diverted students arrive at destination
        if (t >= transitLagMin) {
          const arrivingDiverted = Math.round(regionStates[targetId].arrivalRate * redirectFraction)
          inFlow += arrivingDiverted
        }
      }

      // Autoregressive time progression
      const naturalSurge = (t === 10 && node.id === 'canteen-a') ? 6 : 0
      inFlow += naturalSurge

      const netDelta = inFlow - outFlow
      const newOcc = Math.max(0, Math.min(Math.round(state.capacity * 1.35), state.occupancy + netDelta))
      const newQueue = Math.max(0, newOcc > state.capacity * 0.85 ? newOcc - Math.round(state.capacity * 0.85) : 0)

      state.occupancy = newOcc
      state.queue = newQueue

      trajectories[node.id].push({
        minute: t,
        occupancy: newOcc,
        queue: newQueue,
        utilizationPct: Math.round((newOcc / state.capacity) * 100),
        arrivalRate: inFlow
      })
    })
  }

  // Summary analysis for target region and downstream region
  const targetTraj = trajectories[targetId]
  const destTraj = trajectories[destId]

  const peakTargetOcc = Math.max(...targetTraj.map((x) => x.occupancy))
  const peakTargetUtil = Math.max(...targetTraj.map((x) => x.utilizationPct))
  const avgTargetWaitMin = Number(
    (targetTraj.reduce((s, x) => s + (x.queue * 0.7), 0) / targetTraj.length).toFixed(1)
  )

  const peakDestOcc = Math.max(...destTraj.map((x) => x.occupancy))
  const peakDestUtil = Math.max(...destTraj.map((x) => x.utilizationPct))
  const destCapacity = getRegionById(destId).capacity

  // Downstream risk assessment
  let downstreamRisk = 'Low'
  let downstreamDetails = `${getRegionById(destId).name} peaks at ${peakDestOcc}/${destCapacity} (${peakDestUtil}%)`
  if (peakDestUtil >= 88) {
    downstreamRisk = 'Critical'
    downstreamDetails = `Severe downstream breach: ${getRegionById(destId).name} reaches ${peakDestUtil}% capacity!`
  } else if (peakDestUtil >= 75) {
    downstreamRisk = 'High'
    downstreamDetails = `Elevated load: ${getRegionById(destId).name} reaches ${peakDestUtil}% capacity`
  } else if (peakDestUtil >= 55) {
    downstreamRisk = 'Moderate'
    downstreamDetails = `Manageable absorption: ${getRegionById(destId).name} reaches ${peakDestUtil}% capacity`
  }

  // Count how many regions exceed threshold (>= 85%) across the network
  let regionsExceedingThreshold = 0
  CAMPUS_NODES.forEach((n) => {
    const maxUtil = Math.max(...trajectories[n.id].map((x) => x.utilizationPct))
    if (maxUtil >= 85) regionsExceedingThreshold++
  })

  return {
    scenarioKey: interventionDef.key,
    label: interventionDef.label,
    description: interventionDef.description,
    targetRegionId: targetId,
    destinationRegionId: destId,
    trajectories,
    timeSteps,
    metrics: {
      peakOccupancy: peakTargetOcc,
      peakUtilizationPct: peakTargetUtil,
      occupancyAt10m: targetTraj.find((x) => x.minute === 10)?.occupancy || peakTargetOcc,
      occupancyAt15m: targetTraj.find((x) => x.minute === 15)?.occupancy || peakTargetOcc,
      avgWaitTimeMin: avgTargetWaitMin,
      totalPeopleAffected: totalRedirected + (additionalCounters * 18),
      regionsExceedingThreshold,
      walkingDistanceImpactMeters: totalRedirected > 0 ? walkingDistMeters : 0,
      additionalWalkingTimeMin: totalRedirected > 0 ? transitLagMin : 0,
      resourceCost: totalCostPoints,
      requiredStaff: additionalStaff,
      requiredCounters: additionalCounters,
      downstreamRisk,
      downstreamDetails,
      downstreamPeakOcc: peakDestOcc,
      downstreamPeakUtil: peakDestUtil
    }
  }
}

/**
 * Standard scenario suite generator for comparing options A through F
 */
export function runStandardScenarioSuite(baselineStates, targetId = 'canteen-a', destId = 'canteen-b') {
  const scenarios = [
    {
      key: 'A',
      label: 'Scenario A: No Intervention',
      description: 'Status quo baseline forecast without active intervention.',
      targetRegionId: targetId,
      destinationRegionId: destId,
      redirectFraction: 0,
      additionalCounters: 0,
      additionalStaff: 0
    },
    {
      key: 'B',
      label: 'Scenario B: Redirect to Canteen B',
      description: 'Redirect 35% of arriving students via digital signage and app to Canteen B.',
      targetRegionId: targetId,
      destinationRegionId: destId,
      redirectFraction: 0.35,
      additionalCounters: 0,
      additionalStaff: 0
    },
    {
      key: 'C',
      label: 'Scenario C: Open Additional Counter',
      description: 'Activate +1 reserve hot-meal service counter to accelerate clearance rate.',
      targetRegionId: targetId,
      destinationRegionId: destId,
      redirectFraction: 0,
      additionalCounters: 1,
      additionalStaff: 0
    },
    {
      key: 'D',
      label: 'Scenario D: Deploy Rapid-Response Staff',
      description: 'Deploy 2 crowd marshals to manage queue entry and prevent corridor bottlenecks.',
      targetRegionId: targetId,
      destinationRegionId: destId,
      redirectFraction: 0,
      additionalCounters: 0,
      additionalStaff: 2
    },
    {
      key: 'E',
      label: 'Scenario E: Dynamic Entry Metering',
      description: 'Stagger entry flow to 16 students / 5 min to cap peak room density.',
      targetRegionId: targetId,
      destinationRegionId: destId,
      redirectFraction: 0,
      additionalCounters: 0,
      additionalStaff: 1,
      entryMeteringCap: 16
    },
    {
      key: 'F',
      label: 'Scenario F: Hybrid Orchestration',
      description: 'Balanced strategy: Redirect 20% to Canteen B + Activate 1 counter.',
      targetRegionId: targetId,
      destinationRegionId: destId,
      redirectFraction: 0.20,
      additionalCounters: 1,
      additionalStaff: 1
    }
  ]

  const results = scenarios.map((s) => simulateNetworkScenario(baselineStates, s))
  const baseline = results[0]

  // Add deltas relative to baseline Scenario A
  return results.map((res) => {
    const occDelta = res.metrics.occupancyAt10m - baseline.metrics.occupancyAt10m
    const waitDelta = Number((res.metrics.avgWaitTimeMin - baseline.metrics.avgWaitTimeMin).toFixed(1))
    const pctReduction = baseline.metrics.occupancyAt10m > 0
      ? Math.round(((baseline.metrics.occupancyAt10m - res.metrics.occupancyAt10m) / baseline.metrics.occupancyAt10m) * 100)
      : 0

    return {
      ...res,
      deltas: {
        occupancyDelta: occDelta,
        occupancyPercentReduction: Math.max(0, pctReduction),
        waitTimeDeltaMin: waitDelta,
        exceedanceDelta: res.metrics.regionsExceedingThreshold - baseline.metrics.regionsExceedingThreshold
      }
    }
  })
}
