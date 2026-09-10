import React, { useState } from 'react';
import { Volume2, Play, Square, RefreshCw, CheckCircle, Radio } from 'lucide-react';
import { PublicConfig } from '../types';

interface VoiceMonitorPageProps {
  config: PublicConfig | null;
}

export const VoiceMonitorPage: React.FC<VoiceMonitorPageProps> = ({ config }) => {
  const [pronunciationFixtures] = useState([
    { token: 'KLAX', phonetic: 'K-L-A-X Los Angeles' },
    { token: 'KJFK', phonetic: 'K-J-F-K Kennedy' },
    { token: 'NINER', phonetic: 'NINER (9)' },
    { token: 'TREE', phonetic: 'TREE (3)' },
    { token: 'FIFE', phonetic: 'FIFE (5)' },
    { token: 'FL350', phonetic: 'Flight Level Three Five Zero' },
    { token: 'QNH', phonetic: 'Q-N-H Altimeter Setting' },
    { token: 'TCAS', phonetic: 'TEE-CAS Traffic Collision Avoidance' },
    { token: 'XPDR', phonetic: 'Transponder' },
  ]);

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-slate-50">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black font-mono text-slate-900 tracking-wider uppercase">
            RIME VOICE TELEMETRY & PHONETIC MONITOR
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium font-sans">
            Rime is the PRIMARY spoken output provider. Realtime streaming & atomic WebSocket clear.
          </p>
        </div>
      </div>

      {/* Rime Active Profile Specs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
        <h3 className="text-xs font-mono font-extrabold uppercase text-slate-900 tracking-wider">
          ACTIVE RIME PIPELINE CONFIGURATION
        </h3>

        <div className="grid grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
            <div className="text-slate-500 text-[10px] font-bold">MODEL ID</div>
            <div className="text-base font-black text-sky-600 mt-1">
              {config?.rime.model_id || 'mist'}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
            <div className="text-slate-500 text-[10px] font-bold">VOICE CHARACTER</div>
            <div className="text-base font-black text-slate-900 mt-1">
              {config?.rime.voice || 'amber'}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
            <div className="text-slate-500 text-[10px] font-bold">AUDIO TRANSPORT</div>
            <div className="text-base font-black text-emerald-700 mt-1">
              {config?.rime.transport || 'WebSocket Stream'}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
            <div className="text-slate-500 text-[10px] font-bold">OUTPUT FORMAT</div>
            <div className="text-base font-black text-slate-900 mt-1">
              {config?.rime.audio_format || 'PCM 24,000 Hz'}
            </div>
          </div>
        </div>
      </div>

      {/* Aviation Pronunciation Test Harness */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
          <Radio className="w-4 h-4 text-slate-600" />
          <h3 className="text-xs font-mono font-extrabold uppercase text-slate-900 tracking-wider">
            AVIATION PHRASEOLOGY & PHONETIC FIXTURES
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          {pronunciationFixtures.map((fix) => (
            <div key={fix.token} className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs shadow-subtle">
              <div className="text-sky-600 font-black text-sm">{fix.token}</div>
              <div className="text-slate-700 text-xs mt-1 font-sans font-semibold">{fix.phonetic}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
