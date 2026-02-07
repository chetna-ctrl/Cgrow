/**
 * CatchUpModal Component
 * Helps users rebuild health trends after missing multiple days
 * Phase 2: Intelligence Enhancement
 */

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export const CatchUpModal = ({ daysMissed, onComplete, onClose }) => {
    const [answers, setAnswers] = useState({
        wilting: null,
        water_level: null,
        pests: null,
        general_health: ''
    });

    const questions = [
        {
            id: 'wilting',
            text: 'Any wilting or drooping seen during this period?',
            type: 'boolean',
            impact: 'high'
        },
        {
            id: 'water_level',
            text: 'Was water level maintained?',
            type: 'boolean',
            impact: 'medium'
        },
        {
            id: 'pests',
            text: 'Any pests or diseases noticed?',
            type: 'boolean',
            impact: 'high'
        },
        {
            id: 'general_health',
            text: 'Overall health during the gap?',
            type: 'select',
            options: ['Excellent', 'Good', 'Fair', 'Poor'],
            impact: 'medium'
        }
    ];

    const calculateHealthDrop = () => {
        let dropPercentage = 0;

        // Base drop: 5% per day missed
        dropPercentage += daysMissed * 5;

        // Adjust based on answers
        if (answers.wilting === true) dropPercentage += 15;
        if (answers.water_level === false) dropPercentage += 10;
        if (answers.pests === true) dropPercentage += 20;

        if (answers.general_health === 'Poor') dropPercentage += 15;
        else if (answers.general_health === 'Fair') dropPercentage += 10;
        else if (answers.general_health === 'Good') dropPercentage -= 5;
        else if (answers.general_health === 'Excellent') dropPercentage -= 10;

        return Math.min(Math.max(dropPercentage, 0), 50); // Cap at 50%
    };

    const handleSubmit = () => {
        const estimatedHealthDrop = calculateHealthDrop();
        onComplete({ answers, estimatedHealthDrop, daysMissed });
    };

    const allAnswered = answers.wilting !== null &&
        answers.water_level !== null &&
        answers.pests !== null &&
        answers.general_health !== '';

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 rounded-t-2xl text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white"
                    >
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={32} />
                        <div>
                            <h2 className="text-2xl font-black">Catch-Up Interview</h2>
                            <p className="text-sm text-white/90">{daysMissed} days of data missing</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <p className="text-sm text-slate-600">
                        Help us rebuild your farm's health trend by answering a few quick questions about the past {daysMissed} days.
                    </p>

                    {questions.map((q) => (
                        <div key={q.id} className="bg-slate-50 p-4 rounded-lg">
                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                {q.text}
                                {q.impact === 'high' && (
                                    <span className="ml-2 text-xs text-red-600">(Critical)</span>
                                )}
                            </label>

                            {q.type === 'boolean' ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setAnswers({ ...answers, [q.id]: true })}
                                        className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition ${answers[q.id] === true
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-red-300'
                                            }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        onClick={() => setAnswers({ ...answers, [q.id]: false })}
                                        className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition ${answers[q.id] === false
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-green-300'
                                            }`}
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <select
                                    value={answers[q.id]}
                                    onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                                    className="w-full p-2 border-2 border-slate-200 rounded-lg font-medium"
                                >
                                    <option value="">Select...</option>
                                    {q.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 rounded-b-2xl">
                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered}
                        className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-lg font-black text-sm hover:from-emerald-600 hover:to-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {allAnswered ? '✅ Rebuild Health Trend' : '⏳ Answer All Questions'}
                    </button>
                    <p className="text-xs text-slate-500 text-center mt-2">
                        Estimated health impact: -{calculateHealthDrop()}%
                    </p>
                </div>
            </div>
        </div>
    );
};
