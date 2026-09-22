import React, { useState } from 'react';
import { ProcessedTelemetryEvent } from '../types/telemetry';
import { Cpu, Filter, Radio } from 'lucide-react';

interface LiveTelemetryStreamProps {
  events: ProcessedTelemetryEvent[];
  onSelectEvent: (event: ProcessedTelemetryEvent) => void;
  selectedEventId: string | null;
}

export const LiveTelemetryStream: React.FC<LiveTelemetryStreamProps> = ({
  events,
  onSelectEvent,
  selectedEventId,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INFERENCES_ONLY' | 'CRITICAL_ONLY'>('ALL');

  const filteredEvents = events.filter((e) => {
    if (filterType === 'INFERENCES_ONLY') return !e.edgeFiltered;
    if (filterType === 'CRITICAL_ONLY') {
      return e.jevResponse && (e.jevResponse.severity_tier.value >= 3 || e.jevResponse.classification.value === 'MAGNETIC_OR_PHYSICAL_TAMPER');
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#090D1A] overflow-hidden">
      {/* Stream Header & Filters */}
      <div className="px-4 py-2 bg-[#0D1424] border-b border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Streaming Inference Feed
          </span>
          <span className="text-[10px] bg-cyan-950/60 border border-cyan-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono">
            Jev Real-Time
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 text-[10px] font-mono">
          <Filter className="w-3 h-3 text-slate-500 mr-1" />
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Pulses
          </button>
          <button
            onClick={() => setFilterType('INFERENCES_ONLY')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'INFERENCES_ONLY'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Jev Inferences
          </button>
          <button
            onClick={() => setFilterType('CRITICAL_ONLY')}
            className={`px-2 py-0.5 rounded transition ${
              filterType === 'CRITICAL_ONLY'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
            <Radio className="w-6 h-6 animate-pulse" />
            <p className="text-xs">Awaiting incoming telemetry pulses...</p>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isSelected = selectedEventId === evt.id;
            const timeStr = new Date(evt.raw.timestamp).toLocaleTimeString();

            // Render Edge-Filtered Nominal Pulse (Compact Card)
            if (evt.edgeFiltered) {
              return (
                <div
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className={`p-2 rounded bg-[#0B0F19]/60 border transition cursor-pointer hover:border-slate-700 ${
                    isSelected ? 'border-cyan-500/50 bg-[#0F1626]' : 'border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">[{timeStr}]</span>
                      <span className="text-slate-300 font-semibold">{evt.raw.device_id}</span>
                      <span className="text-slate-500">({evt.raw.zone})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400/90 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-900/40">
                      Edge Pre-Filtered (92% Nominal)
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-500 flex items-center space-x-3">
                    <span>{evt.raw.battery_volts.toFixed(2)}V</span>
                    <span>Reed: {evt.raw.magnetic_reed_state}</span>
                    <span>RSSI: {evt.raw.cellular_rssi_dbm}dBm</span>
                    <span className="text-slate-400">Local Edge Cache</span>
                  </div>
                </div>
              );
            }

            // Render Jev Inferred Event (Rich Carrier Card)
            const resp = evt.jevResponse!;
            const isTamper = resp.classification.value === 'MAGNETIC_OR_PHYSICAL_TAMPER';
            const isBattery = resp.classification.value === 'BATTERY_ELECTROLYTE_DECAY';
            const isRf = resp.classification.value === 'RF_ATTENUATION_ANOMALY';
            const isLeak = resp.classification.value === 'BURST_LEAK_ANOMALY';

            const cardBorderColor = isTamper
              ? 'border-rose-600/70 bg-gradient-to-r from-rose-950/20 to-[#0D1424]'
              : isBattery
              ? 'border-amber-600/50 bg-gradient-to-r from-amber-950/20 to-[#0D1424]'
              : isRf
              ? 'border-indigo-600/50 bg-gradient-to-r from-indigo-950/20 to-[#0D1424]'
              : isLeak
              ? 'border-cyan-500/50 bg-gradient-to-r from-cyan-950/20 to-[#0D1424]'
              : 'border-slate-700 bg-[#0E1626]';

            return (
              <div
                key={evt.id}
                onClick={() => onSelectEvent(evt)}
                className={`p-3 rounded border transition cursor-pointer ${cardBorderColor} ${
                  isSelected ? 'ring-1 ring-cyan-400 shadow-lg' : 'hover:border-slate-500'
                }`}
              >
                {/* Header Line */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">[{timeStr}]</span>
                    <span className="font-bold text-slate-100">{evt.raw.device_id}</span>
                    <span className="text-slate-400 text-[10px]">Zone: {evt.raw.zone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] bg-cyan-950/70 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">
                      {resp.latency_ms}ms Latency
                    </span>
                  </div>
                </div>

                {/* Tree Structure Matching Spec */}
                <div className="space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <span className="text-slate-600">├─</span>
                    <span>Telemetry:</span>
                    <span className="text-slate-200">{evt.raw.battery_volts.toFixed(2)}V ({evt.raw.voltage_delta_per_week > 0 ? '+' : ''}{evt.raw.voltage_delta_per_week}V/wk)</span>
                    <span>| Reed: <strong className={evt.raw.magnetic_reed_state === 'HIGH_FLUX' ? 'text-rose-400' : 'text-slate-300'}>{evt.raw.magnetic_reed_state}</strong></span>
                    <span>| Tilt: <strong className={evt.raw.tilt_sensor_state === 'TRIGGERED' ? 'text-rose-400' : 'text-slate-300'}>{evt.raw.tilt_sensor_state}</strong></span>
                    <span>| RSSI: {evt.raw.cellular_rssi_dbm}dBm</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">├─</span>
                    <span className="text-slate-400">Jev Classification:</span>
                    <span
                      className={`font-semibold px-1.5 py-0.2 rounded text-[10px] ${
                        isTamper
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                          : isBattery
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                          : isLeak
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {resp.classification.value} ({(resp.classification.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">├─</span>
                    <span className="text-slate-400">Severity Score:</span>
                    <span
                      className={`font-bold ${
                        resp.severity_tier.value >= 4
                          ? 'text-rose-400'
                          : resp.severity_tier.value === 3
                          ? 'text-amber-400'
                          : resp.severity_tier.value === 2
                          ? 'text-yellow-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      Tier {resp.severity_tier.value} / 4{' '}
                      {resp.severity_tier.value >= 4
                        ? '[CRITICAL HAZARD]'
                        : resp.severity_tier.value === 3
                        ? '[HIGH URGENCY]'
                        : resp.severity_tier.value === 2
                        ? '[SCHEDULED REPAIR]'
                        : '[NORMAL]'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-slate-600">├─</span>
                    <span className="text-slate-400">Dispatch Probability:</span>
                    <span className="text-cyan-300 font-semibold">
                      {resp.trigger_immediate_dispatch.probability.toFixed(3)}
                    </span>
                    <span
                      className={`text-[9px] px-1 rounded ${
                        resp.trigger_immediate_dispatch.probability >= 0.85
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {resp.trigger_immediate_dispatch.probability >= 0.85 ? 'APPROVED (DISPATCH)' : 'DEFERRED'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 pt-0.5 text-emerald-400">
                    <span className="text-slate-600">└─</span>
                    <span className="text-slate-400">Action Executed:</span>
                    <span className="font-semibold text-emerald-300">{evt.actionExecuted}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
