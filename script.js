/**
 * Weather Forecast Application
 * This script handles all the functionality for the weather forecast app
 * including API calls, user interactions, and UI updates.
 */

// API Configuration (OpenWeatherMap)
const API_KEY = '2bf1cc3603b30d2de4f4148082321302'; // Your API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const searchDropdown = document.getElementById('searchDropdown');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const currentWeather = document.getElementById('currentWeather');
const cityName = document.getElementById('cityName');
const temperature = document.getElementById('temperature');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const feelsLike = document.getElementById('feelsLike');
const weatherIcon = document.getElementById('weatherIcon');
const weatherDescription = document.getElementById('weatherDescription');
const forecastSection = document.getElementById('forecastSection');
const forecast = document.getElementById('forecast');

// Storage key for recently searched cities
const RECENT_CITIES_KEY = 'recentCities';

// Event Listeners
document.addEventListener('DOMContentLoaded', initApp);
searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', getLocationWeather);
cityInput.addEventListener('input', toggleDropdown);
cityInput.addEventListener('focus', showDropdown);
cityInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch();
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('#cityInput') && !event.target.closest('#searchDropdown')) {
        searchDropdown.style.display = 'none';
    }
});

/**
 * Initialize the application
 */
function initApp() {
    console.log("Application initialized");
    
    // Clear input field on page load
    cityInput.value = '';
    
    // Load and display recent cities in dropdown
    const recentCities = getRecentCities();
    console.log("Recent cities on load:", recentCities);
    
    if (recentCities.length > 0) {
        updateRecentCitiesDropdown();
        // Initially hide dropdown even if there are cities
        searchDropdown.style.display = 'none';
    } else {
        // Initially hide dropdown if no cities
        searchDropdown.style.display = 'none';
    }
}

/**
 * Toggle dropdown visibility based on input
 */
function toggleDropdown() {
    const recentCities = getRecentCities();
    
    if (recentCities.length === 0) {
        // No cities to show
        searchDropdown.style.display = 'none';
        return;
    }
    
    // Update and show dropdown
    updateRecentCitiesDropdown();
    searchDropdown.style.display = 'block';
}

/**
 * Show dropdown when input is focused
 */
function showDropdown() {
    const recentCities = getRecentCities();
    if (recentCities.length > 0) {
        updateRecentCitiesDropdown();
        searchDropdown.style.display = 'block';
    }
}

/**
 * Handle the search button click
 */
function handleSearch() {
    const city = cityInput.value.trim();
    
    if (city === '') {
        showError('Please enter a city name');
        return;
    }
    
    console.log("Searching for city:", city);
    getWeatherByCity(city);
}

/**
 * Get weather data for the specified city
 * @param {string} city - The city name to search for
 */
function getWeatherByCity(city) {
    showLoading();
    console.log("Fetching weather for:", city);
    
    // Current weather API call
    fetch(`${WEATHER_API_URL}/weather?q=${city}&units=metric&appid=${API_KEY}`)
        .then(response => {
            console.log("Weather API response status:", response.status);
            if (!response.ok) {
                throw new Error('City not found or API error. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Weather data received:", data);
            hideError();
            displayCurrentWeather(data);
            addToRecentCities(city);
            
            // Get coordinates for forecast
            const { lat, lon } = data.coord;
            getForecast(lat, lon);
        })
        .catch(error => {
            console.error("Error fetching weather:", error);
            hideLoading();
            showError(error.message);
        });
}

/**
 * Get weather forecast data based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function getForecast(lat, lon) {
    console.log("Fetching forecast for coordinates:", lat, lon);
    
    fetch(`${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => {
            console.log("Forecast API response status:", response.status);
            if (!response.ok) {
                throw new Error('Forecast data not available. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Forecast data received:", data);
            displayForecast(data);
            hideLoading();
        })
        .catch(error => {
            console.error("Error fetching forecast:", error);
            hideLoading();
            showError(error.message);
        });
}

/**
 * Get weather for user's current location
 */
function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading();
        console.log("Getting user location...");
        
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                console.log("User location:", latitude, longitude);
                getWeatherByCoordinates(latitude, longitude);
            },
            error => {
                console.error("Geolocation error:", error);
                hideLoading();
                showError('Unable to retrieve your location. ' + error.message);
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
}

/**
 * Get weather data based on coordinates
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
function getWeatherByCoordinates(lat, lon) {
    console.log("Fetching weather for coordinates:", lat, lon);
    
    // Current weather API call
    fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        .then(response => {
            console.log("Weather API response status:", response.status);
            if (!response.ok) {
                throw new Error('Weather data not available. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Weather data received:", data);
            hideError();
            displayCurrentWeather(data);
            
            // Get forecast data
            getForecast(lat, lon);
            
            // Add city to recent searches
            if (data.name) {
                addToRecentCities(data.name);
            }
        })
        .catch(error => {
            console.error("Error fetching weather by coordinates:", error);
            hideLoading();
            showError(error.message);
        });
}

/**
 * Display current weather data
 * @param {Object} data - Weather data from API
 */
function displayCurrentWeather(data) {
    console.log("Displaying current weather for:", data.name);
    
    // Remove the 'hidden' class to show the weather container
    currentWeather.classList.remove('hidden');
    
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0];
    
    cityName.textContent = `${data.name} (${formattedDate})`;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    wind.textContent = `${data.wind.speed} M/S`;
    humidity.textContent = `${data.main.humidity}%`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    
    // Set weather icon
    const iconClass = getWeatherIconClass(data.weather[0].id);
    weatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
    weatherDescription.textContent = data.weather[0].description;
    
    console.log("Current weather display updated");
}

