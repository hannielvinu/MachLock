import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header, Sidebar } from './components/Navigation';
import { LandingPage } from './pages/LandingPage';
import { ConsolePage } from './pages/ConsolePage';
import { InterruptionLabPage } from './pages/InterruptionLabPage';
import { LedgerPage } from './pages/LedgerPage';
import { VoiceMonitorPage } from './pages/VoiceMonitorPage';
import { EvidencePage } from './pages/EvidencePage';
import { EventsPage } from './pages/EventsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SettingsPage } from './pages/SettingsPage';
import { ClientAudioController } from './audio_controller';
import { CockpitSessionState, PublicConfig, RealtimeEvent, ChecklistStep } from './types';

const ConsoleLayout: React.FC<{
  state: CockpitSessionState | null;
  config: PublicConfig | null;
  events: RealtimeEvent[];
  checklist: ChecklistStep[];
  connected: boolean;
  audioController: ClientAudioController;
  onRefreshState: () => void;
}> = ({ state, config, events, checklist, connected, audioController, onRefreshState }) => {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Safety Header Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-1.5 flex items-center justify-between text-xs font-mono select-none shadow-sm">
        <div className="flex items-center space-x-2 text-amber-900 font-bold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>SIMULATION MODE — NOT CERTIFIED FLIGHT GUIDANCE — DOES NOT CONTROL AIRCRAFT SYSTEMS</span>
        </div>
        <span className="text-amber-800 font-bold text-[11px]">DATA-FORGE 2026 / RIME HACKATHON CHALLENGE</span>
      </div>

      <Header state={state} config={config} connected={connected} />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
          <Routes>
            <Route
              path="/console"
              element={
                <ConsolePage
                  state={state}
                  config={config}
                  events={events}
                  checklist={checklist}
                  audioController={audioController}
                  onRefreshState={onRefreshState}
                />
              }
            />
            <Route path="/interruption-lab" element={<InterruptionLabPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/voice" element={<VoiceMonitorPage config={config} />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="/settings" element={<SettingsPage config={config} />} />
            <Route path="*" element={<Navigate to="/console" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const [state, setState] = useState<CockpitSessionState | null>(null);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [checklist, setChecklist] = useState<ChecklistStep[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  const [audioController] = useState(() => new ClientAudioController());

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        setState(data.state);
        setChecklist(data.active_checklist);
      }
    } catch (e) {
      console.error('Session fetch failed', e);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config/public');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error('Config fetch failed', e);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchConfig();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/events`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onmessage = (msg) => {
        try {
          const payload = JSON.parse(msg.data);
          if (payload.type === 'SNAPSHOT') {
            setState(payload.state);
            setConfig(payload.public_config);
          } else {
            const event: RealtimeEvent = payload;
            setEvents((prev) => [event, ...prev.slice(0, 100)]);

            if (event.type === 'CLIENT_PLAYBACK_INVALIDATED' || event.type === 'EPOCH_INCREMENT') {
              const newEpoch = event.epoch_id;
              audioController.invalidateBuffers(newEpoch);
            } else if (event.type === 'RIME_AUDIO_CHUNK') {
              audioController.enqueueChunk(event.epoch_id);
            }

            fetchSession();
          }
        } catch (e) {
          console.error(e);
        }
      };
    } catch (e) {
      console.error(e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Full Console Application */}
        <Route
          path="/*"
          element={
            <ConsoleLayout
              state={state}
              config={config}
              events={events}
              checklist={checklist}
              connected={connected}
              audioController={audioController}
              onRefreshState={fetchSession}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
