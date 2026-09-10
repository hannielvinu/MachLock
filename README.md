# MachLock

> **Transactional Interruption-Safe Voice Execution System**  
> *Research Prototype Demonstrated in a Synthetic Aviation Cockpit Simulator*  
> **DataForge 2026 — Rime Hackathon Challenge**

---

## One-Line Summary
**MachLock makes spoken procedural workflows transactional:** when an operator interrupts, unheard audio is flushed from local buffers, and in-flight asynchronous actions from previous epochs are strictly fenced to prevent obsolete state corruption.

---

## Problem
Realtime conversational voice assistants suffer from a dangerous architectural race condition during interruptions:
- An assistant speaks a multi-step instruction (e.g., *"Confirm thrust lever idle, then discharge bottle two..."*).
- An asynchronous actuator tool is simultaneously triggered in the background.
- The operator interrupts (*"STOP! Hold the checklist!"*).
- While the LLM may cease generating new tokens, **stale audio remains buffered in client playback devices**, and **delayed tool results arrive out-of-order and commit unauthorized state changes**.

---

## Why Voice Is Essential
In procedural domains, **spoken voice is not merely an output modality—it is part of application state.** If an operator has not finished hearing a critical instruction, that instruction must never be considered active or eligible for execution.

---

## Target User
Aerospace operators, mission controllers, and procedural engineers running safety-critical synthetic simulations who require zero tolerance for obsolete state corruption during spoken interruptions.

---

## Solution & Core Innovations
MachLock treats voice procedures as a transactional state machine protected by monotonic epoch barriers:

1. **Intent Verification Gate:** Fast deterministic classifier separating `NOISE`, `BACKCHANNEL` (non-invalidating), `BARGE_IN`, and `SUPERSEDING_COMMAND` (epoch-invalidating).
2. **Monotonic Epoch Fencing:** State engine ensuring only actions matching the exact `current_epoch` can mutate simulated telemetry.
3. **Audible Heard-State Ledger:** Tracks real-time delivery percentages (`GENERATED` ➔ `STREAMING` ➔ `PARTIALLY_HEARD` ➔ `COMPLETED` ➔ `CONFIRMED` ➔ `COMMITTED`).
4. **Rime TTS Stream Cancellation:** Atomic WebSocket clear frames purge in-flight audio synthesis.
5. **Client-Side Playback Buffer Invalidation:** Web Audio API buffer manager stops and purges queued client audio nodes immediately upon epoch bump.
6. **Persistent SQLite Audit Ledger:** Immutable record of every epoch transition, stale rejection, and heard-state update.

---

## Rime Integration
**Rime TTS is the PRIMARY spoken-output provider for MachLock.**
- Rime streams procedural audio with sub-word progress callbacks.
- Rime's streaming channel receives atomic cancellation clears during barge-ins.
- Configured parameters:
  - `RIME_MODEL_ID`: `mist` (configurable)
  - `RIME_VOICE`: `amber` (configurable)
  - `RIME_TRANSPORT`: `websocket`
  - `RIME_AUDIO_FORMAT`: `pcm_24000`

---

## Technology Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Web Audio API, Lucide Icons
- **Backend:** Python 3.10+, FastAPI, Uvicorn, asyncio, WebSockets, Pydantic v2
- **Persistence:** SQLite3 Audit Ledger
- **Voice / Telemetry:** Rime TTS, Deepgram STT (configurable), Groq LLM (configurable)
- **Testing:** Pytest, Pytest-Asyncio, Deterministic Race CLI Harness

---

## Setup & Running

### 1. Environment Configuration
Copy `.env.example` to `config/.env` and insert your credentials:
```bash
cp config/.env.example config/.env
```
*(If Rime credentials are not set, the system automatically falls back to an offline simulated TTS pipeline while exposing clear UI indicators).*

### 2. Install Dependencies
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

### 3. Start Backend Server
```bash
python -m uvicorn app.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start Frontend Console
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## Running Tests & Interruption Harness

### Run Deterministic Unit & Invariant Tests
```bash
python -m pytest tests/ -v
```

### Run Deterministic Race Condition Stress Script
```bash
python scripts/test_interruption.py 500
```

### Run End-to-End Headless Verification
```bash
python scripts/run_e2e_test.py
```

### Run Preflight Verification
```bash
python scripts/preflight.py
```

---

## Safety & Scope
> [!IMPORTANT]
> **MachLock is a research prototype demonstrated inside a synthetic cockpit simulator.** It is **NOT** certified flight guidance and does not control real aircraft systems, engines, fire bottles, or transponders.

---

## License
MIT License. See [`LICENSE`](file:///c:/Users/Hanniel%20Vinu/Desktop/Hackathon/MachLock/LICENSE) for details.
