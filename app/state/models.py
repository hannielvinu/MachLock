"""
MachLock Domain Models & Realtime Event Schema
Standardized protocol messages and domain entities across frontend and backend.
"""

import time
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class HeardState(str, Enum):
    GENERATED = "GENERATED"
    STREAMING = "STREAMING"
    PARTIALLY_HEARD = "PARTIALLY_HEARD"
    COMPLETED = "COMPLETED"
    CONFIRMED = "CONFIRMED"
    COMMITTED = "COMMITTED"
    INTERRUPTED = "INTERRUPTED"
    INVALIDATED = "INVALIDATED"


class IntentClassification(str, Enum):
    NOISE = "NOISE"
    COUGH = "COUGH"
    BACKGROUND = "BACKGROUND"
    BACKCHANNEL = "BACKCHANNEL"
    BARGE_IN = "BARGE_IN"
    SUPERSEDING_COMMAND = "SUPERSEDING_COMMAND"


class EventType(str, Enum):
    SESSION_START = "SESSION_START"
    SESSION_RESET = "SESSION_RESET"
    INSTRUCTION_GENERATED = "INSTRUCTION_GENERATED"
    INSTRUCTION_STREAMING = "INSTRUCTION_STREAMING"
    INSTRUCTION_PARTIALLY_HEARD = "INSTRUCTION_PARTIALLY_HEARD"
    INSTRUCTION_COMPLETED = "INSTRUCTION_COMPLETED"
    INSTRUCTION_CONFIRMED = "INSTRUCTION_CONFIRMED"
    INSTRUCTION_COMMITTED = "INSTRUCTION_COMMITTED"
    USER_CANDIDATE_SPEECH = "USER_CANDIDATE_SPEECH"
    USER_INTERRUPTION = "USER_INTERRUPTION"
    EPOCH_INCREMENT = "EPOCH_INCREMENT"
    RIME_STREAM_START = "RIME_STREAM_START"
    RIME_AUDIO_CHUNK = "RIME_AUDIO_CHUNK"
    RIME_CLEAR = "RIME_CLEAR"
    CLIENT_PLAYBACK_INVALIDATED = "CLIENT_PLAYBACK_INVALIDATED"
    TOOL_DISPATCHED = "TOOL_DISPATCHED"
    TOOL_COMPLETED = "TOOL_COMPLETED"
    STALE_TOOL_RESULT_REJECTED = "STALE_TOOL_RESULT_REJECTED"
    ACOUSTIC_VAD_TRIGGER = "ACOUSTIC_VAD_TRIGGER"
    SAFETY_ALERT = "SAFETY_ALERT"
    TEST_RUN_START = "TEST_RUN_START"
    TEST_RUN_COMPLETE = "TEST_RUN_COMPLETE"


class RealtimeEvent(BaseModel):
    timestamp: float = Field(default_factory=time.time)
    event_id: str
    type: EventType
    epoch_id: int
    instruction_id: Optional[str] = None
    component: str
    status: str = "OK"
    metadata: Dict[str, Any] = Field(default_factory=dict)


class InstructionRecord(BaseModel):
    instruction_id: str
    epoch_id: int
    step_number: int
    procedure_name: str
    text: str
    heard_state: HeardState = HeardState.GENERATED
    heard_percentage: float = 0.0
    confirmed: bool = False
    committed: bool = False
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    invalidated_reason: Optional[str] = None


class ChecklistStep(BaseModel):
    step_number: int
    action_key: str
    title: str
    spoken_instruction: str
    simulated_tool_action: str
    expected_response: str
    is_completed: bool = False
    is_active: bool = False


class CockpitTelemetry(BaseModel):
    pitch_deg: float = 0.0
    roll_deg: float = 0.0
    altitude_ft: float = 10000.0
    airspeed_kts: float = 250.0
    heading_deg: float = 360.0
    thrust_lever_1_pct: float = 75.0
    thrust_lever_2_pct: float = 75.0
    engine_1_fire: bool = False
    engine_2_fire: bool = True
    fire_bottle_1_armed: bool = False
    fire_bottle_1_discharged: bool = False
    fire_bottle_2_armed: bool = False
    transponder_code: str = "7700"
    master_warning: bool = True
    master_caution: bool = False


class CockpitSessionState(BaseModel):
    session_id: str
    current_epoch: int = 1
    active_checklist: str = "ENGINE_FIRE_SIMULATION"
    current_step_index: int = 0
    instructions: List[InstructionRecord] = Field(default_factory=list)
    telemetry: CockpitTelemetry = Field(default_factory=CockpitTelemetry)
    active_rime_stream: bool = False
    client_audio_epoch: int = 1
    is_interrupted: bool = False
    stale_results_rejected_count: int = 0
    stale_commits_prevented_count: int = 0
    partial_commits_prevented_count: int = 0
    audio_leaks_prevented_count: int = 0
    last_event_time: float = Field(default_factory=time.time)


class InterruptionClassificationResult(BaseModel):
    raw_text: str
    classification: IntentClassification
    confidence: float
    is_interruption: bool
    requires_epoch_bump: bool
    reason: str


class RaceTestRequest(BaseModel):
    tool_delay_ms: int = 500
    interruption_stage: str = "STREAMING"  # GENERATED, STREAMING, PARTIAL, TOOL_WAIT
    noise_profile: str = "CLEAN"  # CLEAN, ENGINE, BROADBAND
    step_key: str = "FIRE_BOTTLE_DISCHARGE"


class RaceTestResult(BaseModel):
    test_id: str
    timestamp: float = Field(default_factory=time.time)
    tool_delay_ms: int
    initial_epoch: int
    interrupted_epoch: int
    rime_cancellation_emitted: bool
    client_invalidation_emitted: bool
    stale_tool_result_rejected: bool
    partial_commit_prevented: bool
    persistent_audit_verified: bool
    execution_time_ms: float
    status: str = "PASS"
    details: Dict[str, Any] = Field(default_factory=dict)
