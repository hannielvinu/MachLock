import React from 'react';
import { CockpitTelemetry } from '../types';
import { AlertTriangle, Flame, ShieldCheck, Gauge, Compass } from 'lucide-react';

interface InstrumentClusterProps {
  telemetry: CockpitTelemetry;
}

export const InstrumentCluster: React.FC<InstrumentClusterProps> = ({ telemetry }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-card aerospace-grid-light relative overflow-hidden">
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-sm">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-black uppercase text-slate-900 tracking-wider">
              SYNTHETIC COCKPIT INSTRUMENTATION
            </span>
            <span className="text-xs text-slate-500 font-sans font-semibold ml-2">
              (AEROSPACE TELEMETRY BUS)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {telemetry.master_warning && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-50 text-red-800 border border-red-200 animate-pulse shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>MASTER WARNING</span>
            </span>
          )}
          {telemetry.engine_2_fire && (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-50 text-red-800 border border-red-200 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-red-600" />
              <span>ENG 2 FIRE</span>
            </span>
          )}
        </div>
      </div>

      {/* Flight Instrumentation Grid */}
      <div className="grid grid-cols-4 gap-3.5 text-xs font-mono">
        {/* Airspeed Gauge */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-slate-600 text-xs font-bold tracking-wider uppercase">INDICATED AIRSPEED</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1">
            <span>{telemetry.airspeed_kts}</span>
            <span className="text-xs text-slate-600 font-bold">KTS</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-sky-600 h-full rounded-full transition-all duration-300" style={{ width: `${(telemetry.airspeed_kts / 350) * 100}%` }} />
          </div>
        </div>

        {/* Altitude Gauge */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-slate-600 text-xs font-bold tracking-wider uppercase">PRESSURE ALTITUDE (MSL)</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1">
            <span>{telemetry.altitude_ft.toLocaleString()}</span>
            <span className="text-xs text-slate-600 font-bold">FT</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${(telemetry.altitude_ft / 40000) * 100}%` }} />
          </div>
        </div>

        {/* Heading */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-slate-600 text-xs font-bold tracking-wider uppercase">MAGNETIC HEADING</div>
          <div className="text-2xl font-black text-sky-700 mt-1 flex items-center space-x-1.5">
            <Compass className="w-5 h-5 text-sky-600" />
            <span>{telemetry.heading_deg}°</span>
          </div>
          <div className="text-xs text-slate-600 font-bold mt-1">NAV HDG HOLD ACTIVE</div>
        </div>

        {/* Transponder */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-subtle">
          <div className="text-slate-600 text-xs font-bold tracking-wider uppercase">TRANSPONDER SQUAWK</div>
          <div className="text-2xl font-black text-amber-700 mt-1">
            {telemetry.transponder_code}
          </div>
          <div className="text-xs text-slate-600 font-bold mt-1">MODE C / ALT REPORTING</div>
        </div>
      </div>

      {/* Subsystem Actuator States */}
      <div className="grid grid-cols-3 gap-3.5 mt-3.5 text-xs font-mono">
        {/* Engine 1 */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-bold">ENG 1 (PORT)</span>
            <span className="text-emerald-800 font-black px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200">
              NORMAL
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 mt-1.5">
            THRUST: {telemetry.thrust_lever_1_pct}%
          </div>
        </div>

        {/* Engine 2 */}
        <div className={`p-3.5 rounded-xl border shadow-subtle transition-all ${telemetry.engine_2_fire ? 'bg-red-50 border-red-300 text-red-950' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex justify-between items-center">
            <span className={telemetry.engine_2_fire ? 'text-red-900 font-black' : 'text-slate-700 font-bold'}>
              ENG 2 (STARBOARD)
            </span>
            <span className={`px-2 py-0.5 rounded font-black ${telemetry.engine_2_fire ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
              {telemetry.engine_2_fire ? 'FIRE DETECTED' : 'NORMAL'}
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 mt-1.5">
            THRUST: {telemetry.thrust_lever_2_pct}% {telemetry.thrust_lever_2_pct === 0 && '(IDLE)'}
          </div>
        </div>

        {/* Fire Extinguisher Bottle */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-subtle">
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-bold">FIRE BOTTLE 1</span>
            <span className={`px-2 py-0.5 rounded font-black ${telemetry.fire_bottle_1_discharged ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-800 border border-slate-300'}`}>
              {telemetry.fire_bottle_1_discharged ? 'DISCHARGED' : 'ARMED'}
            </span>
          </div>
          <div className="text-sm font-black text-slate-900 mt-1.5 flex items-center space-x-1.5">
            <ShieldCheck className={`w-4 h-4 ${telemetry.fire_bottle_1_discharged ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span>{telemetry.fire_bottle_1_discharged ? 'EXTINGUISHED' : 'READY'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
