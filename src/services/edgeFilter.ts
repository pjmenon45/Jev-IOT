import { RawIngestionPulse, DecisionThresholds } from '../types/telemetry';

export interface EdgeFilterResult {
  shouldDispatchToJev: boolean;
  filterReason: 'NOMINAL_LOCAL_LOG' | 'TAMPER_FLAGGED' | 'BATTERY_LOW' | 'RF_DEGRADED' | 'HIGH_RETRIES' | 'CYCLIC_VERIFICATION';
}

/**
 * Layer 2: Provider Edge Gateway & Distributed User Plane Pre-Filter
 * - 92% Nominal Pulses (Delta = 0, V_batt nominal, Tamper flag = 0) -> Logged locally
 * - 8% Anomalous, Borderline, or Cyclic Verification -> Dispatched to Inference Layer
 */
export function evaluateEdgePreFilter(
  pulse: RawIngestionPulse,
  thresholds: DecisionThresholds
): EdgeFilterResult {
  // Check for immediate physical anomaly flags
  if (pulse.magnetic_reed_state === 'HIGH_FLUX' || pulse.tilt_sensor_state === 'TRIGGERED') {
    return {
      shouldDispatchToJev: true,
      filterReason: 'TAMPER_FLAGGED',
    };
  }

  // Check battery voltage threshold and rate of decay
  if (
    pulse.battery_volts < thresholds.batteryWarningVoltage || 
    pulse.voltage_delta_per_week < -0.10
  ) {
    return {
      shouldDispatchToJev: true,
      filterReason: 'BATTERY_LOW',
    };
  }

  // Check RF degradation and retry count
  if (pulse.cellular_rssi_dbm <= thresholds.rssiJamThresholdDbm) {
    return {
      shouldDispatchToJev: true,
      filterReason: 'RF_DEGRADED',
    };
  }

  if (pulse.failed_tx_retries >= 3) {
    return {
      shouldDispatchToJev: true,
      filterReason: 'HIGH_RETRIES',
    };
  }

  // Check flow anomaly (burst leak detection)
  if (pulse.flow_liters_per_hour > 450.0) {
    return {
      shouldDispatchToJev: true,
      filterReason: 'TAMPER_FLAGGED',
    };
  }

  // Deterministic cyclic verification: scaled sample for continuous baseline verification
  const deviceHash = pulse.device_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const sampleMod = Math.max(10, Math.floor(100 / Math.max(1, (1 - thresholds.edgeNominalFilterTarget) * 100)));
  if (deviceHash % sampleMod === 0) {
    return {
      shouldDispatchToJev: true,
      filterReason: 'CYCLIC_VERIFICATION',
    };
  }

  // Otherwise, 92%+ nominal pulse filtered and logged locally at the edge gateway
  return {
    shouldDispatchToJev: false,
    filterReason: 'NOMINAL_LOCAL_LOG',
  };
}
