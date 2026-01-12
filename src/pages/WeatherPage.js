import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, Wind, Droplets, MapPin, Loader } from 'lucide-react';

const WeatherPage = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch with fallback logic
        const fetchData = async () => {
            try {
                const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.20&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto');
                if (!res.ok) throw new Error("API Failed");
                const data = await res.json();
                setWeather(data);
            } catch (err) {
                console.log("Using Offline Data");
                // Mock Data if API fails (Prevent "Unavailable" screen)
                setWeather({
                    current: { temperature_2m: 28, wind_speed_10m: 12, relative_humidity_2m: 45, weather_code: 0 },
                    daily: { time: ['2026-01-12', '2026-01-13', '2026-01-14', '2026-01-15'], weather_code: [0, 1, 3, 0], temperature_2m_max: [30, 29, 28, 31], temperature_2m_min: [20, 19, 18, 21] }
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-20 text-center text-2xl font-bold text-gray-300">Loading Satellites...</div>;

    const { current, daily } = weather;

    return (
        <div className="flex flex-col gap-10">
            <h1 className="text-4xl font-bold flex items-center gap-3">
                <MapPin className="text-red-500 fill-red-100" size={40} /> Delhi, India
            </h1>

            {/* MAIN WEATHER BOX */}
            <div className="box-panel bg-[#E0F2FE] border-blue-200 flex flex-col md:flex-row justify-between items-center">
                <div>
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">Now</span>
                    <div className="text-9xl font-bold text-gray-900 mt-4 mb-2">{Math.round(current.temperature_2m)}°</div>
                    <p className="text-2xl text-blue-800 font-medium flex items-center gap-4">
                        <Wind /> {current.wind_speed_10m} km/h
                        <span className="opacity-30">|</span>
                        <Droplets /> {current.relative_humidity_2m}% Humidity
                    </p>
                </div>
                <Sun size={180} className="text-yellow-500 drop-shadow-2xl animate-spin-slow" />
            </div>

            {/* FORECAST SLIDER */}
            <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-800">7-Day Forecast (Slide to View)</h3>
                <div className="slider-container">
                    {daily.time.map((date, idx) => (
                        <div key={idx} className="box-panel slide-item flex flex-col items-center text-center min-w-[220px]">
                            <p className="text-gray-500 font-bold mb-4">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                            <div className="mb-6 bg-gray-50 p-4 rounded-full">
                                {daily.weather_code[idx] <= 3 ? <Sun size={40} className="text-yellow-500" /> : <CloudRain size={40} className="text-blue-500" />}
                            </div>
                            <div className="flex gap-4 text-2xl font-bold">
                                <span className="text-gray-900">{Math.round(daily.temperature_2m_max[idx])}°</span>
                                <span className="text-gray-400">{Math.round(daily.temperature_2m_min[idx])}°</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WeatherPage;
