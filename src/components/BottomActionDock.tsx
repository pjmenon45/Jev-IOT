import { AlertTriangle, ClipboardList, Sliders, FlaskConical } from 'lucide-react';

interface BottomActionDockProps {
  tamperCount: number;
  workOrderCount: number;
  onOpenTamperModal: () => void;
  onOpenWorkOrdersModal: () => void;
  onOpenThresholdModal: () => void;
  onOpenInjectorModal: () => void;
}

export const BottomActionDock: React.FC<BottomActionDockProps> = ({
  tamperCount,
  workOrderCount,
  onOpenTamperModal,
  onOpenWorkOrdersModal,
  onOpenThresholdModal,
  onOpenInjectorModal,
}) => {
  return (
    <footer className="bg-[#0B0F19] border-t border-[#1E293B] px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-10">
      <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Carrier Dock:</span>
        <span className="text-slate-600">|</span>
        <span className="text-emerald-400 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Autonomic Remediation Active</span>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        {/* Tamper Incident Review Button */}
        <button
          onClick={onOpenTamperModal}
          className="px-3 py-1.5 rounded bg-rose-950/50 hover:bg-rose-900/60 border border-rose-600/60 text-rose-200 transition flex items-center space-x-2 shadow-sm"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span>⚠️ {tamperCount} Critical Tamper Incidents Pending Review</span>
        </button>

        {/* Work Orders Button */}
        <button
          onClick={onOpenWorkOrdersModal}
          className="px-3 py-1.5 rounded bg-[#121A2D] hover:bg-[#1A2642] border border-cyan-500/40 text-cyan-200 transition flex items-center space-x-2"
        >
          <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
          <span>📋 View Auto-Dispatched Work Orders ({workOrderCount})</span>
        </button>

        {/* Decision Thresholds Button */}
        <button
          onClick={onOpenThresholdModal}
          className="px-3 py-1.5 rounded bg-[#101726] hover:bg-[#18233A] border border-slate-700 text-slate-300 transition flex items-center space-x-2"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>⚙️ Adjust Jev Decision Thresholds</span>
        </button>

        {/* Anomaly Injector Bench Button */}
        <button
          onClick={onOpenInjectorModal}
          className="px-3 py-1.5 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/50 text-amber-200 transition flex items-center space-x-2"
        >
          <FlaskConical className="w-3.5 h-3.5 text-amber-400" />
          <span>🧪 Test Bench Anomaly Injector</span>
        </button>
      </div>
    </footer>
  );
};
