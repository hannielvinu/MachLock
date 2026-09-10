# Limitations & Safety Constraints

## 1. Safety & Scope Disclaimer
- **Research Prototype:** MachLock is an experimental voice-safety architecture demonstrated inside a synthetic aerospace cockpit simulation.
- **No Aircraft Control:** MachLock **does NOT** connect to, control, or interface with real avionics, aircraft flight computers, hydraulic systems, engine controls, transponders, or emergency fire bottles.
- **No Certification:** This software has not undergone FAA/EASA DO-178C or DO-254 certification and must never be used for actual flight operations or navigation.

---

## 2. Technical & Environmental Limitations

1. **Acoustic Measurement Environment:**
   - Physical Time-To-Mute (TTM) requires hardware acoustic test fixtures (artificial ears/microphones) to measure headphone sound pressure drops. Server-side timestamps approximate processing latency but do not account for DAC/OS driver audio buffer latency.
2. **Speech Recognition Latency & Transcription Errors:**
   - In extremely noisy cockpits (e.g. > 85 dB broadband engine rumble), STT transcription errors may occur without dedicated noise-canceling headsets or local neural beamforming.
3. **Cloud & Network Dependencies:**
   - When configured in live mode, Rime TTS, Deepgram STT, and Groq LLM rely on external cloud endpoints. A network outage or socket disconnection will cause the system to fail-closed into offline simulation mode.
4. **Semantic Intent Classification:**
   - The lightweight Intent Verification Gate uses deterministic regex and priority phraseology lookup for sub-50ms speed. Novel non-standard aviation slang during active TTS may fall back to default conversational barge-in thresholds.
