import React from 'react';
import { ChecklistStep, InstructionRecord } from '../types';
import { CheckCircle2, AlertOctagon, Play, Check, ClipboardList } from 'lucide-react';

interface ChecklistPanelProps {
  steps: ChecklistStep[];
  instructions: InstructionRecord[];
  currentEpoch: number;
  onStartStep: (stepNumber: number) => void;
  onConfirmStep: (instructionId: string) => void;
}

export const ChecklistPanel: React.FC<ChecklistPanelProps> = ({
  steps,
  instructions,
  currentEpoch,
  onStartStep,
  onConfirmStep
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card flex flex-col h-full">
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-black uppercase text-slate-900 tracking-wider">
              EMERGENCY PROCEDURE: ENGINE 2 FIRE
            </span>
            <div className="text-xs font-sans font-semibold text-slate-500">
              Transactional Procedural State Machine
            </div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
          NON-NORMAL CHECKLIST
        </span>
      </div>

      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
        {steps.map((step) => {
          const currentInstruction = instructions.find((i) => i.step_number === step.step_number);
          const isStale = currentInstruction && currentInstruction.epoch_id !== currentEpoch && !currentInstruction.committed;
          const isCommitted = currentInstruction?.committed;

          return (
            <div
              key={step.step_number}
              className={`p-4 rounded-2xl border transition-all shadow-subtle ${
                isCommitted
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : isStale
                  ? 'bg-red-50/60 border-red-200'
                  : currentInstruction
                  ? 'bg-sky-50/60 border-sky-300 ring-2 ring-sky-100'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold border ${
                    isCommitted
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 shadow-sm'
                  }`}>
                    {isCommitted ? <Check className="w-3.5 h-3.5" /> : step.step_number}
                  </span>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wide">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-700 mt-1 font-sans leading-relaxed font-semibold">
                      "{step.spoken_instruction}"
                    </p>
                  </div>
                </div>

                {/* Step Action Button */}
                <div>
                  {!currentInstruction && (
                    <button
                      onClick={() => onStartStep(step.step_number)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>SPEAK</span>
                    </button>
                  )}
                  {currentInstruction && currentInstruction.heard_state === 'COMPLETED' && !currentInstruction.confirmed && (
                    <button
                      onClick={() => onConfirmStep(currentInstruction.instruction_id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold flex items-center space-x-1.5 shadow-sm animate-pulse transition-all active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>CONFIRM</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status and Heard Progress Bar */}
              {currentInstruction && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 font-mono text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-slate-700 font-bold">
                      EPOCH: <span className="font-extrabold text-slate-900">{currentInstruction.epoch_id}</span> | STATE:{' '}
                      <span
                        className={`font-black px-2 py-0.5 rounded text-[11px] ${
                          currentInstruction.committed
                            ? 'bg-emerald-100 text-emerald-800'
                            : isStale || currentInstruction.heard_state === 'INTERRUPTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {isStale ? 'INVALIDATED (STALE EPOCH)' : currentInstruction.heard_state}
                      </span>
                    </span>
                    <span className="text-slate-900 font-extrabold">{currentInstruction.heard_percentage}% AUDIBLE</span>
                  </div>

                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        currentInstruction.committed
                          ? 'bg-emerald-600'
                          : isStale || currentInstruction.heard_state === 'INTERRUPTED'
                          ? 'bg-red-600'
                          : 'bg-sky-600'
                      }`}
                      style={{ width: `${currentInstruction.heard_percentage}%` }}
                    />
                  </div>

                  {currentInstruction.invalidated_reason && (
                    <div className="mt-2 text-xs text-red-900 bg-red-50 p-2 rounded-xl border border-red-200 flex items-center space-x-2 font-sans font-bold">
                      <AlertOctagon className="w-4 h-4 flex-shrink-0 text-red-600" />
                      <span>{currentInstruction.invalidated_reason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
