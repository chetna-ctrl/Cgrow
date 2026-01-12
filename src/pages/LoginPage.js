import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LayoutDashboard, Lock, User, AlertCircle } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onLogin(data.session);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });
            if (error) throw error;
            alert('Signup successful! Check your email for confirmation.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* max-w-md laptop ke liye hai, lekin w-full mobile par screen cover karega */}
            <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden">

                {/* Header: Mobile par padding thodi kam ki hai */}
                <div className="p-6 sm:p-10 text-center border-b border-slate-700 bg-slate-800/50">
                    <div className="inline-flex p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 mb-4">
                        <LayoutDashboard size={40} className="md:w-12 md:h-12" />
                    </div>
                    {/* Mobile par text-3xl aur bade screen par text-4xl */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                        Agri OS Cloud
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base px-4">
                        Sign in to access your farm data
                    </p>
                </div>

                <div className="p-6 sm:p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-shake">
                            <AlertCircle size={20} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-slate-400 text-sm font-semibold mb-2 ml-1">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-600"
                                    placeholder="farmer@agrios.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 text-sm font-semibold mb-2 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white text-base focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 text-lg shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm md:text-base">
                            New here?{' '}
                            <button onClick={handleSignUp} className="text-emerald-400 hover:text-emerald-300 font-bold underline-offset-4 hover:underline">
                                Create an account
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
