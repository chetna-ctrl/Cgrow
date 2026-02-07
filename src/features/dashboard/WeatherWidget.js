import React from 'react';
import { Sun, CloudRain, Droplets, Cloud } from 'lucide-react';

const WeatherWidget = ({ weather }) => {
    // weather: { temp, humidity, rain, solar }

    // Determine Icon
    let Icon = Sun;
    let label = 'Sunny';
    let iconColor = 'text-yellow-300';

    if (weather.rain > 0) {
        Icon = CloudRain;
        label = 'Rainy';
        iconColor = 'text-blue-200';
    }
    else if (weather.solar < 200) {
        Icon = Cloud;
        label = 'Cloudy';
        iconColor = 'text-gray-200';
    }

    if (weather.temp === null || weather.temp === undefined) {
        return (
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white h-full flex items-center justify-center shadow-sm border border-blue-400">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs uppercase tracking-wider font-bold text-blue-100">Syncing Weather...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white h-full flex flex-col justify-between shadow-sm border border-blue-400">
            <h3 className="font-bold text-blue-100 uppercase text-xs tracking-wider flex items-center justify-between">
                <span>{weather.isIoT ? "IoT Environment" : "Local Weather"}</span>
                {weather.isIoT ? (
                    <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] animate-pulse font-black">LIVE SENSOR</span>
                ) : (
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Real-time</span>
                )}
            </h3>

            <div className="flex items-center justify-between my-2">
                <div className="text-left">
                    <p className="text-4xl font-black tracking-tight">{Math.round(weather.temp)}°C</p>
                    <p className="text-sm text-blue-100 font-medium">{weather.isIoT ? "Direct Reading" : label}</p>
                </div>
                {weather.isIoT ? (
                    <div className="flex flex-col items-center">
                        <Icon size={48} className={`${iconColor} drop-shadow-lg`} />
                        {weather.liveDli && (
                            <div className="mt-1 px-2 py-0.5 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-lg shadow-sm">
                                {weather.liveDli} DLI
                            </div>
                        )}
                    </div>
                ) : (
                    <Icon size={48} className={`${iconColor} animate-pulse-slow drop-shadow-lg`} />
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 mt-auto text-xs font-medium">
                <div className="bg-blue-800/30 rounded-lg p-2 flex items-center gap-2">
                    <Droplets size={14} className="text-blue-200" />
                    <span>Hum: {Math.round(weather.humidity)}%</span>
                </div>
                <div className="bg-blue-800/30 rounded-lg p-2 flex items-center gap-2">
                    {weather.isIoT ? (
                        <>
                            <Sun size={14} className="text-yellow-200" />
                            <span>Lux: {Math.round(weather.lux)}</span>
                        </>
                    ) : (
                        <>
                            <Sun size={14} className="text-yellow-200" />
                            <span>Solar: {weather.solar}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
