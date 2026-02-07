import React, { createContext, useContext, useState, useEffect } from 'react';

const BeginnerModeContext = createContext();

export const BeginnerModeProvider = ({ children }) => {
    const [isBeginnerMode, setIsBeginnerMode] = useState(() => {
        const saved = localStorage.getItem('cGrow_beginner_mode');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('cGrow_beginner_mode', JSON.stringify(isBeginnerMode));
    }, [isBeginnerMode]);

    const toggleMode = () => setIsBeginnerMode(prev => !prev);

    // Terminology Mapping Utility
    const t = (beginnerTerm, expertTerm) => isBeginnerMode ? beginnerTerm : expertTerm;

    return (
        <BeginnerModeContext.Provider value={{ isBeginnerMode, toggleMode, t }}>
            {children}
        </BeginnerModeContext.Provider>
    );
};

export const useBeginnerMode = () => {
    const context = useContext(BeginnerModeContext);
    if (!context) {
        throw new Error('useBeginnerMode must be used within a BeginnerModeProvider');
    }
    return context;
};
