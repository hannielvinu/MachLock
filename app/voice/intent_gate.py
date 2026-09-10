"""
MachLock Intent Verification Gate
Fast deterministic classification of candidate speech into:
NOISE | COUGH | BACKGROUND | BACKCHANNEL | BARGE_IN | SUPERSEDING_COMMAND
Guarantees fast, deterministic interruption decisions without blocking on slow LLM calls in the critical path.
"""

import re
from typing import Set
from app.state.models import IntentClassification, InterruptionClassificationResult


class IntentVerificationGate:
    """
    Application-owned interruption gate.
    Evaluates candidate transcript fragments or acoustic triggers immediately.
    """

    # Non-invalidating speech patterns (Epoch is NOT bumped)
    BACKCHANNEL_PATTERNS: Set[str] = {
        "okay", "ok", "uh-huh", "right", "copy", "yes", "roger", "acknowledged",
        "yep", "yeah", "understood", "go ahead", "copy that", "roger that", "wilco"
    }

    NOISE_PATTERNS: Set[str] = {
        "uh", "um", "ah", "er", "hmm", "shh", "cough", "throat", "grunt"
    }

    # Interruption patterns (Epoch MUST be bumped, Rime cleared, client audio invalidated)
    BARGE_IN_PATTERNS: Set[str] = {
        "hold", "stop", "wait", "hold on", "hold procedure", "pause", "cut",
        "abort", "standby", "check", "hold the procedure"
    }

    SUPERSEDING_PATTERNS: Set[str] = {
        "break break", "traffic", "traffic twelve oclock", "traffic 12 oclock",
        "cancel that", "new checklist", "mayday", "pan pan", "emergency",
        "go around", "terrain", "pull up", "windshear", "evacuate"
    }

    def classify_text(self, text: str) -> InterruptionClassificationResult:
        """
        Classifies incoming candidate user utterance.
        """
        cleaned = re.sub(r"[^\w\s]", "", text.strip().lower())
        words = cleaned.split()

        if not words:
            return InterruptionClassificationResult(
                raw_text=text,
                classification=IntentClassification.NOISE,
                confidence=0.95,
                is_interruption=False,
                requires_epoch_bump=False,
                reason="Empty or non-lexical audio frame"
            )

        full_phrase = " ".join(words)

        # 1. Check superseding commands (Highest priority)
        for pattern in self.SUPERSEDING_PATTERNS:
            if pattern in full_phrase or any(word == pattern for word in words):
                return InterruptionClassificationResult(
                    raw_text=text,
                    classification=IntentClassification.SUPERSEDING_COMMAND,
                    confidence=0.98,
                    is_interruption=True,
                    requires_epoch_bump=True,
                    reason=f"Matched priority aviation phraseology: '{pattern}'"
                )

        # 2. Check direct barge-in commands
        for pattern in self.BARGE_IN_PATTERNS:
            if pattern in full_phrase or any(word == pattern for word in words):
                return InterruptionClassificationResult(
                    raw_text=text,
                    classification=IntentClassification.BARGE_IN,
                    confidence=0.95,
                    is_interruption=True,
                    requires_epoch_bump=True,
                    reason=f"Matched procedure hold/abort command: '{pattern}'"
                )

        # 3. Check backchannels / pilot acknowledgments (Check before general length heuristic)
        if full_phrase in self.BACKCHANNEL_PATTERNS or any(pattern in full_phrase for pattern in self.BACKCHANNEL_PATTERNS):
            return InterruptionClassificationResult(
                raw_text=text,
                classification=IntentClassification.BACKCHANNEL,
                confidence=0.90,
                is_interruption=False,
                requires_epoch_bump=False,
                reason="Pilot feedback/acknowledgment backchannel (non-invalidating)"
            )

        # 4. Check noise / filler
        if len(words) == 1 and words[0] in self.NOISE_PATTERNS:
            return InterruptionClassificationResult(
                raw_text=text,
                classification=IntentClassification.NOISE,
                confidence=0.88,
                is_interruption=False,
                requires_epoch_bump=False,
                reason="Acoustic filler / non-actionable noise"
            )

        # 5. Default conversational or procedural speech during active instruction
        if len(words) >= 3:
            return InterruptionClassificationResult(
                raw_text=text,
                classification=IntentClassification.BARGE_IN,
                confidence=0.80,
                is_interruption=True,
                requires_epoch_bump=True,
                reason="Unprompted conversational speech during active instruction"
            )

        return InterruptionClassificationResult(
            raw_text=text,
            classification=IntentClassification.BACKGROUND,
            confidence=0.70,
            is_interruption=False,
            requires_epoch_bump=False,
            reason="Unclassified background acoustic input"
        )
