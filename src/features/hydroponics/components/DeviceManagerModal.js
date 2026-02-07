
import React, { useState } from 'react';
import { X, Cpu, Wifi, ShieldCheck, Zap, AlertCircle } from 'lucide-react';

const DeviceManagerModal = ({ isOpen, onClose }) => {
    const [deviceId, setDeviceId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Scanning, 3: Success

    const handleConnect = (e) => {
        e.preventDefault();
        setIsConnecting(true);
        // Simulate IoT handshake
        setTimeout(() => {
            setStep(2);
            setTimeout(() => {
                setStep(3);
                setIsConnecting(false);
            }, 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                {/* Decorative BG */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-emerald-500 to-indigo-500" />

                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-xl">
                            <Cpu size={24} className="text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">IoT Provisioning</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link Physical Hardware</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {step === 1 && (
                    <form onSubmit={handleConnect} className="space-y-6">
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3 items-start">
                            <Wifi size={18} className="text-blue-600 mt-1" />
                            <p className="text-xs text-blue-700 leading-relaxed font-medium">
                                Enter the 12-digit <strong>Device Secret Key</strong> found on your ESP32 module sticker to start the secure encryption handshake.
                            </p>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest pl-1">Unique Device ID / API KEY</label>
                            <input
                                required
                                value={deviceId}
                                onChange={e => setDeviceId(e.target.value.toUpperCase())}
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-mono text-lg tracking-widest focus:border-cyan-500 outline-none transition-all placeholder:text-slate-200"
                                placeholder="AGRI-XXXX-XXXX"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isConnecting}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            {isConnecting ? 'Handshaking...' : 'Scan for Devices'}
                            <Zap size={16} className={isConnecting ? 'animate-bounce' : ''} />
                        </button>

                        <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Don't have the hardware yet?
                                <br />
                                <span className="text-emerald-500">Check "Hardware Kit" in Farming Guide</span>
                            </p>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    <div className="py-12 flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-cyan-100 rounded-full animate-ping absolute inset-0" />
                            <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin relative flex items-center justify-center">
                                <Wifi size={32} className="text-cyan-500" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="font-black text-slate-800 uppercase text-lg">Scanning BLE Mesh...</h3>
                            <p className="text-xs text-slate-400 font-bold mt-1">Attempting secure tunnel via ESP-NOW</p>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="py-8 flex flex-col items-center gap-6 animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100">
                            <ShieldCheck size={40} className="text-emerald-600" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-black text-slate-800 uppercase text-lg tracking-tight">Access Granted</h3>
                            <p className="text-xs text-slate-500 font-medium max-w-[200px] mx-auto mt-2">
                                Device <strong>{deviceId}</strong> is now encrypted and linked to your operations center.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition shadow-lg shadow-emerald-100"
                        >
                            Finish Setup
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceManagerModal;
