import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Thermometer, Droplets, Activity, Cpu, Link as LinkIcon, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

/**
 * Isolated Arduino Serial Monitor for Testing purposes.
 * This component uses the Web Serial API to read data directly from an Arduino COM port.
 * It is detached from the main dashboard logic to allow safe hardware debugging.
 */

const AgriSerialDashboard = () => {
    const [data, setData] = useState({ temp: 0, humidity: 0, soil_percent: 0, soil_raw: 0 });
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    const connectSerial = async () => {
        setError(null);
        try {
            // 1. Request port access
            if (!("serial" in navigator)) {
                throw new Error("Web Serial API not supported in this browser. Use Chrome or Edge.");
            }

            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            setIsConnected(true);

            const decoder = new TextDecoderStream();
            port.readable.pipeTo(decoder.writable);
            const inputStream = decoder.readable;
            const reader = inputStream.getReader();

            let buffer = "";

            // 2. Continuous Loop to read data
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += value;

                if (buffer.includes('\n')) {
                    const lines = buffer.split('\n');
                    buffer = lines.pop();

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (trimmed) {
                            try {
                                const parsed = JSON.parse(trimmed);
                                setData(prev => ({ ...prev, ...parsed }));

                                // 3. Sync to Supabase (Target table: sensor_data)
                                await syncToSupabase(parsed);
                            } catch (e) {
                                console.warn("Partial JSON or Chunk received:", trimmed);
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Serial Connection Failed:", error);
            setError(error.message);
            setIsConnected(false);
        }
    };

    const syncToSupabase = async (payload) => {
        try {
            const { error } = await supabase
                .from('sensor_data')
                .insert([{
                    ...payload,
                    created_at: new Date().toISOString()
                }]);
            if (error) console.error("Supabase error:", error);
        } catch (e) {
            console.error("Sync failed:", e);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <header className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                        <Cpu className="text-emerald-500" /> Isolated Arduino Hub
                    </h1>
                    <p className="text-slate-500 text-sm">Standalone hardware testing & debugging module</p>
                </div>
                {!isConnected ? (
                    <Button onClick={connectSerial} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                        <LinkIcon size={18} /> Connect Arduino (COM)
                    </Button>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm animate-pulse">
                        <Activity size={16} /> Device Online (9600 baud)
                    </div>
                )}
            </header>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span className="font-semibold text-sm">{error}</span>
                </div>
            )}

            {!isConnected && !error && (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl">
                    <h3 className="font-black text-blue-900 mb-2 uppercase text-xs tracking-widest">Setup Guide</h3>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                        <li>Plug your Arduino via USB.</li>
                        <li>Click "Connect" and select the correct port.</li>
                        <li>Dashboard will start listening for JSON data automatically.</li>
                        <li>Data is synced to <code className="bg-white/50 px-1 rounded">sensor_data</code> table in Supabase.</li>
                    </ol>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DataCard
                    icon={<Thermometer className="text-orange-500" />}
                    label="Temperature"
                    value={data.temp || '0'}
                    unit="°C"
                    color="orange"
                />
                <DataCard
                    icon={<Droplets className="text-blue-500" />}
                    label="Air Humidity"
                    value={data.humidity || '0'}
                    unit="%"
                    color="blue"
                />
                <DataCard
                    icon={<Activity className="text-emerald-500" />}
                    label="Soil Moisture"
                    value={data.soil_percent || '0'}
                    unit="%"
                    color="emerald"
                />
            </div>

            <Card className="bg-slate-900 border-none text-slate-300">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Serial Raw Output</h3>
                <div className="font-mono text-sm overflow-auto max-h-40 bg-black/30 p-4 rounded-xl">
                    {JSON.stringify(data, null, 2)}
                </div>
            </Card>
        </div>
    );
};

const DataCard = ({ icon, label, value, unit, color }) => (
    <div className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 bg-${color}-50 rounded-xl`}>{icon}</div>
            <span className="text-slate-500 font-bold text-sm uppercase tracking-tight">{label}</span>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-slate-800">{value}</span>
            <span className="text-slate-400 font-bold">{unit}</span>
        </div>
    </div>
);

export default AgriSerialDashboard;
