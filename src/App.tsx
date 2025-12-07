import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { CameraFeed } from './components/CameraFeed';
import { MillaModel } from './components/MillaModel';
import { wakewordListener } from './services/wakewordListener';
import { commandHandler } from './services/commandHandler';
import { ttsService } from './services/ttsService';
import { createLipSyncController } from './services/lipSync';
import type { LipSyncData } from './services/lipSync';
import './App.css';

// Extend the Window interface to include webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

function App() {
  const [faceDetected, setFaceDetected] = useState(false);
  const [hologramOpacity, setHologramOpacity] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lipSyncData, setLipSyncData] = useState<LipSyncData>({ mouthOpen: 0, mouthSmile: 0 });
  const [hologramScale, setHologramScale] = useState(1);
  const [listening, setListening] = useState(false);
  
  const lipSyncControllerRef = useRef(createLipSyncController());
  const fadeTimeoutRef = useRef<number | null>(null);
  const lastFaceTimeRef = useRef<number>(Date.now());
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize on mount
  useEffect(() => {
    console.log('Milla Prism alive — waiting for you.');

    // Set up TTS callbacks for lip sync
    ttsService.setCallbacks(
      () => {
        // On speech start
        lipSyncControllerRef.current.startSpeechAnalysis((data) => {
          setLipSyncData(data);
        });
      },
      () => {
        // On speech end
        lipSyncControllerRef.current.stopAnalysis();
      }
    );

    // Set lock screen callback
    commandHandler.setLockScreenCallback(() => {
      setIsLocked(true);
      setHologramOpacity(0.3);
    });

    // Start wake word listener
    wakewordListener.startListening(() => {
      console.log('Milla activated!');
      setIsLocked(false);
      setHologramOpacity(0.8);
      startCommandListening();
    });

    return () => {
      wakewordListener.stopListening();
      lipSyncControllerRef.current.destroy();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle face detection changes
  useEffect(() => {
    if (faceDetected) {
      lastFaceTimeRef.current = Date.now();
      
      // Fade in hologram
      setHologramOpacity(isLocked ? 0.3 : 0.8);
      
      // Clear any pending fade out
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    } else {
      // Start 30s timer to fade out
      if (!fadeTimeoutRef.current) {
        fadeTimeoutRef.current = window.setTimeout(() => {
          const timeSinceLastFace = Date.now() - lastFaceTimeRef.current;
          if (timeSinceLastFace >= 30000) {
            setHologramOpacity(0);
          }
        }, 30000);
      }
    }
  }, [faceDetected, isLocked]);

  // Start listening for commands after wake word
  const startCommandListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      setListening(true);
      console.log('Listening for command...');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log('Command:', transcript);
      commandHandler.processVoiceInput(transcript);
    };

    recognition.onend = () => {
      setListening(false);
      console.log('Stopped listening');
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event.error);
      setListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  // Calculate hologram size (10% of screen height, clamped 70-100px)
  const calculateHologramScale = () => {
    const screenHeight = window.innerHeight;
    const targetHeight = screenHeight * 0.1;
    const clampedHeight = Math.max(70, Math.min(100, targetHeight));
    // Convert to scale factor (assuming base model is about 2 units tall)
    return clampedHeight / 100;
  };

  useEffect(() => {
    const updateScale = () => {
      setHologramScale(calculateHologramScale());
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #0a0a1a 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Camera feed (hidden but active) */}
      <CameraFeed onFaceDetected={setFaceDetected} />

      {/* 3D Canvas for hologram */}
      <Canvas
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '70%',
          zIndex: 10,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 1.5, 3]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4466ff" />

        {/* Milla Model */}
        <MillaModel 
          lipSyncData={lipSyncData}
          opacity={hologramOpacity}
          scale={hologramScale}
        />

        {/* Optional: Uncomment for manual camera control */}
        {/* <OrbitControls /> */}
      </Canvas>

      {/* Status indicators */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 100,
      }}>
        <div>Face: {faceDetected ? '👤 Detected' : '❌ Not detected'}</div>
        <div>Hologram: {hologramOpacity > 0 ? '✨ Active' : '💤 Idle'}</div>
        {listening && <div>🎤 Listening...</div>}
        {isLocked && <div>🔒 Locked</div>}
      </div>

      {/* Instructions */}
      <div style={{
        position: 'fixed',
        top: 20,
        right: 20,
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '15px',
        borderRadius: '10px',
        maxWidth: '300px',
        zIndex: 100,
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>💎 Milla Prism</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Say "Milla" to activate<br/>
          Commands:<br/>
          • "Check calendar"<br/>
          • "What's the weather"<br/>
          • "Write commit"<br/>
          • "Play music"<br/>
          • "Lock screen"
        </div>
      </div>
    </div>
  );
}

export default App;
