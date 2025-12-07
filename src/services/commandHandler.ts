// Command handler for processing voice commands
import { calendarService } from './calendarService';
import type { CalendarPeriod } from './calendarService';
import { weatherService } from './weatherService';
import { commitService } from './commitService';
import { musicService } from './musicService';
import type { MusicMode } from './musicService';
import { ttsService } from './ttsService';

export class CommandHandler {
  private onLockScreen?: () => void;

  setLockScreenCallback(callback: () => void) {
    this.onLockScreen = callback;
  }

  async handleCommand(command: string): Promise<void> {
    const lowerCommand = command.toLowerCase().trim();
    console.log('Processing command:', lowerCommand);

    // Calendar commands
    if (lowerCommand.includes('calendar') || lowerCommand.includes('schedule')) {
      let period: CalendarPeriod = 'today';
      
      if (lowerCommand.includes('tomorrow')) {
        period = 'tomorrow';
      } else if (lowerCommand.includes('week')) {
        period = 'week';
      }

      const summary = await calendarService.getSummary(period);
      ttsService.speak(summary);
      return;
    }

    // Weather command
    if (lowerCommand.includes('weather') || lowerCommand.includes('temperature')) {
      const summary = await weatherService.getSummary();
      ttsService.speak(summary);
      return;
    }

    // Git commit command
    if (lowerCommand.includes('commit') || lowerCommand.includes('git') || lowerCommand.includes('push')) {
      const summary = await commitService.getCommitSummary();
      ttsService.speak(summary);
      return;
    }

    // Music commands
    if (lowerCommand.includes('music') || lowerCommand.includes('play')) {
      let mode: MusicMode = 'home';
      
      if (lowerCommand.includes('drive') || lowerCommand.includes('driving')) {
        mode = 'drive';
      } else if (lowerCommand.includes('chill') || lowerCommand.includes('relax')) {
        mode = 'chill';
      }

      await musicService.play(mode);
      const summary = musicService.getSummary(mode);
      ttsService.speak(summary);
      return;
    }

    // Stop music
    if (lowerCommand.includes('stop') && lowerCommand.includes('music')) {
      musicService.stop();
      ttsService.speak('Music stopped.');
      return;
    }

    // Lock screen command
    if (lowerCommand.includes('lock') || lowerCommand.includes("i'm going") || lowerCommand.includes('im going')) {
      if (this.onLockScreen) {
        this.onLockScreen();
      }
      ttsService.speak('Screen locked. Call me when you need me.');
      return;
    }

    // Wake up command
    if (lowerCommand.includes("i'm back") || lowerCommand.includes('im back') || lowerCommand.includes('hello')) {
      ttsService.speak('Welcome back.');
      return;
    }

    // Unknown command
    ttsService.speak('Say again?');
  }

  // Process command from speech recognition
  async processVoiceInput(transcript: string): Promise<void> {
    await this.handleCommand(transcript);
  }
}

export const commandHandler = new CommandHandler();
