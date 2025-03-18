# Weather Forecast Application

A responsive weather forecast application built with JavaScript, HTML, and Tailwind CSS that allows users to search for weather information by city name or use their current location.

## Features

- Search for weather forecasts by city name
- Get weather for current location
- Recently searched cities dropdown (stored in local storage)
- Current weather conditions display
- 5-day weather forecast
- Responsive design for desktop, iPad Mini, and iPhone SE
- Error handling and input validation

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Open the project directory:
   ```
   cd weather-forecast-app
   ```

3. **Important**: Add your OpenWeatherMap API key
   - Sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api)
   - Open `script.js` and replace `YOUR_API_KEY` with your actual API key:
     ```javascript
     const API_KEY = 'YOUR_API_KEY';
     ```

4. Open the `index.html` file in your browser or use a local development server.

## Project Structure

- `index.html` - Main HTML file with the user interface structure
- `styles.css` - Custom CSS styles for components
- `script.js` - JavaScript file containing all application logic and API calls

## Technologies Used

- HTML5
- CSS3 (Tailwind CSS)
- JavaScript (ES6+)
- OpenWeatherMap API
- Weather Icons (for weather condition representation)
- Local Storage (for saving recently searched cities)

## Browser Compatibility

The application is designed to work on all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Responsive Design

The application is responsive and optimized for:
- Desktop (1024px and above)
- iPad Mini (768px)
- iPhone SE (375px)

## License

This project is created as an educational assignment.
