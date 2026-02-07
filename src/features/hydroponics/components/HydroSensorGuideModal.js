import React from 'react';
import { X, Cpu, Activity, Thermometer, Zap, Droplets } from 'lucide-react';

const HydroSensorGuideModal = ({ onClose }) => {
    const SENSORS = [
        {
            name: "Analog pH Sensor Kit",
            icon: <Activity size={24} className="text-rose-500" />,
            why: "Nutrient Lockout (Khaana blocked)",
            desc: "Plants can only 'eat' nutrients when pH is 5.5 - 6.5. If pH is wrong, plants starve even if tank is full of food.",
            pin: "GPIO 36 (VP) - Analog",
            price: "₹800 - ₹1200"
        },
        {
            name: "TDS / EC Sensor (Gravity)",
            icon: <Zap size={24} className="text-yellow-500" />,
            why: "Food Strength (Khaad ki taqat)",
            desc: "Measures concentration of nutrients. Low (600ppm) = Starving. High (1200ppm+) = Burning.",
            pin: "GPIO 39 (VN) - Analog",
            price: "₹600 - ₹900"
        },
        {
            name: "DS18B20 (Waterproof Temp)",
            icon: <Thermometer size={24} className="text-cyan-500" />,
            why: "Root Rot (Jad sadna)",
            desc: "Warm water (>25°C) holds less Oxygen. Low oxygen = Root Rot (Pythium). Keep water cool!",
            pin: "GPIO 4 (Digital)",
            price: "₹150 - ₹200"
        }
    ];

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-slate-900 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/20 p-2 rounded-xl">
                            <Cpu size={24} className="text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-black text-white leading-tight">Hydroponics Sensor Kit</h2>
                            <p className="text-slate-400 text-xs font-bold">Water Intelligence Hardware</p>
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
                                <div className="inline-block bg-cyan-100 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-md mb-2">
                                    Why: {sensor.why}
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed mb-3">
                                    {sensor.desc}
                                </p>
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

                    {/* Logic Tip */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                        <p className="text-xs text-blue-900 font-bold flex items-start gap-2">
                            <Droplets size={14} className="flex-shrink-0 mt-0.5" />
                            <span>Tip: Calibrate pH and TDS sensors once a month for accuracy.</span>
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

export default HydroSensorGuideModal;
