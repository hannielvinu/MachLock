import React, { useEffect, useState } from 'react';
import { 
  CockpitSessionState, 
  ChecklistStep, 
  RealtimeEvent, 
  PublicConfig 
} from '../types';
import { InstrumentCluster } from '../components/CockpitInstrument';
import { ChecklistPanel } from '../components/ChecklistPanel';
import { VoiceControls } from '../components/VoiceControls';
import { TelemetryEventPanel } from '../components/TelemetryEventPanel';
import { ClientAudioController } from '../audio_controller';

interface ConsolePageProps {
  state: CockpitSessionState | null;
  config: PublicConfig | null;
  events: RealtimeEvent[];
  checklist: ChecklistStep[];
  audioController: ClientAudioController;
  onRefreshState: () => void;
}

export const ConsolePage: React.FC<ConsolePageProps> = ({
  state,
  config,
  events,
  checklist,
  audioController,
  onRefreshState
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartStep = async (stepNumber: number) => {
    try {
      await fetch('/api/checklist/start-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step_number: stepNumber, stream_rime: true })
      });
      setIsPlaying(true);
      onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmStep = async (instructionId: string) => {
    try {
      await fetch('/api/checklist/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction_id: instructionId })
      });
      onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSimulateInterruption = async (phrase: string) => {
    try {
      const res = await fetch('/api/interrupt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: phrase, source: 'PILOT_SPEECH' })
      });
      const data = await res.json();
      if (data.status === 'INTERRUPTED') {
        audioController.invalidateBuffers(data.new_epoch);
        setIsPlaying(false);
      }
      onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('/api/session/reset', { method: 'POST' });
      audioController.invalidateBuffers(1);
      setIsPlaying(false);
      onRefreshState();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 p-6 grid grid-cols-12 gap-6 min-h-0 overflow-y-auto bg-app-bg">
      {/* Left Column: Synthetic Cockpit & Voice Controls (7 cols) */}
      <div className="col-span-7 flex flex-col space-y-5">
        {state && <InstrumentCluster telemetry={state.telemetry} />}
        <VoiceControls
          state={state}
          config={config}
          isPlaying={isPlaying}
          onSimulateInterruption={handleSimulateInterruption}
          onResetSession={handleReset}
        />
        <div className="flex-1">
          <ChecklistPanel
            steps={checklist}
            instructions={state?.instructions || []}
            currentEpoch={state?.current_epoch || 1}
            onStartStep={handleStartStep}
            onConfirmStep={handleConfirmStep}
          />
        </div>
      </div>

      {/* Right Column: Telemetry & Event Stream (5 cols) */}
      <div className="col-span-5 flex flex-col h-full min-h-[600px]">
        <TelemetryEventPanel events={events} state={state} />
      </div>
    </div>
  );
};
