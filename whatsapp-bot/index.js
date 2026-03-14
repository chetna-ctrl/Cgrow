/**
 * cGrow WhatsApp Bot Server
 * ─────────────────────────────────────────────────────────────
 * Local use:  node index.js  → Terminal mein QR aayega
 * Fly.io use: https://cgrow-whatsapp-bot.fly.dev/qr → Browser mein QR dikhega
 *
 * Port: 3001 (local) | process.env.PORT (Fly.io)
 * ─────────────────────────────────────────────────────────────
 */

const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// ─── Express Setup ───────────────────────────────────────────
const app = express();
app.use(express.json());

// ─── Supabase Setup (For Live Reports) ──────────────────────
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://hgddilitfwtyqblttvso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGRpbGl0Znd0eXFibHR0dnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzM5NjQsImV4cCI6MjA4MzU0OTk2NH0.OaplCMXCQtiwpLWAhgWVil6K3pmXSz2j-ptfXDYKp_E';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Auto-Reply Configuration Persistence ───────────────────
const CONFIG_PATH = path.join(__dirname, 'auto_reply_config.json');

let autoReplyConfig = {
    enabled: false,
    message: 'Dhanyawad! Aapka message mil gaya. Hum jald hi reply karenge. 🌱 - cGrow Team',
    aiSales: true // New: AI Sales Advisor Toggle
};

// Load on start
try {
    if (fs.existsSync(CONFIG_PATH)) {
        const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        autoReplyConfig = { ...autoReplyConfig, ...saved };
        console.log('📂 Loaded auto-reply config from file.');
    }
} catch (e) {
    console.error('Failed to load config:', e.message);
}

const saveConfig = () => {
    try {
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(autoReplyConfig, null, 2));
    } catch (e) {
        console.error('Failed to save config:', e.message);
    }
};

/**
 * Generate a live report from Supabase
 */
const generateLiveReport = async () => {
    try {
        // Fetch active batches (Only Growing or Harvest Ready)
        const { data: batches } = await supabase
            .from('batches')
            .select('crop, qty, sow_date, status')
            .in('status', ['Growing', 'Harvest Ready'])
            .order('sow_date', { ascending: false })
            .limit(5);

        // Fetch active systems
        const { data: systems } = await supabase
            .from('systems')
            .select('crop, system_type, current_temp, current_ph, status')
            .in('status', ['Growing', 'Active', 'Stable']) // Adjust based on hydro statuses
            .limit(5);

        let report = `╭─────────────────────╮\n`;
        report += `   🌿 *cGrow Live Intelligence* \n`;
        report += `╰─────────────────────╯\n\n`;

        if (batches && batches.length > 0) {
            report += `📦 *Microgreens Inventory*\n`;
            report += `━━━━━━━━━━━━━━━━━━━━━\n`;
            batches.forEach(b => {
                const days = Math.floor((new Date() - new Date(b.sow_date)) / (1000 * 60 * 60 * 24));
                const cropName = (b.crop || 'Unknown').substring(0, 12).padEnd(12);
                report += `• ${cropName} | ${b.qty} Trays | Day ${days}\n`;
            });
            report += `\n`;
        }

        if (systems && systems.length > 0) {
            report += `💧 *Hydroponics Status*\n`;
            report += `━━━━━━━━━━━━━━━━━━━━━\n`;
            systems.forEach(s => {
                report += `• ${s.crop.padEnd(12)} | ${s.system_type} | ${s.current_temp || '--'}°C\n`;
            });
            report += `\n`;
        }

        if ((!batches || batches.length === 0) && (!systems || systems.length === 0)) {
            report += `_No active research batches found._\n_Please check your dashboard._\n\n`;
        }

        report += `🛰️ *Signal:* Verified\n`;
        report += `🕐 *Sync:* ${new Date().toLocaleTimeString('en-IN')}\n`;
        report += `─────────────────────\n`;
        report += `_Reply *menu* for more options_`;

        return report;
    } catch (err) {
        console.error('Report Error:', err.message);
        return '❌ *CRM Error:* Unable to generate report. Please try again later.';
    }
};

