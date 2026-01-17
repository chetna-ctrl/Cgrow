// MIGRATION: Switched to Open-Meteo (Free, No Key)
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Helper: Map WMO Weather Codes to Conditions
const getWeatherCondition = (code) => {
    if (code === 0) return 'Clear';
    if (code >= 1 && code <= 3) return 'Clouds';
    if (code >= 45 && code <= 48) return 'Fog';
    if (code >= 51 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow';
    if (code >= 80 && code <= 82) return 'Rain';
    if (code >= 85 && code <= 86) return 'Snow';
    if (code >= 95 && code <= 99) return 'Thunderstorm';
    return 'Clear';
};

export const fetchWeather = async (lat = 28.61, lon = 77.20) => {
    try {
        // Fetch Current + Daily Forecast + Solar Data
        const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,shortwave_radiation&daily=weather_code,temperature_2m_max,temperature_2m_min,shortwave_radiation_sum&timezone=auto`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Open-Meteo API Failed');
        const data = await res.json();

        const current = data.current;
        const daily = data.daily;

        return {
            current: {
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                wind: Math.round(current.wind_speed_10m),
                solar: current.shortwave_radiation, // W/m²
                condition: getWeatherCondition(current.weather_code),
                icon: 'default'
            },
            daily: daily.time.slice(0, 7).map((date, index) => ({
                date: date,
                min: Math.round(daily.temperature_2m_min[index]),
                max: Math.round(daily.temperature_2m_max[index]),
                solar_sum: daily.shortwave_radiation_sum[index], // MJ/m²
                condition: getWeatherCondition(daily.weather_code[index])
            }))
        };
    } catch (error) {
        console.error("Weather Service Error:", error);
        throw error;
    }
};

// Agricultural Data (Open-Meteo: No Key Needed)
// Fetches Soil Moisture, EVT, and Soil Temp
export const fetchAgriStats = async (lat = 28.61, lon = 77.20) => {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=soil_moisture_3_9cm,soil_temperature_6cm,evapotranspiration,vapor_pressure_deficit&timezone=auto&forecast_days=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Agri API Failed');
        const data = await res.json();

        const currentHour = new Date().getHours();
        return {
            soilMoisture: data.hourly.soil_moisture_3_9cm[currentHour],
            soilTemp: data.hourly.soil_temperature_6cm[currentHour],
            evapotranspiration: data.hourly.evapotranspiration[currentHour],
            vpd: data.hourly.vapor_pressure_deficit[currentHour] // kPa (Vapor Pressure Deficit)
        };
    } catch (error) {
        console.error("Agri Service Error:", error);
        return { soilMoisture: 0.25, soilTemp: 24, evapotranspiration: 0.4, vpd: 0.8 };
    }
};
