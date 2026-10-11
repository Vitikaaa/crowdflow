/**
 * Network-Aware Decision & Orchestration Engine
 * Evaluates candidate interventions with constrained multi-objective optimization.
 * Formulates explicit objective function, enforces hard operational/safety constraints,
 * and synthesizes multi-channel dispatch packages (digital signage, staff orders, mobile app).
 */

export const DEFAULT_OBJECTIVE_WEIGHTS = {
  capacityExceedance: 35, // High penalty for regional safety capacity exceedance
  downstreamRisk: 25,     // Downstream transfer risk penalty (prevents pushing burden elsewhere)
  waitTime: 15,           // Queue delay / waiting time penalty
  operationalCost: 12,    // Monetary and staff resource expenditure
  walkingImpact: 8,       // Student pedestrian walking delay penalty
  networkCongestion: 5    // Campus-wide average utilization penalty
}

export const OPERATIONAL_LIMITS = {
  maxAvailableStaff: 4,
  maxAvailableReserveCounters: 2,
  downstreamSafetyLimitPct: 88, // Hard constraint: cannot push downstream node past 88%
  budgetPointsLimit: 60
}

/**
 * Evaluate and rank candidate scenarios against objective function and constraints
 * @param {Array} scenarios Output from runStandardScenarioSuite
 * @param {Object} customWeights Configurable weight overrides
 * @param {Object} customLimits Configurable operational constraints
 */
export function rankInterventions(scenarios, customWeights = {}, customLimits = {}) {
  const weights = { ...DEFAULT_OBJECTIVE_WEIGHTS, ...customWeights }
  const limits = { ...OPERATIONAL_LIMITS, ...customLimits }

  // Normalize each metric across all candidate scenarios
  const maxExceedance = Math.max(1, ...scenarios.map((s) => s.metrics.regionsExceedingThreshold))
  const maxDownstreamUtil = Math.max(1, ...scenarios.map((s) => s.metrics.downstreamPeakUtil))
  const maxWait = Math.max(1, ...scenarios.map((s) => s.metrics.avgWaitTimeMin))
  const maxCost = Math.max(1, ...scenarios.map((s) => s.metrics.resourceCost))
  const maxWalking = Math.max(1, ...scenarios.map((s) => s.metrics.walkingDistanceImpactMeters))

  const evaluated = scenarios.map((scenario) => {
    const m = scenario.metrics

    // 1. Constraint Verification
    const constraintViolations = []
    let isFeasible = true

    if (m.requiredStaff > limits.maxAvailableStaff) {
      isFeasible = false
      constraintViolations.push(`Requires ${m.requiredStaff} staff (limit: ${limits.maxAvailableStaff})`)
    }

    if (m.requiredCounters > limits.maxAvailableReserveCounters) {
      isFeasible = false
      constraintViolations.push(`Requires ${m.requiredCounters} counters (limit: ${limits.maxAvailableReserveCounters})`)
    }

    if (m.downstreamPeakUtil > limits.downstreamSafetyLimitPct) {
      isFeasible = false
      constraintViolations.push(`Downstream peak ${m.downstreamPeakUtil}% breaches safety limit (${limits.downstreamSafetyLimitPct}%)`)
    }

    if (m.resourceCost > limits.budgetPointsLimit) {
      isFeasible = false
      constraintViolations.push(`Resource cost ${m.resourceCost} exceeds budget (${limits.budgetPointsLimit})`)
    }

    // 2. Normalized Metric Components [0, 1]
    const compExceedance = m.regionsExceedingThreshold / maxExceedance
    const compDownstream = m.downstreamPeakUtil / maxDownstreamUtil
    const compWait = m.avgWaitTimeMin / maxWait
    const compCost = maxCost > 0 ? m.resourceCost / maxCost : 0
    const compWalking = maxWalking > 0 ? m.walkingDistanceImpactMeters / maxWalking : 0

    // 3. Multi-Attribute Objective Score J(a) - Lower is better (Loss Function)
    const rawObjectiveScore =
      (weights.capacityExceedance * compExceedance) +
      (weights.downstreamRisk * compDownstream) +
      (weights.waitTime * compWait) +
      (weights.operationalCost * compCost) +
      (weights.walkingImpact * compWalking)

    // Penalty for infeasibility
    const penaltyScore = isFeasible ? 0 : 500
    const finalScore = Number((rawObjectiveScore + penaltyScore).toFixed(2))

    // Synthesis of action plan and reason
    let reasoning = ''
    if (!isFeasible) {
      reasoning = `Rejected by constraints: ${constraintViolations.join('; ')}.`
    } else if (scenario.key === 'A') {
      reasoning = 'No intervention leaves high crowd risk at target zone with zero expenditure.'
    } else if (scenario.key === 'B') {
      reasoning = 'Redirection relieves target zone with minimal cost, absorbing flow safely at Canteen B.'
    } else if (scenario.key === 'C') {
      reasoning = 'Opening counter eliminates local queues without transferring crowd to downstream areas.'
    } else if (scenario.key === 'F') {
      reasoning = 'Optimal synergy: mild redirection paired with +1 counter achieves lowest network strain.'
    } else {
      reasoning = 'Feasible alternative with moderate balance of queue reduction and staff investment.'
    }

    // Generate multi-channel dispatch package
    const dispatchPackage = generateDispatchPackage(scenario)

    return {
      ...scenario,
      isFeasible,
      constraintViolations,
      objectiveBreakdown: {
        capacityPenalty: Number((weights.capacityExceedance * compExceedance).toFixed(1)),
        downstreamPenalty: Number((weights.downstreamRisk * compDownstream).toFixed(1)),
        waitPenalty: Number((weights.waitTime * compWait).toFixed(1)),
        costPenalty: Number((weights.operationalCost * compCost).toFixed(1)),
        walkingPenalty: Number((weights.walkingImpact * compWalking).toFixed(1))
      },
      objectiveScore: finalScore,
      reasoning,
      dispatchPackage
    }
  })

  // Sort by objective score (lowest score = highest rank)
  evaluated.sort((a, b) => a.objectiveScore - b.objectiveScore)

  return evaluated
}

