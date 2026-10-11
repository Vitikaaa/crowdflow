/**
 * Multi-Modal Sensor Fusion Engine
 * Fuses CCTV computer vision counts, Wi-Fi device density estimates, and Turnstile gate flow.
 * Includes uncertainty modeling, device-to-person ratios, health monitoring, and weighted variance fusion.
 */

// Device ratio accounting for multiple student devices (smartphones, laptops, smartwatches)
export const WIFI_DEVICE_RATIO = 1.25
export const WIFI_COVERAGE_FACTOR = 0.88

/**
 * Generate simulated raw sensor readings for a region
 * @param {Object} node Campus node
 * @param {number} trueOccupancy Underlying ground truth estimate
 * @param {number} timestamp Unix ms
 */
export function generateSensorReadings(node, trueOccupancy, timestamp = Date.now()) {
  const coverage = node.sensorCoverage || { cctv: 2, wifiAPs: 2, turnstiles: 1 }

  // 1. CCTV vision detection: High accuracy in unobstructed zones, but FOV coverage limitations
  const cctvCoverageFraction = Math.min(1.0, 0.45 + (coverage.cctv * 0.15))
  const cctvOcclusionNoise = (Math.random() - 0.5) * 4
  const cctvRawCount = Math.max(0, Math.round((trueOccupancy * cctvCoverageFraction) + cctvOcclusionNoise))
  const cctvEstimatedTotal = Math.round(cctvRawCount / cctvCoverageFraction)
  const cctvConfidence = Math.min(0.96, Math.max(0.70, 0.88 - (cctvRawCount > node.capacity * 0.8 ? 0.1 : 0)))

  // 2. Wi-Fi aggregate devices: High noise, multiple devices per person, MAC address randomization
  const wifiNoise = (Math.random() - 0.5) * 8
  const rawWifiDevices = Math.max(0, Math.round((trueOccupancy * WIFI_DEVICE_RATIO * WIFI_COVERAGE_FACTOR) + wifiNoise))
  const wifiEstimatedPeople = Math.max(0, Math.round(rawWifiDevices / (WIFI_DEVICE_RATIO * WIFI_COVERAGE_FACTOR)))
  const wifiConfidence = 0.72 // Lower confidence due to background devices and lingering associations

  // 3. Turnstiles: Discrete cumulative counts, highly accurate at bounded portals, but unavailable in open spaces
  const hasTurnstiles = coverage.turnstiles > 0
  let turnstileCount = null
  let turnstileConfidence = 0.0

  if (hasTurnstiles) {
    const turnstileDrift = Math.round((Math.random() - 0.48) * 3)
    turnstileCount = Math.max(0, trueOccupancy + turnstileDrift)
    turnstileConfidence = 0.93
  }

  return {
    regionId: node.id,
    timestamp,
    synthetic: true, // Transparently labeled as simulated demonstration data
    cctv: {
      activeCameras: coverage.cctv,
      rawDetections: cctvRawCount,
      estimatedTotal: cctvEstimatedTotal,
      confidence: Number(cctvConfidence.toFixed(2)),
      latencyMs: 140,
      status: 'healthy',
      lastUpdate: 'just now'
    },
    wifi: {
      activeAPs: coverage.wifiAPs,
      connectedMacAddresses: rawWifiDevices,
      deviceRatioCorrection: WIFI_DEVICE_RATIO,
      estimatedTotal: wifiEstimatedPeople,
      confidence: Number(wifiConfidence.toFixed(2)),
      latencyMs: 2500,
      status: 'healthy',
      lastUpdate: '2s ago'
    },
    turnstile: {
      activeGates: coverage.turnstiles,
      available: hasTurnstiles,
      estimatedTotal: turnstileCount,
      confidence: Number(turnstileConfidence.toFixed(2)),
      latencyMs: 50,
      status: hasTurnstiles ? 'healthy' : 'unsupported',
      lastUpdate: hasTurnstiles ? 'just now' : 'n/a'
    }
  }
}

/**
 * Fuse multi-modal sensor inputs using variance-weighted state estimation
 * @param {Object} raw Telemetry object from generateSensorReadings
 * @returns {Object} Fused occupancy estimate with confidence interval and variance
 */
export function fuseSensorSignals(raw) {
  let weightedSum = 0
  let weightTotal = 0

  // Weights derived from empirical confidence (inversely proportional to measurement variance)
  if (raw.cctv && raw.cctv.status === 'healthy') {
    const weight = Math.pow(raw.cctv.confidence, 2)
    weightedSum += raw.cctv.estimatedTotal * weight
    weightTotal += weight
  }

  if (raw.wifi && raw.wifi.status === 'healthy') {
    const weight = Math.pow(raw.wifi.confidence, 2) * 0.7 // downweight wifi due to multi-device uncertainty
    weightedSum += raw.wifi.estimatedTotal * weight
    weightTotal += weight
  }

  if (raw.turnstile && raw.turnstile.available && raw.turnstile.status === 'healthy') {
    const weight = Math.pow(raw.turnstile.confidence, 2) * 1.2
    weightedSum += raw.turnstile.estimatedTotal * weight
    weightTotal += weight
  }

  const fusedOccupancy = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0
  const normalizedConfidence = Math.min(0.96, Number((weightTotal / (1.0 + 0.7 + (raw.turnstile.available ? 1.2 : 0))).toFixed(2)))
  
  // 95% Confidence Interval half-width (standard error approximation)
  const marginOfError = Math.max(2, Math.round((1 - normalizedConfidence) * fusedOccupancy * 0.35 + 2))

  return {
    fusedOccupancy,
    confidence: normalizedConfidence,
    confidenceInterval: [
      Math.max(0, fusedOccupancy - marginOfError),
      fusedOccupancy + marginOfError
    ],
    marginOfError,
    timestamp: raw.timestamp,
    synthetic: raw.synthetic,
    activeSensorsCount: (raw.cctv ? 1 : 0) + (raw.wifi ? 1 : 0) + (raw.turnstile?.available ? 1 : 0),
    raw
  }
}
