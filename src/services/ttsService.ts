// Text-to-Speech service using Web Speech API
export class TTSService {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private onStartCallback: (() => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoice();
  }

  // Load a soft female voice
  private loadVoice(): void {
    const loadVoices = () => {
      const voices = this.synth.getVoices();
      
      // Try to find a soft female voice
      // Prefer: Google US English Female, Microsoft Zira, or any female voice
      const preferredVoices = [
        'Google US English Female',
        'Microsoft Zira Desktop',
        'Samantha',
        'Victoria',
        'Karen',
      ];

      for (const preferred of preferredVoices) {
        const voice = voices.find(v => v.name.includes(preferred));
        if (voice) {
          this.voice = voice;
          console.log('Selected voice:', voice.name);
          return;
        }
      }

      // Fallback: any female voice
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman')
      );
      
      if (femaleVoice) {
        this.voice = femaleVoice;
        console.log('Selected voice:', femaleVoice.name);
      } else if (voices.length > 0) {
        // Last resort: first available voice
        this.voice = voices[0];
        console.log('Using default voice:', voices[0].name);
      }
    };

    // Voices might not be loaded immediately
    if (this.synth.getVoices().length > 0) {
      loadVoices();
    } else {
      this.synth.addEventListener('voiceschanged', loadVoices);
    }
  }

  // Speak text
  speak(text: string, onStart?: () => void, onEnd?: () => void): void {
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice
    if (this.voice) {
      utterance.voice = this.voice;
    }

    // Configure speech parameters
    utterance.rate = 0.95; // Slightly slower for calm delivery
    utterance.pitch = 1.1; // Slightly higher for feminine tone
    utterance.volume = 0.8; // Not too loud

    // Set callbacks
    utterance.onstart = () => {
      console.log('Speaking:', text);
      if (onStart) onStart();
      if (this.onStartCallback) this.onStartCallback();
    };

    utterance.onend = () => {
      console.log('Speech ended');
      if (onEnd) onEnd();
      if (this.onEndCallback) this.onEndCallback();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
    };

    // Speak
    this.synth.speak(utterance);
  }

  // Cancel current speech
  cancel(): void {
    this.synth.cancel();
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.synth.speaking;
  }

  // Set global callbacks
  setCallbacks(onStart?: () => void, onEnd?: () => void): void {
    this.onStartCallback = onStart || null;
    this.onEndCallback = onEnd || null;
  }
}

export const ttsService = new TTSService();
