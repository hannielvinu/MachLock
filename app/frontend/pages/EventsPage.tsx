import React, { useEffect, useState } from 'react';
import { Database, Filter, RefreshCw, Terminal } from 'lucide-react';
import { RealtimeEvent } from '../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filterComponent, setFilterComponent] = useState<string>('ALL');

  const fetchEvents = () => {
    fetch('/api/events?limit=150')
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = filterComponent === 'ALL'
    ? events
    : events.filter((e) => e.component === filterComponent);

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-app-bg">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-aviation-blue flex items-center justify-center border border-sky-100 shadow-sm">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black font-mono text-text-primary tracking-wider uppercase">
              EVENT TERMINAL & AUDIT TIMELINE
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium font-sans">
              Complete transactional stream of all state modifications, epoch bumps, and fencer operations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterComponent}
            onChange={(e) => setFilterComponent(e.target.value)}
            className="bg-white border border-app-border rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-aviation-blue/20 shadow-subtle"
          >
            <option value="ALL">ALL COMPONENTS</option>
            <option value="EPOCH_FENCER">EPOCH_FENCER</option>
            <option value="COMMIT_FENCE">COMMIT_FENCE</option>
            <option value="INTENT_GATE">INTENT_GATE</option>
            <option value="RIME_TTS">RIME_TTS</option>
            <option value="SIMULATED_ACTUATOR">SIMULATED_ACTUATOR</option>
          </select>

          <button
            onClick={fetchEvents}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-app-border text-xs font-mono font-bold text-text-secondary flex items-center space-x-1.5 shadow-subtle transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white border border-app-border rounded-2xl p-6 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-app-border text-text-muted text-[11px] bg-slate-50/80">
                <th className="py-3 px-4 rounded-l-lg">TIMESTAMP</th>
                <th className="py-3 px-4">EVENT ID</th>
                <th className="py-3 px-4">TYPE</th>
                <th className="py-3 px-4">EPOCH</th>
                <th className="py-3 px-4">COMPONENT</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 rounded-r-lg">METADATA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border text-text-secondary">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-muted font-sans font-medium">
                    No events matching filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.event_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-text-muted">
                      {new Date(evt.timestamp * 1000).toISOString().slice(11, 23)}
                    </td>
                    <td className="py-3 px-4 text-aviation-blue font-bold">{evt.event_id}</td>
                    <td className="py-3 px-4 font-bold text-text-primary">{evt.type}</td>
                    <td className="py-3 px-4 font-bold">{evt.epoch_id}</td>
                    <td className="py-3 px-4 text-text-muted">[{evt.component}]</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-app-border text-text-primary">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[10px] text-text-muted max-w-xs truncate font-mono">
                      {evt.metadata_json}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
