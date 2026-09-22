import { 
  RawIngestionPulse, 
  MetroZone, 
  ProcessedTelemetryEvent, 
  DecisionThresholds,
  WorkOrderTicket,
  TamperIncident
} from '../types/telemetry';
import { evaluateEdgePreFilter } from './edgeFilter';
import { JevClassificationEngine } from './jevClassifier';

export interface GridNodePoint {
  id: string;
  zone: MetroZone;
  x: number; // 0 to 100 relative
  y: number; // 0 to 100 relative
  status: 'NOMINAL' | 'BATTERY_DECAY' | 'TAMPER' | 'RF_JAM';
  batteryVolts: number;
  lastPulseTime: number;
  pulseBrightness: number;
  isStrobeBeacon: boolean;
}

export class FleetSimulator {
  private static technicians = ['J. Rodriguez', 'D. Vance', 'M. Chen', 'S. Taylor', 'A. Kim'];
  private static ticketSeq = 89104;

  /**
   * Pre-generate 1,500 static micro-node grid points across the 5 zones
   * with exact cluster distribution matching the spec
   */
  public static generateMetroNodes(): GridNodePoint[] {
    const nodes: GridNodePoint[] = [];

    // Zone Definitions with center coordinate, radius & realistic mixed issues
    const zonesConfig: { 
      zone: MetroZone; 
      cx: number; 
      cy: number; 
      radius: number; 
      count: number;
      tamperIndices: number[];
      batteryIndices: number[];
      rfIndices: number[];
    }[] = [
      { 
        zone: 'Downtown', 
        cx: 50, 
        cy: 50, 
        radius: 18, 
        count: 420,
        tamperIndices: [42], 
        batteryIndices: [15, 88, 120, 204], 
        rfIndices: [31, 175] 
      },
      { 
        zone: 'North Hills', 
        cx: 35, 
        cy: 22, 
        radius: 16, 
        count: 320,
        tamperIndices: [12, 88], 
        batteryIndices: [25, 60, 140, 210], 
        rfIndices: [95, 180] 
      },
      { 
        zone: 'Industrial Park', 
        cx: 78, 
        cy: 38, 
        radius: 17, 
        count: 280,
        tamperIndices: [104], 
        batteryIndices: [18, 55, 130, 220], 
        rfIndices: [12, 67, 145, 198] 
      },
      { 
        zone: 'East Suburbs', 
        cx: 80, 
        cy: 75, 
        radius: 20, 
        count: 340,
        tamperIndices: [52], 
        batteryIndices: [8, 22, 45, 78, 112, 160, 205, 260], 
        rfIndices: [35, 190] 
      },
      { 
        zone: 'South Basin', 
        cx: 28, 
        cy: 76, 
        radius: 18, 
        count: 240,
        tamperIndices: [72], 
        batteryIndices: [30, 95, 165], 
        rfIndices: [110] 
      },
    ];

    zonesConfig.forEach((zc) => {
      for (let i = 0; i < zc.count; i++) {
        // Gaussian/polar scatter around zone center
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * zc.radius;
        const x = Math.min(95, Math.max(5, zc.cx + Math.cos(angle) * dist));
        const y = Math.min(95, Math.max(5, zc.cy + Math.sin(angle) * dist * 0.8)); // 2.5D isometric squish

        let status: 'NOMINAL' | 'BATTERY_DECAY' | 'TAMPER' | 'RF_JAM' = 'NOMINAL';
        let isStrobeBeacon = false;
        let batteryVolts = 3.4 + (Math.random() * 0.3);

        // Check realistic mixed anomaly distribution
        if (zc.tamperIndices.includes(i)) {
          status = 'TAMPER';
          isStrobeBeacon = true;
          batteryVolts = 2.58;
        } else if (zc.batteryIndices.includes(i)) {
          status = 'BATTERY_DECAY';
          batteryVolts = 2.38 + (Math.random() * 0.14);
        } else if (zc.rfIndices.includes(i)) {
          status = 'RF_JAM';
        }

        nodes.push({
          id: `MTR-${zc.zone.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
          zone: zc.zone,
          x,
          y,
          status,
          batteryVolts,
          lastPulseTime: Date.now() - Math.floor(Math.random() * 60000),
          pulseBrightness: 0.3 + Math.random() * 0.7,
          isStrobeBeacon,
        });
      }
    });

    return nodes;
  }

  /**
   * Generate a single synthetic pulse, either nominal (92%) or anomalous (8%)
   * with randomized distribution across all zones
   */
  public static generatePulse(forcedAnomaly?: 'TAMPER' | 'BATTERY' | 'RF' | 'LEAK'): RawIngestionPulse {
    const zones: MetroZone[] = ['Downtown', 'North Hills', 'Industrial Park', 'East Suburbs', 'South Basin'];
    const chosenZone = zones[Math.floor(Math.random() * zones.length)];

    const idNum = Math.floor(100000 + Math.random() * 900000);
    const deviceId = `MTR-METRO-${idNum}`;
    const timestamp = new Date().toISOString();

    // Default nominal baseline
    let battery_volts = 3.52 + (Math.random() * 0.15 - 0.05);
    let voltage_delta_per_week = -0.01 + (Math.random() * 0.005);
    let flow_liters_per_hour = 12.4 + (Math.random() * 5.0);
    let magnetic_reed_state: 'NOMINAL' | 'HIGH_FLUX' = 'NOMINAL';
    let tilt_sensor_state: 'NORMAL' | 'TRIGGERED' = 'NORMAL';
    let cellular_rssi_dbm = -78 + Math.floor(Math.random() * 12);
    let failed_tx_retries = Math.random() < 0.85 ? 0 : 1;

    // Check if generating an anomaly
    const isAnomaly = forcedAnomaly || Math.random() < 0.08;

    if (isAnomaly) {
      // Natural mix across all sectors: 40% Battery Decay, 30% Tamper, 20% RF, 10% Burst Leak
      let type: 'TAMPER' | 'BATTERY' | 'RF' | 'LEAK' = forcedAnomaly || 'BATTERY';
      if (!forcedAnomaly) {
        const roll = Math.random();
        if (roll < 0.40) type = 'BATTERY';
        else if (roll < 0.70) type = 'TAMPER';
        else if (roll < 0.90) type = 'RF';
        else type = 'LEAK';
      }

      if (type === 'TAMPER') {
        magnetic_reed_state = 'HIGH_FLUX';
        tilt_sensor_state = 'TRIGGERED';
        flow_liters_per_hour = 0.0;
        battery_volts = 2.58;
        voltage_delta_per_week = -0.18;
        cellular_rssi_dbm = -108;
        failed_tx_retries = 4;
      } else if (type === 'BATTERY') {
        battery_volts = 2.41 + (Math.random() * 0.10);
        voltage_delta_per_week = -0.22;
        cellular_rssi_dbm = -74;
        flow_liters_per_hour = 8.2;
      } else if (type === 'RF') {
        cellular_rssi_dbm = -116;
        failed_tx_retries = 5;
      } else if (type === 'LEAK') {
        flow_liters_per_hour = 520.0;
        cellular_rssi_dbm = -82;
      }
    }

    return {
      device_id: deviceId,
      zone: chosenZone,
      timestamp,
      battery_volts: Number(battery_volts.toFixed(2)),
      voltage_delta_per_week: Number(voltage_delta_per_week.toFixed(2)),
      flow_liters_per_hour: Number(flow_liters_per_hour.toFixed(1)),
      magnetic_reed_state,
      tilt_sensor_state,
      cellular_rssi_dbm,
      failed_tx_retries,
    };
  }

  /**
   * Process raw pulse through Layer 2 Edge Filter and Layer 3 Jev AI,
   * then generate Layer 4 Remediation Actions.
   */
  public static async processPulse(
    pulse: RawIngestionPulse,
    thresholds: DecisionThresholds
  ): Promise<{
    event: ProcessedTelemetryEvent;
    newTicket?: WorkOrderTicket;
    newTamper?: TamperIncident;
  }> {
    const edgeResult = evaluateEdgePreFilter(pulse, thresholds);
    const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // If pre-filtered locally (nominal)
    if (!edgeResult.shouldDispatchToJev) {
      return {
        event: {
          id: eventId,
          raw: pulse,
          edgeFiltered: true,
          actionExecuted: 'Filtered at Edge Gateway — Logged Locally',
          actionType: 'NOMINAL',
        },
      };
    }

    // Layer 3: Dispatch to Jev Ultra-Low-Cost Classification Engine
    const jevResponse = await JevClassificationEngine.evaluate(pulse);

    // Layer 4: Provider Control Center Remediation Execution
    let actionExecuted = 'Standard Logging';
    let actionType: 'SECURITY' | 'MAINTENANCE' | 'RF' | 'NOMINAL' = 'NOMINAL';
    let ticketId: string | undefined;
    let simQuarantined: boolean | undefined;
    let newTicket: WorkOrderTicket | undefined;
    let newTamper: TamperIncident | undefined;

    const classification = jevResponse.classification.value;
    const severity = jevResponse.severity_tier.value;
    const dispatchProb = jevResponse.trigger_immediate_dispatch.probability;

    if (classification === 'MAGNETIC_OR_PHYSICAL_TAMPER') {
      actionType = 'SECURITY';
      ticketId = `WO-${++this.ticketSeq}`;
      simQuarantined = true;
      actionExecuted = `SIM Fraud Flagged + Field Work-Order #${ticketId}`;

      newTamper = {
        id: `TMP-${this.ticketSeq}`,
        deviceId: pulse.device_id,
        zone: pulse.zone,
        timestamp: pulse.timestamp,
        reedState: pulse.magnetic_reed_state,
        tiltState: pulse.tilt_sensor_state,
        confidence: jevResponse.classification.confidence,
        severity: severity,
        simStatus: 'QUARANTINED',
        fraudFlag: true,
        notes: `Jev High Flux detection (${(jevResponse.classification.confidence * 100).toFixed(1)}%). Auto SIM quarantine executed.`,
      };

      newTicket = {
        ticketId,
        deviceId: pulse.device_id,
        zone: pulse.zone,
        timestamp: pulse.timestamp,
        classification,
        severity,
        dispatchProbability: dispatchProb,
        assignedTechnician: this.technicians[Math.floor(Math.random() * this.technicians.length)],
        status: 'DISPATCHED',
        etaMinutes: 45,
      };
    } else if (classification === 'BATTERY_ELECTROLYTE_DECAY') {
      actionType = 'MAINTENANCE';
      if (dispatchProb >= thresholds.dispatchProbabilityThreshold || severity >= thresholds.severityTierCriticalMin) {
        ticketId = `WO-${++this.ticketSeq}`;
        actionExecuted = `Critical Battery Replacement Ticket #${ticketId}`;
        newTicket = {
          ticketId,
          deviceId: pulse.device_id,
          zone: pulse.zone,
          timestamp: pulse.timestamp,
          classification,
          severity,
          dispatchProbability: dispatchProb,
          assignedTechnician: this.technicians[Math.floor(Math.random() * this.technicians.length)],
          status: 'DISPATCHED',
          etaMinutes: 120,
        };
      } else {
        actionExecuted = 'Batched to Low-Priority Route Maintenance';
      }
    } else if (classification === 'RF_ATTENUATION_ANOMALY') {
      actionType = 'RF';
      actionExecuted = 'Re-assign Base Station Beam + Flag Local Interference';
    } else if (classification === 'BURST_LEAK_ANOMALY') {
      actionType = 'MAINTENANCE';
      ticketId = `WO-${++this.ticketSeq}`;
      actionExecuted = `Emergency Valve Shutoff Crew Dispatched #${ticketId}`;
      newTicket = {
        ticketId,
        deviceId: pulse.device_id,
        zone: pulse.zone,
        timestamp: pulse.timestamp,
        classification,
        severity,
        dispatchProbability: dispatchProb,
        assignedTechnician: this.technicians[Math.floor(Math.random() * this.technicians.length)],
        status: 'DISPATCHED',
        etaMinutes: 25,
      };
    } else {
      actionExecuted = 'Cyclic Verification Passed — Nominal';
      actionType = 'NOMINAL';
    }

    return {
      event: {
        id: eventId,
        raw: pulse,
        edgeFiltered: false,
        jevResponse,
        actionExecuted,
        actionType,
        ticketId,
        simQuarantined,
      },
      newTicket,
      newTamper,
    };
  }
}
