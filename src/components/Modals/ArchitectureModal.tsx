import React, { useState } from 'react';
import { X, Layers, Image as ImageIcon, Code2, Cpu } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'SCHEMA' | 'ARCHITECTURE'>('VISUAL');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono">
      <div className="bg-[#0B101E] border border-cyan-500/50 rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0D1424] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-sm tracking-wider uppercase text-cyan-200">
              Edge AI Telemetry Architecture &amp; Visual Design Specification
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Tab buttons */}
            <div className="flex bg-[#070B16] p-0.5 rounded border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('VISUAL')}
                className={`px-3 py-1 rounded flex items-center space-x-1.5 transition ${
                  activeTab === 'VISUAL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Visual Infographics</span>
              </button>
              <button
                onClick={() => setActiveTab('ARCHITECTURE')}
                className={`px-3 py-1 rounded flex items-center space-x-1.5 transition ${
                  activeTab === 'ARCHITECTURE'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>4-Layer Pipeline</span>
              </button>
              <button
                onClick={() => setActiveTab('SCHEMA')}
                className={`px-3 py-1 rounded flex items-center space-x-1.5 transition ${
                  activeTab === 'SCHEMA'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Jev Typed Schemas</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'VISUAL' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-cyan-300 flex items-center space-x-2">
                    <span>Figure 1: End-to-End System Infographic (Section 5, Prompt 1)</span>
                  </h3>
                  <span className="text-xs text-slate-400">Isometric Telecom &amp; AI Stack</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#070A12] shadow-xl">
                  <img
                    src="/assets/end_to_end_system_infographic.jpg"
                    alt="End-to-End System Infographic"
                    className="w-full h-auto object-cover max-h-[420px]"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Illustrates 10M smart meters streaming 64-byte pulses into Provider Edge Gateways,
                  routing 8% to the Jev Low-Cost Edge AI Classifier (112ms | $0.042/M tokens), and
                  triggering automated security quarantines &amp; field technician dispatch.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-cyan-300 flex items-center space-x-2">
                    <span>Figure 2: Provider Control Center Map Interface (Section 5, Prompt 2)</span>
                  </h3>
                  <span className="text-xs text-slate-400">Holographic 3D City UI Mockup</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#070A12] shadow-xl">
                  <img
                    src="/assets/control_center_map_interface.jpg"
                    alt="Control Center Map Interface"
                    className="w-full h-auto object-cover max-h-[420px]"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Hyper-detailed operational dashboard showing glowing point-cloud clusters across
                  metro sectors, crimson strobe tamper rings in North Hills, and real-time typed Jev
                  diagnostic classifications.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ARCHITECTURE' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#0E1628] border border-cyan-500/30 space-y-2">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  LAYER 1: MASS IOT FIELD FLEET (10,000,000+ SMART METERS)
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Smart utility meters (gas/water/electric) partitioned into 5 metro districts:
                  Downtown, North Hills, Industrial Park, East Suburbs, South Basin. Heartbeat
                  pulses transmit 64-byte compact payloads over NB-IoT, LTE-M, or LoRaWAN.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0E1628] border border-emerald-500/30 space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  LAYER 2: PROVIDER EDGE GATEWAY &amp; DISTRIBUTED USER PLANE
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Located in provider edge cells and local central offices. Executes deterministic
                  pre-filtering: 92% of pulses are nominal (Delta = 0, nominal voltage, tamper flag
                  clear) and logged locally. Only 8% anomalous, borderline, or cyclic verification
                  pulses are dispatched to inference.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0E1628] border border-indigo-500/30 space-y-2">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  LAYER 3: JEV ULTRA-LOW-COST CLASSIFICATION ENGINE
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Non-autoregressive typed-primitive System-One AI. Evaluates choice, score, and
                  probability primitives in parallel with zero generative token bloat. Delivers
                  ~80–140ms latency at an extraordinary $0.042 per million input tokens.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#0E1628] border border-rose-500/30 space-y-2">
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                  LAYER 4: PROVIDER CONTROL CENTER &amp; AUTOMATED REMEDIATION
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Autonomous operational orchestration: Action A (Security: SIM quarantine and fraud
                  flagging), Action B (Maintenance: automated field technician truck-roll work orders
                  and low-priority batching), Action C (RF: base station beam steering and interference
                  flags).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'SCHEMA' && (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">
                  1. Raw Ingestion Pulse (Meter-to-Edge, 64-Byte Payload)
                </span>
                <pre className="p-3 rounded bg-[#070A12] border border-slate-800 text-cyan-300 overflow-x-auto">
{`{
  "device_id": "MTR-METRO-048291",
  "zone": "North Hills",
  "timestamp": "2026-09-22T14:26:00Z",
  "battery_volts": 2.58,
  "voltage_delta_per_week": -0.18,
  "flow_liters_per_hour": 0.0,
  "magnetic_reed_state": "HIGH_FLUX",
  "tilt_sensor_state": "TRIGGERED",
  "cellular_rssi_dbm": -108,
  "failed_tx_retries": 4
}`}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">
                  2. Jev Query Contract (Zero Token Bloat Typed Primitives)
                </span>
                <pre className="p-3 rounded bg-[#070A12] border border-slate-800 text-indigo-300 overflow-x-auto">
{`{
  "state": "Device MTR-METRO-048291 in North Hills. Flow=0.0 L/h, Batt=2.58V (Drop=-0.18V/wk), Tilt=TRIGGERED, ReedSwitch=HIGH_FLUX, RSSI=-108dBm, Retries=4.",
  "primitives": {
    "classification": {
      "type": "choice",
      "options": [
        "NOMINAL",
        "MAGNETIC_OR_PHYSICAL_TAMPER",
        "BATTERY_ELECTROLYTE_DECAY",
        "RF_ATTENUATION_ANOMALY",
        "BURST_LEAK_ANOMALY"
      ]
    },
    "severity_tier": {
      "type": "score",
      "min": 0,
      "max": 4
    },
    "trigger_immediate_dispatch": {
      "type": "null",
      "question": "Does this event require physical field technician intervention within 24 hours?"
    }
  }
}`}
                </pre>
              </div>

              <div>
                <span className="text-slate-400 font-bold block mb-1">
                  3. Jev Structured Response Output
                </span>
                <pre className="p-3 rounded bg-[#070A12] border border-slate-800 text-emerald-300 overflow-x-auto">
{`{
  "latency_ms": 112,
  "classification": {
    "value": "MAGNETIC_OR_PHYSICAL_TAMPER",
    "confidence": 0.982
  },
  "severity_tier": {
    "value": 4,
    "confidence": 0.941
  },
  "trigger_immediate_dispatch": {
    "probability": 0.965
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#080D18] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
          >
            Close Specification Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
