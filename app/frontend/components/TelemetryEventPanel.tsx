import React from 'react';
import { RealtimeEvent, CockpitSessionState } from '../types';
import { Terminal, Shield, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TelemetryEventPanelProps {
  events: RealtimeEvent[];
  state: CockpitSessionState | null;
}

export const TelemetryEventPanel: React.FC<TelemetryEventPanelProps> = ({ events, state }) => {
  return (
    <div className="bg-white border border-app-border rounded-2xl p-5 shadow-card flex flex-col h-full space-y-4">
      {/* Realtime Epoch & Fence Telemetry Stats */}
      <div>
        <div className="flex items-center space-x-2.5 pb-3 mb-3 border-b border-app-border">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-aviation-blue flex items-center justify-center border border-sky-100">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-extrabold uppercase text-text-primary tracking-wider">
              FENCER TELEMETRY & INVARIANT METRICS
            </span>
            <div className="text-[11px] font-sans font-medium text-text-muted">
              Live Barrier Verification
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="bg-slate-50 p-3 rounded-xl border border-app-border shadow-subtle">
            <div className="text-text-muted text-[10px] font-bold">CURRENT ACTIVE EPOCH</div>
            <div className="text-2xl font-black text-aviation-blue mt-0.5">{state?.current_epoch ?? 1}</div>
          </div>
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 shadow-subtle">
            <div className="text-emerald-800 text-[10px] font-bold">STALE COMMITS PREVENTED</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{state?.stale_commits_prevented_count ?? 0}</div>
          </div>
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 shadow-subtle">
            <div className="text-amber-800 text-[10px] font-bold">PARTIAL COMMITS BLOCKED</div>
            <div className="text-2xl font-black text-amber-600 mt-0.5">{state?.partial_commits_prevented_count ?? 0}</div>
          </div>
          <div className="bg-red-50/70 p-3 rounded-xl border border-red-200 shadow-subtle">
            <div className="text-red-800 text-[10px] font-bold">STALE RESULTS REJECTED</div>
            <div className="text-2xl font-black text-red-600 mt-0.5">{state?.stale_results_rejected_count ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Realtime Event Stream Terminal */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-app-border">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-text-secondary" />
            <span className="font-mono text-xs font-extrabold uppercase text-text-primary tracking-wider">
              REALTIME AUDIT EVENT STREAM
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-text-muted bg-slate-100 px-2 py-0.5 rounded-full border border-app-border">
            {events.length} EVENTS
          </span>
        </div>

        <div className="flex-1 bg-slate-900 rounded-xl p-3 overflow-y-auto font-mono text-[11px] space-y-2 shadow-inner">
          {events.length === 0 ? (
            <div className="text-slate-400 text-center py-8">Awaiting realtime system events...</div>
          ) : (
            events.slice(0, 35).map((evt) => {
              const timeStr = new Date(evt.timestamp * 1000).toISOString().slice(11, 23);
              const isInterruption = evt.type.includes('INTERRUPT');
              const isStaleRejected = evt.type.includes('REJECTED');
              const isCommit = evt.type.includes('COMMITTED');

              return (
                <div
                  key={evt.event_id}
                  className={`p-2 rounded-lg border transition-all ${
                    isInterruption
                      ? 'bg-red-950/60 border-red-500/50 text-red-300'
                      : isStaleRejected
                      ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                      : isCommit
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-400">{timeStr}</span>
                    <span className="text-sky-400">EPOCH:{evt.epoch_id}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="font-bold text-white">{evt.type}</span>
                    <span className="text-[10px] text-slate-400">[{evt.component}]</span>
                  </div>
                  {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                    <div className="text-[10px] text-slate-400 truncate mt-1 bg-slate-950/50 p-1 rounded font-mono">
                      {JSON.stringify(evt.metadata)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
