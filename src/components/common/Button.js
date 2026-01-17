import React from 'react';

const Button = ({
    children,
    onClick,
    variant = 'primary',
    icon: Icon,
    className = '',
    type = 'button',
    disabled = false
}) => {

    const baseStyles = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md hover:scale-[1.02]",
        secondary: "bg-slate-800 hover:bg-slate-700 text-white shadow-sm",
        outline: "border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-600 bg-white",
        ghost: "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
};

export default Button;
