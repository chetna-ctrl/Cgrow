import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowRight, CheckCircle, BarChart3, Droplets, Leaf } from 'lucide-react';

const LandingPage = () => {

    return (

        <div className="min-h-screen bg-slate-50 relative">

            {/* Content overlay */}
            <div className="relative z-10 min-h-screen">
                {/* Header with Login Link */}
                <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-white rounded-2xl p-2 shadow-xl border-2 border-emerald-500/20">
                                <img src="/logo_cgro.png" alt="cGrow Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-5xl font-black text-slate-900 tracking-tighter">cGrow</span>
                        </div>
                        <Link
                            to="/login"
                            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            Sign In
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </header>

                {/* Hero Section */}
                <div className="pt-40 pb-20 px-6 bg-white relative overflow-hidden">
                    {/* Background Logo Watermark */}
                    <div className="absolute -top-10 -right-20 w-[600px] h-[600px] opacity-[0.03] pointer-events-none rotate-12 z-0">
                        <img src="/logo_cgro.png" alt="" className="w-full h-full object-contain" />
                    </div>

                    <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50/50 -mr-32 -skew-x-12"></div>
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="max-w-3xl">
                            <h1 className="text-7xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-8">
                                Conscious Growth.
                                <span className="block text-emerald-600">Smartly Automated.</span>
                            </h1>
                            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                                The OS for Microgreens & Hydroponics.
                                <span className="block mt-2 text-slate-700 font-black tracking-tight">Log manually today. <span className="text-emerald-600">Automate with IoT</span> tomorrow.</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-emerald-500/30 transition-all hover:scale-105"
                                >
                                    Launch Your Farm Free
                                    <ArrowRight size={24} />
                                </Link>
                                <span className="py-5 px-4 text-slate-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                    <CheckCircle size={16} className="text-emerald-500" /> No Hardware Needed
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto px-6 pb-20">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Sprout size={32} />}
                            title="Hybrid Tracking"
                            description="Log data manually via our app, or connect IoT sensors for 24/7 automation."
                        />
                        <FeatureCard
                            icon={<Droplets size={32} />}
                            title="Crop Intelligence"
                            description="Track pH, EC, and climate. Get AI-driven advice for Microgreens & Hydroponics."
                        />
                        <FeatureCard
                            icon={<BarChart3 size={32} />}
                            title="Business Growth"
                            description="Revenue forecasting, yield prediction, and ROI calculators built-in."
                        />
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-white py-20 px-6">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-4xl font-black text-slate-900 text-center mb-12 tracking-tight">
                            Why Researchers & Growers Choose cGrow
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Benefit text="Zero setup cost (Manual Mode)" />
                            <Benefit text="WiFi Manager for 1-click IoT setup" />
                            <Benefit text="Real-time harvest readiness alerts" />
                            <Benefit text="Market price intelligence" />
                            <Benefit text="Commercial-grade security (RLS)" />
                            <Benefit text="Works offline with USB Bridge" />
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-black text-white mb-6 tracking-tight">
                            Grow Smarter, Not Harder.
                        </h2>
                        <p className="text-xl text-emerald-100 mb-8 font-medium">
                            Join the future of conscious agriculture. No credit card required.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all"
                        >
                            Create Free Account
                            <ArrowRight size={24} />
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-white rounded p-1">
                                <img src="/logo_cgro.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tighter">cGrow</span>
                        </div>
                        <p className="text-xs uppercase font-bold tracking-widest text-slate-500">© 2026 cGrow Operations. Chetna's Conscious Growth & Research Operations.</p>
                    </div>
                </footer>

                {/* Logo Watermark - Only on Landing Page */}
                <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
                    <div className="relative">
                        <img
                            src="/logo_cgro.png"
                            alt="cGrow Watermark"
                            className="w-32 h-32 opacity-20 hover:opacity-30 transition-opacity duration-300"
                        />
                        <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl"></div>
                    </div>
                </div>
            </div>
        </div >
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all">
        <div className="text-emerald-600 mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600">{description}</p>
    </div>
);

const Benefit = ({ text }) => (
    <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <CheckCircle className="text-emerald-600 flex-shrink-0" size={24} />
        <span className="text-slate-700 font-medium">{text}</span>
    </div>
);

export default LandingPage;
