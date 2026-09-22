import React, { useState, useEffect, useCallback } from 'react';
import { 
  FleetMetrics, 
  DecisionThresholds, 
  ProcessedTelemetryEvent, 
  WorkOrderTicket, 
  TamperIncident, 
  MetroZone 
} from './types/telemetry';
import { FleetSimulator, GridNodePoint } from './services/fleetSimulator';
import { HeaderMetricsBar } from './components/HeaderMetricsBar';
import { MetroGridMap } from './components/MetroGridMap';
import { LiveTelemetryStream } from './components/LiveTelemetryStream';
import { CostEfficiencyWidget } from './components/CostEfficiencyWidget';
import { BottomActionDock } from './components/BottomActionDock';
import { TamperReviewModal } from './components/Modals/TamperReviewModal';
import { WorkOrdersModal } from './components/Modals/WorkOrdersModal';
import { ThresholdTunerModal } from './components/Modals/ThresholdTunerModal';
import { AnomalyInjectorModal } from './components/Modals/AnomalyInjectorModal';
import { ArchitectureModal } from './components/Modals/ArchitectureModal';

export const App: React.FC = () => {
  // Metrics matching Section 4 Wireframe
  const [metrics, setMetrics] = useState<FleetMetrics>({
    activeFleet: 10248190,
    edgeFilteredCount: 9469280,
    edgeFilterRate: 0.924,
    jevInferencesCount: 778862,
    avgLatencyMs: 114,
    totalTokensProcessed: 38943100,
    monthlyRunRateUsd: 32.71,
    hyperscalerMonthlyUsd: 214500.0,
    tamperCount: 3,
    batteryDecayCount: 14,
    rfJamCount: 6,
  });

  // Thresholds
  const [thresholds, setThresholds] = useState<DecisionThresholds>({
    dispatchProbabilityThreshold: 0.90,
    severityTierCriticalMin: 3,
    edgeNominalFilterTarget: 0.92,
    batteryWarningVoltage: 2.60,
    rssiJamThresholdDbm: -105,
  });

  // State collections
  const [nodes, setNodes] = useState<GridNodePoint[]>(() => FleetSimulator.generateMetroNodes());
  const [events, setEvents] = useState<ProcessedTelemetryEvent[]>([]);
  const [tickets, setTickets] = useState<WorkOrderTicket[]>([
    {
      ticketId: 'WO-89104',
      deviceId: 'MTR-METRO-048291',
      zone: 'North Hills',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      classification: 'MAGNETIC_OR_PHYSICAL_TAMPER',
      severity: 4,
      dispatchProbability: 0.965,
      assignedTechnician: 'J. Rodriguez',
      status: 'DISPATCHED',
      etaMinutes: 38,
    },
    {
      ticketId: 'WO-89103',
      deviceId: 'MTR-SUB-012948',
      zone: 'East Suburbs',
      timestamp: new Date(Date.now() - 720000).toISOString(),
      classification: 'MAGNETIC_OR_PHYSICAL_TAMPER',
      severity: 4,
      dispatchProbability: 0.942,
      assignedTechnician: 'D. Vance',
      status: 'EN_ROUTE',
      etaMinutes: 14,
    },
    {
      ticketId: 'WO-89102',
      deviceId: 'MTR-DWN-094112',
      zone: 'Downtown',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      classification: 'MAGNETIC_OR_PHYSICAL_TAMPER',
      severity: 4,
      dispatchProbability: 0.958,
      assignedTechnician: 'M. Chen',
      status: 'EN_ROUTE',
      etaMinutes: 22,
    },
    {
      ticketId: 'WO-89101',
      deviceId: 'MTR-IND-771204',
      zone: 'Industrial Park',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      classification: 'BURST_LEAK_ANOMALY',
      severity: 4,
      dispatchProbability: 0.982,
      assignedTechnician: 'S. Taylor',
      status: 'DISPATCHED',
      etaMinutes: 18,
    },
    {
      ticketId: 'WO-89100',
      deviceId: 'MTR-NTH-882319',
      zone: 'North Hills',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      classification: 'BATTERY_ELECTROLYTE_DECAY',
      severity: 3,
      dispatchProbability: 0.915,
      assignedTechnician: 'A. Kim',
      status: 'EN_ROUTE',
      etaMinutes: 45,
    },
  ]);

  const [tampers, setTampers] = useState<TamperIncident[]>([
    {
      id: 'TMP-89104',
      deviceId: 'MTR-METRO-048291',
      zone: 'North Hills',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      reedState: 'HIGH_FLUX',
      tiltState: 'TRIGGERED',
      confidence: 0.982,
      severity: 4,
      simStatus: 'QUARANTINED',
      fraudFlag: true,
      notes: 'Strong neodymium magnetic distortion detected. Meter housing tilt flag active.',
    },
    {
      id: 'TMP-89103',
      deviceId: 'MTR-SUB-012948',
      zone: 'East Suburbs',
      timestamp: new Date(Date.now() - 720000).toISOString(),
      reedState: 'HIGH_FLUX',
      tiltState: 'TRIGGERED',
      confidence: 0.975,
      severity: 4,
      simStatus: 'QUARANTINED',
      fraudFlag: true,
      notes: 'Physical tamper switch broken. Zero flow despite pressure variance.',
    },
    {
      id: 'TMP-89102',
      deviceId: 'MTR-DWN-094112',
      zone: 'Downtown',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      reedState: 'HIGH_FLUX',
      tiltState: 'TRIGGERED',
      confidence: 0.989,
      severity: 4,
      simStatus: 'QUARANTINED',
      fraudFlag: true,
      notes: 'Enclosure opened while energized. SIM traffic isolated.',
    },
    {
      id: 'TMP-89101',
      deviceId: 'MTR-IND-339102',
      zone: 'Industrial Park',
      timestamp: new Date(Date.now() - 1500000).toISOString(),
      reedState: 'HIGH_FLUX',
      tiltState: 'TRIGGERED',
      confidence: 0.968,
      severity: 4,
      simStatus: 'QUARANTINED',
      fraudFlag: true,
      notes: 'High magnetic flux detected near shunt sensor.',
    },
    {
      id: 'TMP-89100',
      deviceId: 'MTR-SBN-612940',
      zone: 'South Basin',
      timestamp: new Date(Date.now() - 2100000).toISOString(),
      reedState: 'HIGH_FLUX',
      tiltState: 'TRIGGERED',
      confidence: 0.979,
      severity: 4,
      simStatus: 'QUARANTINED',
      fraudFlag: true,
      notes: 'Physical latch disengaged on residential gas meter.',
    },
  ]);

  // UI Selection states
  const [selectedZone, setSelectedZone] = useState<MetroZone | 'ALL'>('ALL');
  const [selectedNode, setSelectedNode] = useState<GridNodePoint | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Modals state
  const [isTamperModalOpen, setIsTamperModalOpen] = useState(false);
  const [isWorkOrdersModalOpen, setIsWorkOrdersModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [isInjectorModalOpen, setIsInjectorModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Core Pulse Processing Pipeline
  const processNewPulse = useCallback(
    async (forcedAnomaly?: 'TAMPER' | 'BATTERY' | 'RF' | 'LEAK') => {
      const pulse = FleetSimulator.generatePulse(forcedAnomaly);
      const result = await FleetSimulator.processPulse(pulse, thresholds);

      // Prepend to live stream
      setEvents((prev) => [result.event, ...prev.slice(0, 49)]);

      // Update metrics
      setMetrics((prev) => {
        const isJev = !result.event.edgeFiltered;
        const newInferences = prev.jevInferencesCount + (isJev ? 1 : 0);
        const newFiltered = prev.edgeFilteredCount + (isJev ? 0 : 1);
        const total = newInferences + newFiltered;
        const filterRate = total > 0 ? newFiltered / total : 0.924;

        let newLatency = prev.avgLatencyMs;
        let newTokens = prev.totalTokensProcessed;
        let newRunRate = prev.monthlyRunRateUsd;

        if (isJev && result.event.jevResponse) {
          newLatency = Math.round((prev.avgLatencyMs * 0.95) + (result.event.jevResponse.latency_ms * 0.05));
          newTokens += result.event.jevResponse.input_tokens_est;
          newRunRate += result.event.jevResponse.cost_usd * 30 * 100; // extrapolated daily scale factor
        }

        let tampersCount = prev.tamperCount;
        let batteryCount = prev.batteryDecayCount;
        let rfCount = prev.rfJamCount;

        if (result.event.jevResponse) {
          const cat = result.event.jevResponse.classification.value;
          if (cat === 'MAGNETIC_OR_PHYSICAL_TAMPER') tampersCount++;
          if (cat === 'BATTERY_ELECTROLYTE_DECAY') batteryCount++;
          if (cat === 'RF_ATTENUATION_ANOMALY') rfCount++;
        }

        return {
          ...prev,
          edgeFilteredCount: newFiltered,
          edgeFilterRate: filterRate,
          jevInferencesCount: newInferences,
          avgLatencyMs: newLatency,
          totalTokensProcessed: newTokens,
          monthlyRunRateUsd: newRunRate,
          tamperCount: tampersCount,
          batteryDecayCount: batteryCount,
          rfJamCount: rfCount,
        };
      });

      // Handle newly created tickets and tampers
      if (result.newTicket) {
        setTickets((prev) => [result.newTicket!, ...prev]);
      }
      if (result.newTamper) {
        setTampers((prev) => [result.newTamper!, ...prev]);
      }

      // Update node in the map dynamically based on the pulse's actual zone
      const eventCategory = result.event.jevResponse?.classification.value;
      if (forcedAnomaly === 'TAMPER' || eventCategory === 'MAGNETIC_OR_PHYSICAL_TAMPER') {
        setNodes((prev) => {
          const updated = [...prev];
          const zoneNodes = updated.filter((n) => n.zone === pulse.zone);
          if (zoneNodes.length > 0) {
            const target = zoneNodes[Math.floor(Math.random() * zoneNodes.length)];
            target.status = 'TAMPER';
            target.isStrobeBeacon = true;
          }
          return updated;
        });
      } else if (forcedAnomaly === 'BATTERY' || eventCategory === 'BATTERY_ELECTROLYTE_DECAY') {
        setNodes((prev) => {
          const updated = [...prev];
          const zoneNodes = updated.filter((n) => n.zone === pulse.zone && n.status === 'NOMINAL');
          if (zoneNodes.length > 0) {
            const target = zoneNodes[Math.floor(Math.random() * zoneNodes.length)];
            target.status = 'BATTERY_DECAY';
            target.batteryVolts = pulse.battery_volts;
          }
          return updated;
        });
      } else if (forcedAnomaly === 'RF' || eventCategory === 'RF_ATTENUATION_ANOMALY') {
        setNodes((prev) => {
          const updated = [...prev];
          const zoneNodes = updated.filter((n) => n.zone === pulse.zone && n.status === 'NOMINAL');
          if (zoneNodes.length > 0) {
            const target = zoneNodes[Math.floor(Math.random() * zoneNodes.length)];
            target.status = 'RF_JAM';
          }
          return updated;
        });
      }
    },
    [thresholds]
  );

  // Initial populate of events feed with seed events matching Section 4
  useEffect(() => {
    // Generate initial historical seed events
    const initialEvents: ProcessedTelemetryEvent[] = [
      {
        id: 'EVT-INIT-1',
        raw: {
          device_id: 'MTR-METRO-048291',
          zone: 'North Hills',
          timestamp: new Date().toISOString(),
          battery_volts: 2.58,
          voltage_delta_per_week: -0.18,
          flow_liters_per_hour: 0.0,
          magnetic_reed_state: 'HIGH_FLUX',
          tilt_sensor_state: 'TRIGGERED',
          cellular_rssi_dbm: -108,
          failed_tx_retries: 4,
        },
        edgeFiltered: false,
        jevResponse: {
          latency_ms: 112,
          classification: { value: 'MAGNETIC_OR_PHYSICAL_TAMPER', confidence: 0.982 },
          severity_tier: { value: 4, confidence: 0.941 },
          trigger_immediate_dispatch: { probability: 0.965 },
          input_tokens_est: 48,
          cost_usd: 0.000002016,
        },
        actionExecuted: 'SIM Fraud Flagged + Field Work-Order #WO-89104',
        actionType: 'SECURITY',
        ticketId: 'WO-89104',
        simQuarantined: true,
      },
      {
        id: 'EVT-INIT-2',
        raw: {
          device_id: 'MTR-METRO-110482',
          zone: 'East Suburbs',
          timestamp: new Date(Date.now() - 3000).toISOString(),
          battery_volts: 2.41,
          voltage_delta_per_week: -0.22,
          flow_liters_per_hour: 8.2,
          magnetic_reed_state: 'NOMINAL',
          tilt_sensor_state: 'NORMAL',
          cellular_rssi_dbm: -74,
          failed_tx_retries: 0,
        },
        edgeFiltered: false,
        jevResponse: {
          latency_ms: 98,
          classification: { value: 'BATTERY_ELECTROLYTE_DECAY', confidence: 0.947 },
          severity_tier: { value: 2, confidence: 0.915 },
          trigger_immediate_dispatch: { probability: 0.42 },
          input_tokens_est: 44,
          cost_usd: 0.000001848,
        },
        actionExecuted: 'Batched to Low-Priority Route Maintenance',
        actionType: 'MAINTENANCE',
      },
      {
        id: 'EVT-INIT-3',
        raw: {
          device_id: 'MTR-DWN-492104',
          zone: 'Downtown',
          timestamp: new Date(Date.now() - 6000).toISOString(),
          battery_volts: 3.52,
          voltage_delta_per_week: -0.01,
          flow_liters_per_hour: 14.1,
          magnetic_reed_state: 'NOMINAL',
          tilt_sensor_state: 'NORMAL',
          cellular_rssi_dbm: -72,
          failed_tx_retries: 0,
        },
        edgeFiltered: true,
        actionExecuted: 'Filtered at Edge Gateway — Logged Locally',
        actionType: 'NOMINAL',
      },
    ];

    setEvents(initialEvents);
  }, []);

  // Periodic Telemetry Ingestion Timer
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      processNewPulse();
    }, 1800); // Pulse every 1.8s for smooth viewing

    return () => clearInterval(interval);
  }, [isSimulating, processNewPulse]);

  // Handlers for Operator Actions
  const handleToggleQuarantine = (id: string) => {
    setTampers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, simStatus: t.simStatus === 'QUARANTINED' ? 'ACTIVE' : 'QUARANTINED' }
          : t
      )
    );
  };

  const handleToggleFraud = (id: string) => {
    setTampers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, fraudFlag: !t.fraudFlag } : t))
    );
  };

  const handleUpdateTicketStatus = (ticketId: string, status: WorkOrderTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status } : t))
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070A12] text-slate-100 overflow-hidden font-sans">
      {/* Top Carrier Header & Metrics Bar */}
      <HeaderMetricsBar
        metrics={metrics}
        onOpenArchitecture={() => setIsArchitectureModalOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating((s) => !s)}
      />

      {/* Main Split Body: 60% Left Panel (Map) | 40% Right Panel (Telemetry Feed) */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Left Panel: 60% Width */}
        <section className="w-full md:w-[60%] h-full flex flex-col min-h-0">
          <MetroGridMap
            nodes={nodes}
            selectedZone={selectedZone}
            onSelectZone={setSelectedZone}
            onSelectNode={setSelectedNode}
            selectedNode={selectedNode}
          />
        </section>

        {/* Right Panel: 40% Width */}
        <section className="w-full md:w-[40%] h-full flex flex-col min-h-0 border-l border-[#1E293B]">
          <div className="flex-1 overflow-hidden min-h-0">
            <LiveTelemetryStream
              events={events}
              onSelectEvent={(evt) => setSelectedEventId(evt.id)}
              selectedEventId={selectedEventId}
            />
          </div>

          {/* Cost Efficiency Engine Widget */}
          <CostEfficiencyWidget metrics={metrics} />
        </section>
      </main>

      {/* Bottom Action Dock */}
      <BottomActionDock
        tamperCount={tampers.length}
        workOrderCount={tickets.filter((t) => t.status !== 'COMPLETED').length}
        onOpenTamperModal={() => setIsTamperModalOpen(true)}
        onOpenWorkOrdersModal={() => setIsWorkOrdersModalOpen(true)}
        onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
        onOpenInjectorModal={() => setIsInjectorModalOpen(true)}
      />

      {/* Carrier Modals */}
      <TamperReviewModal
        isOpen={isTamperModalOpen}
        onClose={() => setIsTamperModalOpen(false)}
        incidents={tampers}
        onToggleQuarantine={handleToggleQuarantine}
        onToggleFraudFlag={handleToggleFraud}
      />

      <WorkOrdersModal
        isOpen={isWorkOrdersModalOpen}
        onClose={() => setIsWorkOrdersModalOpen(false)}
        tickets={tickets}
        onUpdateStatus={handleUpdateTicketStatus}
      />

      <ThresholdTunerModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        thresholds={thresholds}
        onUpdateThresholds={setThresholds}
      />

      <AnomalyInjectorModal
        isOpen={isInjectorModalOpen}
        onClose={() => setIsInjectorModalOpen(false)}
        onInject={(type) => processNewPulse(type)}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
};

export default App;
