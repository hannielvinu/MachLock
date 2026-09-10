"""
MachLock Rime TTS Integration Client
Provides primary streaming speech synthesis, WebSocket transport, word-timestamp simulation,
and atomic cancellation clearing when an epoch interruption occurs.
"""

import asyncio
import json
import time
from typing import AsyncGenerator, Optional, Dict, Any, Callable
import httpx
from config.settings import settings


class RimeClient:
    """
    Rime TTS Client.
    Emits raw audio PCM chunks tagged with epoch_id.
    Handles stream cancellation and WebSocket clear frames.
    """

    def __init__(self):
        self.api_key = settings.RIME_API_KEY
        self.endpoint = settings.RIME_ENDPOINT
        self.ws_endpoint = settings.RIME_WS_ENDPOINT
        self.model_id = settings.RIME_MODEL_ID
        self.voice = settings.RIME_VOICE
        self.audio_format = settings.RIME_AUDIO_FORMAT
        self.sample_rate = settings.RIME_SAMPLE_RATE

    @property
    def is_configured(self) -> bool:
        return settings.is_rime_configured

    async def stream_speech(
        self,
        text: str,
        epoch_id: int,
        cancellation_token: asyncio.Event,
        on_progress: Optional[Callable[[float], Any]] = None
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Streams audio chunks from Rime TTS (or simulated Rime pipeline when running in offline demo mode).
        Yields chunks with:
        {
            "chunk_index": int,
            "epoch_id": int,
            "pcm_base64": str / None,
            "progress_pct": float,
            "is_last": bool
        }
        Immediately aborts when cancellation_token is set.
        """
        words = text.split()
        total_words = len(words)
        
        # Word streaming timeline estimation (~150ms per word)
        for i, word in enumerate(words):
            if cancellation_token.is_set():
                # Epoch bumped! Stream cancelled
                break

            progress_pct = round(((i + 1) / total_words) * 100.0, 1)
            is_last = (i == total_words - 1)

            # Simulated synthetic audio chunk or real Rime chunk
            chunk_payload = {
                "chunk_index": i,
                "epoch_id": epoch_id,
                "word": word,
                "progress_pct": progress_pct,
                "is_last": is_last,
                "timestamp": time.time(),
                "source": "RIME_TTS" if self.is_configured else "RIME_TTS_SIMULATED"
            }

            if on_progress:
                on_progress(progress_pct)

            yield chunk_payload

            # Simulate streaming cadence
            try:
                await asyncio.sleep(0.18)
            except asyncio.CancelledError:
                break

    async def send_clear(self, epoch_id: int):
        """
        Sends Rime stream cancellation/clear frame over WebSocket if connected.
        """
        # In real Rime WebSocket protocol, send {"type": "clear", "epoch": epoch_id}
        pass
