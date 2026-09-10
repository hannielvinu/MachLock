import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  Radio, 
  ShieldAlert, 
  GitCommit, 
  Activity, 
  Database, 
  Cpu, 
  Settings, 
  Zap, 
  Volume2,
  Clock,
  Home,
  CheckCircle2
} from 'lucide-react';
import { CockpitSessionState, PublicConfig } from '../types';

interface HeaderProps {
  state: CockpitSessionState | null;
  config: PublicConfig | null;
  connected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ state, config, connected }) => {
  const [utcTime, setUtcTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between select-none z-30 shadow-sm">
      {/* Brand & Wordmark (Logo Only) */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <img 
            src="/logo.png" 
            alt="MachLock Logo" 
            className="h-10 w-auto max-w-[190px] object-contain" 
          />
        </Link>
      </div>

      {/* Telemetry Status Badges */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`} />
          <span className="text-slate-600 font-semibold">GATEWAY:</span>
          <span className={connected ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
            {connected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <Volume2 className="w-4 h-4 text-sky-600" />
          <span className="text-slate-600 font-semibold">RIME TTS:</span>
          <span className={config?.rime.configured ? 'text-emerald-700 font-bold' : 'text-sky-700 font-bold'}>
            {config?.rime.configured ? 'LIVE ONLINE' : 'SIMULATED'}
          </span>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200">
          <span className="text-sky-800 font-semibold">ACTIVE EPOCH:</span>
          <span className="text-sky-800 font-black text-sm px-2 py-0.5 bg-white rounded-md shadow-sm border border-sky-100">
            {state?.current_epoch ?? 1}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 text-slate-700 font-mono text-xs px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold">{utcTime}</span>
        </div>
      </div>
    </header>
  );
};

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/console', label: 'Cockpit Console', icon: Activity },
    { to: '/interruption-lab', label: 'Interruption Lab', icon: Zap },
    { to: '/ledger', label: 'Heard State Ledger', icon: GitCommit },
    { to: '/voice', label: 'Rime Voice Monitor', icon: Volume2 },
    { to: '/evidence', label: 'Evidence & Metrics', icon: ShieldAlert },
    { to: '/events', label: 'Event Terminal', icon: Database },
    { to: '/architecture', label: 'Architecture', icon: Cpu },
    { to: '/settings', label: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between py-4 flex-shrink-0 select-none shadow-sm">
      <div className="space-y-4">
        {/* Return to Landing */}
        <div className="px-3">
          <Link
            to="/"
            className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl text-xs font-sans font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200"
          >
            <Home className="w-4 h-4 text-sky-600" />
            <span>Overview & Overview</span>
          </Link>
        </div>

        <nav className="space-y-1 px-3">
          <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider px-3 mb-2">
            OPERATIONAL VIEWS
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4">
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5 shadow-sm">
          <div className="font-bold flex items-center space-x-1.5 text-amber-800">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span className="font-mono text-[11px] uppercase tracking-wider">SAFETY SCOPE</span>
          </div>
          <p className="text-[11px] leading-relaxed text-amber-800/90 font-sans">
            Research prototype demonstrated inside a synthetic cockpit simulator. Not certified flight guidance.
          </p>
        </div>
      </div>
    </aside>
  );
};
