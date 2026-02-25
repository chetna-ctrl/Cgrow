/**
 * cGrow API & Networking Configuration
 * ─────────────────────────────────────────────────────────────
 * Centralized config for WhatsApp Bot and external services.
 * Change BOT_URL here to update the entire dashboard.
 */

const API_CONFIG = {
    // WhatsApp Bot Server (Local dev: port 3001)
    // Production: Replace with 'https://your-bot-url.fly.dev'
    BOT_URL: import.meta.env.VITE_BOT_URL || 'http://localhost:3001',

    // Safety check: Is the bot likely running locally?
    IS_LOCAL_BOT: (import.meta.env.VITE_BOT_URL || '').includes('localhost') || !import.meta.env.VITE_BOT_URL,

    // Endpoints
    ENDPOINTS: {
        SEND_MSG: '/send-msg',
        SEND_BULK: '/send-bulk',
        STATUS: '/status',
        SET_AUTOREPLY: '/set-autoreply'
    }
};

export default API_CONFIG;
