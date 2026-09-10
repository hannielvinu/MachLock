export interface InstructionRecord {
  instruction_id: string;
  epoch_id: number;
  step_number: number;
  procedure_name: string;
  text: string;
  heard_state: 'GENERATED' | 'STREAMING' | 'PARTIALLY_HEARD' | 'COMPLETED' | 'CONFIRMED' | 'COMMITTED' | 'INTERRUPTED' | 'INVALIDATED';
  heard_percentage: number;
  confirmed: boolean;
  committed: boolean;
  created_at: number;
  updated_at: number;
  invalidated_reason?: string;
}

export interface ChecklistStep {
  step_number: number;
  action_key: string;
  title: string;
  spoken_instruction: string;
  simulated_tool_action: string;
  expected_response: string;
  is_completed: boolean;
  is_active: boolean;
}

export interface CockpitTelemetry {
  pitch_deg: number;
  roll_deg: number;
  altitude_ft: number;
  airspeed_kts: number;
  heading_deg: number;
  thrust_lever_1_pct: number;
  thrust_lever_2_pct: number;
  engine_1_fire: boolean;
  engine_2_fire: boolean;
  fire_bottle_1_armed: boolean;
  fire_bottle_1_discharged: boolean;
  fire_bottle_2_armed: boolean;
  transponder_code: string;
  master_warning: boolean;
  master_caution: boolean;
}

export interface CockpitSessionState {
  session_id: string;
  current_epoch: number;
  active_checklist: string;
  current_step_index: number;
  instructions: InstructionRecord[];
  telemetry: CockpitTelemetry;
  active_rime_stream: boolean;
  client_audio_epoch: number;
  is_interrupted: boolean;
  stale_results_rejected_count: number;
  stale_commits_prevented_count: number;
  partial_commits_prevented_count: number;
  audio_leaks_prevented_count: number;
  last_event_time: number;
}

export interface RealtimeEvent {
  timestamp: number;
  event_id: string;
  type: string;
  epoch_id: number;
  instruction_id?: string;
  component: string;
  status: string;
  metadata: Record<string, any>;
}

export interface RaceTestResult {
  test_id: string;
  timestamp: number;
  tool_delay_ms: number;
  initial_epoch: number;
  interrupted_epoch: number;
  rime_cancellation_emitted: boolean;
  client_invalidation_emitted: boolean;
  stale_tool_result_rejected: boolean;
  partial_commit_prevented: boolean;
  persistent_audit_verified: boolean;
  execution_time_ms: number;
  status: string;
  details: Record<string, any>;
}

export interface PublicConfig {
  environment: string;
  rime: {
    configured: boolean;
    model_id: string;
    voice: string;
    language: string;
    endpoint: string;
    transport: string;
    audio_format: string;
    sample_rate: number;
  };
  stt: {
    provider: string;
    configured: boolean;
    model: string;
    language: string;
  };
  llm: {
    provider: string;
    configured: boolean;
    model: string;
  };
  livekit: {
    configured: boolean;
    url: string;
  };
  intent_gate: {
    vad_threshold: number;
    min_duration_ms: number;
    debounce_ms: number;
  };
  simulation: {
    default_tool_delay_ms: number;
    audit_enabled: boolean;
  };
}
