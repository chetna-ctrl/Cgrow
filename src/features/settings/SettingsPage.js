import React, { useState, useEffect } from 'react';
import { User, Shield, Save, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const SettingsPage = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userSession, setUserSession] = useState(null);
    const [saved, setSaved] = useState(false);

    // Default State
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        farm_name: '',
        push_notifications: true,
        data_sync: true
    });

    // 1. Fetch Data on Load
    useEffect(() => {
        const getProfile = async () => {
            setLoading(true);

            // Get Current User
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUserSession(user);

                // Fetch Settings from DB
                const { data } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                } else {
                    // If no settings exist yet, pre-fill email from login
                    setProfile(prev => ({ ...prev, email: user.email }));
                }
            }
            setLoading(false);
        };

        getProfile();
    }, []);

    // 2. Save Data to Supabase
    const handleSave = async () => {
        if (!userSession) return alert('You must be logged in to save settings.');

        setSaving(true);

        const updates = {
            user_id: userSession.id, // Critical: Links data to the user
            full_name: profile.full_name,
            email: profile.email,
            farm_name: profile.farm_name,
            push_notifications: profile.push_notifications,
            data_sync: profile.data_sync,
            updated_at: new Date()
        };

        const { error } = await supabase
            .from('user_settings')
            .upsert(updates);

        if (error) {
            alert('Error saving settings: ' + error.message);
        } else {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
        setSaving(false);
    };

    if (loading) return <div className="p-10 text-white">Loading Settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                {saved && <span className="text-emerald-500 font-semibold animate-pulse">Settings Saved!</span>}
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <User size={20} className="text-emerald-500" /> Profile
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-slate-600 text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={profile.full_name || ''}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="e.g. Simranjeet Singh"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-600 text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                value={profile.email || ''}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="farm@example.com"
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-slate-600 text-sm font-medium mb-2">Farm Name</label>
                            <input
                                type="text"
                                value={profile.farm_name || ''}
                                onChange={(e) => setProfile({ ...profile, farm_name: e.target.value })}
                                className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 rounded-lg p-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                                placeholder="e.g. Green Valley Acres"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="border-b border-slate-100 pb-4 mb-6">
                        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <Shield size={20} className="text-emerald-500" /> Preferences
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-slate-900 font-medium">Push Notifications</h4>
                                <p className="text-slate-500 text-sm mt-1">Receive alerts for severe weather and irrigation.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={profile.push_notifications}
                                    onChange={(e) => setProfile({ ...profile, push_notifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>

                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-slate-900 font-medium">Data Synchronization</h4>
                                <p className="text-slate-500 text-sm mt-1">Automatically sync data when online.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={profile.data_sync}
                                    onChange={(e) => setProfile({ ...profile, data_sync: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                        </div>
                    </div>

                    <div className="mt-8 text-right">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2 inline-flex disabled:opacity-50"
                        >
                            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
