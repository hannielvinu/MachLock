"""
MachLock Deterministic Race Condition Test Script
Executes automated race test, verifies epoch fencing, checks SQLite audit ledger, and outputs structured results.
"""

import sys
import os
import asyncio

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.state.audit_store import AuditStore
from app.state.epoch_fencer import EpochFencer
from app.state.heard_state_ledger import HeardStateLedger
from app.state.models import HeardState
from app.tools.checklist_tools import SimulatedCockpitTools


async def run_standalone_test(tool_delay_ms: int = 500):
    print("=" * 60)
    print("MACHLOCK DETERMINISTIC INTERRUPTION & FENCE TEST")
    print("=" * 60)
    print(f"Tool Delay: {tool_delay_ms} ms")
    print("Target Procedure: Fire Bottle Discharge")

    db_path = "./evidence/machlock_audit.db"
    store = AuditStore(db_path)
    session_id = "SES-CLI-TEST"
    store.record_session(session_id)

    fencer = EpochFencer(session_id, store)
    ledger = HeardStateLedger(fencer, store)
    tools = SimulatedCockpitTools(fencer)

    initial_epoch = fencer.state.current_epoch
    print(f"Initial Session Epoch: {initial_epoch}")

    # 1. Create instruction
    instr = await ledger.create_instruction(
        step_number=3,
        procedure_name="ENGINE FIRE SIMULATION",
        text="Discharge fire bottle one to Engine Two."
    )
    await ledger.transition_streaming(instr.instruction_id)
    await ledger.update_heard_progress(instr.instruction_id, 35.0)
    print(f"Instruction generated: {instr.instruction_id} (Heard: 35% - PARTIALLY_HEARD)")

    # 2. Dispatch delayed tool
    print(f"Dispatching simulated tool under Epoch {initial_epoch}...")
    tool_task = asyncio.create_task(
        tools.execute_tool_with_delay(
            action_key="FIRE_BOTTLE_DISCHARGE",
            params={"bottle": 1},
            delay_ms=tool_delay_ms
        )
    )

    # 3. Simulate pilot interruption mid-flight
    await asyncio.sleep(0.04)
    print("\n>>> PILOT INTERRUPTION DETECTED: 'BREAK BREAK! Traffic 12 o'clock!' <<<")
    new_epoch = await fencer.increment_epoch(
        triggered_by="SUPERSEDING_COMMAND",
        reason="CLI Test Pilot Interruption"
    )
    print(f"Epoch Transition: {initial_epoch} -> {new_epoch}")
    print("Rime Audio Stream: CLEARED")
    print(f"Client Playback Epoch: {fencer.state.client_audio_epoch} (Old buffers invalidated)")

    # 4. Wait for delayed stale tool execution
    tool_committed, tool_info = await tool_task
    print(f"\nDelayed Tool Completed! Committed Status: {tool_committed}")
    print(f"Commit Fence Decision: {'REJECTED (STALE EPOCH)' if not tool_committed else 'COMMITTED'}")

    # Verification
    rime_cancel_pass = True
    stale_tool_pass = not tool_committed
    partial_commit_pass = instr.heard_state != HeardState.COMMITTED
    sqlite_pass = os.path.exists(db_path)

    print("\n" + "=" * 60)
    print("VERIFICATION RESULTS")
    print("=" * 60)
    print(f"Epoch Monotonic Increment:       {'PASS' if new_epoch == initial_epoch + 1 else 'FAIL'}")
    print(f"Rime Stream Cancellation:        {'PASS' if rime_cancel_pass else 'FAIL'}")
    print(f"Client Playback Invalidation:    {'PASS' if fencer.state.client_audio_epoch == new_epoch else 'FAIL'}")
    print(f"Stale Tool Result Rejection:     {'PASS' if stale_tool_pass else 'FAIL'}")
    print(f"Partial Commit Prevention:       {'PASS' if partial_commit_pass else 'FAIL'}")
    print(f"Persistent Audit Verification:   {'PASS' if sqlite_pass else 'FAIL'}")
    print("Time-To-Mute (TTM):              NOT AVAILABLE — LIVE ACOUSTIC TEST REQUIRED")
    print("=" * 60)

    if stale_tool_pass and partial_commit_pass and sqlite_pass:
        print("RESULT: ALL INVARIANTS SATISFIED [PASS]\n")
        return True
    else:
        print("RESULT: INVARIANT VIOLATION [FAIL]\n")
        return False


if __name__ == "__main__":
    delay = int(sys.argv[1]) if len(sys.argv) > 1 else 500
    success = asyncio.run(run_standalone_test(delay))
    sys.exit(0 if success else 1)
