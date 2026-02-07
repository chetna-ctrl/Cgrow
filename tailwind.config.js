/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Return to Standard Dark Mode Mappings
                // No more inversion.

                // Slate (Professional Navy Palette)
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155', // Borders/Secondary
                    800: '#1E293B', // Card BG (Lighter than Main)
                    900: '#0F172A', // Main BG (Dark Navy)
                    950: '#020617', // Sidebar / Deepest
                },

                // Explicit White/Black
                white: '#FFFFFF',
                black: '#000000',

                // Accents
                emerald: {
                    400: '#34D399',
                    500: '#10B981',
                    600: '#059669',
                    900: '#064E3B',
                },
                cyan: {
                    600: '#0891b2',
                    900: '#164e63',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
