import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, Cloud, Wind, Droplets, MapPin, Loader, CloudLightning, CloudSnow } from 'lucide-react';
import { fetchWeather } from '../../services/weatherService';

const WeatherPage = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchWeather();
                setWeather(data);
            } catch (err) {
                setError(true);
                // Fallback Mock Data
                setWeather({
                    current: { temp: 28, wind: 12, humidity: 45, condition: 'Clear' },
                    daily: [
                        { date: '2026-01-13', max: 30, min: 20, condition: 'Clear' },
                        { date: '2026-01-14', max: 29, min: 19, condition: 'Clouds' },
                        { date: '2026-01-15', max: 28, min: 18, condition: 'Rain' },
                        { date: '2026-01-16', max: 31, min: 21, condition: 'Clear' }
                    ]
                });
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getWeatherIcon = (condition, size = 24, className = "") => {
        switch (condition?.toLowerCase()) {
            case 'rain': return <CloudRain size={size} className={`text-blue-500 ${className}`} />;
            case 'clouds': return <Cloud size={size} className={`text-gray-400 ${className}`} />;
            case 'clear': return <Sun size={size} className={`text-yellow-500 ${className}`} />;
            case 'thunderstorm': return <CloudLightning size={size} className={`text-purple-500 ${className}`} />;
            case 'snow': return <CloudSnow size={size} className={`text-cyan-200 ${className}`} />;
            default: return <Sun size={size} className={`text-yellow-500 ${className}`} />;
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
            <Loader className="animate-spin text-emerald-500 mb-4" size={48} />
            <p className="text-slate-400 font-medium animate-pulse">Contacting Weather Satellites...</p>
        </div>
    );

    const { current, daily } = weather;

    return (
        <div className="flex flex-col gap-10">
            <h1 className="text-4xl font-bold flex items-center gap-3 text-slate-900">
                <MapPin className="text-red-600 fill-red-100" size={40} /> Delhi, India
            </h1>

            {/* MAIN WEATHER BOX */}
            <div className={`box-panel flex flex-col md:flex-row justify-between items-center relative overflow-hidden transition-colors duration-500 shadow-sm border
                ${current.condition === 'Clear' ? 'bg-amber-50 border-amber-200' :
                    current.condition === 'Rain' ? 'bg-blue-50 border-blue-200' :
                        'bg-slate-50 border-slate-200'}`}>

                <div className="relative z-10">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
                        ${current.condition === 'Clear' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
                        Current Conditions
                    </span>
                    <div className="text-9xl font-bold text-slate-900 mt-4 mb-2">{current.temp}°</div>
                    <p className="text-2xl font-medium flex items-center gap-6 text-slate-700">
                        <span className="flex items-center gap-2"><Wind size={24} /> {current.wind} km/h</span>
                        <span className="opacity-30">|</span>
                        <span className="flex items-center gap-2"><Droplets size={24} /> {current.humidity}% Humidity</span>
                    </p>
                    <p className="text-lg text-slate-600 mt-2 capitalize font-bold">{current.condition}</p>
                </div>

                <div className="relative z-10 drop-shadow-2xl animate-float">
                    {getWeatherIcon(current.condition, 180)}
                </div>

                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            </div>

            {/* FORECAST SLIDER */}
            <div>
                <h3 className="text-2xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                    Forecast <span className="text-sm font-normal text-slate-500">(Next 5 Days)</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {daily.map((day, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                            <p className="text-slate-600 font-bold mb-4 text-sm uppercase tracking-wider">
                                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </p>
                            <div className="mb-4 bg-slate-50 p-3 rounded-full">
                                {getWeatherIcon(day.condition, 32)}
                            </div>
                            <div className="flex gap-3 text-xl font-bold items-end">
                                <span className="text-slate-900">{day.max}°</span>
                                <span className="text-slate-400 text-base">{day.min}°</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 font-medium capitalize">{day.condition}</p>
                        </div>
                    ))}
                </div>
            </div>

            {error && (
                <div className="text-center p-4 bg-amber-50 text-amber-600 rounded-lg text-sm border border-amber-100">
                    Using offline data (API Limit or Network Error)
                </div>
            )}
        </div>
    );
};

export default WeatherPage;
