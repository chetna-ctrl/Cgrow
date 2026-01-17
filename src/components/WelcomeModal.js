import React, { useState } from 'react';
import { X, Sprout, Calendar, BarChart3, CheckCircle } from 'lucide-react';
import './WelcomeModal.css';

const WelcomeModal = ({ onClose }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Sprout size={48} />,
            title: "Welcome to Agri OS! 🌱",
            description: "Your smart farm management system is ready. Let's get you started with a quick tour.",
            action: "Start Tour"
        },
        {
            icon: <Sprout size={48} />,
            title: "Add Your First Crop",
            description: "Start by adding a microgreens batch or hydroponics system. Track growth from seed to harvest.",
            action: "Next"
        },
        {
            icon: <Calendar size={48} />,
            title: "Log Daily Data",
            description: "Use the Daily Tracker to monitor pH, EC, and temperature. Get smart recommendations based on your data.",
            action: "Next"
        },
        {
            icon: <BarChart3 size={48} />,
            title: "View Analytics",
            description: "See crop health scores, trend charts, and AI-powered insights to optimize your farm.",
            action: "Next"
        },
        {
            icon: <CheckCircle size={48} />,
            title: "You're All Set!",
            description: "Explore all features or jump right in. You can always access help by hovering over the (?) icons.",
            action: "Get Started"
        }
    ];

    const currentStep = steps[step];
    const isLastStep = step === steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            onClose();
        } else {
            setStep(step + 1);
        }
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <div className="welcome-modal-overlay">
            <div className="welcome-modal">
                <button onClick={handleSkip} className="welcome-modal-close">
                    <X size={24} />
                </button>

                <div className="welcome-modal-content">
                    <div className="welcome-modal-icon">
                        {currentStep.icon}
                    </div>

                    <h2 className="welcome-modal-title">{currentStep.title}</h2>
                    <p className="welcome-modal-description">{currentStep.description}</p>

                    <div className="welcome-modal-progress">
                        {steps.map((_, index) => (
                            <div
                                key={index}
                                className={`welcome-modal-progress-dot ${index <= step ? 'active' : ''}`}
                            />
                        ))}
                    </div>

                    <div className="welcome-modal-actions">
                        {!isLastStep && (
                            <button onClick={handleSkip} className="welcome-modal-skip">
                                Skip Tour
                            </button>
                        )}
                        <button onClick={handleNext} className="welcome-modal-next">
                            {currentStep.action}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
