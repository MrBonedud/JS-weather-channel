import { formatDate } from "./utils.js";

const API_KEY = "7Q3HENA2JVMMKRHXV9BXRJC7C";
const BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const GIPHY_API_KEY = "HGAgmwCyD6F89Mrr2w8NGpJkbdt3RzC2";

async function fetchWeather(location) {
    const url = `${BASE_URL}/${location}?unitGroup=metric&include=days&key=${API_KEY}&contentType=json`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather data not found");

        const data = await response.json();
        console.log("Full API Response:", data);

        const dailyData = await Promise.all(
            data.days.slice(0, 7).map(async (day) => {
                const weatherIcon = determineWeatherIcon(day.icon);
                const gifCondition = determineGifCondition(day.icon);
                const gifUrl = await fetchGif(gifCondition);
                
                return {
                    date: day.datetime,
                    formattedDate: formatDate(day.datetime),
                    temp: Math.round(day.temp),
                    description: day.conditions,
                    icon: weatherIcon,
                    gifUrl: gifUrl,
                };
            })
        );

        console.log("Processed Weather Data:", dailyData);
        return dailyData;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
}

function determineWeatherIcon(apiIcon) {
  const iconMapping = {
    'clear-day': 'clear-day',
    'clear-night': 'clear-night',
    'partly-cloudy-day': 'partly-cloudy-day',
    'partly-cloudy-night': 'partly-cloudy-night',
    'rain': 'rain-night',           
    'snow': 'snow-night',           
    'thunder': 'thunderstorm',
    'thunder-rain': 'thunderstorm',
    'thunder-showers': 'thunderstorm'
};


    return iconMapping[apiIcon] || 'sunny'; 
}

function determineGifCondition(apiIcon) {
    const gifMapping = {
        'clear-day': 'Sunny',
        'clear-night': 'Moon',
        'partly-cloudy-day': 'partly cloudy weather',
        'partly-cloudy-night': 'partly cloudy weather',
        'cloudy': 'Clouds',
        'rain': 'rainy weather',
        'snow': 'snowy weather',
        'wind': 'windy weather',
        'fog': 'foggy weather',
        'thunder': 'thunderstorm',
        'thunder-rain': 'thunderstorm',
        'thunder-showers': 'thunderstorm'
    };

    return gifMapping[apiIcon] || 'weather'; // Default to general weather if unknown
}

async function fetchGif(weatherCondition) {
    try {
        const response = await fetch(
            `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${weatherCondition}&limit=1`
        );
        const data = await response.json();
        return data.data[0]?.images?.original?.url || null;
    } catch (error) {
        console.error("Error fetching gif:", error);
        return null;
    }
}

export { fetchWeather };