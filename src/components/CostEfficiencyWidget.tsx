import React from 'react';
import { DollarSign } from 'lucide-react';
import { FleetMetrics } from '../types/telemetry';

interface CostEfficiencyWidgetProps {
  metrics: FleetMetrics;
}

export const CostEfficiencyWidget: React.FC<CostEfficiencyWidgetProps> = ({ metrics }) => {
  const savingsPercent = (
    ((metrics.hyperscalerMonthlyUsd - metrics.monthlyRunRateUsd) / metrics.hyperscalerMonthlyUsd) *
    100
  ).toFixed(2);

  const annualSavingsUsd = (metrics.hyperscalerMonthlyUsd - metrics.monthlyRunRateUsd) * 12;

  return (
    <div className="bg-[#0B0F19] border-t border-[#1E293B] p-3 text-xs font-mono">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold uppercase tracking-wider text-slate-200 text-[11px]">
            Cost Efficiency Engine
          </span>
          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded font-semibold">
            {savingsPercent}% Ingestion &amp; Compute Reduction
          </span>
        </div>

        <div className="text-[10px] text-slate-400">
          Rate: <span className="text-cyan-400 font-bold">$0.042</span> / 1M Input Tokens
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Hyperscaler LLM Card */}
        <div className="p-2.5 rounded bg-[#101524] border border-rose-900/30">
          <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
            <span>Standard Hyperscaler LLM</span>
            <span className="text-rose-400">Generative Autoregressive</span>
          </div>
          <div className="text-base font-bold text-rose-300 font-mono">
            ${metrics.hyperscalerMonthlyUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            <span className="text-[10px] text-slate-500 font-normal"> / mo</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            ~$0.02 / evaluation (token bloat &amp; high latency)
          </div>
        </div>

        {/* Jev System-One Card */}
        <div className="p-2.5 rounded bg-[#0D1829] border border-cyan-500/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between text-cyan-300 text-[10px] mb-1">
            <span className="font-semibold">Jev System-One Edge Architecture</span>
            <span className="text-emerald-400 font-semibold">Non-Autoregressive</span>
          </div>
          <div className="text-base font-bold text-emerald-400 font-mono flex items-baseline space-x-1.5">
            <span>${metrics.monthlyRunRateUsd.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
            <span className="text-[9px] text-cyan-300 bg-cyan-950/80 px-1 rounded border border-cyan-800">
              ~114ms
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Annual Run-Rate Savings:</span>
            <strong className="text-emerald-300">
              ${(annualSavingsUsd / 1_000_000).toFixed(2)}M / yr
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
