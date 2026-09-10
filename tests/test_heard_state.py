"""
Tests for MachLock Heard-State Ledger Transitions & Invariants
"""

import pytest
from app.state.audit_store import AuditStore
from app.state.epoch_fencer import EpochFencer
from app.state.heard_state_ledger import HeardStateLedger
from app.state.models import HeardState


@pytest.fixture
def ledger_setup(tmp_path):
    db_file = str(tmp_path / "test_ledger.db")
    store = AuditStore(db_file)
    fencer = EpochFencer("SES-TEST-LEDGER", store)
    ledger = HeardStateLedger(fencer, store)
    return fencer, ledger, store


@pytest.mark.asyncio
async def test_heard_state_progression(ledger_setup):
    fencer, ledger, store = ledger_setup

    # 1. GENERATED
    instr = await ledger.create_instruction(1, "TEST_PROCEDURE", "Set transponder to 7700")
    assert instr.heard_state == HeardState.GENERATED
    assert instr.heard_percentage == 0.0

    # Generated cannot commit
    assert await ledger.commit_instruction(instr.instruction_id) is False

    # 2. STREAMING
    await ledger.transition_streaming(instr.instruction_id)
    assert instr.heard_state == HeardState.STREAMING
    assert await ledger.commit_instruction(instr.instruction_id) is False

    # 3. PARTIALLY_HEARD
    await ledger.update_heard_progress(instr.instruction_id, 60.0)
    assert instr.heard_state == HeardState.PARTIALLY_HEARD
    assert await ledger.commit_instruction(instr.instruction_id) is False
    assert await ledger.confirm_instruction(instr.instruction_id) is False  # Cannot confirm partial

    # 4. COMPLETED
    await ledger.update_heard_progress(instr.instruction_id, 100.0)
    assert instr.heard_state == HeardState.COMPLETED
    assert await ledger.commit_instruction(instr.instruction_id) is False  # Cannot commit without confirmation

    # 5. CONFIRMED
    confirmed = await ledger.confirm_instruction(instr.instruction_id)
    assert confirmed is True
    assert instr.heard_state == HeardState.CONFIRMED

    # 6. COMMITTED
    committed = await ledger.commit_instruction(instr.instruction_id)
    assert committed is True
    assert instr.heard_state == HeardState.COMMITTED
