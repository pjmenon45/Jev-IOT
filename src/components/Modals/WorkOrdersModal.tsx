import React, { useState } from 'react';
import { WorkOrderTicket } from '../../types/telemetry';
import { X, ClipboardList, CheckCircle2, Clock, User, MapPin } from 'lucide-react';

interface WorkOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: WorkOrderTicket[];
  onUpdateStatus: (ticketId: string, status: WorkOrderTicket['status']) => void;
}

export const WorkOrdersModal: React.FC<WorkOrdersModalProps> = ({
  isOpen,
  onClose,
  tickets,
  onUpdateStatus,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DISPATCHED' | 'COMPLETED'>('ALL');

  if (!isOpen) return null;

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'DISPATCHED') return t.status === 'DISPATCHED' || t.status === 'EN_ROUTE';
    if (filter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <div className="bg-[#0B101E] border border-cyan-500/50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-cyan-950/40 border-b border-cyan-900/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <ClipboardList className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-cyan-200">
              Auto-Dispatched Field Technician Work Orders
            </span>
            <span className="text-xs bg-cyan-900/60 text-cyan-200 px-2 py-0.5 rounded border border-cyan-700">
              {tickets.length} Total Tickets
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-2 bg-[#090E1C] border-b border-slate-800 flex items-center space-x-2 text-xs">
          <span className="text-slate-500">Filter Status:</span>
          {(['ALL', 'DISPATCHED', 'COMPLETED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 rounded text-xs transition ${
                filter === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p>No work orders match the current filter.</p>
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.ticketId}
                className="p-3.5 rounded bg-[#0E1628] border border-slate-800 hover:border-cyan-500/40 transition space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-cyan-300 text-sm">{t.ticketId}</span>
                    <span className="text-xs text-slate-300">Target: {t.deviceId}</span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{t.zone}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : t.status === 'EN_ROUTE'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ETA: {t.status === 'COMPLETED' ? 'Resolved' : `${t.etaMinutes} mins`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Diagnosis:</span>
                    <strong className="text-slate-200">{t.classification}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Severity &amp; Prob:</span>
                    <span>
                      Tier {t.severity} | Prob: {(t.dispatchProbability * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Field Tech:</span>
                    <span className="text-cyan-300 flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{t.assignedTechnician}</span>
                    </span>
                  </div>
                </div>

                {/* Status Toggle Actions */}
                <div className="flex justify-end space-x-2 pt-1">
                  {t.status !== 'COMPLETED' && (
                    <button
                      onClick={() => onUpdateStatus(t.ticketId, 'COMPLETED')}
                      className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-600 text-emerald-200 text-xs flex items-center space-x-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Resolved / Completed</span>
                    </button>
                  )}
                  {t.status === 'DISPATCHED' && (
                    <button
                      onClick={() => onUpdateStatus(t.ticketId, 'EN_ROUTE')}
                      className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900/70 border border-amber-600 text-amber-200 text-xs flex items-center space-x-1"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Set En Route</span>
                    </button>
                  )}
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
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
