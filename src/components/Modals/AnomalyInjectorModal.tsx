import React from 'react';
import { X, FlaskConical, ShieldAlert, BatteryLow, Radio, Droplets } from 'lucide-react';

interface AnomalyInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInject: (type: 'TAMPER' | 'BATTERY' | 'RF' | 'LEAK') => void;
}

export const AnomalyInjectorModal: React.FC<AnomalyInjectorModalProps> = ({
  isOpen,
  onClose,
  onInject,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#0B101E] border border-amber-500/50 rounded-lg shadow-2xl w-full max-w-xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-amber-950/40 border-b border-amber-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-amber-200">
              Test Bench: Synthetic Telemetry Pulse Injector
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <p className="text-xs text-slate-400">
            Inject realistic anomaly pulses into the Layer 1 stream to evaluate Layer 2 edge
            filtering, Layer 3 Jev non-autoregressive triage, and Layer 4 remediation workflows.
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Tamper Button */}
            <button
              onClick={() => {
                onInject('TAMPER');
                onClose();
              }}
              className="w-full p-3 rounded bg-[#0E1628] hover:bg-rose-950/40 border border-slate-800 hover:border-rose-600 transition flex items-start space-x-3 text-left group"
            >
              <ShieldAlert className="w-5 h-5 text-rose-400 mt-0.5 group-hover:scale-110 transition" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">
                    Scenario 1: Critical Magnetic &amp; Physical Tamper
                  </span>
                  <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded border border-rose-800">
                    Random Sector
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Reed: HIGH_FLUX | Tilt: TRIGGERED | Retries: 4. Injects critical tamper beacon into a random metro district.
                </p>
              </div>
            </button>

            {/* Battery Decay Button */}
            <button
              onClick={() => {
                onInject('BATTERY');
                onClose();
              }}
              className="w-full p-3 rounded bg-[#0E1628] hover:bg-amber-950/40 border border-slate-800 hover:border-amber-600 transition flex items-start space-x-3 text-left group"
            >
              <BatteryLow className="w-5 h-5 text-amber-400 mt-0.5 group-hover:scale-110 transition" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">
                    Scenario 2: Battery Electrolyte Decay Wave
                  </span>
                  <span className="text-[10px] bg-amber-950 text-amber-400 px-1.5 py-0.5 rounded border border-amber-800">
                    Random Sector
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  V_batt: 2.41V (-0.22V/wk drop). Injects major battery degradation into aging clusters in any zone.
                </p>
              </div>
            </button>

            {/* RF Jam Button */}
            <button
              onClick={() => {
                onInject('RF');
                onClose();
              }}
              className="w-full p-3 rounded bg-[#0E1628] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500 transition flex items-start space-x-3 text-left group"
            >
              <Radio className="w-5 h-5 text-cyan-400 mt-0.5 group-hover:scale-110 transition" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">
                    Scenario 3: RF Attenuation &amp; Local Jamming
                  </span>
                  <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-800">
                    Random Sector
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  RSSI: -116 dBm | Retries: 5. Triggers automated base station beam steering and local interference flag.
                </p>
              </div>
            </button>

            {/* Burst Leak Button */}
            <button
              onClick={() => {
                onInject('LEAK');
                onClose();
              }}
              className="w-full p-3 rounded bg-[#0E1628] hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500 transition flex items-start space-x-3 text-left group"
            >
              <Droplets className="w-5 h-5 text-indigo-400 mt-0.5 group-hover:scale-110 transition" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-300">
                    Scenario 4: Burst Leak Anomaly
                  </span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-800">
                    South Basin
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Flow: 520 L/h surge. Triggers Tier 4 Critical Hazard and emergency utility shutoff dispatch.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#080D18] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
