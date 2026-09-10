# MachLock

> **Transactional Interruption-Safe Voice Execution System**  
> *Research Prototype Demonstrated in a Synthetic Aviation Cockpit Simulator*  
> **DataForge 2026 — Rime Hackathon Challenge (IIT Kharagpur)**

---

## 📌 Repository Overview & About

| Property | Value |
| :--- | :--- |
| **Project Name** | **MachLock** |
| **Tagline** | *Transactional Interruption-Safe Procedural Voice Execution* |
| **Challenge** | DataForge 2026 by IIT Kharagpur — Rime Hackathon Challenge |
| **Core Track** | **Rime Voice Track** (Interruption, Recovery & Hard Voice Engineering) |
| **Primary Voice Engine** | **Rime TTS** (Streaming WebSocket with atomic clear & sub-word tracking) |
| **Repository URL** | [https://github.com/hannielvinu/MachLock](https://github.com/hannielvinu/MachLock) |
| **License** | MIT License |

### Short Description (for GitHub About / Metadata)
> **Transactional Interruption-Safe Procedural Voice System built for DataForge 2026 (Rime Track). Uses Monotonic Epoch Fencing, Rime WebSocket audio cancellation, and Audible Heard-State Ledgers to guarantee obsolete voice and in-flight tool results never corrupt state upon operator interruptions.**

### Topics / Tags
`voice-ai` `rime-tts` `realtime-voice` `hackathon` `dataforge-2026` `fastapi` `react` `typescript` `state-machine` `aerospace-simulator` `webrtc` `audio-processing` `interruption-handling`

---

## 🚀 One-Line Summary
**MachLock makes spoken procedural workflows transactional:** when an operator interrupts, unheard audio is flushed from local buffers, and in-flight asynchronous actions from previous epochs are strictly fenced to prevent obsolete state corruption.

---

## 🎯 The Hard Voice Problem
Realtime conversational voice assistants suffer from a dangerous architectural race condition during interruptions:
- An assistant speaks a multi-step instruction (e.g., *"Confirm thrust lever idle, then discharge bottle two..."*).
- An asynchronous actuator tool is simultaneously triggered in the background.
- The operator interrupts (*"STOP! Hold the checklist!"*).
- While the LLM may cease generating new tokens, **stale audio remains buffered in client playback devices**, and **delayed tool results arrive out-of-order and commit unauthorized state changes**.

---

## 🎙️ Why Voice Is Essential
In procedural domains, **spoken voice is not merely an output modality—it is part of application state.** If an operator has not finished hearing a critical instruction, that instruction must never be considered active or eligible for execution.

---

## 👥 Target User & Scope
Aerospace operators, mission controllers, and procedural engineers running safety-critical synthetic simulations who require zero tolerance for obsolete state corruption during spoken interruptions.

> [!IMPORTANT]
> **MachLock is a research prototype demonstrated inside a synthetic cockpit simulator.** It is **NOT** certified flight guidance and does not control real aircraft systems, engines, fire bottles, or transponders.

---

## 💡 Solution & Core Innovations
MachLock treats voice procedures as a transactional state machine protected by monotonic epoch barriers:

1. **Intent Verification Gate:** Fast deterministic classifier separating `NOISE`, `BACKCHANNEL` (non-invalidating), `BARGE_IN`, and `SUPERSEDING_COMMAND` (epoch-invalidating) in `< 50ms` without blocking on slow LLM roundtrips.
2. **Monotonic Epoch Fencing:** Invariant check: `action.epoch_id == current_epoch AND heard_state == COMPLETED AND action.confirmed == true`.
3. **Audible Heard-State Ledger:** Tracks real-time delivery percentages (`GENERATED` ➔ `STREAMING` ➔ `PARTIALLY_HEARD` ➔ `COMPLETED` ➔ `CONFIRMED` ➔ `COMMITTED`).
4. **Rime TTS Stream Cancellation:** Atomic WebSocket clear frames purge in-flight audio synthesis.
5. **Client-Side Playback Buffer Invalidation:** Web Audio API buffer manager stops and purges queued client audio nodes immediately upon epoch bump.
6. **Persistent SQLite Audit Ledger:** Immutable record of every epoch transition, stale rejection, and heard-state update.

---

## 🔊 Rime Integration (Primary Spoken Engine)
**Rime TTS is the PRIMARY spoken-output provider for MachLock.**
- Rime streams procedural audio with sub-word progress callbacks.
- Rime's streaming channel receives atomic cancellation clears during barge-ins.
- Configured parameters:
  - `RIME_MODEL_ID`: `mist` (configurable)
  - `RIME_VOICE`: `amber` (configurable)
  - `RIME_TRANSPORT`: `websocket`
  - `RIME_AUDIO_FORMAT`: `pcm_24000`

---

## 🛠️ Technology Stack
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Web Audio API, Lucide Icons, Satoshi Font
- **Backend:** Python 3.10+, FastAPI, Uvicorn, asyncio, WebSockets, Pydantic v2
- **Persistence:** SQLite3 Audit Ledger
- **Voice / Telemetry:** Rime TTS, Deepgram STT (configurable), Groq LLM (configurable)
- **Testing:** Pytest, Pytest-Asyncio, Deterministic Race CLI Harness

---

## ⚡ Quick Start & Running Locally

### 1. Environment Setup
```bash
# Copy example environment configuration
cp config/.env.example config/.env
```

### 2. Install Dependencies
```bash
# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
npm install
```

### 3. Start Backend API & WebSocket Server
```bash
python -m uvicorn app.backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### 4. Start Frontend Console
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Verification & Test Suite

```bash
# Run deterministic unit and invariant tests
python -m pytest tests/ -v

# Run deterministic race condition test script
python scripts/test_interruption.py 500

# Run preflight verification
python scripts/preflight.py
```

---

## 📂 Key Documentation Artifacts
- [`START_HERE.md`](./START_HERE.md) — 1-minute judge summary & evaluation guide.
- [`RIME_EVIDENCE.md`](./RIME_EVIDENCE.md) — Scientific reproducibility report and test matrix.
- [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) — 4-minute demo walkthrough.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Pipeline diagrams and specifications.
- [`LIMITATIONS.md`](./LIMITATIONS.md) — Safety scope and research constraints.

---

## 📄 License
MIT License. See [`LICENSE`](./LICENSE) for details.
