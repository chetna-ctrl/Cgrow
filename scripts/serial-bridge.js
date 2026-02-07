// Arduino -> Supabase Bridge
// Run this on your laptop to forward Serial data to Dashboard
// Usage: node scripts/serial-bridge.js

import { createClient } from '@supabase/supabase-js';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load Environment Variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Error: Supabase credentials missing in .env file');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Find Arduino Port (Auto-detect logic)
async function findArduino() {
    const ports = await SerialPort.list();
    // Look for common Arduino drivers (CH340, FTDI, etc.)
    const arduinoPort = ports.find(p =>
        (p.manufacturer && p.manufacturer.includes('Arduino')) ||
        (p.vendorId && ['1a86', '0403', '2341'].includes(p.vendorId)) // CH340, FTDI, Arduino
    );

    if (arduinoPort) {
        return arduinoPort.path;
    } else {
        // Fallback: Return first available COM port
        if (ports.length > 0) return ports[0].path;
        return null;
    }
}

async function startBridge() {
    console.log('🔌 cGrow Serial Bridge Starting...');

    const portPath = await findArduino();
    if (!portPath) {
        console.error('❌ No Arduino found! Connect your device via USB.');
        return;
    }

    console.log(`✅ Detected Device on: ${portPath}`);

    const port = new SerialPort({ path: portPath, baudRate: 115200 });
    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.on('open', () => {
        console.log('🚀 Bridge Connected! Waiting for data...');
    });

    parser.on('data', async (line) => {
        try {
            // Visualize data
            console.log(`📥 Received: ${line}`);

            // Parse JSON from Arduino
            const data = JSON.parse(line);

            // Send to Supabase
            const { error } = await supabase
                .from('sensor_readings')
                .insert([data]);

            if (error) {
                console.error('⚠️ Supabase Error:', error.message);
            } else {
                console.log('☁️ Sent to Dashboard!');
            }

        } catch (e) {
            // Ignore non-JSON lines (debug logs)
            // console.log('Parsed Log:', line);
        }
    });

    port.on('error', (err) => {
        console.error('❌ Serial Port Error:', err.message);
    });
}

startBridge();
