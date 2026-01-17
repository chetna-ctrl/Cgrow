import React from 'react';

const Card = ({ children, className = '', hover = true, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
                bg-white rounded-2xl border border-slate-200 p-6 
                shadow-sm transition-all duration-300
                ${hover ? 'hover:shadow-md hover:-translate-y-1 hover:border-emerald-200 cursor-pointer' : ''}
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default Card;