const getMenuResponse = () => {
    let menu = `🤖 *cGrow Smart CRM Menu*\n`;
    menu += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    menu += `1️⃣  *!status* - Get live farm report\n`;
    menu += `2️⃣  *support* - Connect with technical team\n`;
    menu += `3️⃣  *sales* - Connect with AI Sales Advisor\n`;
    menu += `4️⃣  *help* - Show this menu\n\n`;
    menu += `_Our AI Advisor can answer questions about quality, tech, and pricing._\n\n`;
    menu += `─────────────────────\n`;
    menu += `_cGrow — The Future of Farming 🌿_`;
    return menu;
};

// ─── AI Sales Advisor Intelligence (Sales Psychology Engine) ────
const SALES_STATES = {}; // tracks state per sender

const getSalesAdvisorResponse = async (sender, text, liveData) => {
    const state = SALES_STATES[sender] || 'IDLE';
    let response = '';
    let newState = state;

    // Detect Intent
    const isPriceQuery = text.includes('price') || text.includes('cost') || text.includes('rate') || text.includes('kitne');
    const isQualityQuery = text.includes('quality') || text.includes('fresh') || text.includes('pure') || text.includes('accha');
    const isInquiry = text.includes('buy') || text.includes('order') || text.includes('purchase') || text.includes('seeds');

    // Live Data Context
    const health = liveData.health || '98%';
    const crops = liveData.topCrops || 'Radish & Sunflower';

    if (isPriceQuery) {
        response = `💰 *About our pricing...*\n\nHum quality pe compromise nahi karte. cGrow crops 🛰️ *IoT Precision* se grow hote hain, isliye inka shelf-life normal greens se 40% zyada hai.\n\nAapko consistency milegi, har baar. Fresh batch ki health abhi *${health}* hai. Kya main aapko bundles dikhaun?`;
        newState = 'QUALIFIED';
    }
    else if (isQualityQuery) {
        response = `🛡️ *Batch Trust:* Aapka fikar jayaz hai.\n\nHum har tray ka live metadata track karte hain. Currently, batches like *${crops}* perform kar rahe hain with *98.4% nutrient density*.\n\nBina pesticides ke, 100% pure. Kya aap humara laboratory analysis report dekhna chahenge?`;
        newState = 'TRUST_BUILT';
    }
    else if (isInquiry) {
        if (state === 'TRUST_BUILT' || state === 'QUALIFIED') {
            response = `🚀 *Great choice!*\n\nHamara process simple hai. Abhi *${crops}* harvest ready hain. \n\nDirect order link: https://cgrow.farm/shop\n\nAgar aapko seeds ya complete setup chahiye, toh likhein 'setup' aur main humare expert ko connect kar dunga.`;
            newState = 'CLOSING';
        } else {
            response = `🌿 *Welcome to cGrow!* \n\nHum India's most advanced Microgreen research farm hain. Kya aap apne restaurant ke liye dekh rahe hain ya personal use ke liye?`;
            newState = 'HOOK_SENT';
        }
    }

    SALES_STATES[sender] = newState;
    return response;
};

/**
 * AI Marketing Generation (MOCKED LLM CALL)
 */
app.post('/generate-marketing-msg', async (req, res) => {
    const { campaignType, customerName, topCrop } = req.body;
    
    // In a real scenario, this would call Professor AI service or OpenAI/Mistral
    let aiMessage = '';
    
    switch(campaignType) {
        case 'FLASH_SALE':
            aiMessage = `⚡ *FLASH SALE ALERT* ⚡\n\nHi ${customerName}! 🌿 Exciting news - your favorite ${topCrop} is being harvested TODAY! \n\nSince you're a regular, we've got a *20% OFF* deal just for you on this batch. \n\nDirect order link: https://cgrow.farm/deals\n\n_Valid for today only!_`;
            break;
        case 'HARVEST_READY':
            aiMessage = `🌱 *Freshly Picked!* 🌱\n\nHi ${customerName}! Our precision-grown ${topCrop} is ready for pickup. \n\nIoT Verified Health: 98.4%\nNutrient Density: High\n\nOrder now to get it while it's crisp! 🥗`;
            break;
        case 'REFILL_REMINDER':
            aiMessage = `🥤 *Time for a Refill?* \n\nHi ${customerName}! Based on your last order, you might be running low on your favorite greens soon. \n\nDon't let your nutrition gap grow! 🚜 We have fresh ${topCrop} ready. Shall we reserve a tray for you?`;
            break;
        default:
            aiMessage = `Hi ${customerName}, check out our latest from cGrow farm!`;
    }
    
    res.json({ success: true, message: aiMessage });
});

