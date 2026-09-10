import React, { useState } from 'react';
import { Cpu, ArrowDown } from 'lucide-react';

interface ArchNode {
  id: string;
  title: string;
  role: string;
  input: string;
  output: string;
  failureMode: string;
  ownership: string;
}

export const ArchitecturePage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<ArchNode | null>(null);

  const nodes: ArchNode[] = [
    {
      id: 'mic',
      title: 'PILOT MICROPHONE / WEBRTC',
      role: 'Captures full-duplex pilot audio stream via Web Audio / LiveKit.',
      input: 'Acoustic voice PCM stream',
      output: 'Raw audio frames to acoustic preprocessor',
      failureMode: 'Acoustic clipping, ambient cockpit noise',
      ownership: 'LiveKit Client / Web Audio API'
    },
    {
      id: 'acoustic',
      title: 'ACOUSTIC PREPROCESSING & VAD',
      role: 'Measures RMS energy, evaluates VAD confidence, and performs hysteresis debouncing.',
      input: 'Raw PCM frames',
      output: 'Candidate speech chunks',
      failureMode: 'Low energy breath / background rumble',
      ownership: 'MachLock Application Acoustic Engine'
    },
    {
      id: 'intent_gate',
      title: 'INTENT VERIFICATION GATE',
      role: 'Deterministic classification into NOISE, BACKCHANNEL, BARGE_IN, or SUPERSEDING_COMMAND.',
      input: 'Candidate speech transcript / acoustic profile',
      output: 'Interruption decision & epoch bump trigger',
      failureMode: 'Ambiguous phraseology',
      ownership: 'MachLock Custom Intent Verifier'
    },
    {
      id: 'epoch_fencer',
      title: 'MONOTONIC EPOCH FENCER',
      role: 'Increments epoch, cancels LLM generation, clears Rime stream, and invalidates playback buffers.',
      input: 'Interruption event trigger',
      output: 'New monotonic epoch_id & invalidation broadcasts',
      failureMode: 'Race condition barrier leak',
      ownership: 'MachLock Core State Engine'
    },
    {
      id: 'rime_tts',
      title: 'RIME TTS STREAMING ENGINE',
      role: 'Primary spoken output provider. Streams procedural speech with atomic WebSocket clear.',
      input: 'Checklist instruction text & current epoch_id',
      output: 'PCM 24 kHz audio stream tagged with epoch_id',
      failureMode: 'Stale chunk emission during network latency',
      ownership: 'Rime Cloud TTS / MachLock Transport'
    },
    {
      id: 'client_invalidator',
      title: 'CLIENT-SIDE PLAYBACK INVALIDATOR',
      role: 'Web Audio controller that rejects any audio chunk where chunk.epoch_id < currentAudioEpoch.',
      input: 'Incoming Rime audio chunks & epoch invalidation signals',
      output: 'Immediate headphone silence upon interruption',
      failureMode: 'Buffer lingering in browser audio hardware queue',
      ownership: 'MachLock Client Audio Controller'
    },
    {
      id: 'commit_fence',
      title: 'TRANSACTIONAL COMMIT FENCE',
      role: 'Enforces invariant: action.epoch == current_epoch AND heard_state == COMPLETED AND confirmed.',
      input: 'Asynchronous tool completion results & pilot readback',
      output: 'Authoritative state commitment to simulated cockpit',
      failureMode: 'Stale async promise resolving after interruption',
      ownership: 'MachLock State Fencer'
    }
  ];

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-slate-50">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black font-mono text-slate-900 tracking-wider uppercase">
            SYSTEM ARCHITECTURE & TRANSACTION PIPELINE
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium font-sans">
            Click any architectural subsystem node to inspect design invariants, inputs, outputs, and failure modes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Architecture Flow Diagram (8 cols) */}
        <div className="col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-3">
          {nodes.map((node, idx) => (
            <React.Fragment key={node.id}>
              <div
                onClick={() => setSelectedNode(node)}
                className={`p-4 rounded-xl border cursor-pointer font-mono text-xs transition-all shadow-subtle ${
                  selectedNode?.id === node.id
                    ? 'bg-sky-50 border-sky-600 text-slate-900 ring-2 ring-sky-100'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-black text-sky-700 text-sm">{node.title}</div>
                  <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {node.ownership}
                  </span>
                </div>
                <div className="text-xs text-slate-600 mt-1 font-sans font-semibold">{node.role}</div>
              </div>
              {idx < nodes.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-4 h-4 text-sky-600" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Node Deep Dive Panel (4 cols) */}
        <div className="col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="text-xs font-mono font-extrabold uppercase text-slate-900 tracking-wider pb-3 border-b border-slate-200">
            SUBSYSTEM SPECIFICATION
          </h3>

          {selectedNode ? (
            <div className="space-y-4 font-mono text-xs">
              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase">SUBSYSTEM:</span>
                <div className="text-sm font-black text-sky-700 mt-0.5">{selectedNode.title}</div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase">RESPONSIBILITY:</span>
                <p className="text-slate-700 text-xs mt-0.5 font-sans leading-relaxed font-semibold">
                  {selectedNode.role}
                </p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase">INPUT:</span>
                <div className="text-slate-900 text-xs mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans font-semibold">
                  {selectedNode.input}
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] font-bold uppercase">OUTPUT:</span>
                <div className="text-slate-900 text-xs mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans font-semibold">
                  {selectedNode.output}
                </div>
              </div>

              <div>
                <span className="text-red-700 text-[10px] font-bold uppercase">FAILURE MODE:</span>
                <div className="text-red-950 text-xs mt-1 bg-red-50 p-2.5 rounded-lg border border-red-200 font-sans font-semibold">
                  {selectedNode.failureMode}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs font-sans font-semibold py-16 text-center">
              Click a node on the left to inspect architectural invariants and input/output contracts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
