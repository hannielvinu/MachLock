# System Architecture Documentation

## 1. High-Level Architecture Overview

```
                      +---------------------------------------+
                      |           PILOT / OPERATOR            |
                      +-------------------+-------------------+
                                          |
                        Full-Duplex Audio | Acoustic Barge-In
                                          v
                      +-------------------+-------------------+
                      |      CLIENT AUDIO CONTROLLER          |
                      |   (Web Audio API / Buffer Purge)      |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |    ACOUSTIC PREPROCESSING & VAD       |
                      |    (RMS Energy / Debounce Gate)       |
                      +-------------------+-------------------+
                                          |
                                          v
                      +-------------------+-------------------+
                      |     INTENT VERIFICATION GATE          |
                      | (NOISE | BACKCHANNEL | BARGE_IN |     |
                      |       SUPERSEDING_COMMAND)            |
                      +-------------------+-------------------+
                                          |
                                          v  [If Epoch Bump Required]
                      +-------------------+-------------------+
                      |       MONOTONIC EPOCH FENCER          |
                      |        current_epoch += 1             |
                      +---------+-------------------+---------+
                                |                   |
             Atomic Clear Frame |                   | Invalidate Buffer
                                v                   v
                      +---------+---------+   +-----+-----------------+
                      |     RIME TTS      |   |  HEARD-STATE LEDGER   |
                      | (Stream Canceled) |   | (Mark Interrupted)    |
                      +-------------------+   +-----+-----------------+
                                                    |
                                                    v
                                      +-------------+-----------------+
                                      |     TRANSACTIONAL COMMIT      |
                                      |             FENCE             |
                                      | Reject Stale epoch != current |
                                      +-------------+-----------------+
                                                    |
                                                    v
                                      +-------------+-----------------+
                                      |    SQLITE PERSISTENT AUDIT    |
                                      |            LEDGER             |
                                      +-------------------------------+
```

---

## 2. Audible Heard-State Lifecycle

```
[GENERATED] ──(Stream Start)──> [STREAMING] ──(Audio Playing)──> [PARTIALLY_HEARD]
                                                                        │
                                                                 (100% Audible)
                                                                        v
[COMMITTED] <──(Commit Fence)── [CONFIRMED] <──(Pilot Readback)── [COMPLETED]
     │
     X  <─── [INTERRUPTED / INVALIDATED] (Triggered by Epoch Bump at any point)
```

---

## 3. Realtime Audio & Cancellation Protocol

1. **Rime Streaming Path:**
   - Server requests TTS synthesis from Rime streaming WebSocket.
   - Audio frames are yielded with chunk metadata `{"epoch_id": N, "progress_pct": X}`.
   - Client Web Audio node queues the chunk if and only if `chunk.epoch_id == currentAudioEpoch`.
2. **Interruption & Atomic Purge Path:**
   - Pilot speaks: *"BREAK BREAK! Traffic twelve o'clock!"*.
   - Intent Verification Gate detects priority pattern in `< 50ms`.
   - Epoch bumps from `N` to `N + 1`.
   - Server sends WebSocket clear frame to Rime TTS.
   - Server broadcasts `CLIENT_PLAYBACK_INVALIDATED` to frontend.
   - Frontend `ClientAudioController` executes `activeSource.stop()`, disconnects Web Audio nodes, and clears queued arrays.
3. **Commit Barrier:**
   - An asynchronous tool dispatched under epoch `N` returns at `T+500ms`.
   - The Commit Fence compares `tool.dispatch_epoch (N)` against `fencer.current_epoch (N + 1)`.
   - Result: `REJECTED_STALE` — zero state mutation.