/**
 * Display forecast data
 * @param {Object} data - Forecast data from API
 */
function displayForecast(data) {
    console.log("Displaying forecast data");
    
    // Remove the 'hidden' class to show the forecast container
    forecastSection.classList.remove('hidden');
    forecast.innerHTML = '';
    
    // Group forecast data by day
    const dailyData = {};
    
    // Process the list of forecast timestamps
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) {
            dailyData[date] = item;
        }
    });
    
    console.log("Processed forecast days:", Object.keys(dailyData).length);
    
    // Only display up to 5 days
    const fiveDayForecast = Object.values(dailyData).slice(0, 5);
    
    fiveDayForecast.forEach(item => {
        const date = new Date(item.dt * 1000);
        const formattedDate = date.toISOString().split('T')[0];
        const iconClass = getWeatherIconClass(item.weather[0].id);
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'bg-gray-700 text-white p-4 rounded-lg forecast-card';
        forecastCard.innerHTML = `
            <p class="font-bold mb-2">[${formattedDate}]</p>
            <div class="text-center text-3xl mb-2">
                <i class="${iconClass}"></i>
            </div>
            <p class="text-sm">Temp: ${Math.round(item.main.temp)}°C</p>
            <p class="text-sm">Wind: ${item.wind.speed} M/S</p>
            <p class="text-sm">Humidity: ${item.main.humidity}%</p>
        `;
        
        forecast.appendChild(forecastCard);
    });
    
    console.log("Forecast display updated with", fiveDayForecast.length, "days");
}

/**
 * Get weather icon class based on weather condition ID
 * @param {number} conditionId - Weather condition ID from API
 * @returns {string} - CSS class for the weather icon
 */
function getWeatherIconClass(conditionId) {
    // Weather condition code mapping to icon classes
    if (conditionId >= 200 && conditionId < 300) {
        return 'wi wi-thunderstorm';
    } else if (conditionId >= 300 && conditionId < 500) {
        return 'wi wi-sprinkle';
    } else if (conditionId >= 500 && conditionId < 600) {
        return 'wi wi-rain';
    } else if (conditionId >= 600 && conditionId < 700) {
        return 'wi wi-snow';
    } else if (conditionId >= 700 && conditionId < 800) {
        return 'wi wi-fog';
    } else if (conditionId === 800) {
        return 'wi wi-day-sunny';
    } else if (conditionId > 800) {
        return 'wi wi-cloudy';
    }
    return 'wi wi-day-sunny'; // Default
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    console.log("Showing error:", message);
    errorMessage.classList.remove('hidden');
    errorText.textContent = message;
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.classList.add('hidden');
}

/**
 * Show loading indicator
 */
function showLoading() {
    console.log("Showing loading indicator");
    searchBtn.innerHTML = '<span class="loading"></span>';
    searchBtn.disabled = true;
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    console.log("Hiding loading indicator");
    searchBtn.innerHTML = 'Search';
    searchBtn.disabled = false;
}

/**
 * Get recently searched cities from local storage
 * @returns {Array} - Array of city names
 */
function getRecentCities() {
    const cities = localStorage.getItem(RECENT_CITIES_KEY);
    return cities ? JSON.parse(cities) : [];
}

/**
 * Add a city to the recently searched cities list
 * @param {string} city - City name to add
 */
function addToRecentCities(city) {
    let cities = getRecentCities();
    
    // Remove if already exists to avoid duplicates
    cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
    
    // Add to beginning of array
    cities.unshift(city);
    
    // Keep only the most recent 5 cities
    cities = cities.slice(0, 5);
    
    // Save to local storage
    localStorage.setItem(RECENT_CITIES_KEY, JSON.stringify(cities));
    
    console.log("Updated recent cities:", cities);
    
    // Update dropdown
    updateRecentCitiesDropdown();
}

/**
 * Update the recent cities dropdown menu
 */
function updateRecentCitiesDropdown() {
    const cities = getRecentCities();
    searchDropdown.innerHTML = '';
    
    if (cities.length === 0) {
        searchDropdown.style.display = 'none';
        return;
    }
    
    // Add a header to the dropdown
    const header = document.createElement('div');
    header.className = 'px-3 py-2 text-sm font-semibold text-gray-500 bg-gray-100';
    header.textContent = 'Recently searched cities';
    searchDropdown.appendChild(header);
    
    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'dropdown-item px-3 py-2 hover:bg-blue-50 cursor-pointer';
        item.textContent = city;
        item.addEventListener('click', () => {
            cityInput.value = city;
            searchDropdown.style.display = 'none';
            getWeatherByCity(city);
        });
        
        searchDropdown.appendChild(item);
    });
    
    console.log("Dropdown updated with", cities.length, "cities");
}

// Debug function - Add this at the end of the file
function checkEnvironment() {
    console.log("Environment check:");
    console.log("API Key:", API_KEY);
    console.log("Weather API URL:", WEATHER_API_URL);
    console.log("DOM elements loaded:", 
        cityInput && searchBtn && currentWeather && forecast ? "Yes" : "No");
    
    if (cityInput) cityInput.value = "Test input works";
    console.log("Test city input set");
}

// Run environment check when loaded
document.addEventListener('DOMContentLoaded', checkEnvironment);