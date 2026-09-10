import React, { useEffect, useState } from 'react';
import { GitCommit, ArrowRight, ShieldAlert, CheckCircle, XCircle, Database } from 'lucide-react';
import { InstructionRecord } from '../types';

export const LedgerPage: React.FC = () => {
  const [instructions, setInstructions] = useState<InstructionRecord[]>([]);

  useEffect(() => {
    fetch('/api/ledger')
      .then((res) => res.json())
      .then((data) => setInstructions(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-app-bg">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky-50 text-aviation-blue flex items-center justify-center border border-sky-100 shadow-sm">
          <GitCommit className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black font-mono text-text-primary tracking-wider uppercase">
            HEARD-STATE LEDGER & TRANSACTIONAL COMMIT FENCE
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 font-medium font-sans">
            "Voice is part of state: Spoken procedures cannot commit without verified audible delivery & pilot confirmation."
          </p>
        </div>
      </div>

      {/* State Machine Transition Visualizer */}
      <div className="bg-white border border-app-border rounded-2xl p-6 shadow-card space-y-5">
        <h3 className="text-xs font-mono font-extrabold uppercase text-text-primary tracking-wider">
          AUDIBLE STATE MACHINE PROGRESSION LIFECYCLE
        </h3>

        <div className="flex items-center justify-between font-mono text-xs overflow-x-auto py-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-app-border text-center min-w-[120px] shadow-subtle">
            <div className="font-extrabold text-text-primary">GENERATED</div>
            <div className="text-[10px] text-text-muted mt-0.5 font-sans">Instruction ready</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center min-w-[120px] shadow-subtle">
            <div className="font-extrabold text-aviation-blue">STREAMING</div>
            <div className="text-[10px] text-sky-700 mt-0.5 font-sans">Rime synthesis</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center min-w-[120px] shadow-subtle">
            <div className="font-extrabold text-amber-700">PARTIAL</div>
            <div className="text-[10px] text-amber-600 mt-0.5 font-sans">&lt; 100% audible</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="p-3 rounded-xl bg-slate-50 border border-app-border text-center min-w-[120px] shadow-subtle">
            <div className="font-extrabold text-text-primary">COMPLETED</div>
            <div className="text-[10px] text-text-muted mt-0.5 font-sans">100% delivered</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center min-w-[120px] shadow-subtle">
            <div className="font-extrabold text-aviation-blue">CONFIRMED</div>
            <div className="text-[10px] text-sky-700 mt-0.5 font-sans">Pilot readback</div>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted flex-shrink-0" />
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-center min-w-[120px] shadow-subtle">
            <div className="font-extrabold text-emerald-700">COMMITTED</div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-sans">Cockpit updated</div>
          </div>
        </div>

        {/* Invalid paths banner */}
        <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-2.5 shadow-subtle">
            <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span className="font-bold text-[11px]">INVALID PATH: PARTIALLY_HEARD ➔ COMMITTED (BLOCKED BY HEARD-LEDGER)</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center space-x-2.5 shadow-subtle">
            <XCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span className="font-bold text-[11px]">INVALID PATH: OLD_EPOCH ➔ COMMITTED (BLOCKED BY EPOCH-FENCER)</span>
          </div>
        </div>
      </div>

      {/* Historical Ledger Table */}
      <div className="bg-white border border-app-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-app-border">
          <Database className="w-4 h-4 text-text-secondary" />
          <h3 className="text-xs font-mono font-extrabold uppercase text-text-primary tracking-wider">
            PERSISTENT INSTRUCTION AUDIT LEDGER (SQLITE IMMUTABLE STORE)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-app-border text-text-muted text-[11px] bg-slate-50/80">
                <th className="py-3 px-4 rounded-l-lg">INSTRUCTION ID</th>
                <th className="py-3 px-4">EPOCH</th>
                <th className="py-3 px-4">PROCEDURE TEXT</th>
                <th className="py-3 px-4">HEARD STATE</th>
                <th className="py-3 px-4">PROGRESS</th>
                <th className="py-3 px-4">CONFIRMED</th>
                <th className="py-3 px-4 rounded-r-lg">COMMITTED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border text-text-secondary">
              {instructions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-muted font-sans font-medium">
                    No instructions logged in persistent ledger. Start checklist from Cockpit Console.
                  </td>
                </tr>
              ) : (
                instructions.map((inst) => (
                  <tr key={inst.instruction_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-aviation-blue font-bold">{inst.instruction_id}</td>
                    <td className="py-3 px-4 font-bold text-text-primary">{inst.epoch_id}</td>
                    <td className="py-3 px-4 text-text-primary font-sans font-medium">{inst.text}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          inst.committed
                            ? 'bg-emerald-100 text-emerald-800'
                            : inst.heard_state === 'INTERRUPTED' || inst.heard_state === 'INVALIDATED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {inst.heard_state}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">{inst.heard_percentage}%</td>
                    <td className="py-3 px-4">
                      {inst.confirmed ? (
                        <span className="text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50">YES</span>
                      ) : (
                        <span className="text-text-muted font-medium">NO</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {inst.committed ? (
                        <span className="text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-50">YES</span>
                      ) : (
                        <span className="text-red-700 font-bold px-2 py-0.5 rounded bg-red-50">NO</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
