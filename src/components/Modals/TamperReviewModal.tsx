import React from 'react';
import { TamperIncident } from '../../types/telemetry';
import { X, ShieldAlert, Lock, ShieldCheck, UserX } from 'lucide-react';

interface TamperReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: TamperIncident[];
  onToggleQuarantine: (incidentId: string) => void;
  onToggleFraudFlag: (incidentId: string) => void;
}

export const TamperReviewModal: React.FC<TamperReviewModalProps> = ({
  isOpen,
  onClose,
  incidents,
  onToggleQuarantine,
  onToggleFraudFlag,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#0B101E] border border-rose-600/60 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-rose-950/40 border-b border-rose-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
            <span className="font-bold text-sm tracking-wider uppercase text-rose-200">
              Critical Tamper Incidents &amp; Security Quarantine Dock
            </span>
            <span className="text-xs bg-rose-900/60 text-rose-200 px-2 py-0.5 rounded border border-rose-700">
              {incidents.length} Pending Actions
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {incidents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p>No active physical tamper incidents detected.</p>
            </div>
          ) : (
            incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-lg bg-[#0E1628] border border-rose-900/40 hover:border-rose-600/50 transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-rose-300 text-sm">{inc.deviceId}</span>
                    <span className="text-xs text-slate-400">Sector: {inc.zone}</span>
                    <span className="text-[10px] text-slate-500">
                      Detected: {new Date(inc.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                      Jev Confidence: {(inc.confidence * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                      Severity: Tier {inc.severity} / 4
                    </span>
                  </div>
                </div>

                {/* Diagnostics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-[#090E1C] p-2.5 rounded border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Reed Switch:</span>
                    <strong className="text-rose-400">{inc.reedState}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Tilt Sensor:</span>
                    <strong className="text-rose-400">{inc.tiltState}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SIM Status:</span>
                    <strong
                      className={
                        inc.simStatus === 'QUARANTINED' ? 'text-rose-400' : 'text-emerald-400'
                      }
                    >
                      {inc.simStatus}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Revenue Fraud:</span>
                    <strong className={inc.fraudFlag ? 'text-rose-400' : 'text-slate-400'}>
                      {inc.fraudFlag ? 'FLAGGED' : 'CLEAR'}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-400 italic">
                  Note: {inc.notes}
                </div>

                {/* Operator Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-800">
                  <button
                    onClick={() => onToggleQuarantine(inc.id)}
                    className={`px-3 py-1.5 rounded text-xs transition flex items-center space-x-1.5 border ${
                      inc.simStatus === 'QUARANTINED'
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        : 'bg-rose-900/60 hover:bg-rose-800/70 text-rose-200 border-rose-600'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {inc.simStatus === 'QUARANTINED' ? 'Lift SIM Quarantine' : 'Quarantine SIM Immediately'}
                    </span>
                  </button>

                  <button
                    onClick={() => onToggleFraudFlag(inc.id)}
                    className={`px-3 py-1.5 rounded text-xs transition flex items-center space-x-1.5 border ${
                      inc.fraudFlag
                        ? 'bg-amber-950/60 hover:bg-amber-900/70 text-amber-300 border-amber-600'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>{inc.fraudFlag ? 'Clear Fraud Flag' : 'Mark Revenue Fraud'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#080D18] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
          >
            Close Dock
          </button>
        </div>
      </div>
    </div>
  );
};
