"""
Tests for MachLock Monotonic Epoch Fencer
"""

import pytest
import asyncio
from app.state.audit_store import AuditStore
from app.state.epoch_fencer import EpochFencer
from app.state.models import HeardState


@pytest.fixture
def test_setup(tmp_path):
    db_file = str(tmp_path / "test_audit.db")
    store = AuditStore(db_file)
    fencer = EpochFencer("SES-TEST-FENCER", store)
    return fencer, store


@pytest.mark.asyncio
async def test_epoch_increment(test_setup):
    fencer, store = test_setup
    assert fencer.state.current_epoch == 1

    new_epoch = await fencer.increment_epoch("PILOT", "Barge-in hold")
    assert new_epoch == 2
    assert fencer.state.current_epoch == 2
    assert fencer.state.client_audio_epoch == 2
    assert fencer.state.is_interrupted is True


@pytest.mark.asyncio
async def test_tool_commit_fence(test_setup):
    fencer, store = test_setup
    initial_epoch = fencer.state.current_epoch

    # Valid tool result under current epoch
    valid_commit = await fencer.validate_and_commit_tool_result(
        tool_request_id="TOOL-001",
        request_epoch=initial_epoch,
        action_key="VERIFY_THRUST_LEVER_IDLE",
        result_payload={"status": "OK"}
    )
    assert valid_commit is True

    # Now bump epoch
    await fencer.increment_epoch("SUPERSEDING_COMMAND", "Traffic alert")
    assert fencer.state.current_epoch == 2

    # Stale tool result from epoch 1 arriving after epoch bump
    stale_commit = await fencer.validate_and_commit_tool_result(
        tool_request_id="TOOL-002",
        request_epoch=1,
        action_key="FIRE_BOTTLE_DISCHARGE",
        result_payload={"status": "OK"}
    )
    assert stale_commit is False
    assert fencer.state.stale_results_rejected_count == 1
    assert fencer.state.stale_commits_prevented_count == 1
