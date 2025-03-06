import { formatDate, celsiusToFahrenheit } from './utils.js';
import { getCurrentSlide } from './events.js';

let isCelsius = true;

function createWeatherCard(weatherData, index) {
    const card = document.createElement('div');
    card.className = 'weather-card';
    
    const formattedDate = weatherData.formattedDate;
    const dayTemperature = isCelsius ? weatherData.dayTemp : celsiusToFahrenheit(weatherData.dayTemp);
    const nightTemperature = isCelsius ? weatherData.nightTemp : celsiusToFahrenheit(weatherData.nightTemp);
    
    card.innerHTML = `
        <div class="card-content">
            <h2 class="date">${formattedDate}</h2>
            <div class="weather-container">
                <div class="day-forecast">
                    <h3>Daytime</h3>
                    <div class="weather-info">
                        <div class="temperature">${dayTemperature}°${isCelsius ? 'C' : 'F'}</div>
                        <div class="weather-icon">
                            <img src="img/${weatherData.dayIcon}.svg" 
                                 alt="${weatherData.description}"
                                 width="80"
                                 height="80">
                        </div>
                        <div class="description">${weatherData.description}</div>
                    </div>
                </div>
                <div class="night-forecast">
                    <h3>Nighttime</h3>
                    <div class="weather-info">
                        <div class="temperature">${nightTemperature}°${isCelsius ? 'C' : 'F'}</div>
                        <div class="weather-icon">
                            <img src="img/${weatherData.nightIcon}.svg" 
                                 alt="${weatherData.description}"
                                 width="80"
                                 height="80">
                        </div>
                        <div class="description">${weatherData.description}</div>
                    </div>
                </div>
                ${weatherData.gifUrl ? `
                    <div class="gif-container">
                        <img src="${weatherData.gifUrl}" 
                             alt="Weather animation" 
                             class="weather-gif"
                             loading="lazy">
                    </div>
                ` : ''}
            </div>
        </div>
    `;

    return card;
}

function displayWeather(weatherDataArray) {
    if (!weatherDataArray || weatherDataArray.length === 0) {
        console.error('No weather data available to display');
        const weatherSection = document.getElementById('weather_section');
        weatherSection.innerHTML = '<div class="error-message">No weather data available. Please try again.</div>';
        return { slides: [], prevButton: null, nextButton: null };
    }

    const weatherSection = document.getElementById('weather_section');
    weatherSection.innerHTML = '';

    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel-container';

    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'slides-container';

    weatherDataArray.forEach((data, index) => {
        if (!data) {
            console.warn('Invalid weather data encountered');
            return;
        }
        const card = createWeatherCard(data, index);
        slidesContainer.appendChild(card);
    });

    const prevButton = document.createElement('button');
    prevButton.className = 'prev';
    prevButton.innerHTML = '&#10094;';
    prevButton.setAttribute('aria-label', 'Previous day');

    const nextButton = document.createElement('button');
    nextButton.className = 'next';
    nextButton.innerHTML = '&#10095;';
    nextButton.setAttribute('aria-label', 'Next day');

    carouselContainer.appendChild(slidesContainer);
    carouselContainer.appendChild(prevButton);
    carouselContainer.appendChild(nextButton);
    weatherSection.appendChild(carouselContainer);

    const slides = document.querySelectorAll('.weather-card');
    const currentSlide = getCurrentSlide();
    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${100 * (i - currentSlide)}%)`;
    });

   
    const tempToggle = document.querySelector('.toggle-temp');
    if (tempToggle) {
        tempToggle.innerHTML = `<span class="current-unit">${isCelsius ? '°C' : '°F'}</span>`;
    }

    return { slides, prevButton, nextButton };
}

function toggleTemperatureUnit(weatherDataArray) {
    isCelsius = !isCelsius;
    if (weatherDataArray) {
        displayWeather(weatherDataArray);
    }
}

export { displayWeather, toggleTemperatureUnit };