"""
Tests for Stale Tool Result Rejection and Concurrent Race Condition Prevention
"""

import pytest
import asyncio
from app.state.audit_store import AuditStore
from app.state.epoch_fencer import EpochFencer
from app.tools.checklist_tools import SimulatedCockpitTools


@pytest.fixture
def tool_setup(tmp_path):
    db_file = str(tmp_path / "test_tools.db")
    store = AuditStore(db_file)
    fencer = EpochFencer("SES-TEST-TOOLS", store)
    tools = SimulatedCockpitTools(fencer)
    return fencer, tools, store


@pytest.mark.asyncio
async def test_concurrent_tool_race_condition(tool_setup):
    fencer, tools, store = tool_setup

    initial_epoch = fencer.state.current_epoch

    # Launch tool with 200ms delay in background
    task = asyncio.create_task(
        tools.execute_tool_with_delay("FIRE_BOTTLE_DISCHARGE", {"bottle": 1}, delay_ms=150)
    )

    # Interruption happens 30ms into execution
    await asyncio.sleep(0.03)
    await fencer.increment_epoch("PILOT", "Traffic Alert")

    committed, info = await task

    # Assert delayed tool from old epoch was strictly rejected
    assert committed is False
    assert info["committed"] is False
    assert info["result"] == "STALE_DISCARDED"
    assert fencer.state.stale_results_rejected_count == 1
    assert fencer.state.telemetry.fire_bottle_1_discharged is False
