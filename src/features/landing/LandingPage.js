import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowRight, CheckCircle, BarChart3, Droplets, Leaf } from 'lucide-react';

const LandingPage = () => {

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50">
            {/* Header with Login Link */}
            <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Sprout className="text-emerald-600" size={32} />
                        <span className="text-2xl font-bold text-slate-900">Agri OS</span>
                    </div>
                    <Link
                        to="/login"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
                    >
                        Login / Sign Up
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-6xl font-bold text-slate-900 mb-6">
                        Smart Farm Management
                        <span className="block text-emerald-600 mt-2">Made Simple</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                        Track microgreens, monitor hydroponics, and make data-driven decisions with AI-powered insights.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-emerald-900/30 transition-all"
                        >
                            Get Started Free
                            <ArrowRight size={24} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Sprout size={32} />}
                        title="Microgreens Tracking"
                        description="Monitor batches, predict harvest dates, and calculate revenue automatically."
                    />
                    <FeatureCard
                        icon={<Droplets size={32} />}
                        title="Hydroponics Management"
                        description="Track pH, EC, temperature with smart alerts and recommendations."
                    />
                    <FeatureCard
                        icon={<BarChart3 size={32} />}
                        title="Business Intelligence"
                        description="ROI calculator, market prices, and agronomy-based revenue forecasting."
                    />
                </div>
            </div>

            {/* Benefits Section */}
            <div className="bg-white py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">
                        Why Farmers Choose Agri OS
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <Benefit text="Real-time crop health monitoring" />
                        <Benefit text="Automated harvest readiness alerts" />
                        <Benefit text="Soil & climate-based yield predictions" />
                        <Benefit text="Market price intelligence" />
                        <Benefit text="Complete farming guides included" />
                        <Benefit text="Mobile-friendly dashboard" />
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Farm?
                    </h2>
                    <p className="text-xl text-emerald-100 mb-8">
                        Join hundreds of smart farmers using Agri OS to increase yields and profits.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-600 px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all"
                    >
                        Start Your Free Trial
                        <ArrowRight size={24} />
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Sprout className="text-emerald-500" size={24} />
                        <span className="text-xl font-bold text-white">Agri OS</span>
                    </div>
                    <p className="text-sm">© 2026 Agri OS. Smart Farm Management System.</p>
                </div>
            </footer>
        </div>
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
