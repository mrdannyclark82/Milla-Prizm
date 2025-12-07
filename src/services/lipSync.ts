// Lip sync service for mouth movement during speech

export interface LipSyncData {
  mouthOpen: number; // 0 to 1
  mouthSmile: number; // 0 to 1
}

export class LipSyncController {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing = false;
  private animationFrameId: number | null = null;
  private onUpdateCallback: ((data: LipSyncData) => void) | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.error('Web Audio API not supported:', e);
    }
  }

  // Start analyzing audio for lip sync
  startAnalysis(audioElement: HTMLAudioElement, onUpdate: (data: LipSyncData) => void) {
    if (!this.audioContext || !audioElement) return;

    this.onUpdateCallback = onUpdate;

    // Create analyser
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);

    // Connect audio source
    const source = this.audioContext.createMediaElementSource(audioElement);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.isAnalyzing = true;
    this.analyze();
  }

  // Start analyzing speech synthesis
  startSpeechAnalysis(onUpdate: (data: LipSyncData) => void) {
    this.onUpdateCallback = onUpdate;
    this.isAnalyzing = true;
    this.simulateSpeech();
  }

  private analyze() {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) return;

    // @ts-ignore - TypeScript incorrectly flags ArrayBufferLike vs ArrayBuffer
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;

    // Map volume to mouth opening (0-255 -> 0-1)
    const mouthOpen = Math.min(average / 128, 1);
    
    // Add subtle smile based on high frequencies
    const highFreqArray = Array.from(this.dataArray.slice(this.dataArray.length / 2));
    const highFreqSum = highFreqArray.reduce((a, b) => a + b, 0);
    const mouthSmile = Math.min((highFreqSum / (this.dataArray.length / 2)) / 200, 0.3);

    if (this.onUpdateCallback) {
      this.onUpdateCallback({ mouthOpen, mouthSmile });
    }

    this.animationFrameId = requestAnimationFrame(() => this.analyze());
  }

  private simulateSpeech() {
    if (!this.isAnalyzing) return;

    // Simulate mouth movement for TTS
    const time = Date.now() / 100;
    const mouthOpen = Math.abs(Math.sin(time)) * 0.6 + Math.random() * 0.2;
    const mouthSmile = Math.sin(time / 2) * 0.1 + 0.1;

    if (this.onUpdateCallback) {
      this.onUpdateCallback({ mouthOpen, mouthSmile });
    }

    this.animationFrameId = requestAnimationFrame(() => this.simulateSpeech());
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Reset mouth to closed
    if (this.onUpdateCallback) {
      this.onUpdateCallback({ mouthOpen: 0, mouthSmile: 0 });
    }
  }

  destroy() {
    this.stopAnalysis();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

export const createLipSyncController = () => new LipSyncController();
