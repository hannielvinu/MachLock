/**
 * MachLock Client-Side Playback Buffer Invalidator
 * Web Audio API based audio player that enforces:
 * audio.epoch_id != currentAudioEpoch -> NEVER PLAY
 * On interruption, actively disconnects active nodes and flushes the queue immediately.
 */

export class ClientAudioController {
  private audioCtx: AudioContext | null = null;
  private currentAudioEpoch: number = 1;
  private activeSource: AudioBufferSourceNode | null = null;
  private playbackQueue: { epoch_id: number; buffer: AudioBuffer }[] = [];
  private onStateChange?: (state: { activeEpoch: number; isPlaying: boolean; queueLength: number }) => void;

  constructor(onStateChange?: (state: { activeEpoch: number; isPlaying: boolean; queueLength: number }) => void) {
    this.onStateChange = onStateChange;
  }

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass({ sampleRate: 24000 });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setEpoch(newEpoch: number) {
    if (newEpoch > this.currentAudioEpoch) {
      this.invalidateBuffers(newEpoch);
    }
  }

  public invalidateBuffers(newEpoch: number) {
    this.currentAudioEpoch = newEpoch;
    
    // 1. Immediately stop current playing source
    if (this.activeSource) {
      try {
        this.activeSource.stop();
        this.activeSource.disconnect();
      } catch (e) {
        // Source might have already finished
      }
      this.activeSource = null;
    }

    // 2. Clear all queued audio buffers
    this.playbackQueue = [];

    this.notifyState();
  }

  public enqueueChunk(epochId: number, pcmData?: Float32Array) {
    // Strict fence check: Reject if belonging to old epoch
    if (epochId < this.currentAudioEpoch) {
      return;
    }

    this.initContext();
    if (!this.audioCtx) return;

    // Create synthetic tone if pcmData not provided (for browser demonstration)
    const sampleRate = 24000;
    const duration = 0.15; // 150ms per chunk
    const frameCount = sampleRate * duration;
    const buffer = this.audioCtx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    if (pcmData && pcmData.length > 0) {
      for (let i = 0; i < frameCount && i < pcmData.length; i++) {
        data[i] = pcmData[i];
      }
    } else {
      // Soft synthetic radio sidetone beep
      for (let i = 0; i < frameCount; i++) {
        data[i] = Math.sin((i / sampleRate) * 2 * Math.PI * 440) * 0.05 * Math.exp(-i / (sampleRate * 0.08));
      }
    }

    this.playbackQueue.push({ epoch_id: epochId, buffer });
    this.processQueue();
  }

  private processQueue() {
    if (this.activeSource || this.playbackQueue.length === 0) {
      return;
    }

    const item = this.playbackQueue.shift();
    if (!item) return;

    // Reject stale chunk at moment of playback
    if (item.epoch_id < this.currentAudioEpoch) {
      this.processQueue();
      return;
    }

    if (!this.audioCtx) return;

    const source = this.audioCtx.createBufferSource();
    source.buffer = item.buffer;
    source.connect(this.audioCtx.destination);
    
    source.onended = () => {
      if (this.activeSource === source) {
        this.activeSource = null;
        this.notifyState();
        this.processQueue();
      }
    };

    this.activeSource = source;
    source.start();
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        activeEpoch: this.currentAudioEpoch,
        isPlaying: this.activeSource !== null,
        queueLength: this.playbackQueue.length
      });
    }
  }

  public getAudioEpoch(): number {
    return this.currentAudioEpoch;
  }
}
