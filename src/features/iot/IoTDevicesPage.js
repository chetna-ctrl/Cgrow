import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import { Wifi, WifiOff, Battery, Settings, Trash2, Plus, RefreshCw, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const IoTDevicesPage = () => {
    const [showAddDevice, setShowAddDevice] = useState(false);
    const queryClient = useQueryClient();

    // Fetch user's IoT devices
    const { data: devices = [], isLoading, error } = useQuery({
        queryKey: ['iot_devices'],
        queryFn: async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];

                const { data, error } = await supabase
                    .from('iot_devices')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                // If table doesn't exist, return empty array (graceful degradation)
                if (error) {
                    if (error.code === '42P01') {
                        console.warn('iot_devices table not found - run iot_hybrid_setup.sql');
                    } else {
                        console.error('Error fetching IoT devices:', error);
                    }
                    return [];
                }

                return data || [];
            } catch (err) {
                console.error('Unexpected error in IoT devices query:', err);
                return [];
            }
        },
        // Don't retry on errors, prevent infinite loops
        retry: false,
        // Cache for 5 minutes to reduce queries
        staleTime: 5 * 60 * 1000
    });

    // Fetch batches and targets for assignment
    const { data: batches = [] } = useQuery({
        queryKey: ['batches'],
        queryFn: async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];

                const { data, error } = await supabase
                    .from('batches')
                    .select('*')
                    .eq('user_id', user.id)
                    .neq('status', 'Harvested');

                if (error) {
                    console.error('Error fetching batches:', error);
                    return [];
                }

                return data || [];
            } catch (err) {
                console.error('Unexpected error in batches query:', err);
                return [];
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000
    });

    const { data: systems = [] } = useQuery({
        queryKey: ['systems'],
        queryFn: async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];

                const { data, error } = await supabase
                    .from('systems')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching systems:', error);
                    return [];
                }

                return data || [];
            } catch (err) {
                console.error('Unexpected error in systems query:', err);
                return [];
            }
        },
        retry: false,
        staleTime: 5 * 60 * 1000
    });

    // Delete device mutation
    const deleteDevice = useMutation({
        mutationFn: async (deviceId) => {
            const { error } = await supabase
                .from('iot_devices')
                .delete()
                .eq('id', deviceId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['iot_devices']);
        }
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'text-green-600 bg-green-50';
            case 'offline': return 'text-slate-400 bg-slate-50';
            case 'error': return 'text-red-600 bg-red-50';
            default: return 'text-slate-400 bg-slate-50';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'online': return <Wifi size={16} />;
            case 'offline': return <WifiOff size={16} />;
            case 'error': return <AlertCircle size={16} />;
            default: return <WifiOff size={16} />;
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Never';
        const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-emerald-600" size={48} />
                    <p className="text-slate-600 font-medium">Loading IoT devices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <Zap className="text-emerald-600" size={32} />
                        IoT Devices
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Manage your sensor kits and monitor live data
                    </p>
                </div>

                <button
                    onClick={() => setShowAddDevice(true)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                    <Plus size={20} />
                    Add Device
                </button>
            </div>

            {/* No Devices State */}
            {devices.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap className="text-emerald-600" size={48} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-3">No IoT Devices Yet</h2>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Connect your cGrow sensor kit to start receiving automatic sensor data.
                        Your dashboard works perfectly with manual logging too!
                    </p>
                    <button
                        onClick={() => setShowAddDevice(true)}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Register Your First Device
                    </button>
                </div>
            )}

            {/* Devices Grid */}
            {devices.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {devices.map((device) => (
                        <div
                            key={device.id}
                            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl hover:shadow-2xl transition-all"
                        >
                            {/* Device Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-800 mb-1">
                                        {device.device_name || device.device_id}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-mono">
                                        {device.device_id}
                                    </p>
                                </div>

                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${getStatusColor(device.status)}`}>
                                    {getStatusIcon(device.status)}
                                    {device.status}
                                </div>
                            </div>

                            {/* Last Seen */}
                            <div className="bg-slate-50 rounded-xl p-3 mb-4">
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                                    Last Seen
                                </p>
                                <p className="text-sm font-bold text-slate-700">
                                    {getTimeAgo(device.last_seen)}
                                </p>
                            </div>

                            {/* Assignment */}
                            {(device.batch_id || device.target_id) && (
                                <div className="bg-emerald-50 rounded-xl p-3 mb-4 border border-emerald-100">
                                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-1">
                                        Monitoring
                                    </p>
                                    <p className="text-sm font-bold text-emerald-900">
                                        {device.batch_id
                                            ? batches.find(b => b.id === device.batch_id)?.crop || 'Microgreens Batch'
                                            : systems.find(s => s.id === device.target_id)?.name || 'Hydroponics System'
                                        }
                                    </p>
                                </div>
                            )}

                            {/* Battery & Firmware */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {device.battery_level && (
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Battery size={14} className="text-slate-500" />
                                            <p className="text-xs text-slate-500 font-bold">Battery</p>
                                        </div>
                                        <p className="text-lg font-black text-slate-700">
                                            {Math.round(device.battery_level)}%
                                        </p>
                                    </div>
                                )}

                                {device.firmware_version && (
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 font-bold mb-1">Firmware</p>
                                        <p className="text-sm font-bold text-slate-700">
                                            {device.firmware_version}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
                                >
                                    <Settings size={16} />
                                    Configure
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this device? This cannot be undone.')) {
                                            deleteDevice.mutate(device.id);
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-red-100 transition-all text-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Device Modal (Placeholder) */}
            {showAddDevice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h2 className="text-2xl font-black text-slate-800 mb-4">Add IoT Device</h2>
                        <p className="text-slate-600 mb-6">
                            Device registration wizard coming soon! For now, devices will auto-register when they send their first data.
                        </p>
                        <button
                            onClick={() => setShowAddDevice(false)}
                            className="w-full bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IoTDevicesPage;
