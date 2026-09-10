"""
Tests for Intent Gate Interruption Classification & Epoch Triggering
"""

import pytest
from app.voice.intent_gate import IntentVerificationGate
from app.state.models import IntentClassification


def test_intent_gate_classifications():
    gate = IntentVerificationGate()

    # 1. Superseding Command
    res1 = gate.classify_text("BREAK BREAK! Traffic twelve o'clock!")
    assert res1.classification == IntentClassification.SUPERSEDING_COMMAND
    assert res1.is_interruption is True
    assert res1.requires_epoch_bump is True

    # 2. Direct Barge-in
    res2 = gate.classify_text("Hold procedure! Standby!")
    assert res2.classification == IntentClassification.BARGE_IN
    assert res2.is_interruption is True
    assert res2.requires_epoch_bump is True

    # 3. Non-invalidating Backchannel
    res3 = gate.classify_text("Roger, copy that")
    assert res3.classification == IntentClassification.BACKCHANNEL
    assert res3.is_interruption is False
    assert res3.requires_epoch_bump is False

    # 4. Acoustic noise
    res4 = gate.classify_text("uh")
    assert res4.classification == IntentClassification.NOISE
    assert res4.is_interruption is False
    assert res4.requires_epoch_bump is False
