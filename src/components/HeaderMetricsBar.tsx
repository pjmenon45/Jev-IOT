import React from 'react';
import { FleetMetrics } from '../types/telemetry';
import { Activity, ShieldAlert, Cpu, DollarSign, Layers } from 'lucide-react';

interface HeaderMetricsBarProps {
  metrics: FleetMetrics;
  onOpenArchitecture: () => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

export const HeaderMetricsBar: React.FC<HeaderMetricsBarProps> = ({
  metrics,
  onOpenArchitecture,
  isSimulating,
  onToggleSimulation,
}) => {
  return (
    <header className="bg-[#0B0F19] border-b border-[#1E293B] text-slate-200">
      {/* Top Carrier Bar */}
      <div className="px-4 py-2 flex flex-wrap items-center justify-between border-b border-[#151D2E] gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold text-sm tracking-wider uppercase text-cyan-400 font-mono-telemetry">
              Provider IoT Control Center
            </span>
          </div>
          <span className="text-slate-600">::</span>
          <span className="text-xs text-slate-400 font-medium">
            Smart Meter Health & Edge AI Telemetry
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Jev System-One AI Engine
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onToggleSimulation}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition flex items-center space-x-1.5 border ${
              isSimulating
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
            }`}
            title="Toggle live telemetry stream generation"
          >
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isSimulating ? 'FEED: STREAMING' : 'FEED: PAUSED'}</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="px-2.5 py-1 rounded bg-[#121A2D] hover:bg-[#1B2744] text-cyan-300 text-[11px] font-mono font-medium transition flex items-center space-x-1.5 border border-cyan-500/30"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Specs</span>
          </button>

          <div className="flex items-center space-x-2 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 rounded text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-[11px] font-semibold tracking-wide">
              STATUS: ALL EDGES OPERATIONAL [●]
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics Bar */}
      <div className="px-4 py-2 bg-[#070A12]/90 flex flex-wrap items-center justify-between text-xs font-mono-telemetry gap-y-2">
        <div className="flex items-center divide-x divide-slate-800 text-slate-300">
          <div className="pr-4 flex items-center space-x-2">
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Active Fleet</span>
            <span className="text-slate-100 font-bold text-sm tracking-wide">
              {metrics.activeFleet.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1 py-0.2 rounded border border-emerald-900">
              10M+
            </span>
          </div>

          <div className="px-4 flex items-center space-x-2">
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Edge Filtered (24h)</span>
            <span className="text-emerald-400 font-bold text-sm">
              {(metrics.edgeFilterRate * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">
              ({metrics.edgeFilteredCount.toLocaleString()} nominal)
            </span>
          </div>

          <div className="px-4 flex items-center space-x-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Jev Inferences</span>
            <span className="text-cyan-300 font-bold text-sm">
              {metrics.jevInferencesCount.toLocaleString()}
            </span>
          </div>

          <div className="px-4 flex items-center space-x-2">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Avg Latency</span>
            <span className="text-indigo-300 font-bold text-sm">
              {metrics.avgLatencyMs.toFixed(0)} ms
            </span>
          </div>

          <div className="pl-4 flex items-center space-x-2">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-500 uppercase text-[10px] tracking-wider">Monthly Run-Rate</span>
            <span className="text-emerald-400 font-bold text-sm">
              ${metrics.monthlyRunRateUsd.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 line-through">
              ${(metrics.hyperscalerMonthlyUsd / 1000).toFixed(1)}k
            </span>
          </div>
        </div>

        {/* Live Anomaly Badges */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-rose-950/40 border border-rose-600/40 text-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>Tampers: <strong className="text-rose-200">{metrics.tamperCount}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-600/40 text-amber-300">
            <span>Battery Decay: <strong className="text-amber-200">{metrics.batteryDecayCount}</strong></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-600/40 text-cyan-300">
            <span>RF Jam/Attn: <strong className="text-cyan-200">{metrics.rfJamCount}</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
};
