import React, { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle } from 'lucide-react';

/**
 * OnboardingTutorial Component
 * Interactive 3-step guide for new users
 * Phase 5: User Retention
 */
const OnboardingTutorial = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has seen the tutorial
        const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
        if (!hasSeenTutorial) {
            setIsVisible(true);
        }
    }, []);

    const steps = [
        {
            id: 'health-score',
            title: 'Your Farm Health Score',
            description: 'This shows how well your crops are doing based on VPD, pH, EC, and other factors.',
            tip: '80+ is excellent! Aim to keep it in the green zone.',
            icon: '💚',
            highlight: '#health-meter'
        },
        {
            id: 'quick-logging',
            title: 'Quick Logging with 1-Tap OK',
            description: 'When everything looks good, just tap "1-Tap OK" and we\'ll auto-fill the data using smart defaults.',
            tip: 'Perfect for busy days when you don\'t have time for detailed logging.',
            icon: '⚡',
            highlight: '#one-tap-ok'
        },
        {
            id: 'daily-tracker',
            title: 'Daily Tracker for Detailed Logs',
            description: 'Log temperature, humidity, pH, EC, and visual checks here for accurate predictions and harvest dates.',
            tip: 'The more you log, the smarter the system becomes!',
            icon: '📊',
            highlight: '#tracker-link'
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('hasSeenTutorial', 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />

            {/* Tutorial Modal */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 safe-area-inset-bottom">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn max-h-[85vh] overflow-y-auto flex flex-col">
                    {/* Close button */}
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
                        aria-label="Skip tutorial"
                    >
                        <X size={24} />
                    </button>

                    {/* Progress indicator */}
                    <div className="flex gap-2 mb-6 shrink-0">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded-full transition-all ${index <= currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Content - Scrollable area */}
                    <div className="text-center mb-8 flex-1 overflow-y-auto">
                        <div className="text-6xl mb-4">{step.icon}</div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3">
                            {step.title}
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 mb-4 leading-relaxed">
                            {step.description}
                        </p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                            <p className="text-xs md:text-sm text-emerald-700 font-medium">
                                💡 Tip: {step.tip}
                            </p>
                        </div>
                    </div>

                    {/* Navigation - Sticky Footer equivalent */}
                    <div className="flex items-center justify-between shrink-0 pt-2 border-t border-slate-50 mt-auto">
                        <button
                            onClick={handleSkip}
                            className="text-slate-500 hover:text-slate-700 font-medium transition-colors text-sm"
                        >
                            Skip
                        </button>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">
                                {currentStep + 1}/{steps.length}
                            </span>
                            <button
                                onClick={handleNext}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-emerald-200"
                            >
                                {isLastStep ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Got it
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OnboardingTutorial;
