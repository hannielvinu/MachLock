import React from 'react';
import { Volume2, Mic, AlertOctagon, RotateCcw, Play, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { CockpitSessionState, PublicConfig } from '../types';

interface VoiceControlsProps {
  state: CockpitSessionState | null;
  config: PublicConfig | null;
  isPlaying: boolean;
  onSimulateInterruption: (phrase: string) => void;
  onResetSession: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  state,
  config,
  isPlaying,
  onSimulateInterruption,
  onResetSession
}) => {
  const [customBargeIn, setCustomBargeIn] = React.useState('BREAK BREAK! Traffic twelve o\'clock!');

  return (
    <div className="bg-white border border-app-border rounded-2xl p-5 shadow-card flex flex-col space-y-4">
      <div className="flex items-center justify-between pb-3.5 border-b border-app-border">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-aviation-blue flex items-center justify-center border border-sky-100">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-extrabold uppercase text-text-primary tracking-wider">
              RIME TTS & PILOT BARGE-IN CONTROLLER
            </span>
            <div className="text-[11px] font-sans font-medium text-text-muted">
              Atomic Stream Clearing & Monotonic Epoch Barrier
            </div>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-50 text-aviation-blue border border-sky-200 shadow-sm">
          PCM 24 kHz WebSocket
        </span>
      </div>

      {/* Rime Voice Status & Live Waveform Indicator */}
      <div className="bg-slate-50/90 p-4 rounded-xl border border-app-border flex items-center justify-between shadow-subtle">
        <div className="flex items-center space-x-3.5">
          <div className={`w-3.5 h-3.5 rounded-full ${isPlaying ? 'bg-aviation-blue animate-ping' : 'bg-slate-300'}`} />
          <div>
            <div className="text-xs font-mono font-bold text-text-primary flex items-center space-x-2">
              <span>RIME TTS ENGINE:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config?.rime.configured ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'}`}>
                {config?.rime.configured ? 'AUTHENTICATED LIVE' : 'SIMULATION MODE'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-text-secondary mt-0.5 font-medium">
              Model: <span className="font-bold text-text-primary">{config?.rime.model_id || 'mist'}</span> | Voice: <span className="font-bold text-text-primary">{config?.rime.voice || 'amber'}</span> | Audio Epoch: <span className="font-bold text-aviation-blue">{state?.client_audio_epoch || 1}</span>
            </div>
          </div>
        </div>

        {/* Animated Waveform Indicator */}
        <div className="flex items-center space-x-1.5 h-8 px-3 bg-white rounded-lg border border-app-border">
          {[40, 75, 30, 90, 60, 100, 45, 80, 20, 95].map((h, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${isPlaying ? 'bg-aviation-blue shadow-blue-glow' : 'bg-slate-200'}`}
              style={{ height: isPlaying ? `${h}%` : '25%' }}
            />
          ))}
        </div>
      </div>

      {/* Interruption Simulation Controls */}
      <div className="space-y-2.5">
        <label className="block text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
          SIMULATE PILOT INTERRUPTION (BARGE-IN STRESS CASE):
        </label>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customBargeIn}
              onChange={(e) => setCustomBargeIn(e.target.value)}
              className="w-full bg-slate-50 border border-app-border rounded-xl px-3.5 py-2 text-xs font-mono text-text-primary focus:outline-none focus:ring-2 focus:ring-aviation-blue/20 focus:border-aviation-blue shadow-subtle transition-all font-medium"
              placeholder="Type pilot barge-in phrase..."
            />
          </div>
          <button
            onClick={() => onSimulateInterruption(customBargeIn)}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold flex items-center space-x-2 shadow-sm transition-all active:scale-95 flex-shrink-0"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>INTERRUPT / BUMP EPOCH</span>
          </button>
        </div>

        {/* Preset Aviation Phraseology Shortcuts */}
        <div className="flex items-center space-x-2 pt-1 font-mono text-[11px]">
          <span className="text-text-muted font-bold text-[10px]">PRESETS:</span>
          <button
            onClick={() => onSimulateInterruption("BREAK BREAK! Traffic twelve o'clock!")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-text-secondary hover:text-text-primary border border-app-border transition-all font-semibold"
          >
            Traffic 12 O'Clock
          </button>
          <button
            onClick={() => onSimulateInterruption("HOLD! Check altimeter setting.")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-text-secondary hover:text-text-primary border border-app-border transition-all font-semibold"
          >
            Hold Procedure
          </button>
          <button
            onClick={() => onSimulateInterruption("Roger, copy")}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-text-muted hover:text-text-primary border border-app-border transition-all font-semibold"
            title="Non-invalidating backchannel"
          >
            Backchannel (Roger)
          </button>
        </div>
      </div>

      {/* Reset Session */}
      <div className="pt-2 border-t border-app-border flex justify-end">
        <button
          onClick={onResetSession}
          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-text-secondary hover:text-text-primary text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all border border-app-border"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET SESSION</span>
        </button>
      </div>
    </div>
  );
};
