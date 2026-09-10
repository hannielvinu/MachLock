"""
MachLock Heard-State Ledger & State Machine
Enforces strict state-machine progression:
GENERATED -> STREAMING -> PARTIALLY_HEARD -> COMPLETED -> CONFIRMED -> COMMITTED
"""

import time
import uuid
from typing import Optional, List
from app.state.models import HeardState, InstructionRecord, EventType
from app.state.epoch_fencer import EpochFencer
from app.state.audit_store import AuditStore


class HeardStateLedger:
    """
    Manages procedural spoken state and prevents unconfirmed/partially heard execution.
    """

    def __init__(self, fencer: EpochFencer, audit_store: AuditStore):
        self.fencer = fencer
        self.audit_store = audit_store

    async def create_instruction(self, step_number: int, procedure_name: str, text: str) -> InstructionRecord:
        instruction_id = f"INS-{uuid.uuid4().hex[:6].upper()}"
        epoch_id = self.fencer.state.current_epoch
        
        record = InstructionRecord(
            instruction_id=instruction_id,
            epoch_id=epoch_id,
            step_number=step_number,
            procedure_name=procedure_name,
            text=text,
            heard_state=HeardState.GENERATED,
            heard_percentage=0.0,
            confirmed=False,
            committed=False
        )

        self.fencer.state.instructions.append(record)
        self.audit_store.save_instruction(self.fencer.session_id, record)

        await self.fencer.emit_event(
            EventType.INSTRUCTION_GENERATED,
            component="PROCEDURAL_LEDGER",
            instruction_id=instruction_id,
            status="OK",
            metadata={"step": step_number, "text": text, "epoch": epoch_id}
        )
        return record

    async def transition_streaming(self, instruction_id: str) -> Optional[InstructionRecord]:
        record = self._get_instruction(instruction_id)
        if not record:
            return None

        if record.epoch_id != self.fencer.state.current_epoch:
            record.heard_state = HeardState.INVALIDATED
            record.invalidated_reason = "Stale epoch during streaming transition"
            self.audit_store.save_instruction(self.fencer.session_id, record)
            return record

        record.heard_state = HeardState.STREAMING
        record.updated_at = time.time()
        self.audit_store.save_instruction(self.fencer.session_id, record)

        await self.fencer.emit_event(
            EventType.INSTRUCTION_STREAMING,
            component="RIME_STREAM_PIPELINE",
            instruction_id=instruction_id,
            status="STREAMING",
            metadata={"epoch": record.epoch_id}
        )
        return record

    async def update_heard_progress(self, instruction_id: str, percentage: float) -> Optional[InstructionRecord]:
        record = self._get_instruction(instruction_id)
        if not record:
            return None

        if record.epoch_id != self.fencer.state.current_epoch:
            return record

        record.heard_percentage = min(100.0, max(0.0, percentage))
        if record.heard_percentage < 100.0:
            record.heard_state = HeardState.PARTIALLY_HEARD
        else:
            record.heard_state = HeardState.COMPLETED

        record.updated_at = time.time()
        self.audit_store.save_instruction(self.fencer.session_id, record)

        if record.heard_state == HeardState.COMPLETED:
            await self.fencer.emit_event(
                EventType.INSTRUCTION_COMPLETED,
                component="HEARD_STATE_LEDGER",
                instruction_id=instruction_id,
                status="COMPLETED",
                metadata={"heard_pct": 100.0, "epoch": record.epoch_id}
            )
        else:
            await self.fencer.emit_event(
                EventType.INSTRUCTION_PARTIALLY_HEARD,
                component="HEARD_STATE_LEDGER",
                instruction_id=instruction_id,
                status="PARTIAL",
                metadata={"heard_pct": record.heard_percentage, "epoch": record.epoch_id}
            )
        return record

    async def confirm_instruction(self, instruction_id: str, pilot_callsign: str = "PILOT") -> bool:
        """
        User / Pilot readback confirmation.
        Must be in COMPLETED state and match current_epoch.
        """
        record = self._get_instruction(instruction_id)
        if not record:
            return False

        if record.epoch_id != self.fencer.state.current_epoch:
            record.invalidated_reason = "Confirmation rejected: epoch mismatch"
            return False

        if record.heard_state != HeardState.COMPLETED:
            # Cannot confirm if only partially heard
            self.fencer.state.partial_commits_prevented_count += 1
            return False

        record.confirmed = True
        record.heard_state = HeardState.CONFIRMED
        record.updated_at = time.time()
        self.audit_store.save_instruction(self.fencer.session_id, record)

        await self.fencer.emit_event(
            EventType.INSTRUCTION_CONFIRMED,
            component="INTENT_VERIFIER",
            instruction_id=instruction_id,
            status="CONFIRMED",
            metadata={"confirmed_by": pilot_callsign, "epoch": record.epoch_id}
        )
        return True

    async def commit_instruction(self, instruction_id: str) -> bool:
        """
        Final commit to simulated cockpit state.
        STRICT INVARIANT:
        record.epoch_id == current_epoch
        AND record.heard_state == CONFIRMED (or COMPLETED + confirmed)
        AND record.confirmed == True
        """
        record = self._get_instruction(instruction_id)
        if not record:
            return False

        current_epoch = self.fencer.state.current_epoch

        # Strict Fence Condition
        if record.epoch_id != current_epoch:
            self.fencer.state.stale_commits_prevented_count += 1
            record.heard_state = HeardState.INVALIDATED
            record.invalidated_reason = f"Stale epoch commit attempt (record={record.epoch_id}, current={current_epoch})"
            self.audit_store.save_instruction(self.fencer.session_id, record)
            return False

        if not record.confirmed or record.heard_percentage < 100.0:
            self.fencer.state.partial_commits_prevented_count += 1
            record.invalidated_reason = f"Partial/unconfirmed commit attempt (heard={record.heard_percentage}%, confirmed={record.confirmed})"
            self.audit_store.save_instruction(self.fencer.session_id, record)
            return False

        record.committed = True
        record.heard_state = HeardState.COMMITTED
        record.updated_at = time.time()
        self.audit_store.save_instruction(self.fencer.session_id, record)

        await self.fencer.emit_event(
            EventType.INSTRUCTION_COMMITTED,
            component="COMMIT_FENCE",
            instruction_id=instruction_id,
            status="COMMITTED",
            metadata={"epoch": record.epoch_id, "step": record.step_number}
        )
        return True

    def _get_instruction(self, instruction_id: str) -> Optional[InstructionRecord]:
        for instr in self.fencer.state.instructions:
            if instr.instruction_id == instruction_id:
                return instr
        return None
