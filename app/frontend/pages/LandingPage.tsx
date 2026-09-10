import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Radio, 
  ShieldCheck, 
  Zap, 
  Volume2, 
  GitCommit, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Terminal,
  Cpu,
  Lock,
  Compass,
  FileCode,
  Sparkles,
  Server,
  Code2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-sky-100 selection:text-sky-900">
      {/* Top Navigation */}
      <nav className="h-20 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center hover:opacity-95 transition-opacity">
          <img 
            src="/logo.png" 
            alt="MachLock Logo" 
            className="h-12 w-auto max-w-[220px] object-contain" 
          />
        </Link>

        <div className="flex items-center space-x-6 text-sm font-medium">
          <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors">About</a>
          <a href="#problem" className="text-slate-600 hover:text-slate-900 transition-colors">The Hard Voice Problem</a>
          <a href="#solution" className="text-slate-600 hover:text-slate-900 transition-colors">Epoch Fencing</a>
          <a href="#rime" className="text-slate-600 hover:text-slate-900 transition-colors">Rime TTS Engine</a>
          <a href="#architecture" className="text-slate-600 hover:text-slate-900 transition-colors">Architecture</a>
          
          <Link
            to="/console"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-md transition-all active:scale-95"
          >
            <span>LAUNCH CONSOLE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-8 max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-mono font-bold shadow-sm">
          <Zap className="w-3.5 h-3.5 text-sky-600" />
          <span>RIME HACKATHON CHALLENGE — DATAFORGE 2026</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-[1.15]">
          Making Realtime Voice Procedures <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">Transactional</span>.
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl font-medium leading-relaxed">
          When an operator interrupts, anything unheard and any in-flight asynchronous tool result generated prior to that moment can <strong className="text-slate-900 font-bold">never become an authoritative state</strong>.
        </p>

        <div className="flex items-center space-x-4 pt-4">
          <Link
            to="/console"
            className="px-8 py-4 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-mono font-bold text-sm flex items-center space-x-3 shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 active:scale-95"
          >
            <Activity className="w-5 h-5" />
            <span>ENTER COCKPIT SIMULATOR</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            to="/interruption-lab"
            className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-mono font-bold text-sm flex items-center space-x-3 shadow-sm transition-all active:scale-95"
          >
            <Zap className="w-5 h-5 text-sky-600" />
            <span>RUN RACE TEST LAB</span>
          </Link>
        </div>

        {/* Feature Pill Highlights */}
        <div className="grid grid-cols-3 gap-6 pt-12 max-w-5xl w-full text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-slate-900 text-sm">Monotonic Epoch Fencing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every instruction, Rime stream, and async tool request is fenced to a monotonic epoch counter. Stale results are rejected instantly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Volume2 className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-slate-900 text-sm">Rime TTS Cancellation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Realtime streaming speech synthesis with atomic WebSocket clear frames and local Web Audio buffer invalidation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <GitCommit className="w-5 h-5" />
            </div>
            <h3 className="font-mono font-bold text-slate-900 text-sm">Audible Heard-State Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spoken words are treated as state. Partially heard or unconfirmed procedures are strictly prohibited from mutating application telemetry.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white border-y border-slate-200 px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
              ABOUT MACHLOCK
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Engineered for Interruption Safety & Procedural Integrity
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto font-medium">
              MachLock is an experimental voice-safety engine built for DataForge 2026 by IIT Kharagpur (Rime Hackathon Challenge), demonstrated inside a synthetic aerospace cockpit simulator.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-mono font-bold text-slate-900 text-base">The Mission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eliminate the dangerous race conditions of conversational voice agents in procedural high-stakes systems by treating voice delivery as transactional state.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-mono font-bold text-slate-900 text-base">Rime-Native Audio</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rime TTS serves as the primary spoken voice engine. Streaming WebSocket audio frames are tied to monotonic epochs with sub-50ms clearance upon interruption.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-mono font-bold text-slate-900 text-base">Zero Stale Mutation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backed by an immutable SQLite audit ledger and deterministic race-condition test harnesses guaranteeing zero state leakage across interruptions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Comparison Section */}
      <section id="problem" className="py-20 bg-slate-50 px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
              THE HARD VOICE SAFETY PROBLEM
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Why Standard Voice AI Fails in Procedural Systems
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto font-medium">
              Comparing standard LLM voice assistants with MachLock's transactional fencer during a critical barge-in.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Standard Voice AI */}
            <div className="p-8 rounded-3xl bg-red-50/70 border border-red-200 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-red-800 bg-red-100 px-3 py-1 rounded-full">
                  STANDARD VOICE AGENT
                </span>
                <span className="text-xs text-red-700 font-black">STATE CORRUPTION RISK</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 font-bold text-base leading-none">✕</span>
                  <span>Speaks instruction while dispatching asynchronous background tool.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 font-bold text-base leading-none">✕</span>
                  <span>Pilot interrupts: LLM stops generating text, but audio keeps playing in headphones.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-600 font-bold text-base leading-none">✕</span>
                  <span>Delayed background tool result returns and commits obsolete state out-of-order.</span>
                </li>
              </ul>
            </div>

            {/* MachLock Fencer */}
            <div className="p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                  MACHLOCK TRANSACTIONAL ENGINE
                </span>
                <span className="text-xs text-emerald-700 font-black">INVARIANT GUARANTEED</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-800 font-medium">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>Epoch-stamped instruction lifecycle & atomic Rime stream clearing.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>Pilot interrupts: Sub-50ms Intent Gate advances monotonic Epoch.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <span>Commit Fence rejects stale tool results & purges local client audio buffers.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Rime Section */}
      <section id="rime" className="py-20 bg-white border-t border-slate-200 px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-mono font-bold text-sky-600 uppercase tracking-widest">
              PRIMARY VOICE ENGINE
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900">
              Powered by Rime Streaming TTS
            </h2>
            <p className="text-slate-600 text-sm max-w-2xl mx-auto font-medium">
              Rime is not an accessory in MachLock—it is the authoritative voice output engine driving real-time spoken procedure execution.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px] font-bold">RIME MODEL</div>
              <div className="text-sm font-black text-sky-600 mt-1">mist / custom</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px] font-bold">VOICE PROFILE</div>
              <div className="text-sm font-black text-slate-900 mt-1">amber (configurable)</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px] font-bold">TRANSPORT</div>
              <div className="text-sm font-black text-emerald-700 mt-1">WebSocket Streaming</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 text-[10px] font-bold">AUDIO ENCODING</div>
              <div className="text-sm font-black text-slate-900 mt-1">PCM 24,000 Hz</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-16 bg-slate-900 text-white text-center space-y-6">
        <div className="max-w-4xl mx-auto px-8 space-y-4">
          <h2 className="text-3xl font-black font-mono">EXPERIENCE MACHLOCK LIVE</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Test the deterministic race condition harness, trigger voice barge-ins, and inspect the immutable SQLite audit ledger.
          </p>
          <div className="pt-4 flex justify-center space-x-4">
            <Link
              to="/console"
              className="px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-black text-xs shadow-lg transition-all active:scale-95"
            >
              LAUNCH INTERACTIVE CONSOLE
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-xs text-slate-500 font-mono">
          DataForge 2026 — Rime Hackathon Challenge — Research Prototype Simulator
        </div>
      </footer>
    </div>
  );
};
