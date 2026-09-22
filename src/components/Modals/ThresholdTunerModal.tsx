import React from 'react';
import { DecisionThresholds } from '../../types/telemetry';
import { X, Sliders, RotateCcw } from 'lucide-react';

interface ThresholdTunerModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: DecisionThresholds;
  onUpdateThresholds: (thresholds: DecisionThresholds) => void;
}

export const ThresholdTunerModal: React.FC<ThresholdTunerModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onUpdateThresholds,
}) => {
  if (!isOpen) return null;

  const handleReset = () => {
    onUpdateThresholds({
      dispatchProbabilityThreshold: 0.90,
      severityTierCriticalMin: 3,
      edgeNominalFilterTarget: 0.92,
      batteryWarningVoltage: 2.60,
      rssiJamThresholdDbm: -105,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#0B101E] border border-indigo-500/50 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-indigo-950/40 border-b border-indigo-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-indigo-200">
              Jev Decision Thresholds &amp; Edge Filter Tuner
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sliders */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Dispatch Probability Threshold */}
          <div className="space-y-1.5 bg-[#0E1628] p-3 rounded border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Jev Dispatch Probability Threshold (Truck-Roll Approval)
              </span>
              <span className="text-cyan-400 font-bold">
                {(thresholds.dispatchProbabilityThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.99"
              step="0.01"
              value={thresholds.dispatchProbabilityThreshold}
              onChange={(e) =>
                onUpdateThresholds({
                  ...thresholds,
                  dispatchProbabilityThreshold: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[10px] text-slate-500">
              Controls when Jev triggers an automated emergency physical technician truck-roll.
            </p>
          </div>

          {/* Edge Filter Target Rate */}
          <div className="space-y-1.5 bg-[#0E1628] p-3 rounded border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Layer 2 Edge Gateway Pre-Filter Target Rate
              </span>
              <span className="text-emerald-400 font-bold">
                {(thresholds.edgeNominalFilterTarget * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="0.80"
              max="0.98"
              step="0.005"
              value={thresholds.edgeNominalFilterTarget}
              onChange={(e) =>
                onUpdateThresholds({
                  ...thresholds,
                  edgeNominalFilterTarget: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-[10px] text-slate-500">
              Fraction of nominal pulses cached locally at the edge cells without hitting inference.
            </p>
          </div>

          {/* Severity Critical Min */}
          <div className="space-y-1.5 bg-[#0E1628] p-3 rounded border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Severity Score Critical Cutoff (Tiers 0 - 4)
              </span>
              <span className="text-rose-400 font-bold">
                Tier {thresholds.severityTierCriticalMin}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              value={thresholds.severityTierCriticalMin}
              onChange={(e) =>
                onUpdateThresholds({
                  ...thresholds,
                  severityTierCriticalMin: parseInt(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />
            <p className="text-[10px] text-slate-500">
              Minimum severity required for automatic quarantine and security escalation.
            </p>
          </div>

          {/* Battery Warning Voltage */}
          <div className="space-y-1.5 bg-[#0E1628] p-3 rounded border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Battery Low Voltage Pre-Filter Trigger
              </span>
              <span className="text-amber-400 font-bold">
                {thresholds.batteryWarningVoltage.toFixed(2)} V
              </span>
            </div>
            <input
              type="range"
              min="2.20"
              max="3.00"
              step="0.05"
              value={thresholds.batteryWarningVoltage}
              onChange={(e) =>
                onUpdateThresholds({
                  ...thresholds,
                  batteryWarningVoltage: parseFloat(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-[10px] text-slate-500">
              Threshold below which pulses bypass edge cache and enter Jev battery decay triage.
            </p>
          </div>

          {/* RSSI Jam Threshold */}
          <div className="space-y-1.5 bg-[#0E1628] p-3 rounded border border-slate-800">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-semibold">
                Cellular RSSI Jam / Attenuation Cutoff
              </span>
              <span className="text-indigo-400 font-bold">
                {thresholds.rssiJamThresholdDbm} dBm
              </span>
            </div>
            <input
              type="range"
              min="-120"
              max="-90"
              step="1"
              value={thresholds.rssiJamThresholdDbm}
              onChange={(e) =>
                onUpdateThresholds({
                  ...thresholds,
                  rssiJamThresholdDbm: parseInt(e.target.value),
                })
              }
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
            <p className="text-[10px] text-slate-500">
              Signal strength threshold for triggering base station beam steering optimization.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#080D18] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Carrier Defaults</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
