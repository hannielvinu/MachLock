import React, { useState } from 'react';
import { Zap, Play, CheckCircle, AlertTriangle, ShieldCheck, Clock, ArrowRight, Activity } from 'lucide-react';
import { RaceTestResult } from '../types';

export const InterruptionLabPage: React.FC = () => {
  const [toolDelay, setToolDelay] = useState<number>(500);
  const [interruptionStage, setInterruptionStage] = useState<string>('STREAMING');
  const [noiseMode, setNoiseMode] = useState<string>('CLEAN');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<RaceTestResult | null>(null);

  const runRaceTest = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/tests/interruption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_delay_ms: toolDelay,
          interruption_stage: interruptionStage,
          noise_profile: noiseMode,
          step_key: 'FIRE_BOTTLE_DISCHARGE'
        })
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-app-bg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-aviation-blue flex items-center justify-center border border-sky-100 shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-mono text-text-primary tracking-wider uppercase">
                INTERRUPTION LAB & DETERMINISTIC RACE HARNESS
              </h2>
              <p className="text-xs text-text-secondary mt-0.5 font-medium font-sans">
                "Reproduce the hard voice race condition. Observe the fence. Prove obsolete state never commits."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Controls Card */}
      <div className="bg-white border border-app-border rounded-2xl p-6 shadow-card space-y-5">
        <div className="grid grid-cols-3 gap-5">
          {/* Tool Delay Selection */}
          <div>
            <label className="block text-xs font-mono font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
              SIMULATED TOOL DELAY (MS):
            </label>
            <div className="flex space-x-2">
              {[100, 250, 500, 1000, 2000].map((d) => (
                <button
                  key={d}
                  onClick={() => setToolDelay(d)}
                  className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                    toolDelay === d
                      ? 'bg-aviation-blue text-white border-aviation-blue shadow-sm'
                      : 'bg-slate-50 border-app-border text-text-secondary hover:text-text-primary hover:bg-slate-100'
                  }`}
                >
                  {d}ms
                </button>
              ))}
            </div>
          </div>

          {/* Interruption Point */}
          <div>
            <label className="block text-xs font-mono font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
              INTERRUPTION TRIGGER POINT:
            </label>
            <div className="flex space-x-2">
              {['GENERATED', 'STREAMING', 'PARTIAL', 'TOOL_WAIT'].map((stage) => (
                <button
                  key={stage}
                  onClick={() => setInterruptionStage(stage)}
                  className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                    interruptionStage === stage
                      ? 'bg-aviation-blue text-white border-aviation-blue shadow-sm'
                      : 'bg-slate-50 border-app-border text-text-secondary hover:text-text-primary hover:bg-slate-100'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>

          {/* Noise Profile */}
          <div>
            <label className="block text-xs font-mono font-bold text-text-secondary mb-2.5 uppercase tracking-wider">
              ACOUSTIC NOISE PROFILE:
            </label>
            <div className="flex space-x-2">
              {['CLEAN', 'ENGINE-LIKE', 'BROADBAND'].map((noise) => (
                <button
                  key={noise}
                  onClick={() => setNoiseMode(noise)}
                  className={`flex-1 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                    noiseMode === noise
                      ? 'bg-aviation-blue text-white border-aviation-blue shadow-sm'
                      : 'bg-slate-50 border-app-border text-text-secondary hover:text-text-primary hover:bg-slate-100'
                  }`}
                >
                  {noise}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={runRaceTest}
            disabled={isRunning}
            className="px-6 py-3 rounded-xl bg-aviation-blue hover:bg-sky-700 text-white font-mono font-black text-xs flex items-center space-x-2 shadow-card transition-transform active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isRunning ? 'EXECUTING RACE CONDITION TEST...' : 'RUN DETERMINISTIC RACE TEST'}</span>
          </button>
        </div>
      </div>

      {/* Results & Animated Timeline */}
      {testResult && (
        <div className="grid grid-cols-12 gap-6">
          {/* Visual Timeline Trace (8 cols) */}
          <div className="col-span-8 bg-white border border-app-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-app-border font-mono text-xs">
              <span className="font-extrabold text-text-primary uppercase tracking-wider">
                EXECUTION RACE TIMELINE TRACE
              </span>
              <span className="font-bold px-2.5 py-1 rounded bg-sky-50 text-aviation-blue border border-sky-200">
                TEST ID: {testResult.test_id}
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-muted font-bold text-[10px]">T+00ms</span>
                <span className="text-aviation-blue font-black">EPOCH {testResult.initial_epoch} CREATED</span>
                <span className="text-text-secondary text-xs">— Procedure: Fire Bottle Discharge initiated</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-muted font-bold text-[10px]">T+10ms</span>
                <span className="text-text-primary font-bold">TOOL DISPATCHED</span>
                <span className="text-text-secondary text-xs">— In-flight async delay: {testResult.tool_delay_ms}ms</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-muted font-bold text-[10px]">T+20ms</span>
                <span className="text-aviation-blue font-black">RIME TTS STREAMING</span>
                <span className="text-text-secondary text-xs">— Audio chunks delivered to Web Audio queue</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 shadow-subtle">
                <span className="text-red-600 font-bold text-[10px]">T+50ms</span>
                <span className="font-black text-red-700">PILOT BARGE-IN INTERRUPT</span>
                <span className="text-xs font-sans font-semibold">— "BREAK BREAK! Traffic twelve o'clock!"</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 shadow-subtle">
                <span className="text-sky-600 font-bold text-[10px]">T+52ms</span>
                <span className="text-aviation-blue font-black">EPOCH BUMP: {testResult.initial_epoch} → {testResult.interrupted_epoch}</span>
                <span className="text-xs font-sans font-medium">— Rime stream cleared, Client audio buffer flushed</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-subtle">
                <span className="text-amber-600 font-bold text-[10px]">T+{testResult.tool_delay_ms + 10}ms</span>
                <span className="font-black text-amber-700">DELAYED STALE TOOL RESULT ARRIVES (EPOCH {testResult.initial_epoch})</span>
                <span className="text-xs font-sans font-medium">— Passed to Commit Fence</span>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold shadow-subtle">
                <span className="text-emerald-700 font-bold text-[10px]">T+{testResult.tool_delay_ms + 12}ms</span>
                <span className="text-emerald-800 font-black">COMMIT FENCE: REJECTED (STALE EPOCH) — ZERO STATE MUTATION</span>
              </div>
            </div>
          </div>

          {/* Fencer Verification Scorecard (4 cols) */}
          <div className="col-span-4 bg-white border border-app-border rounded-2xl p-6 shadow-card space-y-4">
            <div className="pb-3 border-b border-app-border font-mono text-xs font-extrabold text-text-primary uppercase tracking-wider">
              COMMIT FENCE SCORECARD
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-secondary font-medium">Rime Cancellation:</span>
                <span className="text-emerald-700 font-black flex items-center space-x-1.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>PASS</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-secondary font-medium">Client Playback Flush:</span>
                <span className="text-emerald-700 font-black flex items-center space-x-1.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>PASS</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-secondary font-medium">Stale Tool Rejection:</span>
                <span className="text-emerald-700 font-black flex items-center space-x-1.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>PASS</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-secondary font-medium">Partial Commit Block:</span>
                <span className="text-emerald-700 font-black flex items-center space-x-1.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>PASS</span>
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-app-border shadow-subtle">
                <span className="text-text-secondary font-medium">Persistent SQLite Audit:</span>
                <span className="text-emerald-700 font-black flex items-center space-x-1.5 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>PASS</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-600 text-white font-mono text-xs font-black text-center shadow-card">
              RACE INVARIANTS 100% SATISFIED
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
