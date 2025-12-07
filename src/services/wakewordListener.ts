// Wake word listener using Web Speech API

// Extend the Window interface to include webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export class WakewordListener {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onWakeCallback: (() => void) | null = null;
  private continuousMode = true;

  constructor() {
    // Check if Web Speech API is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Heard:', transcript);
        
        // Check for wake word "Milla"
        if (transcript.includes('milla') || transcript.includes('mila')) {
          console.log('Wake word detected!');
          if (this.onWakeCallback) {
            this.onWakeCallback();
          }
        }
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech' || event.error === 'audio-capture') {
          // Restart recognition after a brief delay
          if (this.continuousMode && this.isListening) {
            setTimeout(() => this.startListening(), 1000);
          }
        }
      };

      this.recognition.onend = () => {
        // Automatically restart if in continuous mode
        if (this.continuousMode && this.isListening) {
          try {
            this.recognition?.start();
          } catch (e) {
            console.log('Recognition restart delayed');
            setTimeout(() => {
              if (this.isListening) {
                try {
                  this.recognition?.start();
                } catch (err) {
                  console.error('Failed to restart recognition:', err);
                }
              }
            }, 100);
          }
        }
      };
    } else {
      console.warn('Web Speech API not available');
    }
  }

  startListening(onWake?: () => void) {
    if (onWake) {
      this.onWakeCallback = onWake;
    }

    if (this.recognition && !this.isListening) {
      try {
        this.isListening = true;
        this.recognition.start();
        console.log('Wake word listener started - say "Milla" to wake');
      } catch (e) {
        console.error('Failed to start wake word listener:', e);
      }
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      this.recognition.stop();
      console.log('Wake word listener stopped');
    }
  }

  setContinuousMode(enabled: boolean) {
    this.continuousMode = enabled;
  }
}

export const wakewordListener = new WakewordListener();
