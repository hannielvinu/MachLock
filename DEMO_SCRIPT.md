# MachLock 4-Minute Judge Demo Script

## Timing & Narrative Structure

### 0:00 – 0:30: Problem Hook & Core Invariant
- **Action:** Open Cockpit Console (`/console`).
- **Narrative:** "Welcome to MachLock. When you build voice AI for high-stakes procedures, standard voice assistants have a fatal flaw: when a pilot interrupts, buffered speech keeps playing in their ears, and delayed background tool results execute out of order. MachLock solves this with *Transactional Voice Execution*."
- **Visual:** Point out the Top Bar showing **EPOCH 1**, Rime TTS status, and Synthetic Cockpit Telemetry.

---

### 0:30 – 1:15: Normal Checklist Progression
- **Action:** Click **START** on Step 1 (*"Confirm Engine 2 Fire Warning"*).
- **Narrative:** "Rime TTS begins streaming procedural speech. Notice the progress bar filling in the Heard-State Ledger. Once the pilot finishes hearing the instruction (100%), they confirm."
- **Action:** Click **CONFIRM**. The step turns green and commits to the simulated cockpit state.

---

### 1:15 – 2:30: The Interruption Stress Test & Race Condition
- **Action:** Navigate to `/interruption-lab`.
- **Narrative:** "Now let's reproduce the hard race condition. We set a 500ms simulated tool latency on the Fire Bottle discharge actuator and hit **RUN DETERMINISTIC RACE TEST**."
- **Action:** Click **RUN DETERMINISTIC RACE TEST**.
- **Narrative:** "At T+50ms, while Rime is streaming and the actuator tool is in-flight, a pilot barge-in occurs: *'BREAK BREAK! Traffic 12 o'clock!'*. Instantly, Epoch increments to 2, Rime stream clears, and client audio buffers are invalidated. When the delayed tool result from Epoch 1 arrives at T+510ms, the Commit Fence **rejects it as stale**."
- **Visual:** Highlight the **Commit Fence Scorecard** (100% Passed).

---

### 2:30 – 3:15: Heard-State Ledger Deep Dive
- **Action:** Navigate to `/ledger`.
- **Narrative:** "In MachLock, voice is part of state. Look at the Heard-State Ledger: an instruction that is only *partially heard* or belonging to an older epoch is permanently blocked from reaching `COMMITTED`."

---

### 3:15 – 4:00: Evidence Dashboard & Architecture
- **Action:** Navigate to `/evidence` and `/architecture`.
- **Narrative:** "Every event is logged to an immutable SQLite database. We do not fabricate numbers—unmeasured physical acoustic latencies are clearly labeled. Click any node in our Architecture diagram to inspect our custom Intent Verification Gate, Epoch Fencer, and Rime cancellation pipeline."
- **Closing:** "MachLock turns voice into a safe, transactional computing interface."
