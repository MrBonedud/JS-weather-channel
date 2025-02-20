import { fetchWeather } from "./api.js";
import { displayWeather, toggleTemperatureUnit } from "./dom.js";
import { debounce } from "./utils.js";

let currentSlide = 0;
let intervalId = null;
let currentWeatherData = null;

export function getCurrentSlide() {
    return currentSlide;
}

export function setCurrentSlide(index) {
    currentSlide = index;
}

function showSlide(slides, index) {
    const totalSlides = slides.length;
    
    if (index >= totalSlides) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = totalSlides - 1;
    } else {
        currentSlide = index;
    }

    slides.forEach((slide, i) => {
        slide.style.transform = `translateX(${100 * (i - currentSlide)}%)`;
    });
}

function setupCarousel(slides, prevButton, nextButton) {
    if (!slides.length) return;

    const carouselContainer = document.querySelector('.carousel-container');
    let isPaused = false;

    showSlide(slides, currentSlide);

    function startInterval() {
        return setInterval(() => {
            if (!isPaused) {
                showSlide(slides, currentSlide + 1);
            }
        }, 5000);
    }

    if (intervalId) {
        clearInterval(intervalId);
    }
    intervalId = startInterval();

    carouselContainer.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    carouselContainer.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    prevButton.addEventListener("click", () => {
        clearInterval(intervalId);
        showSlide(slides, currentSlide - 1);
        intervalId = startInterval();
    });

    nextButton.addEventListener("click", () => {
        clearInterval(intervalId);
        showSlide(slides, currentSlide + 1);
        intervalId = startInterval();
    });
}

const debouncedSearch = debounce(async (location) => {
    console.log(`Fetching weather data for: ${location}`);
    const weatherData = await fetchWeather(location);
    if (!weatherData) {
        console.error("Failed to retrieve weather data.");
        return;
    }

    currentWeatherData = weatherData;
    currentSlide = 0; 

    const { slides, prevButton, nextButton } = displayWeather(weatherData);
    setupCarousel(slides, prevButton, nextButton);
}, 500);

function setupEventListeners() {
    document
        .querySelector(".search_button")
        .addEventListener("click", async () => {
            const location = document.querySelector("#weather_Search").value.trim();
            if (!location) {
                console.warn("No location entered.");
                return;
            }
            debouncedSearch(location);
        });

    document
        .querySelector("#weather_Search")
        .addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                const location = e.target.value.trim();
                if (!location) {
                    console.warn("No location entered.");
                    return;
                }
                debouncedSearch(location);
            }
        });

    document.querySelector(".toggle-temp").addEventListener("click", () => {
        toggleTemperatureUnit(currentWeatherData);
        const { slides, prevButton, nextButton } = displayWeather(currentWeatherData);
        setupCarousel(slides, prevButton, nextButton);
    });
}

export { setupEventListeners };