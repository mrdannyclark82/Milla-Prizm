// Camera component with face tracking
import { useRef, useEffect, useState } from 'react';

interface CameraFeedProps {
  onFaceDetected?: (detected: boolean) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onFaceDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setError(null);

          // Start simple face detection
          startFaceDetection();
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError('Camera access denied');
      }
    };

    const startFaceDetection = () => {
      // Simple motion detection as a proxy for face presence
      // In a real implementation, this would use MediaPipe FaceMesh
      let lastImageData: ImageData | null = null;

      detectionIntervalRef.current = window.setInterval(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx || video.videoWidth === 0) return;

        // Set canvas size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Simple motion detection
        if (lastImageData) {
          let diffSum = 0;
          for (let i = 0; i < imageData.data.length; i += 4) {
            const diff = Math.abs(imageData.data[i] - lastImageData.data[i]);
            diffSum += diff;
          }

          const avgDiff = diffSum / (imageData.data.length / 4);
          const faceDetected = avgDiff > 5; // Threshold for motion

          if (onFaceDetected) {
            onFaceDetected(faceDetected);
          }
        }

        lastImageData = imageData;
      }, 1000); // Check every second
    };

    startCamera();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [onFaceDetected]);

  return (
    <div style={{ position: 'relative', width: 0, height: 0, overflow: 'hidden' }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      {error && (
        <div style={{
          position: 'fixed',
          top: 10,
          left: 10,
          background: 'rgba(255, 0, 0, 0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000,
        }}>
          {error}
        </div>
      )}
    </div>
  );
};
