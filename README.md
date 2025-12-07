# Milla Prism 💎

A real-time, full upper-body holographic companion that floats above the screen using your front camera. Milla Prism is a Progressive Web App (PWA) that combines 3D graphics, voice interaction, and AI assistance in a beautiful, immersive experience.

![Milla Prism Screenshot](https://github.com/user-attachments/assets/69cde621-ccb6-4064-be21-3f590a59c5c1)

## ✨ Features

### Holographic Avatar
- **Real-time 3D rendering** using React Three Fiber and Three.js
- **Translucent holographic shader** with soft glow, rainbow effects, and scan lines
- **Adaptive sizing**: Model scales to 10% of screen height (clamped 70-100px)
- **Breathing animation**: Subtle idle breathing for life-like presence
- **Floating effect**: Gentle hovering motion above the interface
- **Face tracking**: Motion-based face detection with fade-in/fade-out

### Voice Interaction
- **Wake word detection**: Say "Milla" to activate
- **Speech recognition**: Natural language command processing
- **Text-to-speech**: Soft female voice responses
- **Lip sync**: Animated mouth movement during speech
- **No chit-chat**: Direct, concise responses only

### Smart Functions (Local-First)
1. **📅 Calendar**: Check today, tomorrow, or week's schedule
   - "Check calendar"
   - "What's tomorrow's schedule"
   
2. **🌤️ Weather**: Real-time weather via open-meteo.com
   - "What's the weather"
   
3. **💻 Git Commits**: Draft commit messages from staged changes
   - "Write commit"
   
4. **🎵 Music**: Play ambient music loops
   - "Play music" (home mode)
   - "Play drive music"
   - "Play chill music"
   
5. **🔒 Lock Screen**: Dim hologram and enter low-power mode
   - "Lock screen"
   - "I'm going"

### Progressive Web App
- **Installable**: Add to home screen on mobile/desktop
- **Offline capable**: Service worker caching
- **Fast loading**: Optimized bundle with code splitting
- **Responsive**: Works on all screen sizes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with Web Speech API support (Chrome, Edge, Safari)
- Camera access (optional, for face detection)

### Installation

```bash
# Clone the repository
git clone https://github.com/mrdannyclark82/Milla-Prizm.git
cd Milla-Prizm

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Browser Permissions
When you first open the app, you'll need to grant:
- **Microphone access**: For wake word detection and voice commands
- **Camera access** (optional): For face detection and presence awareness

## 🎯 Usage

### Activation
1. Open the app in your browser
2. Say **"Milla"** to wake her up
3. She'll respond and start listening for commands

### Available Commands

**Calendar Management:**
- "Check calendar" / "What's on my schedule today"
- "What's tomorrow's schedule"
- "Show me this week's events"

**Weather Information:**
- "What's the weather" / "How's the temperature"

**Git Integration:**
- "Write commit" / "Draft a commit message"

**Music Control:**
- "Play music" (home mode - comfortable ambiance)
- "Play drive music" (energetic)
- "Play chill music" (relaxing)
- "Stop music"

**Screen Control:**
- "Lock screen" / "I'm going" (enters low-power mode)
- "Hello" / "I'm back" (wakes from lock)

### Idle Behavior
- Milla fades out after 30 seconds if no face is detected
- She fades back in when you return
- In lock mode, the hologram dims but remains visible

## 🛠️ Tech Stack

### Core
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server

### 3D Graphics
- **Three.js** - 3D rendering engine
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Custom GLSL shaders** - Holographic prism effect

### AI & Voice
- **Web Speech API** - Speech recognition and synthesis
- **MediaPipe** (planned) - Advanced face tracking
- **Custom lip sync** - Audio-reactive mouth animation

### PWA
- **Vite PWA Plugin** - Service worker generation
- **Workbox** - Runtime caching strategies

### Services
- **Open-Meteo API** - Weather data (no API key required)
- **Local-first architecture** - Privacy-focused design

## 📁 Project Structure

```
milla-prism/
├── public/
│   ├── assets/          # Audio files, models, etc.
│   ├── icon-192.png     # PWA icon (192x192)
│   └── icon-512.png     # PWA icon (512x512)
├── src/
│   ├── components/
│   │   ├── CameraFeed.tsx      # Camera access & face detection
│   │   └── MillaModel.tsx      # 3D holographic avatar
│   ├── services/
│   │   ├── calendarService.ts  # Calendar integration
│   │   ├── commandHandler.ts   # Voice command processing
│   │   ├── commitService.ts    # Git commit drafting
│   │   ├── lipSync.ts          # Lip sync animation
│   │   ├── musicService.ts     # Audio playback
│   │   ├── ttsService.ts       # Text-to-speech
│   │   ├── wakewordListener.ts # Wake word detection
│   │   └── weatherService.ts   # Weather API
│   ├── shaders/
│   │   └── prismShader.glsl.ts # Holographic shader
│   ├── types/
│   │   └── speech-recognition.d.ts # Web Speech API types
│   ├── App.tsx           # Main application component
│   ├── App.css           # Application styles
│   └── main.tsx          # Entry point
├── package.json
├── vite.config.ts        # Vite + PWA configuration
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Customization

### Hologram Colors
Edit `src/shaders/prismShader.glsl.ts`:
```typescript
glowColor: { value: [0.3, 0.6, 1.0] }, // RGB values (0-1)
```

### Voice Settings
Edit `src/services/ttsService.ts`:
```typescript
utterance.rate = 0.95;  // Speech speed
utterance.pitch = 1.1;  // Voice pitch
utterance.volume = 0.8; // Volume
```

### Model Scale
Edit `src/App.tsx`:
```typescript
const calculateHologramScale = () => {
  const screenHeight = window.innerHeight;
  const targetHeight = screenHeight * 0.1; // 10% of screen
  const clampedHeight = Math.max(70, Math.min(100, targetHeight));
  return clampedHeight / 100;
};
```

## 🔒 Privacy & Security

- **Local-first**: All processing happens on your device
- **No data collection**: No analytics, tracking, or user data storage
- **Secure APIs**: Only connects to trusted, public APIs (open-meteo.com)
- **Camera privacy**: Video feed never leaves your device
- **Open source**: Full transparency of code and behavior

## 🚧 Roadmap

### Near-term
- [ ] Real MediaPipe face mesh integration
- [ ] Selfie segmentation for improved presence detection
- [ ] Actual GLB model with red hair and detailed features
- [ ] Pinch-to-zoom gesture support
- [ ] Local LLM integration (Gemma-2B) for commit messages

### Future
- [ ] Expo native app export
- [ ] Offline voice recognition
- [ ] Custom wake word training
- [ ] More personality modes
- [ ] Integration with more productivity tools

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with love for an immersive, personal AI companion experience
- Inspired by holographic UI concepts from sci-fi media
- Thanks to the React Three Fiber and Three.js communities

---

**"Milla Prism alive — waiting for you."**
