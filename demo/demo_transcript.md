# MachLock Recorded Demo Transcript

**Title:** MachLock: Transactional Interruption-Safe Voice Execution  
**Context:** DataForge 2026 — Rime Hackathon Challenge  
**Video File Reference:** `demo/MachLock_Demo.mp4` *(User adds manually)*

---

### [00:00 - 00:30] Introduction & Problem Hook
- **Speaker:** "In procedural cockpit simulations, ordinary realtime voice models can be dangerous. When an agent speaks an instruction, it often triggers backend actuators concurrently. If a pilot interrupts, obsolete voice continues playing in local buffers and stale tool results still commit. MachLock introduces transactional epoch fencing."

### [00:30 - 01:15] Normal Procedure Execution
- **Speaker:** "Here in the MachLock Command Center, we initiate the Engine 2 Fire checklist. Rime TTS streams procedural audio with real-time audible tracking. Only when 100% of the speech is heard and read back by the pilot does the state commit."

### [01:15 - 02:30] Interruption Race Condition Stress Test
- **Speaker:** "In our Interruption Lab, we simulate a 500ms actuator delay on discharging the fire bottle. Mid-stream, the pilot calls: 'BREAK BREAK! Traffic twelve o'clock!'. Instantly, the Intent Verification Gate triggers an Epoch increment. Rime synthesis cancels, client Web Audio buffers flush, and when the delayed tool result arrives, the Commit Fence strictly discards it."

### [02:30 - 03:15] State Ledger & Commit Invariant
- **Speaker:** "Looking at the Heard-State Ledger, we see that partially-heard instructions or stale epochs can never commit. Spoken voice is an active component of state."

### [03:15 - 04:00] Evidence & Architecture
- **Speaker:** "Every transition is recorded in persistent SQLite audit tables. MachLock delivers rigorous, interruption-safe voice transactions."
