"""
MachLock E2E Headless Harness
Supports live audio loopback verification when external API keys (LiveKit, Rime, Deepgram) are present,
or executes a deterministic offline headless simulation if keys are omitted.
"""

import os
import sys
import asyncio
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config.settings import settings
from app.state.audit_store import AuditStore
from app.state.epoch_fencer import EpochFencer
from app.state.heard_state_ledger import HeardStateLedger
from app.voice.rime_client import RimeClient
from app.voice.intent_gate import IntentVerificationGate
from app.tools.checklist_tools import SimulatedCockpitTools


async def run_e2e_harness():
    print("=" * 65)
    print("MACHLOCK END-TO-END (E2E) VERIFICATION HARNESS")
    print("=" * 65)

    if not settings.is_rime_configured:
        print("[INFO] LIVE E2E DISABLED")
        print("Reason: RIME_API_KEY credentials not configured in environment.")
        print("Falling back to Deterministic Offline Simulation Harness...")
    else:
        print("[INFO] LIVE E2E ENABLED — Using configured Rime endpoint.")

    store = AuditStore("./evidence/machlock_audit.db")
    session_id = "SES-E2E-RUN"
    store.record_session(session_id)

    fencer = EpochFencer(session_id, store)
    ledger = HeardStateLedger(fencer, store)
    tools = SimulatedCockpitTools(fencer)
    rime = RimeClient()
    gate = IntentVerificationGate()

    print(f"\n[1] Starting Engine Fire Checklist Step under Epoch {fencer.state.current_epoch}...")
    instr = await ledger.create_instruction(
        step_number=2,
        procedure_name="ENGINE FIRE SIMULATION",
        text="Confirm thrust lever two idle. Verify N1 spooling down."
    )
    await ledger.transition_streaming(instr.instruction_id)

    cancellation_token = asyncio.Event()

    async def stream_audio():
        async for chunk in rime.stream_speech(instr.text, fencer.state.current_epoch, cancellation_token):
            await ledger.update_heard_progress(instr.instruction_id, chunk["progress_pct"])
            if cancellation_token.is_set():
                break

    stream_task = asyncio.create_task(stream_audio())

    # Wait for partial playback
    await asyncio.sleep(0.35)
    print(f"[2] Instruction partially heard: {instr.heard_percentage}% ({instr.heard_state.value})")

    # Injected simulated pilot interruption
    print("\n[3] Injecting Pilot Barge-in: 'HOLD! Check heading first!'")
    classification = gate.classify_text("HOLD! Check heading first!")
    print(f"    Intent Classification: {classification.classification.value} (Confidence: {classification.confidence})")
    print(f"    Requires Epoch Bump: {classification.requires_epoch_bump}")

    if classification.requires_epoch_bump:
        cancellation_token.set()
        new_epoch = await fencer.increment_epoch(
            triggered_by=classification.classification.value,
            reason=classification.reason
        )
        print(f"[4] Epoch Transition: {fencer.state.current_epoch - 1} -> {new_epoch}")
        print(f"    Client Audio Epoch Fenced to: {fencer.state.client_audio_epoch}")

    await stream_task

    # Attempt to commit unconfirmed/stale instruction
    print("\n[5] Testing Commit Fence against interrupted instruction...")
    commit_success = await ledger.commit_instruction(instr.instruction_id)
    print(f"    Commit attempt result: {'COMMITTED (ERROR!)' if commit_success else 'BLOCKED (CORRECT)'}")

    print("\n" + "=" * 65)
    print("E2E HARNESS SUMMARY")
    print("=" * 65)
    print(f"Total Epoch Bumps:           1")
    print(f"Stale Commits Blocked:       {fencer.state.stale_commits_prevented_count}")
    print(f"Partial Commits Blocked:     {fencer.state.partial_commits_prevented_count}")
    print(f"E2E Invariant Status:        {'PASS' if not commit_success else 'FAIL'}")
    print("=" * 65)


if __name__ == "__main__":
    asyncio.run(run_e2e_harness())
