import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react({
            // Enable JSX in .js files (CRA compatibility)
            include: '**/*.{jsx,js}',
        })
    ],

    // Ensure compatibility with existing code
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },

    // Development server configuration
    server: {
        port: 3000,
        open: true,
        host: true
    },

    // Build configuration
    build: {
        outDir: 'dist',
        sourcemap: false,
        // Ensure compatibility with older browsers (matching CRA defaults)
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'supabase': ['@supabase/supabase-js'],
                    'charts': ['recharts']
                }
            }
        }
    },

    // Environment variable prefix
    envPrefix: 'VITE_',

    // CSS configuration
    css: {
        postcss: './postcss.config.js',
    },

    // Ensure public folder is handled correctly
    publicDir: 'public',

    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@supabase/supabase-js',
            '@tanstack/react-query',
            'recharts',
            'lucide-react'
        ],
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },

    // Enable JSX in .js files
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.js$/,
        exclude: [],
    }
});
