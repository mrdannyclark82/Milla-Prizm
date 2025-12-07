// Calendar service for reading events
export type CalendarPeriod = 'today' | 'tomorrow' | 'week';

export interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

export class CalendarService {
  // Check if user has granted calendar permission
  async checkPermission(): Promise<boolean> {
    // For web, we'll use a mock implementation
    // In a real Expo app, this would use expo-calendar
    return true;
  }

  // Request calendar permission
  async requestPermission(): Promise<boolean> {
    // Mock implementation for web
    console.log('Calendar permission requested (mock)');
    return true;
  }

  // Get events for the specified period
  async getEvents(period: CalendarPeriod): Promise<CalendarEvent[]> {
    // Mock implementation - in a real app, this would query the device calendar
    const now = new Date();
    const events: CalendarEvent[] = [];

    switch (period) {
      case 'today':
        // Mock today's events
        events.push({
          title: 'Morning standup',
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
        });
        events.push({
          title: 'Code review',
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
          end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0),
        });
        break;

      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        events.push({
          title: 'Team meeting',
          start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0),
          end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 11, 0),
        });
        break;

      case 'week':
        // Mock week events
        for (let i = 0; i < 7; i++) {
          const day = new Date(now);
          day.setDate(day.getDate() + i);
          if (i % 2 === 0) {
            events.push({
              title: `Meeting ${i + 1}`,
              start: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 0),
              end: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 11, 0),
            });
          }
        }
        break;
    }

    return events;
  }

  // Format events into a spoken summary
  async getSummary(period: CalendarPeriod): Promise<string> {
    await this.requestPermission();
    const events = await this.getEvents(period);

    if (events.length === 0) {
      return `Nothing scheduled for ${period}.`;
    }

    let summary = '';
    const periodText = period === 'today' ? 'today' : period === 'tomorrow' ? 'tomorrow' : 'this week';

    if (events.length === 1) {
      const event = events[0];
      const time = event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      summary = `You have ${event.title} at ${time} ${periodText}.`;
    } else {
      summary = `You have ${events.length} events ${periodText}. `;
      summary += events.slice(0, 3).map(e => {
        const time = e.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `${e.title} at ${time}`;
      }).join(', ');
      
      if (events.length > 3) {
        summary += ` and ${events.length - 3} more.`;
      }
    }

    return summary;
  }
}

export const calendarService = new CalendarService();
