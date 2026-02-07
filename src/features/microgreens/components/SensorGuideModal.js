import React from 'react';
import { X, Cpu, Droplets, Thermometer, Wind, Zap } from 'lucide-react';

const SensorGuideModal = ({ onClose }) => {
    const SENSORS = [
        {
            name: "DHT22 (Air Temp & Humidity)",
            icon: <Thermometer size={24} className="text-orange-500" />,
            why: "Mold Prevention (Mold se bachav)",
            desc: "Measures ROOM Climate, not soil. High humidity = Mold risk.",
            placement: "Hang 6-10 inches ABOVE the trays. Do not touch water.",
            pin: "GPIO 4",
            price: "₹250 - ₹350"
        },
        {
            name: "Capacitive Soil Moisture v1.2",
            icon: <Droplets size={24} className="text-blue-500" />,
            why: "Watering Timing (Kab paani dein)",
            desc: "Measures Cocopeat water level. Prevents over-watering.",
            placement: "Insert vertically into the Cocopeat (near roots). Keep the top electronic part DRY.",
            pin: "GPIO 34 (Analog)",
            price: "₹150 - ₹200"
        },
        {
            name: "Relay Module (5V)",
            icon: <Zap size={24} className="text-yellow-500" />,
            why: "Fan Control (Auto-Airflow)",
            desc: "Switch for 12V Fans. Turns ON when humidity > 70%.",
            placement: "Place inside a dry plastic box. Keep away from water spray.",
            pin: "GPIO 18",
            price: "₹80 - ₹120"
        }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500/20 p-2 rounded-xl">
                            <Cpu size={24} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white leading-tight">Microgreens Sensor Kit</h2>
                            <p className="text-slate-400 text-xs font-bold">Hardware Checklist</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {SENSORS.map((sensor, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 hover:shadow-lg transition-all group">
                            <div className="bg-white p-3 rounded-xl shadow-sm h-fit group-hover:scale-110 transition-transform">
                                {sensor.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-black text-slate-800 text-base md:text-lg mb-1 leading-snug">{sensor.name}</h3>
                                <div className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                                    Why: {sensor.why}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-1">
                                    {sensor.desc}
                                </p>
                                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg font-bold flex items-start gap-1 mb-2">
                                    <Wind size={12} className="flex-shrink-0 mt-0.5" /> <span>Place: {sensor.placement}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                                    <div className="text-xs text-slate-500 font-bold font-mono">
                                        PIN: {sensor.pin}
                                    </div>
                                    <div className="text-xs text-slate-500 font-bold">
                                        Est. Cost: <span className="text-slate-800">{sensor.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* ESP32 Note */}
                    <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-xl">
                        <p className="text-xs text-indigo-900 font-bold flex items-start gap-2">
                            <Cpu size={14} className="flex-shrink-0 mt-0.5" />
                            <span>Brain: Use "ESP32 DevKit V1" (WiFi + Bluetooth)</span>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-slate-50 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SensorGuideModal;
