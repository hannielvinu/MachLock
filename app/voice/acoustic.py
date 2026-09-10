"""
MachLock Acoustic Preprocessing & VAD Filter
Processes audio frames, measures RMS energy / VAD confidence, and enforces noise-floor debounce.
"""

import numpy as np
from typing import Dict, Any, Tuple


class AcousticPreprocessor:
    """
    Acoustic preprocessing pipeline:
    Microphone Stream -> Noise Floor Gate -> Energy Meter -> VAD Filter -> Candidate Speech Frame
    """

    def __init__(
        self,
        energy_threshold: float = 0.02,
        min_speech_duration_ms: int = 120,
        sample_rate: int = 16000
    ):
        self.energy_threshold = energy_threshold
        self.min_speech_duration_ms = min_speech_duration_ms
        self.sample_rate = sample_rate
        self.consecutive_speech_ms = 0
        self.is_speech_active = False

    def process_pcm_chunk(self, pcm_bytes: bytes) -> Dict[str, Any]:
        """
        Calculates acoustic telemetry (RMS energy, VAD confidence estimate, speech duration).
        """
        if not pcm_bytes or len(pcm_bytes) < 2:
            return {
                "rms_energy": 0.0,
                "vad_confidence": 0.0,
                "is_candidate_speech": False,
                "speech_duration_ms": 0
            }

        # Convert int16 PCM to float32
        audio_data = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        
        # Calculate RMS energy
        rms = float(np.sqrt(np.mean(audio_data ** 2))) if len(audio_data) > 0 else 0.0

        # Frame duration in ms
        frame_duration_ms = (len(audio_data) / self.sample_rate) * 1000.0

        # Simple robust energy-based VAD estimation
        if rms > self.energy_threshold:
            self.consecutive_speech_ms += frame_duration_ms
            vad_confidence = min(1.0, (rms / 0.1) * 0.9)
        else:
            self.consecutive_speech_ms = max(0.0, self.consecutive_speech_ms - frame_duration_ms * 0.5)
            vad_confidence = max(0.0, (rms / self.energy_threshold) * 0.3)

        is_candidate_speech = self.consecutive_speech_ms >= self.min_speech_duration_ms

        return {
            "rms_energy": round(rms, 4),
            "vad_confidence": round(vad_confidence, 3),
            "is_candidate_speech": is_candidate_speech,
            "speech_duration_ms": round(self.consecutive_speech_ms, 1)
        }

    def reset(self):
        self.consecutive_speech_ms = 0
        self.is_speech_active = False
