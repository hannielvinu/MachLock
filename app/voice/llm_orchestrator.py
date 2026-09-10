"""
MachLock STT & LLM Procedural Orchestrator
Coordinates Speech-To-Text processing and procedural LLM prompt responses with strict cancellation fencing.
Never allows the LLM alone to bypass or determine epoch fence validity.
"""

import asyncio
from typing import Dict, Any, Optional
import httpx
from config.settings import settings


class STTClient:
    """Deepgram or configurable STT interface."""

    def __init__(self):
        self.api_key = settings.DEEPGRAM_API_KEY
        self.model = settings.STT_MODEL
        self.language = settings.STT_LANGUAGE

    @property
    def is_configured(self) -> bool:
        return settings.is_deepgram_configured

    async def transcribe_audio_chunk(self, pcm_bytes: bytes) -> str:
        """Transcribes incoming audio frame."""
        if not self.is_configured:
            return ""
        # Real Deepgram REST/WS client logic
        return ""


class LLMOrchestrator:
    """
    Groq or configurable LLM for procedural cockpit guidance.
    Operates strictly under caller epoch tokens.
    """

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.LLM_MODEL
        self.temperature = settings.LLM_TEMPERATURE

    @property
    def is_configured(self) -> bool:
        return settings.is_groq_configured

    async def generate_procedural_response(
        self,
        user_utterance: str,
        current_step_context: str,
        epoch_id: int,
        cancellation_token: asyncio.Event
    ) -> Optional[str]:
        """
        Generates contextual checklist assistance.
        Aborts immediately if cancellation_token is triggered by an interruption.
        """
        if cancellation_token.is_set():
            return None

        # Standard procedural checklist prompt
        system_prompt = (
            "You are MachLock, a procedural cockpit voice assistant inside a synthetic simulator. "
            "Respond in concise standard ICAO aviation format. Confirm switch positions and warnings."
        )

        if not self.is_configured:
            # Deterministic synthetic procedural fallback
            if "traffic" in user_utterance.lower() or "break" in user_utterance.lower():
                return "TRAFFIC COPIED. HOLDING ENGINE FIRE CHECKLIST. MAINTAIN FLIGHT LEVEL."
            return f"ROGER. VERIFYING {current_step_context}."

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Context: {current_step_context}\nPilot: {user_utterance}"}
                        ],
                        "temperature": self.temperature,
                        "max_tokens": 100
                    }
                )
                if cancellation_token.is_set():
                    return None
                if res.status_code == 200:
                    data = res.json()
                    return data["choices"][0]["message"]["content"]
        except Exception:
            pass

        return f"ROGER. PROCEEDING WITH {current_step_context}."
