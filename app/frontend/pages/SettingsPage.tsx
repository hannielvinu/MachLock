import React from 'react';
import { Settings, Sliders, Volume2 } from 'lucide-react';
import { PublicConfig } from '../types';

interface SettingsPageProps {
  config: PublicConfig | null;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ config }) => {
  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-slate-50">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black font-mono text-slate-900 tracking-wider uppercase">
            SYSTEM SETTINGS & INTEGRATIONS
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium font-sans">
            Server-side secret shielding is active. API keys are masked and never exposed to browser context.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Rime TTS Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Volume2 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 uppercase tracking-wide">
              RIME TTS PROVIDER (PRIMARY SPEECH)
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">STATUS:</span>
              <div className="font-black text-emerald-700 text-sm mt-0.5">
                {config?.rime.configured ? 'AUTHENTICATED / LIVE ONLINE' : 'SIMULATION MODE ACTIVE'}
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">MODEL ID:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.rime.model_id || 'mist'}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">VOICE CHARACTER:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.rime.voice || 'amber'}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">TRANSPORT PROTOCOL:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.rime.transport || 'websocket'}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">AUDIO ENCODING:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.rime.audio_format || 'pcm_24000'}</div>
            </div>
          </div>
        </div>

        {/* Intent Gate & VAD Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4 font-mono text-xs">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-200">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900 uppercase tracking-wide">
              INTENT GATE & VAD THRESHOLDS
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">VAD CONFIDENCE THRESHOLD:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.intent_gate.vad_threshold ?? 0.65}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">MINIMUM SPEECH DURATION:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.intent_gate.min_duration_ms ?? 120} ms</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-slate-500 text-[10px] font-bold">INTENT GATE DEBOUNCE:</span>
              <div className="text-slate-900 font-bold mt-0.5">{config?.intent_gate.debounce_ms ?? 50} ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
