export type MetroZone = 
  | 'Downtown' 
  | 'North Hills' 
  | 'Industrial Park' 
  | 'East Suburbs' 
  | 'South Basin';

export type ReedSwitchState = 'NOMINAL' | 'HIGH_FLUX';
export type TiltSensorState = 'NORMAL' | 'TRIGGERED';

export type ClassificationCategory = 
  | 'NOMINAL'
  | 'MAGNETIC_OR_PHYSICAL_TAMPER'
  | 'BATTERY_ELECTROLYTE_DECAY'
  | 'RF_ATTENUATION_ANOMALY'
  | 'BURST_LEAK_ANOMALY';

export interface RawIngestionPulse {
  device_id: string;
  zone: MetroZone;
  timestamp: string;
  battery_volts: number;
  voltage_delta_per_week: number;
  flow_liters_per_hour: number;
  magnetic_reed_state: ReedSwitchState;
  tilt_sensor_state: TiltSensorState;
  cellular_rssi_dbm: number;
  failed_tx_retries: number;
}

export interface JevQueryContract {
  state: string;
  primitives: {
    classification: {
      type: 'choice';
      options: ClassificationCategory[];
    };
    severity_tier: {
      type: 'score';
      min: number;
      max: number;
    };
    trigger_immediate_dispatch: {
      type: 'null';
      question: string;
    };
  };
}

export interface JevStructuredResponse {
  latency_ms: number;
  classification: {
    value: ClassificationCategory;
    confidence: number;
  };
  severity_tier: {
    value: number; // 0 (Normal) to 4 (Critical Hazard)
    confidence: number;
  };
  trigger_immediate_dispatch: {
    probability: number;
  };
  input_tokens_est: number;
  cost_usd: number;
}

export interface ProcessedTelemetryEvent {
  id: string;
  raw: RawIngestionPulse;
  edgeFiltered: boolean;
  jevResponse?: JevStructuredResponse;
  actionExecuted: string;
  actionType: 'SECURITY' | 'MAINTENANCE' | 'RF' | 'NOMINAL';
  ticketId?: string;
  simQuarantined?: boolean;
}

export interface WorkOrderTicket {
  ticketId: string;
  deviceId: string;
  zone: MetroZone;
  timestamp: string;
  classification: ClassificationCategory;
  severity: number;
  dispatchProbability: number;
  assignedTechnician: string;
  status: 'DISPATCHED' | 'EN_ROUTE' | 'COMPLETED' | 'PENDING_REVIEW';
  etaMinutes: number;
}

export interface TamperIncident {
  id: string;
  deviceId: string;
  zone: MetroZone;
  timestamp: string;
  reedState: ReedSwitchState;
  tiltState: TiltSensorState;
  confidence: number;
  severity: number;
  simStatus: 'ACTIVE' | 'QUARANTINED';
  fraudFlag: boolean;
  notes: string;
}

export interface FleetMetrics {
  activeFleet: number;
  edgeFilteredCount: number;
  edgeFilterRate: number;
  jevInferencesCount: number;
  avgLatencyMs: number;
  totalTokensProcessed: number;
  monthlyRunRateUsd: number;
  hyperscalerMonthlyUsd: number;
  tamperCount: number;
  batteryDecayCount: number;
  rfJamCount: number;
}

export interface DecisionThresholds {
  dispatchProbabilityThreshold: number; // default 0.90
  severityTierCriticalMin: number; // default 3
  edgeNominalFilterTarget: number; // default 0.92
  batteryWarningVoltage: number; // default 2.6V
  rssiJamThresholdDbm: number; // default -105dBm
}