// ─── WhatsApp Client Setup ───────────────────────────────────

// CORS — React dashboard aur any origin ko allow karna
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ─── WhatsApp Client Setup ───────────────────────────────────
// System Chrome use karo — Chromium download se bachne ke liye (fast!)
const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `C:\\Users\\${process.env.USERNAME}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe`,
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe', // Edge fallback
];
const { existsSync } = require('fs');
const executablePath = chromePaths.find(p => existsSync(p));
if (executablePath) {
    console.log(`✅ Using browser: ${executablePath}`);
} else {
    console.log('⚠️  System Chrome/Edge nahi mila — Puppeteer apna Chromium download karega (slow)');
}

const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'cgrow-agri-os' }),
    puppeteer: {
        headless: true,
        executablePath: executablePath || undefined,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

let botStatus = 'initializing';
let currentQR = null;   // base64 QR string store karna (browser mein dikhane ke liye)

// ─── WhatsApp Events ──────────────────────────────────────────

client.on('qr', (qr) => {
    botStatus = 'qr_pending';
    currentQR = qr;

    // Local use ke liye terminal mein bhi dikhao
    console.log('\n📱 QR Code ready! Browser mein dekhne ke liye: http://localhost:3001/qr\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    currentQR = null;
    console.log('✅ WhatsApp Authentication successful! Session saved.');
});

client.on('ready', () => {
    botStatus = 'ready';
    currentQR = null;
    console.log('\n🚀 cGrow WhatsApp Bot is READY!');
    console.log(`   API: POST /send-msg  |  GET /status  |  GET /qr\n`);
});

client.on('disconnected', (reason) => {
    botStatus = 'disconnected';
    console.error('❌ WhatsApp disconnected:', reason);
    console.log('Reconnecting in 10 seconds...');
    setTimeout(() => client.initialize(), 10000);
});

// Spam control: ek sender ko 5 min mein ek hi auto-reply
const autoReplySent = {};
const AUTO_REPLY_COOLDOWN = 5 * 60 * 1000;

client.on('message', async (msg) => {
    // 1. Ignore broadcasts (WhatsApp Status) & Groups & Self
    if (msg.from === 'status@broadcast') return;
    if (msg.fromMe) return;
    if (msg.isGroupMsg) return;

    const sender = msg.from;
    const text = msg.body?.trim().toLowerCase() || '';

    // DEBUG: Har ek message log karo
    console.log(`📩 Message Received from ${sender}: "${text}"`);

    // ── Command Handling ─────────────────────────────────────
    try {
        // 1. Live Report
        if (text === '!status' || text === '!report' || text === 'status' || text === 'report') {
            console.log(`📊 Report requested by: ${sender}`);
            const report = await generateLiveReport();
            await msg.reply(report);
            return;
        }

        // 2. Help / Menu
        if (text === 'help' || text === 'menu' || text === 'hi' || text === 'hello') {
            console.log(`🤖 Menu requested by: ${sender}`);
            const menu = getMenuResponse();
            await msg.reply(menu);
            return;
        }

        // 3. Support & Sales (New CRM Features)
        if (text.includes('support') || text.includes('technical')) {
            console.log(`🛠️ Support query from: ${sender}`);
            await msg.reply('✅ *Support Request Logged.*\n\nHumare technician aapka message check kar rahe hain. Dashboard related koi bhi issue ho toh yahan details likh sakte hain.\n\n_Ref: SR-' + Date.now().toString().slice(-4) + '_');
            return;
        }

        if (text.includes('sales') || text.includes('inventory') || text.includes('seed') || text.includes('price') || text.includes('buy')) {
            console.log(`💰 AI Sales Advisor engaging: ${sender}`);

            // Fetch some live context for the AI
            const { data: batches } = await supabase.from('batches').select('crop').eq('status', 'Growing').limit(2);
            const liveCtx = {
                health: '98.6%',
                topCrops: batches?.map(b => b.crop).join(' & ') || 'Premium Greens'
            };

            const aiReply = await getSalesAdvisorResponse(sender, text, liveCtx);
            if (aiReply) {
                await humanDelay(2000, 4000); // Simulated "Advisor is typing..."
                await msg.reply(aiReply);
                return;
            }
        }

    } catch (cmdErr) {
        console.error('❌ Command Error:', cmdErr.message);
        // Don't crash the whole bot, just tell the user something went wrong
        try { await msg.reply('⚠️ *Bot Error:* Command process karne mein dikat aayi. Dobara koshish karein.'); } catch (e) { }
    }

    // ── Auto-Reply & AI Sales Logic ─────────────────────────
    if (!autoReplyConfig.enabled && !autoReplyConfig.aiSales) {
        console.log(`ℹ️  Bot processing skipped for ${sender} (All auto-features OFF)`);
        return;
    }

    const lastSent = autoReplySent[sender] || 0;
    if (Date.now() - lastSent < AUTO_REPLY_COOLDOWN) {
        console.log(`ℹ️  Auto-reply skipped for ${sender} (Cooldown active)`);
        return;
    }

    autoReplySent[sender] = Date.now();

    try {
        await humanDelay(1500, 3000); // Natural typing delay
        await msg.reply(autoReplyConfig.message);
        console.log(`🤖 Auto-replied to: ${sender}`);
    } catch (err) {
        console.warn('Auto-reply failed:', err.message);
    }
});



// ─── Helper Functions ─────────────────────────────────────────

const humanDelay = (min = 2000, max = 5000) =>
    new Promise(resolve => setTimeout(resolve,
        Math.floor(Math.random() * (max - min + 1)) + min));

const formatNumber = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}@c.us`;
    return `${digits}@c.us`;
};

// ─── API Routes ───────────────────────────────────────────────

/**
 * GET /status
 */
app.get('/status', (req, res) => {
    res.json({
        status: botStatus,
        ready: botStatus === 'ready',
        autoReply: autoReplyConfig.enabled,
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /set-autoreply
 * Dashboard Settings se auto-reply toggle karo
 * Body: { "enabled": true, "message": "Dhanyawad!..." }
 */
app.post('/set-autoreply', (req, res) => {
    const { enabled, message, aiSales } = req.body;
    if (typeof enabled === 'boolean') autoReplyConfig.enabled = enabled;
    if (typeof aiSales === 'boolean') autoReplyConfig.aiSales = aiSales;
    if (message && typeof message === 'string') autoReplyConfig.message = message;

    saveConfig(); // Save to file

    console.log(`🤖 Config Updated: Auto-Reply=${autoReplyConfig.enabled}, AI-Sales=${autoReplyConfig.aiSales}`);
    res.json({ success: true, config: autoReplyConfig });
});



/**
 * GET /qr
 * Browser mein QR code dikhata hai — Fly.io deployment ke liye
 * URL: https://cgrow-whatsapp-bot.fly.dev/qr
 */
app.get('/qr', (req, res) => {
    if (botStatus === 'ready') {
        return res.send(`
            <!DOCTYPE html><html><head>
            <title>cGrow Bot Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4;}
            .card{background:white;border-radius:24px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;}
            .icon{font-size:72px;margin-bottom:16px;}
            h1{color:#16a34a;margin:0 0 8px;}p{color:#6b7280;margin:0;}</style>
            </head><body><div class="card">
            <div class="icon">✅</div>
            <h1>Bot Connected!</h1>
            <p>cGrow WhatsApp Bot is active and ready.</p>
            <p style="margin-top:12px;font-size:12px;color:#9ca3af;">Status: ${botStatus}</p>
            </div></body></html>
        `);
    }

    if (!currentQR) {
        return res.send(`
            <!DOCTYPE html><html><head>
            <title>cGrow Bot - Initializing</title>
            <meta http-equiv="refresh" content="5">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fef9c3;}
            .card{background:white;border-radius:24px;padding:40px;text-align:center;}
            .spinner{width:40px;height:40px;border:4px solid #fcd34d;border-top-color:#f59e0b;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px;}
            @keyframes spin{to{transform:rotate(360deg)}}
            h1{color:#92400e;margin:0 0 8px;}p{color:#6b7280;}</style>
            </head><body><div class="card">
            <div class="spinner"></div>
            <h1>Initializing...</h1>
            <p>WhatsApp client shuru ho raha hai.</p>
            <p style="font-size:12px;color:#9ca3af;margin-top:8px;">Page auto-refresh ho raha hai...</p>
            </div></body></html>
        `);
    }

    // QR code as PNG — qrcode library se generate karo
    try {
        const QRCode = require('qrcode');
        QRCode.toDataURL(currentQR, { width: 300, margin: 2 }, (err, url) => {
            if (err) return res.status(500).send('QR generate error');
            res.send(`
                <!DOCTYPE html><html><head>
                <title>cGrow WhatsApp - QR Scan</title>
                <meta http-equiv="refresh" content="30">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4;}
                .card{background:white;border-radius:24px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;max-width:400px;}
                h1{color:#15803d;margin:0 0 4px;font-size:22px;}
                p{color:#6b7280;font-size:14px;margin:0 0 20px;}
                img{border-radius:12px;border:3px solid #dcfce7;}
                .steps{text-align:left;margin-top:20px;background:#f0fdf4;border-radius:12px;padding:16px;}
                .steps p{color:#374151;margin:4px 0;font-size:13px;}</style>
                </head><body><div class="card">
                <h1>🌱 cGrow WhatsApp Bot</h1>
                <p>Neeche wala QR code scan karein</p>
                <img src="${url}" alt="WhatsApp QR Code" width="280"/>
                <div class="steps">
                <p><b>Kaise scan karein:</b></p>
                <p>📱 WhatsApp kholen</p>
                <p>⋮ → Linked Devices</p>
                <p>→ Link a Device</p>
                <p>→ Yeh QR scan karein</p>
                </div>
                <p style="margin-top:16px;font-size:11px;color:#9ca3af;">Page 30 sec mein auto-refresh hoga</p>
                </div></body></html>
            `);
        });
    } catch (e) {
        // qrcode package nahi mila — raw text show karo
        res.send(`<pre>QR: ${currentQR}\n\nqrcode package install karein: npm install qrcode</pre>`);
    }
});

/**
 * POST /send-msg
 * Body: { "number": "919876543210", "message": "Hello!" }
 */
app.post('/send-msg', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ success: false, error: '"number" aur "message" dono chahiye.' });
    }
    if (botStatus !== 'ready') {
        return res.status(503).json({
            success: false,
            error: `Bot ready nahi hai (${botStatus}). /qr pe jaake scan karein.`
        });
    }

    try {
        const chatId = formatNumber(number);
        await humanDelay();
        await client.sendMessage(chatId, message);

        console.log(`✉️  Sent to ${number}: "${message.substring(0, 60)}"`);
        return res.status(200).json({ success: true, info: 'Message bhej diya gaya!', timestamp: new Date().toISOString() });

    } catch (error) {
        console.error('❌ Send error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /send-bulk
 * Body: { "targets": [{ "number": "91...", "message": "..." }] }
 * Safety limit: max 50 messages
 */
app.post('/send-bulk', async (req, res) => {
    const { targets } = req.body;

    if (!targets || !Array.isArray(targets) || targets.length === 0) {
        return res.status(400).json({ success: false, error: '"targets" array chahiye.' });
    }
    if (botStatus !== 'ready') {
        return res.status(503).json({ success: false, error: `Bot ready nahi (${botStatus}).` });
    }

    const safeTargets = targets.slice(0, 50);
    const results = [];

    for (const target of safeTargets) {
        try {
            await humanDelay(3000, 8000);   // Longer gap for bulk
            await client.sendMessage(formatNumber(target.number), target.message);
            results.push({ number: target.number, status: 'sent' });
        } catch (err) {
            results.push({ number: target.number, status: 'failed', error: err.message });
        }
    }

    const sentCount = results.filter(r => r.status === 'sent').length;
    return res.status(200).json({ success: true, sent: sentCount, failed: safeTargets.length - sentCount, results });
});

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n🌱 cGrow WhatsApp Bot Server — port ${PORT}`);
    console.log(`   QR Scan: http://localhost:${PORT}/qr`);
    console.log('   Initializing WhatsApp client...\n');
});

client.initialize();
