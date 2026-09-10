"""
MachLock Configuration Settings
Pydantic-based settings management with server-side secret shielding.
"""

from typing import Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("config/.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = True

    # Rime TTS Configuration
    RIME_API_KEY: Optional[str] = Field(default=None)
    RIME_ENDPOINT: str = "https://users.rime.ai/v1/rime-tts"
    RIME_WS_ENDPOINT: str = "wss://users.rime.ai/v1/rime-tts-ws"
    RIME_MODEL_ID: str = "mist"
    RIME_VOICE: str = "amber"
    RIME_LANGUAGE: str = "en"
    RIME_TRANSPORT: str = "websocket"
    RIME_AUDIO_FORMAT: str = "pcm_24000"
    RIME_SAMPLE_RATE: int = 24000

    # STT Provider
    STT_PROVIDER: str = "deepgram"
    DEEPGRAM_API_KEY: Optional[str] = Field(default=None)
    STT_MODEL: str = "nova-2"
    STT_LANGUAGE: str = "en-US"

    # LLM Provider
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: Optional[str] = Field(default=None)
    LLM_MODEL: str = "llama-3.3-70b-versatile"
    LLM_TEMPERATURE: float = 0.1

    # LiveKit WebRTC
    LIVEKIT_URL: Optional[str] = Field(default=None)
    LIVEKIT_API_KEY: Optional[str] = Field(default=None)
    LIVEKIT_API_SECRET: Optional[str] = Field(default=None)

    # VAD & Acoustic Gate
    VAD_CONFIDENCE_THRESHOLD: float = 0.65
    VAD_ENERGY_THRESHOLD: float = 0.02
    ACOUSTIC_MIN_SPEECH_DURATION_MS: int = 120
    INTENT_GATE_DEBOUNCE_MS: int = 50
    INTERRUPTION_SENSITIVITY: float = 0.75

    # Simulation & State Engine
    DEFAULT_SIMULATED_TOOL_DELAY_MS: int = 500
    SQLITE_DB_PATH: str = "./evidence/machlock_audit.db"
    ENABLE_PERSISTENT_AUDIT: bool = True

    @property
    def is_rime_configured(self) -> bool:
        return bool(self.RIME_API_KEY and self.RIME_API_KEY.strip() and not self.RIME_API_KEY.startswith("your_"))

    @property
    def is_deepgram_configured(self) -> bool:
        return bool(self.DEEPGRAM_API_KEY and self.DEEPGRAM_API_KEY.strip() and not self.DEEPGRAM_API_KEY.startswith("your_"))

    @property
    def is_groq_configured(self) -> bool:
        return bool(self.GROQ_API_KEY and self.GROQ_API_KEY.strip() and not self.GROQ_API_KEY.startswith("your_"))

    @property
    def is_livekit_configured(self) -> bool:
        return bool(self.LIVEKIT_URL and self.LIVEKIT_API_KEY and not self.LIVEKIT_API_KEY.startswith("your_"))

    def get_public_config(self) -> dict:
        """Return public telemetry configuration without exposing secret keys."""
        return {
            "environment": self.ENVIRONMENT,
            "rime": {
                "configured": self.is_rime_configured,
                "model_id": self.RIME_MODEL_ID,
                "voice": self.RIME_VOICE,
                "language": self.RIME_LANGUAGE,
                "endpoint": self.RIME_ENDPOINT,
                "transport": self.RIME_TRANSPORT,
                "audio_format": self.RIME_AUDIO_FORMAT,
                "sample_rate": self.RIME_SAMPLE_RATE,
            },
            "stt": {
                "provider": self.STT_PROVIDER,
                "configured": self.is_deepgram_configured,
                "model": self.STT_MODEL,
                "language": self.STT_LANGUAGE,
            },
            "llm": {
                "provider": self.LLM_PROVIDER,
                "configured": self.is_groq_configured,
                "model": self.LLM_MODEL,
            },
            "livekit": {
                "configured": self.is_livekit_configured,
                "url": self.LIVEKIT_URL if self.is_livekit_configured else "not_configured",
            },
            "intent_gate": {
                "vad_threshold": self.VAD_CONFIDENCE_THRESHOLD,
                "min_duration_ms": self.ACOUSTIC_MIN_SPEECH_DURATION_MS,
                "debounce_ms": self.INTENT_GATE_DEBOUNCE_MS,
            },
            "simulation": {
                "default_tool_delay_ms": self.DEFAULT_SIMULATED_TOOL_DELAY_MS,
                "audit_enabled": self.ENABLE_PERSISTENT_AUDIT,
            }
        }


settings = Settings()
