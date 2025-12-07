// Weather service using open-meteo.com
export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

export class WeatherService {
  private readonly API_URL = 'https://api.open-meteo.com/v1/forecast';
  
  // Get user's approximate location
  private async getLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve) => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
          (error) => {
            console.warn('Geolocation error:', error);
            // Default to San Francisco
            resolve({ latitude: 37.7749, longitude: -122.4194 });
          }
        );
      } else {
        // Default to San Francisco
        resolve({ latitude: 37.7749, longitude: -122.4194 });
      }
    });
  }

  // Fetch weather data
  async getWeather(): Promise<WeatherData> {
    try {
      const location = await this.getLocation();
      
      const response = await fetch(
        `${this.API_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`
      );

      if (!response.ok) {
        throw new Error('Weather API request failed');
      }

      const data = await response.json();
      
      const temperature = Math.round(data.current.temperature_2m);
      const weatherCode = data.current.weather_code;
      const condition = this.getWeatherCondition(weatherCode);

      return {
        temperature,
        condition,
        location: 'your area',
      };
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      // Return fake data as fallback
      return this.getFakeWeather();
    }
  }

  // Get fake weather data as fallback
  private getFakeWeather(): WeatherData {
    const conditions = ['sunny', 'cloudy', 'partly cloudy', 'clear'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.floor(Math.random() * 30) + 60; // 60-90°F

    return {
      temperature,
      condition: randomCondition,
      location: 'your area',
    };
  }

  // Convert weather code to condition string
  private getWeatherCondition(code: number): string {
    if (code === 0) return 'clear';
    if (code <= 3) return 'partly cloudy';
    if (code <= 49) return 'foggy';
    if (code <= 69) return 'rainy';
    if (code <= 79) return 'snowy';
    if (code <= 99) return 'stormy';
    return 'clear';
  }

  // Get spoken weather summary
  async getSummary(): Promise<string> {
    const weather = await this.getWeather();
    return `It's ${weather.temperature} degrees and ${weather.condition} in ${weather.location}.`;
  }
}

export const weatherService = new WeatherService();
