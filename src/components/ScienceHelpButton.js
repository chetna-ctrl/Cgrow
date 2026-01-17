// Reusable Help Button Component for Scientific Intelligence
import React from 'react';
import { BookOpen } from 'lucide-react';

const ScienceHelpButton = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
            title="Learn about the Science"
        >
            <BookOpen size={24} />
        </button>
    );
};

export default ScienceHelpButton;
