# START HERE: MACHLOCK

## ONE-LINE IDEA
**MachLock makes spoken procedure execution transactional:** when a pilot interrupts, anything unheard or generated prior to that moment can never become an authoritative executed state.

---

## PROBLEM
Realtime voice AI agents face a critical safety flaw in high-stakes procedural environments:
1. The AI begins speaking a critical command (e.g. *"Discharge fire bottle two..."*).
2. The AI simultaneously dispatches an asynchronous tool call to execute the action.
3. The pilot interrupts with a higher priority event (*"BREAK BREAK! Traffic 12 o'clock!"*).
4. Typical voice agents stop text generation, but buffered audio keeps playing in local headphones, delayed tool results arrive asynchronously, and obsolete instructions execute out-of-order.

---

## SOLUTION
MachLock introduces **Transactional Interruption-Safe Procedural Voice**:
- Voice output is treated not as ephemeral playback, but as an active component of application state.
- Spoken instructions follow a strict formal lifecycle:
  `GENERATED` ➔ `STREAMING` ➔ `PARTIALLY_HEARD` ➔ `COMPLETED` ➔ `CONFIRMED` ➔ `COMMITTED`
- An interruption increments a monotonic **Epoch**. Any action, tool result, or audio chunk belonging to an older epoch is **fenced and permanently discarded**.

---

## CORE INNOVATIONS
1. **Application-Owned Intent Verification Gate:** Deterministic sub-50ms acoustic & phraseology classification (NOISE, BACKCHANNEL, BARGE-IN, SUPERSEDING-COMMAND) without slow LLM calls in the interruption critical path.
2. **Monotonic Epoch Fencing:** Invariant: `action.epoch_id == current_epoch AND heard_state == COMPLETED AND confirmed == true`.
3. **Rime TTS Stream Cancellation:** Atomic WebSocket clear frame clearing in-flight synthesis.
4. **Client-Side Playback Buffer Invalidation:** Web Audio controller instantly purges local audio queues upon epoch bump, preventing audio leaks.
5. **Audible Heard-State Ledger:** Tracks partial delivery percentages; partial instructions cannot commit.
6. **Reproducible Race-Condition Harness:** Deterministic stress test verifying zero state leakage under artificial async actuator latency.

---

## RIME'S ROLE
**Rime TTS is the PRIMARY spoken output provider.** It is not an accessory for welcome messages; it actively streams procedural checklist instructions over WebSocket with sub-word progress callbacks and atomic interruption clearance.

---

## HOW TO RUN (QUICK START)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Install & Start Backend
```bash
# In repository root
pip install -r requirements.txt
python -m uvicorn app.backend.main:app --host 0.0.0.0 --port 8000
```

### 3. Install & Start Frontend Console
```bash
# In repository root (separate terminal)
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## RUNNING TESTS & HARNESSES

```bash
# Run deterministic pytest test suite
python -m pytest tests/ -v

# Run the Race-Condition Interruption Test Script
python scripts/test_interruption.py 500

# Run Preflight Verification
python scripts/preflight.py
```

---

## DEMO & SCREENSHOTS
- Demo Script & Walkthrough: [`DEMO_SCRIPT.md`](file:///c:/Users/Hanniel%20Vinu/Desktop/Hackathon/MachLock/DEMO_SCRIPT.md)
- Demo Transcript: [`demo/demo_transcript.md`](file:///c:/Users/Hanniel%20Vinu/Desktop/Hackathon/MachLock/demo/demo_transcript.md)
- Evidence & Benchmarks: [`RIME_EVIDENCE.md`](file:///c:/Users/Hanniel%20Vinu/Desktop/Hackathon/MachLock/RIME_EVIDENCE.md)
- Architecture & Diagrams: [`ARCHITECTURE.md`](file:///c:/Users/Hanniel%20Vinu/Desktop/Hackathon/MachLock/ARCHITECTURE.md)
- Safety & Limitations: [`LIMITATIONS.md`](file:///c:/Users/Hanniel%20Vinu/Desktop/Hackathon/MachLock/LIMITATIONS.md)
