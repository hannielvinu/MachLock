# MachLock: Transactional Interruption-Safe Voice Execution System
# Implementation Plan & Architecture Verification

This document outlines the architectural blueprint, state engine contracts, Rime voice cancellation pipeline, and directory layout for MachLock.

## User Review Required
> [!NOTE]
> All source code, tests, documentation, and scripts will be generated directly. No MP4 will be created (leaving `demo/MachLock_Demo.mp4` intentionally absent for user upload).

## Implementation Architecture
1. **Root Documentation & Specs**:
   - `START_HERE.md`, `README.md`, `RIME_EVIDENCE.md`, `DEMO_SCRIPT.md`, `ARCHITECTURE.md`, `LIMITATIONS.md`, `LICENSE`
2. **Configuration & Security**:
   - `.env.example`, `.gitignore`, `config/pronunciation.yaml`, `config/settings.py`
3. **Backend & State Machine Engine (`app/backend/`, `app/state/`, `app/voice/`, `app/tools/`)**:
   - FastAPI HTTP & WebSocket server (`app/backend/main.py`)
   - Monotonic Epoch Fencer (`app/state/epoch_fencer.py`)
   - Heard-State Ledger & State Machine (`app/state/heard_state_ledger.py`)
   - SQLite Audit Storage & Ledger Database (`app/state/audit_store.py`)
   - Intent Verification Gate & Acoustic Preprocessing (`app/voice/intent_gate.py`, `app/voice/acoustic.py`)
   - Rime Streaming Client & Cancellation Transport (`app/voice/rime_client.py`)
   - STT (Deepgram/mockable) & LLM Orchestrator with cancellation token (`app/voice/stt_client.py`, `app/voice/llm_orchestrator.py`)
   - Simulated Tool Race Engine (`app/tools/checklist_tools.py`)
4. **Frontend Aerospace Console (`app/frontend/`)**:
   - Vite + React + TypeScript + Tailwind CSS
   - Web Audio API Client-Side Playback Buffer Invalidator
   - High-density Aerospace Sci-Fi UI (`/console`, `/interruption-lab`, `/ledger`, `/voice`, `/evidence`, `/events`, `/architecture`, `/settings`)
   - Waveforms, Telemetry, Synthetic Cockpit Instruments, Event Stream, Timeline
5. **Testing & Verification Harness (`tests/`, `scripts/`, `evidence/`)**:
   - `tests/test_epoch_fencing.py`
   - `tests/test_heard_state.py`
   - `tests/test_stale_tool.py`
   - `tests/test_interruption.py`
   - `tests/test_e2e_audio.py`
   - `scripts/test_interruption.py`
   - `scripts/run_e2e_test.py`
   - `scripts/preflight.py`