/**
 * Generate simulated multi-channel dispatch materials
 */
export function generateDispatchPackage(scenario) {
  const targetName = scenario.targetRegionId === 'canteen-a' ? 'Canteen A' : 'Target Region'
  const destName = scenario.destinationRegionId === 'canteen-b' ? 'Canteen B' : 'Secondary Region'

  let signageText = 'Normal Campus Flow'
  let staffOrder = 'Maintain regular area monitoring.'
  let studentAppNotice = null

  if (scenario.key === 'B' || scenario.redirectFraction > 0) {
    signageText = `⚠️ High Lunch Wait at ${targetName}. Head to ${destName} for faster service (2 min walk).`
    staffOrder = `Deploy 1 marshal at ${targetName} south vestibule to advise students towards ${destName}.`
    studentAppNotice = {
      title: `Faster Lunch Option Nearby`,
      body: `${targetName} is near 90% capacity. Shorter lines and hot lunch counters currently available at ${destName}.`,
      eta: '2.5 min walking detour'
    }
  } else if (scenario.key === 'C' || scenario.additionalCounters > 0) {
    signageText = `✅ ${targetName}: Express Counter #4 is now OPEN for rapid takeaway orders.`
    staffOrder = `Notify Kitchen Team to staff Express Counter #4 immediately.`
    studentAppNotice = {
      title: `Express Counter Opened at ${targetName}`,
      body: `Counter #4 has been activated for rapid checkout.`,
      eta: 'Immediate service'
    }
  } else if (scenario.key === 'D') {
    signageText = `Please follow staff guidance at entrance doors.`
    staffOrder = `Dispatch 2 security stewards to ${targetName} entrance: establish structured dual queue line.`
    studentAppNotice = null
  } else if (scenario.key === 'F') {
    signageText = `ℹ️ Express counter open at ${targetName}. Fast hot meals also ready at ${destName}.`
    staffOrder = `Open Counter #4 at ${targetName} and assign 1 student ambassador to cross-walk path to ${destName}.`
    studentAppNotice = {
      title: `Campus Lunch Flow Advisory`,
      body: `Extra capacity active at ${targetName} & ${destName}.`,
      eta: 'Choose either location'
    }
  }

  return {
    digitalSignage: {
      screenId: 'SIGN-CANTEEN-CORRIDOR-01',
      displayMode: 'Yellow Warning Banner',
      text: signageText,
      durationMin: 20
    },
    staffInstructions: {
      team: 'Campus Operations & Security',
      requiredStaffCount: scenario.metrics.requiredStaff,
      priority: scenario.metrics.peakUtilizationPct >= 85 ? 'HIGH' : 'MEDIUM',
      order: staffOrder
    },
    studentMobileNotification: studentAppNotice
  }
}
