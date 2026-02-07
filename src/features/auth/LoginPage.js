import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Sprout, Mail, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    // This creates: http://localhost:3000/dashboard OR http://192.168.x.x:3000/dashboard
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Logo with Back Button */}
                <div className="text-center mb-10">
                    <div className="flex flex-col items-center justify-center gap-4 mb-6">
                        <Link to="/" className="flex flex-col items-center gap-3 hover:opacity-90 transition-opacity">
                            <div className="w-24 h-24 bg-white rounded-3xl p-3 shadow-2xl shadow-emerald-500/10 border border-emerald-500/20">
                                <img src="/logo_cgro.png" alt="cGrow" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter">cGrow</h1>
                        </Link>
                    </div>
                    <p className="text-slate-400 font-medium tracking-tight px-4 underline decoration-emerald-500/30 underline-offset-4">
                        Conscious Growth & Research Operations
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 mt-6 font-bold uppercase tracking-widest"
                    >
                        ← Return to Operations
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle size={20} />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* Google Sign-In Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full bg-white hover:bg-gray-50 text-slate-700 font-semibold py-3 px-4 rounded-lg border-2 border-slate-300 flex items-center justify-center gap-3 mb-4 transition-all disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        {loading ? 'Signing in...' : 'Continue with Google'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Or continue with email</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                        >
                            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-emerald-600 hover:text-emerald-500 font-medium text-sm"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-sm mb-2">Trouble verifying?</p>
                    <button
                        onClick={async () => {
                            try {
                                alert('Testing connection to Supabase...');
                                const start = Date.now();
                                // Race between Fetch and 10s Timeout
                                const { data, error } = await Promise.race([
                                    supabase.from('iot_devices').select('count', { count: 'exact', head: true }),
                                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: Server did not respond in 10s')), 10000))
                                ]);
                                const end = Date.now();

                                if (error) {
                                    alert(`❌ Error: ${error.message} (Code: ${error.code})`);
                                } else {
                                    alert(`✅ Connected! Ping: ${end - start}ms. Database is accessible.`);
                                }
                            } catch (err) {
                                alert(`❌ Network Failure: ${err.message}. Check WiFi/Data.`);
                            }
                        }}
                        className="text-xs text-slate-400 hover:text-emerald-500 underline font-mono"
                    >
                        [Run Network Diagnostic]
                    </button>
                    <p className="text-[10px] text-slate-300 mt-2">v1.1 Mobile Debugger</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
