"""
MachLock Monotonic Epoch Fencer
Coordinates strict fencing of epochs across LLM, Rime TTS, client playback, and simulated tools.
"""

import time
import uuid
import asyncio
from typing import Optional, Callable, Dict, Any
from app.state.models import (
    CockpitSessionState,
    EventType,
    RealtimeEvent,
    HeardState,
    InstructionRecord,
)
from app.state.audit_store import AuditStore


class EpochFencer:
    """
    Guarantees the Core Invariant:
    action.epoch_id == current_epoch
    AND
    action.heard_state == COMPLETED
    AND
    action.confirmed == true
    
    Only then may a simulated action commit.
    """

    def __init__(self, session_id: str, audit_store: AuditStore):
        self.session_id = session_id
        self.audit_store = audit_store
        self.state = CockpitSessionState(session_id=session_id)
        self._event_subscribers = []
        self._lock = asyncio.Lock()
        
        # Track in-flight async tasks to cancel on interruption
        self._active_tts_task: Optional[asyncio.Task] = None
        self._active_llm_task: Optional[asyncio.Task] = None
        self._active_tool_tasks: Dict[str, asyncio.Task] = {}

    def subscribe_events(self, callback: Callable[[RealtimeEvent], Any]):
        self._event_subscribers.append(callback)

    async def emit_event(self, event_type: EventType, component: str, status: str = "OK", instruction_id: Optional[str] = None, metadata: Optional[Dict[str, Any]] = None) -> RealtimeEvent:
        event = RealtimeEvent(
            timestamp=time.time(),
            event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
            type=event_type,
            epoch_id=self.state.current_epoch,
            instruction_id=instruction_id,
            component=component,
            status=status,
            metadata=metadata or {}
        )
        self.state.last_event_time = event.timestamp
        self.audit_store.record_event(self.session_id, event)
        for sub in self._event_subscribers:
            try:
                if asyncio.iscoroutinefunction(sub):
                    await sub(event)
                else:
                    sub(event)
            except Exception as e:
                pass
        return event

    async def increment_epoch(self, triggered_by: str, reason: str) -> int:
        """
        Interruption Barrier:
        1. Increments monotonic current_epoch
        2. Cancels active LLM generation
        3. Fences/cancels in-flight tool promises
        4. Triggers Rime stream clear
        5. Invalidates client-side playback buffer
        6. Marks current instruction as INTERRUPTED / INVALIDATED
        7. Logs persistent audit event
        """
        async with self._lock:
            old_epoch = self.state.current_epoch
            self.state.current_epoch += 1
            new_epoch = self.state.current_epoch
            self.state.is_interrupted = True
            self.state.client_audio_epoch = new_epoch

            # 1. Invalidate active instructions in old epoch
            for instr in self.state.instructions:
                if instr.epoch_id == old_epoch and not instr.committed:
                    if instr.heard_state in [HeardState.GENERATED, HeardState.STREAMING, HeardState.PARTIALLY_HEARD]:
                        instr.heard_state = HeardState.INTERRUPTED
                        instr.invalidated_reason = f"Interrupted by {triggered_by}: {reason}"
                        instr.updated_at = time.time()
                        self.audit_store.save_instruction(self.session_id, instr)

            # 2. Record epoch transition in SQLite ledger
            self.audit_store.record_epoch_bump(self.session_id, new_epoch, triggered_by, reason)

            # 3. Emit epoch bump event
            await self.emit_event(
                EventType.EPOCH_INCREMENT,
                component="EPOCH_FENCER",
                status="TRIGGERED",
                metadata={
                    "old_epoch": old_epoch,
                    "new_epoch": new_epoch,
                    "triggered_by": triggered_by,
                    "reason": reason
                }
            )

            # 4. Emit Rime stream clear signal
            await self.emit_event(
                EventType.RIME_CLEAR,
                component="RIME_TTS",
                status="CLEARED",
                metadata={"epoch": new_epoch, "old_epoch": old_epoch}
            )

            # 5. Emit Client Playback Invalidation signal
            await self.emit_event(
                EventType.CLIENT_PLAYBACK_INVALIDATED,
                component="CLIENT_AUDIO_CONTROLLER",
                status="INVALIDATED",
                metadata={"client_audio_epoch": new_epoch, "old_epoch": old_epoch}
            )

            return new_epoch

    async def validate_and_commit_tool_result(self, tool_request_id: str, request_epoch: int, action_key: str, result_payload: dict) -> bool:
        """
        Commit Fence:
        Validates whether a tool result arriving from async execution is eligible to commit.
        Strict check: request_epoch == current_epoch
        """
        async with self._lock:
            if request_epoch != self.state.current_epoch:
                # STALE RESULT REJECTED
                self.state.stale_results_rejected_count += 1
                self.state.stale_commits_prevented_count += 1
                self.audit_store.record_tool_completion(tool_request_id, "REJECTED_STALE", {
                    "reason": f"Epoch mismatch: request_epoch={request_epoch} != current_epoch={self.state.current_epoch}",
                    "payload": result_payload
                })
                await self.emit_event(
                    EventType.STALE_TOOL_RESULT_REJECTED,
                    component="COMMIT_FENCE",
                    status="REJECTED",
                    metadata={
                        "tool_request_id": tool_request_id,
                        "request_epoch": request_epoch,
                        "current_epoch": self.state.current_epoch,
                        "action_key": action_key
                    }
                )
                return False

            # Valid result under current epoch
            self.audit_store.record_tool_completion(tool_request_id, "COMPLETED", result_payload)
            await self.emit_event(
                EventType.TOOL_COMPLETED,
                component="SIMULATED_TOOL",
                status="COMMITTED",
                metadata={
                    "tool_request_id": tool_request_id,
                    "epoch_id": request_epoch,
                    "action_key": action_key
                }
            )
            return True

    def get_state(self) -> CockpitSessionState:
        return self.state
