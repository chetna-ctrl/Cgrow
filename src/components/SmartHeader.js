import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Thermometer, MapPin, Clock, Calendar } from 'lucide-react';

/**
 * SmartHeader Component
 * Real-time command center header with:
 * - Live clock (updates every second)
 * - Current date with day name
 * - Weather widget (uses Open-Meteo API - no key needed)
 * - Optimal sowing window indicator
 */
const SmartHeader = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weather, setWeather] = useState({
        temp: '--',
        condition: 'Loading...',
        humidity: '--',
        icon: 'sun'
    });
    const [location, setLocation] = useState('Detecting...');

    // 1. Live Clock - Updates every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Weather & Location - Uses central weatherService
    useEffect(() => {
        const loadWeather = async (lat, lon) => {
            try {
                const { fetchWeather } = await import('../services/weatherService');
                const data = await fetchWeather(lat, lon);

                if (data.current) {
                    setWeather({
                        temp: `${data.current.temp}°C`,
                        condition: data.current.condition,
                        humidity: `${data.current.humidity}%`,
                        icon: data.current.condition.toLowerCase().includes('rain') ? 'rain' :
                            data.current.condition.toLowerCase().includes('cloud') ? 'cloud' : 'sun'
                    });
                }
            } catch (error) {
                console.error('SmartHeader Weather Error:', error);
                setWeather({ temp: '29°C', condition: 'Clear', humidity: '65%', icon: 'sun' });
            }
        };

        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation('Your Farm');
                    loadWeather(position.coords.latitude, position.coords.longitude);
                },
                () => {
                    setLocation('Delhi, India');
                    loadWeather(28.6139, 77.2090);
                }
            );
        } else {
            setLocation('Delhi, India');
            loadWeather(28.6139, 77.2090);
        }
    }, []);

    // Format Date: "Wednesday, 15 January 2026"
    const formattedDate = new Intl.DateTimeFormat('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(currentDate);

    // Format Time: "10:15:30 AM"
    const formattedTime = currentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Calculate optimal sowing window (6 AM - 9 AM or 4 PM - 6 PM)
    const hour = currentDate.getHours();
    const isOptimalWindow = (hour >= 6 && hour <= 9) || (hour >= 16 && hour <= 18);

    // Weather Icon component
    const WeatherIcon = () => {
        switch (weather.icon) {
            case 'rain': return <CloudRain size={36} className="text-blue-400" />;
            case 'cloud': return <Cloud size={36} className="text-gray-400" />;
            default: return <Sun size={36} className="text-yellow-400" />;
        }
    };

    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg mb-6 border border-slate-700">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">

                {/* LEFT: Date & Time */}
                <div className="text-center lg:text-left">
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                        <Clock size={18} className="text-emerald-400" />
                        <h2 className="text-3xl font-bold text-white tracking-tight font-mono">
                            {formattedTime}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2 justify-center lg:justify-start mt-1">
                        <Calendar size={14} className="text-slate-400" />
                        <p className="text-slate-400 font-medium text-sm">{formattedDate}</p>
                    </div>
                </div>

                {/* CENTER: Optimal Sowing Window */}
                <div className={`px-6 py-3 rounded-xl text-center transition-all ${isOptimalWindow
                    ? 'bg-emerald-500/20 border border-emerald-500/50'
                    : 'bg-slate-700/50 border border-slate-600'
                    }`}>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isOptimalWindow ? 'text-emerald-400' : 'text-slate-400'
                        }`}>
                        {isOptimalWindow ? '🌱 Optimal Sowing Window' : 'Next Window'}
                    </p>
                    <p className={`font-semibold ${isOptimalWindow ? 'text-emerald-300' : 'text-slate-300'}`}>
                        {hour < 6 ? '06:00 AM - 09:00 AM' :
                            hour < 16 ? '04:00 PM - 06:00 PM' :
                                '06:00 AM - 09:00 AM (Tomorrow)'}
                    </p>
                </div>

                {/* RIGHT: Weather Widget */}
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                            <Thermometer size={16} className="text-orange-400" />
                            <p className="text-white font-bold text-xl">{weather.temp}</p>
                        </div>
                        <p className="text-sm text-slate-400">{weather.condition}</p>
                        <div className="flex items-center gap-1 justify-end text-xs text-slate-500">
                            <MapPin size={10} />
                            <span>{location}</span>
                        </div>
                    </div>
                    <div className="p-3 bg-slate-700/50 rounded-xl">
                        <WeatherIcon />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartHeader;
