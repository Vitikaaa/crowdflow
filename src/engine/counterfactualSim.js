/**
 * Counterfactual Intervention Simulator
 * Core research engine for simulating alternative futures across interconnected service regions.
 * Models multi-region network flow conservation, transit lag, and downstream capacity ripple effects.
 */

import { CAMPUS_NODES, CAMPUS_EDGES, getRegionById, resolveRegionId } from './campusGraph.js'

/**
 * Run a multi-region network simulation over time steps [0, 5, 10, 15, 20] min
 * @param {Object} baselineStates Map of regionId -> { occupancy, arrivalRate, departureRate, counters, queue }
 * @param {Object} interventionDef Scenario specification
 * @returns {Object} Simulation results including trajectories for all regions and summary metrics
 */
export function simulateNetworkScenario(baselineStates, interventionDef) {
  const timeSteps = [0, 5, 10, 15, 20]
  const targetId = resolveRegionId(interventionDef.targetRegionId || 'stationery-1')
  const destId = resolveRegionId(interventionDef.destinationRegionId || 'stationery-2')
  
  // Clone initial regional states
  const regionStates = {}
  CAMPUS_NODES.forEach((node) => {
    const base = baselineStates[node.id] || {}
    regionStates[node.id] = {
      id: node.id,
      name: node.name,
      capacity: node.capacity,
      occupancy: base.occupancy ?? (node.id === targetId ? Math.round(node.capacity * 0.88) : node.id === destId ? Math.round(node.capacity * 0.35) : Math.round(node.capacity * 0.45)),
      arrivalRate: base.arrivalRate ?? (node.id === targetId ? 18 : node.id === destId ? 6 : 12),
      departureRate: base.departureRate ?? 10,
      counters: base.counters ?? node.baseCounters ?? 2,
      queue: base.queue ?? (node.id === targetId ? 14 : 0),
      serviceRatePerCounter: node.category === 'dining' ? 9 : 6
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

  // Walking distance penalty (if redirecting from target to dest)
  const edgeAB = CAMPUS_EDGES.find(
    (e) => (e.source === targetId && e.target === destId) || (e.source === destId && e.target === targetId)
  )
  const walkingDistMeters = edgeAB ? edgeAB.distanceMeters : 140
  const transitLagMin = edgeAB ? edgeAB.transitTimeMin : 2.2

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
        if (t >= transitLagMin) {
          const arrivingDiverted = Math.round(regionStates[targetId].arrivalRate * redirectFraction)
          inFlow += arrivingDiverted
        }
      }

      // Natural surge at peak times
      const naturalSurge = (t === 10 && (node.id === 'annapurna' || node.id === 'stationery-1')) ? 5 : 0
      inFlow += naturalSurge

      const netDelta = inFlow - outFlow
      const newOcc = Math.max(0, Math.min(Math.round(state.capacity * 1.35), state.occupancy + netDelta))
      const newQueue = Math.max(0, newOcc > state.capacity * 0.82 ? newOcc - Math.round(state.capacity * 0.82) : 0)

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
  const targetTraj = trajectories[targetId] || trajectories[CAMPUS_NODES[0].id]
  const destTraj = trajectories[destId] || trajectories[CAMPUS_NODES[1].id]

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
    const maxUtil = Math.max(...(trajectories[n.id] || []).map((x) => x.utilizationPct))
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
export function runStandardScenarioSuite(baselineStates, targetId = 'stationery-1', destId = 'stationery-2') {
  const resolvedTarget = resolveRegionId(targetId)
  const resolvedDest = resolveRegionId(destId)

  const scenarios = [
    {
      key: 'A',
      label: 'Scenario A: Status Quo (Baseline)',
      description: 'Baseline unmanaged flow without active crowd intervention.',
      targetRegionId: resolvedTarget,
      destinationRegionId: resolvedDest,
      redirectFraction: 0,
      additionalCounters: 0,
      additionalStaff: 0
    },
    {
      key: 'B',
      label: `Scenario B: Redirect to ${getRegionById(resolvedDest).shortName}`,
      description: `Divert 40% of incoming visitors from ${getRegionById(resolvedTarget).shortName} to ${getRegionById(resolvedDest).shortName} via digital signage & student app notifications.`,
      targetRegionId: resolvedTarget,
      destinationRegionId: resolvedDest,
      redirectFraction: 0.40,
      additionalCounters: 0,
      additionalStaff: 0
    },
    {
      key: 'C',
      label: 'Scenario C: Open Additional Service Counter',
      description: 'Activate +1 reserve express clearance window to double serving throughput.',
      targetRegionId: resolvedTarget,
      destinationRegionId: resolvedDest,
      redirectFraction: 0,
      additionalCounters: 1,
      additionalStaff: 0
    },
    {
      key: 'D',
      label: 'Scenario D: Rapid Marshals & Corridor Control',
      description: 'Deploy 2 trained student marshals to organize line queues and prevent bottleneck congestion.',
      targetRegionId: resolvedTarget,
      destinationRegionId: resolvedDest,
      redirectFraction: 0,
      additionalCounters: 0,
      additionalStaff: 2
    },
    {
      key: 'E',
      label: 'Scenario E: Dynamic Entry Metering',
      description: 'Regulate entrance turnstiles to cap inflow at 14 visitors/5 min, smoothing crowd peaks.',
      targetRegionId: resolvedTarget,
      destinationRegionId: resolvedDest,
      redirectFraction: 0,
      additionalCounters: 0,
      additionalStaff: 1,
      entryMeteringCap: 14
    },
    {
      key: 'F',
      label: 'Scenario F: Full Campus Hybrid Orchestration',
      description: `Optimized multi-pronged strategy: Divert 25% traffic to ${getRegionById(resolvedDest).shortName} + Activate 1 counter + 1 marshal.`,
      targetRegionId: resolvedTarget,
      destinationRegionId: resolvedDest,
      redirectFraction: 0.25,
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
