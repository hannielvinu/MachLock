"""
Tests for E2E Audio Pipeline & Offline Fallback Mechanics
"""

import pytest
import asyncio
from app.voice.rime_client import RimeClient
from app.voice.acoustic import AcousticPreprocessor


@pytest.mark.asyncio
async def test_rime_stream_and_cancellation():
    rime = RimeClient()
    token = asyncio.Event()

    chunks = []
    async def collect_chunks():
        async for chunk in rime.stream_speech("Confirm thrust lever two idle.", epoch_id=10, cancellation_token=token):
            chunks.append(chunk)

    task = asyncio.create_task(collect_chunks())
    await asyncio.sleep(0.2)
    token.set()  # Cancel mid-stream
    await task

    # Assert stream aborted early
    assert len(chunks) < 5
    if chunks:
        assert chunks[0]["epoch_id"] == 10


def test_acoustic_preprocessor_energy():
    pre = AcousticPreprocessor()
    silence = bytes([0] * 3200)
    res = pre.process_pcm_chunk(silence)
    assert res["rms_energy"] == 0.0
    assert res["is_candidate_speech"] is False
