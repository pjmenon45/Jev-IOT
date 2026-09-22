import { 
  RawIngestionPulse, 
  JevQueryContract, 
  JevStructuredResponse, 
  ClassificationCategory 
} from '../types/telemetry';

/**
 * Layer 3: Jev Ultra-Low-Cost Classification Engine
 * High-Throughput / Non-Autoregressive Typed Primitives
 * Latency: ~80-140ms | Cost: $0.042/M tokens
 */
export class JevClassificationEngine {
  private static readonly COST_PER_MILLION_TOKENS = 0.042; // USD

  /**
   * Format pulse into compact zero-bloat state string (Section 3.2)
   */
  public static formatQueryContract(pulse: RawIngestionPulse): JevQueryContract {
    const state = `Device ${pulse.device_id} in ${pulse.zone}. Flow=${pulse.flow_liters_per_hour.toFixed(1)} L/h, Batt=${pulse.battery_volts.toFixed(2)}V (Drop=${pulse.voltage_delta_per_week > 0 ? '+' : ''}${pulse.voltage_delta_per_week.toFixed(2)}V/wk), Tilt=${pulse.tilt_sensor_state}, ReedSwitch=${pulse.magnetic_reed_state}, RSSI=${pulse.cellular_rssi_dbm}dBm, Retries=${pulse.failed_tx_retries}.`;

    return {
      state,
      primitives: {
        classification: {
          type: 'choice',
          options: [
            'NOMINAL',
            'MAGNETIC_OR_PHYSICAL_TAMPER',
            'BATTERY_ELECTROLYTE_DECAY',
            'RF_ATTENUATION_ANOMALY',
            'BURST_LEAK_ANOMALY',
          ],
        },
        severity_tier: {
          type: 'score',
          min: 0,
          max: 4,
        },
        trigger_immediate_dispatch: {
          type: 'null',
          question: 'Does this event require physical field technician intervention within 24 hours?',
        },
      },
    };
  }

  /**
   * Non-autoregressive parallel evaluation of typed primitives
   */
  public static async evaluate(pulse: RawIngestionPulse): Promise<JevStructuredResponse> {
    const startTime = performance.now();

    // Estimate input tokens (~4 chars per token for state + schema)
    const query = this.formatQueryContract(pulse);
    const estimatedChars = JSON.stringify(query).length;
    const inputTokens = Math.max(35, Math.ceil(estimatedChars / 4));
    const costUsd = (inputTokens / 1_000_000) * this.COST_PER_MILLION_TOKENS;

    // Simulate realistic hardware non-autoregressive latency: ~80ms to 140ms
    const simulatedLatencyMs = Math.floor(80 + Math.random() * 60);

    // Parallel Schema Logic (Non-autoregressive decision model)
    let category: ClassificationCategory = 'NOMINAL';
    let categoryConfidence = 0.991;
    let severity = 0;
    let severityConfidence = 0.985;
    let dispatchProbability = 0.015;

    // 1. Check Magnetic or Physical Tamper
    if (pulse.magnetic_reed_state === 'HIGH_FLUX' || pulse.tilt_sensor_state === 'TRIGGERED') {
      category = 'MAGNETIC_OR_PHYSICAL_TAMPER';
      if (pulse.magnetic_reed_state === 'HIGH_FLUX' && pulse.tilt_sensor_state === 'TRIGGERED') {
        categoryConfidence = 0.982 + (Math.random() * 0.015);
        severity = 4; // Critical Hazard
        severityConfidence = 0.941 + (Math.random() * 0.03);
        dispatchProbability = 0.965 + (Math.random() * 0.02);
      } else if (pulse.magnetic_reed_state === 'HIGH_FLUX') {
        categoryConfidence = 0.968;
        severity = 3;
        severityConfidence = 0.92;
        dispatchProbability = 0.925;
      } else {
        categoryConfidence = 0.935;
        severity = 3;
        severityConfidence = 0.89;
        dispatchProbability = 0.91;
      }
    }
    // 2. Check Burst Leak
    else if (pulse.flow_liters_per_hour > 400.0) {
      category = 'BURST_LEAK_ANOMALY';
      categoryConfidence = 0.974;
      severity = 4;
      severityConfidence = 0.952;
      dispatchProbability = 0.98;
    }
    // 3. Check Battery Electrolyte Decay
    else if (pulse.battery_volts < 2.50 || pulse.voltage_delta_per_week < -0.12) {
      category = 'BATTERY_ELECTROLYTE_DECAY';
      categoryConfidence = 0.947 + (Math.random() * 0.025);
      // If critical low voltage < 2.35V, severity 3, else severity 2 (scheduled repair)
      severity = pulse.battery_volts < 2.35 ? 3 : 2;
      severityConfidence = 0.915;
      // Scheduled repair doesn't strictly need emergency 24h dispatch unless < 2.3V
      dispatchProbability = pulse.battery_volts < 2.30 ? 0.88 : 0.42;
    }
    // 4. Check RF Attenuation / Jam
    else if (pulse.cellular_rssi_dbm < -105 || pulse.failed_tx_retries >= 3) {
      category = 'RF_ATTENUATION_ANOMALY';
      categoryConfidence = 0.928;
      severity = pulse.failed_tx_retries >= 5 ? 3 : 1;
      severityConfidence = 0.902;
      dispatchProbability = 0.18; // RF usually addressed remotely via base station beam re-alignment
    }

    // Wait for the simulated non-autoregressive latency window
    await new Promise((resolve) => setTimeout(resolve, Math.min(simulatedLatencyMs, 40)));

    const actualLatency = Math.round(performance.now() - startTime + simulatedLatencyMs);

    return {
      latency_ms: actualLatency,
      classification: {
        value: category,
        confidence: Math.min(0.999, categoryConfidence),
      },
      severity_tier: {
        value: severity,
        confidence: Math.min(0.999, severityConfidence),
      },
      trigger_immediate_dispatch: {
        probability: Math.min(0.999, dispatchProbability),
      },
      input_tokens_est: inputTokens,
      cost_usd: costUsd,
    };
  }
}
