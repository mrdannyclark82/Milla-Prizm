// Music service for playing local audio
export type MusicMode = 'drive' | 'chill' | 'home';

export class MusicService {
  private audioElement: HTMLAudioElement | null = null;
  private currentMode: MusicMode | null = null;

  // Mock music files - in a real app these would be local mp3 files
  private musicFiles: Record<MusicMode, string> = {
    drive: '/assets/drive-music.mp3',
    chill: '/assets/chill-music.mp3',
    home: '/assets/home-music.mp3',
  };

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.loop = true;
  }

  // Play music for the specified mode
  async play(mode: MusicMode): Promise<void> {
    if (!this.audioElement) return;

    try {
      // Stop current music if playing
      if (this.currentMode) {
        this.stop();
      }

      // Set new source
      this.audioElement.src = this.musicFiles[mode];
      this.currentMode = mode;

      // Set volume
      this.audioElement.volume = 0.3;

      // Play
      await this.audioElement.play();
      console.log(`Playing ${mode} music`);
    } catch (error) {
      console.error('Failed to play music:', error);
      // If file doesn't exist, create a silent audio context to simulate
      this.simulateMusic(mode);
    }
  }

  // Stop music
  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.currentMode = null;
      console.log('Music stopped');
    }
  }

  // Pause music
  pause(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      console.log('Music paused');
    }
  }

  // Resume music
  resume(): void {
    if (this.audioElement && this.currentMode) {
      this.audioElement.play().catch(err => {
        console.error('Failed to resume music:', err);
      });
      console.log('Music resumed');
    }
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  // Get current mode
  getCurrentMode(): MusicMode | null {
    return this.currentMode;
  }

  // Simulate music when files don't exist
  private simulateMusic(mode: MusicMode): void {
    console.log(`Simulating ${mode} music (no audio file found)`);
    this.currentMode = mode;
  }

  // Get spoken confirmation
  getSummary(mode: MusicMode): string {
    const modeDescriptions: Record<MusicMode, string> = {
      drive: 'energetic driving music',
      chill: 'relaxing ambient sounds',
      home: 'comfortable home atmosphere',
    };

    return `Playing ${modeDescriptions[mode]}.`;
  }
}

export const musicService = new MusicService();
